import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
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
    <main className="sug-archive">
      <article className="sug-event-detail">
        <Link className="sug-article-back" href="/events">
          ← Back to events
        </Link>
        {banner?.url && (
          <div className="sug-event-detail-banner">
            <Image
              alt={banner.alt || ''}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              src={getMediaUrl(banner.url, banner.updatedAt)}
              unoptimized
            />
          </div>
        )}
        <header className="sug-event-detail-header">
          <span className="sug-event-type">{eventTypeLabels[eventType]}</span>
          <h1>{event.title}</h1>
          <dl className="sug-event-facts">
            <div>
              <dt>When</dt>
              <dd>
                <time dateTime={event.startsAt}>{formatLagosDateTime(event.startsAt)}</time>
                {event.endsAt && (
                  <>
                    <span aria-hidden="true"> – </span>
                    <time dateTime={event.endsAt}>
                      {formatLagosDateTime(event.endsAt)}
                    </time>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{event.venue || 'Venue to be announced'}</dd>
            </div>
          </dl>
        </header>
        {event.description && <p className="sug-event-description">{event.description}</p>}
      </article>
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
