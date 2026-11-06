'use server'

import config from '@payload-config'
import { randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { allowAction, getClientIp } from '@/lib/welfare'

export type ActionResult = { ok: boolean; message: string }

const HOUR = 60 * 60 * 1000
const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const GENERIC_ERROR = 'Something went wrong. Please try again in a moment.'

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function detectImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  if (buf.length > 12 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' }
  }
  if (
    buf.length > 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

function bad(message: string): ActionResult {
  return { ok: false, message }
}

export async function submitReport(formData: FormData): Promise<ActionResult> {
  const done: ActionResult = {
    ok: true,
    message: 'Thank you. Your report was received and will appear once staff approve it.',
  }

  if (text(formData, 'website') !== '') {
    return done
  }

  try {
    const ip = getClientIp(await headers())
    if (!allowAction(`lf-report:${ip}`, 5, HOUR)) {
      return bad('Too many reports from this connection. Please try again later.')
    }

    const kind = text(formData, 'kind')
    const title = text(formData, 'title')
    const description = text(formData, 'description')
    const location = text(formData, 'location')
    const dateStr = text(formData, 'dateOccurred')
    const contactName = text(formData, 'contactName')
    const contactInfo = text(formData, 'contactInfo')

    if (kind !== 'lost' && kind !== 'found') return bad('Please choose Lost or Found.')
    if (title.length < 3 || title.length > 120) return bad('Please enter a title (3 to 120 characters).')
    if (description.length > 1000) return bad('The description is too long (maximum 1000 characters).')
    if (location.length < 2 || location.length > 160) return bad('Please enter where it happened.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return bad('Please choose a valid date.')
    const when = new Date(`${dateStr}T12:00:00.000Z`)
    if (Number.isNaN(when.getTime())) return bad('Please choose a valid date.')
    if (when.getTime() > Date.now() + 36 * 60 * 60 * 1000) return bad('The date cannot be in the future.')
    if (contactName.length > 100) return bad('The name is too long.')
    if (contactInfo.length < 3 || contactInfo.length > 200) {
      return bad('Please enter a phone number or email so staff can reach you.')
    }

    const payload = await getPayload({ config })

    let photoId: number | undefined
    const raw = formData.get('photo')
    if (raw instanceof File && raw.size > 0) {
      if (raw.size > MAX_PHOTO_BYTES) return bad('The photo is too large (maximum 4 MB).')
      const buf = Buffer.from(await raw.arrayBuffer())
      const img = detectImage(buf)
      if (!img) return bad('The photo must be a JPG, PNG or WebP image.')
      const media = await payload.create({
        collection: 'media',
        data: { alt: title },
        file: {
          data: buf,
          mimetype: img.mime,
          name: `lost-found-${randomUUID()}.${img.ext}`,
          size: buf.length,
        },
        overrideAccess: true,
      })
      photoId = media.id
    }

    await payload.create({
      collection: 'lost-found-items',
      data: {
        kind,
        title,
        description: description || undefined,
        location,
        dateOccurred: when.toISOString(),
        photo: photoId,
        contactName: contactName || undefined,
        contactInfo,
        status: 'pending',
      },
      overrideAccess: true,
    })

    return done
  } catch (err) {
    console.error('Lost & Found report failed:', err instanceof Error ? err.message : 'unknown error')
    return bad(GENERIC_ERROR)
  }
}

export async function submitClaim(itemId: number, formData: FormData): Promise<ActionResult> {
  const done: ActionResult = {
    ok: true,
    message: 'Your message was sent to the SUG team. They will contact you.',
  }

  if (text(formData, 'website') !== '') {
    return done
  }

  try {
    if (!Number.isInteger(itemId)) return bad(GENERIC_ERROR)

    const ip = getClientIp(await headers())
    if (!allowAction(`lf-claim:${ip}`, 5, HOUR)) {
      return bad('Too many messages from this connection. Please try again later.')
    }

    const claimerName = text(formData, 'claimerName')
    const claimerContact = text(formData, 'claimerContact')
    const message = text(formData, 'message')

    if (claimerName.length < 2 || claimerName.length > 100) return bad('Please enter your name.')
    if (claimerContact.length < 3 || claimerContact.length > 200) {
      return bad('Please enter a phone number or email.')
    }
    if (message.length < 10 || message.length > 1000) {
      return bad('Please write a message of 10 to 1000 characters.')
    }

    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'lost-found-items',
      where: { and: [{ id: { equals: itemId } }, { status: { equals: 'approved' } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (!found.docs[0]) return bad('This item is no longer available.')

    await payload.create({
      collection: 'lost-found-claims',
      data: { item: itemId, claimerName, claimerContact, message, status: 'new' },
      overrideAccess: true,
    })

    return done
  } catch (err) {
    console.error('Lost & Found claim failed:', err instanceof Error ? err.message : 'unknown error')
    return bad(GENERIC_ERROR)
  }
}