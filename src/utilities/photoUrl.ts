import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type SizeMap = Record<string, { url?: string | null } | undefined>

export function getPhotoUrl(photo: Media, size: string): string {
  const sizes = photo.sizes as unknown as SizeMap | undefined
  const sized = sizes?.[size]?.url
  return getMediaUrl(sized || photo.url, photo.updatedAt)
}