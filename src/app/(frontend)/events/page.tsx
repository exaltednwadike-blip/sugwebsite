import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { formatLagosDateTime } from '@/utilities/formatLagosDateTime'

type EventsPageProps = {
  searchParams: Promise<{
    view?: string
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

function getMonthLabel(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-NG', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  })
}

function getDateTile(dateString: string): { day: string; month: string } {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('en-NG', {
      day: '2-digit',
      timeZone: 'Africa/Lagos',
    }),
    month: date.toLocaleDateString('en-NG', {
      month: 'short',
      timeZone: 'Africa/Lagos',
    }),
  }
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { view: requestedView } = await searchParams
  const isPast = requestedView === 'past'
  const now = new Date().toISOString()
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    depth: 1,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: isPast ? '-startsAt' : 'startsAt',
    where: {
      and: [
        { _status: { equals: 'published' } },
        isPast
          ? { startsAt: { less_than: now } }
          : { startsAt: { greater_than_equal: now } },
      ],
    },
  })

  const eventsByMonth = new Map<string, typeof events.docs>()
  for (const event of events.docs) {
    const month = getMonthLabel(event.startsAt)
    const monthEvents = eventsByMonth.get(month) ?? []
    monthEvents.push(event)
    eventsByMonth.set(month, monthEvents)
  }

  return (
    <main className="sug-archive">
      <div className="sug-archive-container">
        <header className="sug-archive-heading">
          <p className="sug-eyebrow">Campus life, together</p>
          <h1>{isPast ? 'Past events' : 'Events'}</h1>
          <p>Find what is coming up and make time to be part of campus life.</p>
        </header>

        <nav aria-label="Event time period" className="sug-archive-filters">
          <Link
            aria-current={!isPast ? 'page' : undefined}
            className={`sug-filter-pill${!isPast ? ' is-active' : ''}`}
            href="/events"
          >
            Upcoming events
          </Link>
          <Link
            aria-current={isPast ? 'page' : undefined}
            className={`sug-filter-pill${isPast ? ' is-active' : ''}`}
            href="/events?view=past"
          >
            Past events
          </Link>
        </nav>

        {events.docs.length > 0 ? (
          <div className="sug-events-by-month">
            {[...eventsByMonth.entries()].map(([month, monthEvents]) => (
              <section aria-label={month} className="sug-event-month" key={month}>
                <h2>{month}</h2>
                <ul className="sug-event-directory-list">
                  {monthEvents.map((event) => {
                    const date = getDateTile(event.startsAt)
                    const banner =
                      typeof event.banner === 'object' && event.banner ? event.banner : null
                    const eventType = event.eventType ?? 'general'

                    return (
                      <li key={event.id}>
                        <article className="sug-event-directory-row">
                          <Link
                            aria-label={`View ${event.title}`}
                            className={`sug-date-tile event-${eventType}`}
                            href={`/events/${event.slug}`}
                          >
                            <span>{date.day}</span>
                            <strong>{date.month}</strong>
                          </Link>
                          <div className="sug-event-directory-content">
                            <span className="sug-event-type">{eventTypeLabels[eventType]}</span>
                            <h3>
                              <Link href={`/events/${event.slug}`}>{event.title}</Link>
                            </h3>
                            <p>
                              <span>{event.venue || 'Venue to be announced'}</span>
                              <span aria-hidden="true">·</span>
                              <time dateTime={event.startsAt}>
                                {formatLagosDateTime(event.startsAt)}
                              </time>
                              {event.endsAt && (
                                <>
                                  <span aria-hidden="true">–</span>
                                  <time dateTime={event.endsAt}>
                                    {new Date(event.endsAt).toLocaleTimeString('en-NG', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      timeZone: 'Africa/Lagos',
                                    })}
                                  </time>
                                </>
                              )}
                            </p>
                          </div>
                          {banner?.url && (
                            <Link
                              aria-label={`View ${event.title}`}
                              className="sug-event-directory-banner"
                              href={`/events/${event.slug}`}
                            >
                              <Image
                                alt={banner.alt || ''}
                                fill
                                sizes="(max-width: 640px) 28vw, 180px"
                                src={getMediaUrl(banner.url, banner.updatedAt)}
                                unoptimized
                              />
                            </Link>
                          )}
                        </article>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="sug-archive-empty">
            <h2>{isPast ? 'No past events yet' : 'Nothing on the calendar just yet'}</h2>
            <p>
              {isPast
                ? 'Completed SUG events will appear here.'
                : 'Published upcoming events will appear here. Please check back soon.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Events | Student Union Government',
  description: 'Browse upcoming and past Student Union Government events.',
}
