import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { Homepage } from '@/components/SUG/Homepage'
import {
  getPlaceholderEvents,
  placeholderExecutives,
  type HomepageEvent,
  type HomepageExecutive,
} from '@/data/homepageRoundTwo'
import { getPayload } from 'payload'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()
  const [eventResult, executiveResult] = await Promise.all([
    payload.find({
      collection: 'events',
      depth: 1,
      draft: false,
      limit: 3,
      overrideAccess: false,
      sort: 'startsAt',
      where: {
        startsAt: {
          greater_than_equal: now,
        },
      },
    }),
    payload.find({
      collection: 'exco-members',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: 'sortOrder',
      where: {
        isSpotlight: {
          equals: true,
        },
      },
    }),
  ])

  const eventItems: HomepageEvent[] = eventResult.docs.map((event) => ({
    title: event.title,
    startsAt: event.startsAt,
    venue: event.venue ?? '',
    eventType: event.eventType ?? 'general',
  }))
  const executiveItems: HomepageExecutive[] = executiveResult.docs.map((executive) => ({
    fullName: executive.fullName,
    position: executive.position,
    photoUrl: typeof executive.photo === 'object' ? (executive.photo?.url ?? null) : null,
  }))

  return (
    <Homepage
      events={eventItems.length > 0 ? eventItems : getPlaceholderEvents()}
      eventsArePlaceholder={eventItems.length === 0}
      executives={executiveItems.length > 0 ? executiveItems : placeholderExecutives}
      executivesArePlaceholder={executiveItems.length === 0}
    />
  )
}

export const metadata: Metadata = {
  title: 'Student Union Government | University of Nigeria, Enugu Campus',
  description:
    'News, updates, resources and support from the Student Union Government of the University of Nigeria, Enugu Campus.',
}
