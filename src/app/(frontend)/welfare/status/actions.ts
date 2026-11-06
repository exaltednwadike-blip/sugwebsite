'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import {
  allowAction,
  getClientIp,
  hashSecret,
  normalizeTicketCode,
  verifySecret,
} from '@/lib/welfare'
import { WELFARE_CATEGORIES } from '@/lib/welfareCategories'

export type TicketMessageView = {
  id: number
  sender: 'student' | 'staff'
  body: string
  createdAt: string
}

export type TicketView = {
  ticketCode: string
  status: string
  statusLabel: string
  categoryLabel: string
  createdAt: string
  description: string
  messages: TicketMessageView[]
}

export type LookupState =
  | { status: 'error'; message: string }
  | { status: 'ok'; ticket: TicketView }

const NOT_RECOGNISED = 'Code or secret not recognised.'
const GENERIC_ERROR = 'Something went wrong. Please try again in a moment.'

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  'in-review': 'In review',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

function fail(message: string): LookupState {
  return { status: 'error', message }
}

async function loadTicket(code: string, secret: string): Promise<LookupState> {
  if (
    typeof code !== 'string' ||
    typeof secret !== 'string' ||
    code.length === 0 ||
    secret.length === 0 ||
    code.length > 30 ||
    secret.length > 60
  ) {
    return fail(NOT_RECOGNISED)
  }

  const payload = await getPayload({ config })

  const found = await payload.find({
    collection: 'welfare-tickets',
    where: { ticketCode: { equals: normalizeTicketCode(code) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const ticket = found.docs[0]
  if (!ticket) {
    void hashSecret(secret)
    return fail(NOT_RECOGNISED)
  }
  if (!verifySecret(secret, ticket.secretHash)) {
    return fail(NOT_RECOGNISED)
  }

  const msgs = await payload.find({
    collection: 'welfare-ticket-messages',
    where: { ticket: { equals: ticket.id } },
    sort: 'createdAt',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const categoryLabel =
    WELFARE_CATEGORIES.find((c) => c.value === ticket.category)?.label ?? ticket.category

  return {
    status: 'ok',
    ticket: {
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      statusLabel: STATUS_LABELS[ticket.status] ?? ticket.status,
      categoryLabel,
      createdAt: ticket.createdAt,
      description: ticket.description,
      messages: msgs.docs.map((m) => ({
        id: m.id,
        sender: m.sender === 'staff' ? 'staff' : 'student',
        body: m.body,
        createdAt: m.createdAt,
      })),
    },
  }
}

export async function lookupTicket(code: string, secret: string): Promise<LookupState> {
  try {
    const ip = getClientIp(await headers())
    if (!allowAction(`welfare-status:${ip}`, 10, 60 * 60 * 1000)) {
      return fail('Too many attempts from this connection. Please try again later.')
    }
    return await loadTicket(code, secret)
  } catch (err) {
    console.error('Welfare lookup failed:', err instanceof Error ? err.message : 'unknown error')
    return fail(GENERIC_ERROR)
  }
}

export async function sendFollowUp(
  code: string,
  secret: string,
  body: string,
): Promise<LookupState> {
  try {
    const ip = getClientIp(await headers())
    if (!allowAction(`welfare-reply:${ip}`, 10, 60 * 60 * 1000)) {
      return fail('Too many messages from this connection. Please try again later.')
    }

    const text = typeof body === 'string' ? body.trim() : ''
    if (text.length < 1) {
      return fail('Please type a message first.')
    }
    if (text.length > 2000) {
      return fail('Your message is too long (maximum 2000 characters).')
    }

    const loaded = await loadTicket(code, secret)
    if (loaded.status === 'error') {
      return loaded
    }
    if (loaded.ticket.status === 'closed') {
      return fail('This ticket is closed, so new messages cannot be added.')
    }

    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'welfare-tickets',
      where: { ticketCode: { equals: loaded.ticket.ticketCode } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const ticket = found.docs[0]
    if (!ticket) {
      return fail(NOT_RECOGNISED)
    }

    await payload.create({
      collection: 'welfare-ticket-messages',
      data: { ticket: ticket.id, sender: 'student', body: text },
      overrideAccess: true,
    })

    return await loadTicket(code, secret)
  } catch (err) {
    console.error('Welfare reply failed:', err instanceof Error ? err.message : 'unknown error')
    return fail(GENERIC_ERROR)
  }
}