'use server'

import { headers } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export interface ContactFormState {
  status: 'idle' | 'success' | 'error'
  message: string
}

const requestTimesByIP = new Map<string, number[]>()
const oneHour = 60 * 60 * 1000
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientIP(headerStore: Headers): string {
  const forwardedFor = headerStore.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return headerStore.get('x-real-ip')?.trim() || 'unknown'
}

function consumeRateLimit(ip: string, now: number): boolean {
  for (const [storedIP, times] of requestTimesByIP) {
    const recentTimes = times.filter((time) => now - time < oneHour)
    if (recentTimes.length === 0) {
      requestTimesByIP.delete(storedIP)
    } else {
      requestTimesByIP.set(storedIP, recentTimes)
    }
  }

  const recent = requestTimesByIP.get(ip) ?? []
  if (recent.length >= 3) {
    return false
  }

  recent.push(now)
  requestTimesByIP.set(ip, recent)
  return true
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function submitExecutiveMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (readText(formData, 'website')) {
    return {
      status: 'success',
      message: 'Your message has been received.',
    }
  }

  const memberID = readText(formData, 'memberID')
  const senderName = readText(formData, 'senderName')
  const senderEmail = readText(formData, 'senderEmail')
  const subject = readText(formData, 'subject')
  const message = readText(formData, 'message')

  if (!/^[1-9]\d*$/.test(memberID)) {
    return { status: 'error', message: 'This executive profile is invalid. Please reload and try again.' }
  }
  if (senderName.length < 1 || senderName.length > 100) {
    return { status: 'error', message: 'Enter your name using no more than 100 characters.' }
  }
  if (senderEmail.length > 254 || !emailPattern.test(senderEmail)) {
    return { status: 'error', message: 'Enter a valid email address.' }
  }
  if (subject.length < 1 || subject.length > 160) {
    return { status: 'error', message: 'Enter a subject using no more than 160 characters.' }
  }
  if (message.length < 1 || message.length > 2000) {
    return { status: 'error', message: 'Enter a message using no more than 2,000 characters.' }
  }

  const headerStore = await headers()
  const clientIP = getClientIP(headerStore)
  if (!consumeRateLimit(clientIP, Date.now())) {
    return {
      status: 'error',
      message: 'You have reached the message limit. Please try again later.',
    }
  }

  const payload = await getPayload({ config: configPromise })
  const member = await payload.find({
    collection: 'exco-members',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { id: { equals: Number(memberID) } },
        { isCurrent: { equals: true } },
      ],
    },
  })

  if (!member.docs[0]) {
    return { status: 'error', message: 'This executive profile is no longer available.' }
  }

  await payload.create({
    collection: 'exco-contact-messages',
    overrideAccess: true,
    data: {
      member: member.docs[0].id,
      senderName,
      senderEmail,
      subject,
      message,
    },
  })

  return {
    status: 'success',
    message: 'Thanks — your message has been sent to the SUG secretariat.',
  }
}
