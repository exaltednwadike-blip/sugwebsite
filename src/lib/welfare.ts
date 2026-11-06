import { createHmac, randomInt, timingSafeEqual } from 'crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomChars(length: number): string {
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)]
  }
  return out
}

export function generateTicketCode(): string {
  return `WLF-${randomChars(4)}-${randomChars(4)}`
}

export function generateSecret(): string {
  return Array.from({ length: 6 }, () => randomChars(4)).join('-')
}

export function normalizeSecret(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function normalizeTicketCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (raw.startsWith('WLF') && raw.length === 11) {
    return `WLF-${raw.slice(3, 7)}-${raw.slice(7, 11)}`
  }
  return raw
}

export function hashSecret(secret: string): string {
  const key = process.env.PAYLOAD_SECRET
  if (!key) {
    throw new Error('PAYLOAD_SECRET is not set')
  }
  return createHmac('sha256', key).update(normalizeSecret(secret)).digest('hex')
}

export function verifySecret(secret: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) {
    return false
  }
  const computed = hashSecret(secret)
  if (computed.length !== storedHash.length) {
    return false
  }
  return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'))
}

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Returns true when the action is allowed. Kept in memory only, nothing is stored. */
export function allowAction(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()

  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) {
        buckets.delete(k)
      }
    }
  }

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= limit) {
    return false
  }
  existing.count += 1
  return true
}

export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }
  return headers.get('x-real-ip') ?? 'unknown'
}