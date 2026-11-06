'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import {
  allowAction,
  generateSecret,
  generateTicketCode,
  getClientIp,
  hashSecret,
} from '@/lib/welfare'
import { WELFARE_CATEGORIES } from '@/lib/welfareCategories'

export type SubmitState =
  | { status: 'error'; message: string }
  | { status: 'success'; ticketCode: string; secret: string }

let warnedAboutTurnstile = false

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (!warnedAboutTurnstile) {
      warnedAboutTurnstile = true
      console.warn('TURNSTILE_SECRET_KEY is not set: bot check is skipped.')
    }
    return true
  }
  if (!token) {
    return false
  }
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export async function submitTicket(formData: FormData): Promise<SubmitState> {
  // Honeypot: pretend it worked, save nothing.
  if (text(formData, 'website') !== '') {
    return { status: 'success', ticketCode: generateTicketCode(), secret: generateSecret() }
  }

  const ip = getClientIp(await headers())
  if (!allowAction(`welfare-submit:${ip}`, 3, 60 * 60 * 1000)) {
    return {
      status: 'error',
      message: 'Too many submissions from this connection. Please try again later.',
    }
  }

  const match = WELFARE_CATEGORIES.find((c) => c.value === text(formData, 'category'))
  const description = text(formData, 'description')
  const optionalContact = text(formData, 'optionalContact')

  if (!match) {
    return { status: 'error', message: 'Please choose a category.' }
  }
  if (description.length < 10) {
    return { status: 'error', message: 'Please describe your concern in at least 10 characters.' }
  }
  if (description.length > 3000) {
    return { status: 'error', message: 'Your description is too long (maximum 3000 characters).' }
  }
  if (optionalContact.length > 200) {
    return { status: 'error', message: 'Contact details are too long (maximum 200 characters).' }
  }

  if (!(await verifyTurnstile(text(formData, 'cf-turnstile-response')))) {
    return { status: 'error', message: 'The bot check failed. Please try again.' }
  }

  const payload = await getPayload({ config })

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ticketCode = generateTicketCode()
    const secret = generateSecret()
    try {
      await payload.create({
        collection: 'welfare-tickets',
        data: {
          ticketCode,
          secretHash: hashSecret(secret),
          category: match.value,
          description,
          optionalContact: optionalContact || undefined,
          status: 'new',
        },
        overrideAccess: true,
      })
      return { status: 'success', ticketCode, secret }
    } catch (err) {
      console.error(
        'Welfare ticket creation failed:',
        err instanceof Error ? err.message : 'unknown error',
      )
    }
  }

  return { status: 'error', message: 'Something went wrong. Please try again in a moment.' }
}