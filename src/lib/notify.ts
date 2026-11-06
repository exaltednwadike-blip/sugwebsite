import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

type Kind = 'lostFound' | 'welfare' | 'contact'

const ROLES: Record<Kind, string[]> = {
  lostFound: ['moderator', 'welfare_manager', 'super_admin'],
  welfare: ['welfare_manager', 'super_admin'],
  contact: ['editor', 'super_admin'],
}

let warned = false

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function recipients(req: PayloadRequest, kind: Kind): Promise<string[]> {
  const override = process.env.NOTIFY_OVERRIDE_TO
  if (override) {
    return override
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const res = await req.payload.find({
    collection: 'users',
    where: { and: [{ isActive: { equals: true } }, { role: { in: ROLES[kind] } }] },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  return res.docs.map((u) => u.email).filter(Boolean)
}

async function send(to: string[], subject: string, lines: string[], path: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    if (!warned) {
      warned = true
      console.warn('RESEND_API_KEY is not set: email alerts are skipped.')
    }
    return
  }
  if (to.length === 0) {
    return
  }

  const link = `${getServerSideURL()}${path}`
  const from = process.env.NOTIFY_FROM || 'SUG Website <onboarding@resend.dev>'
  const text = `${lines.join('\n')}\n\nOpen the admin: ${link}`
  const html =
    `<div style="font-family:Arial,sans-serif;color:#0A3D2A;max-width:520px">` +
    `<h2 style="color:#12804A">${esc(subject)}</h2>` +
    lines.map((l) => `<p>${esc(l)}</p>`).join('') +
    `<p><a href="${esc(link)}" style="background:#12804A;color:#ffffff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Open the admin</a></p>` +
    `</div>`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, text }),
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error('Email alert failed with status', res.status)
    }
  } catch {
    console.error('Email alert could not be sent.')
  } finally {
    clearTimeout(timer)
  }
}

async function alertStaff(
  req: PayloadRequest,
  kind: Kind,
  subject: string,
  lines: string[],
  path: string,
): Promise<void> {
  try {
    const to = await recipients(req, kind)
    await send(to, subject, lines, path)
  } catch (err) {
    console.error('Email alert error:', err instanceof Error ? err.message : 'unknown error')
  }
}

export const notifyLostFoundItem: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const d = doc as { kind?: string; title?: string; location?: string }
    await alertStaff(
      req,
      'lostFound',
      'New Lost & Found report',
      [
        `A ${d.kind === 'found' ? 'found' : 'lost'} item was reported: ${d.title ?? 'item'}.`,
        `Location: ${d.location ?? 'not given'}.`,
        'It is waiting for your review before it appears on the website.',
      ],
      '/admin/collections/lost-found-items?where[status][equals]=pending',
    )
  }
  return doc
}

export const notifyLostFoundClaim: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const d = doc as { claimerName?: string }
    await alertStaff(
      req,
      'lostFound',
      'New Lost & Found claim',
      [
        `${d.claimerName ?? 'Someone'} sent a message about a Lost & Found item.`,
        'Their contact details are in the admin.',
      ],
      '/admin/collections/lost-found-claims',
    )
  }
  return doc
}

export const notifyWelfareTicket: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const d = doc as { ticketCode?: string }
    await alertStaff(
      req,
      'welfare',
      'New welfare ticket',
      [
        `A new anonymous welfare ticket was received${d.ticketCode ? `: ${d.ticketCode}` : ''}.`,
        'For privacy, the details are not included in this email.',
      ],
      '/admin/collections/welfare-tickets?where[status][equals]=new',
    )
  }
  return doc
}

export const notifyWelfareReply: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const d = doc as { sender?: string }
    if (d.sender === 'student') {
      await alertStaff(
        req,
        'welfare',
        'Student reply on a welfare ticket',
        [
          'A student sent a follow-up message on a welfare ticket.',
          'For privacy, the message is not included in this email.',
        ],
        '/admin/collections/welfare-ticket-messages',
      )
    }
  }
  return doc
}

export const notifyContactMessage: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation === 'create') {
    const d = doc as { senderName?: string; subject?: string }
    await alertStaff(
      req,
      'contact',
      'New message to an executive',
      [
        `${d.senderName ?? 'Someone'} sent a message.`,
        `Subject: ${d.subject ?? 'no subject'}.`,
      ],
      '/admin/collections/exco-contact-messages',
    )
  }
  return doc
}