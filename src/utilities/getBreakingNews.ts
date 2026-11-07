import configPromise from '@payload-config'
import { getPayload } from 'payload'

export interface BreakingItem {
  text: string
  href: string | null
}

// Reads the breaking-news items an editor entered under Globals > Site Settings.
// Returns an empty list (so the bar is hidden) if it is switched off, empty, or unreachable.
export async function getBreakingNews(): Promise<BreakingItem[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

    if (settings.breakingEnabled === false) return []

    return (settings.breakingItems ?? [])
      .map((item) => ({
        text: (item.text ?? '').trim(),
        href: item.link?.trim() || null,
      }))
      .filter((item) => item.text.length > 0)
  } catch {
    return []
  }
}
