import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'

import configPromise from '@payload-config'
import { formatLagosDateTime } from '@/utilities/formatLagosDateTime'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getPayload } from 'payload'

type EventDetailProps = {
  params: Promise<{
    slug: string
  }>
}

const eventTypeLabels = {
  meeting: 'Meeting',
  town_hall: 'Town Hall',
  cultural: 'Cultural',
  sports: 'Sports',
  academic: 'Academic',
  general: 'General',
} as const

async function findPublishedEvent(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'events',
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params
  const event = await findPublishedEvent(decodeURIComponent(slug))

  if (!event) notFound()

  const banner = typeof event.banner === 'object' && event.banner ? event.banner : null
  const eventType = event.eventType ?? 'general'

  return (
    <main className="rs-main">
      <div className="rs-wrap rs-inner">
        <article className="rs-article">
          <Link className="rs-back" href="/events">
            <ArrowLeft aria-hidden="true" size={16} /> Back to events
          </Link>
          {banner?.url && (
            <div className="rs-article-cover">
              <Image
                alt={banner.alt || ''}
                fill
                priority
                sizes="(min-width: 800px) 800px, 100vw"
                src={getMediaUrl(banner.url, banner.updatedAt)}
                unoptimized
              />
            </div>
          )}
          <header>
            <span className="rs-chip">{eventTypeLabels[eventType]}</span>
            <h1>{event.title}</h1>
            <ul className="rs-facts">
              <li>
                <CalendarDays aria-hidden="true" size={18} />
                <span>
                  <time dateTime={event.startsAt}>{formatLagosDateTime(event.startsAt)}</time>
                  {event.endsAt && (
                    <>
                      {' '}
                      &ndash; <time dateTime={event.endsAt}>{formatLagosDateTime(event.endsAt)}</time>
                    </>
                  )}
                </span>
              </li>
              <li>
                <MapPin aria-hidden="true" size={18} />
                <span>{event.venue || 'Venue to be announced'}</span>
              </li>
            </ul>
          </header>
          {event.description && <p className="rs-lead">{event.description}</p>}
        </article>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const { slug } = await params
  const event = await findPublishedEvent(decodeURIComponent(slug))

  if (!event) {
    return {
      title: 'Event not found | Student Union Government',
      description: 'This published event could not be found.',
    }
  }

  return {
    title: `${event.title} | Student Union Government`,
    description:
      event.description || `${event.title} at ${event.venue || 'University of Nigeria, Enugu Campus'}.`,
  }
}