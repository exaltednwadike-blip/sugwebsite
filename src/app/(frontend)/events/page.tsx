import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
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
    day: date.toLocaleDateString('en-NG', { day: '2-digit', timeZone: 'Africa/Lagos' }),
    month: date.toLocaleDateString('en-NG', { month: 'short', timeZone: 'Africa/Lagos' }),
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
        isPast ? { startsAt: { less_than: now } } : { startsAt: { greater_than_equal: now } },
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
    <main className="rs-main">
      <PageBanner subtitle="Upcoming and past events." title="Events" />
      <div className="rs-wrap rs-inner">
        <nav aria-label="Event time period" className="rs-tabs">
          <Link
            aria-current={!isPast ? 'page' : undefined}
            className={!isPast ? 'rs-tab is-active' : 'rs-tab'}
            href="/events"
          >
            Upcoming
          </Link>
          <Link
            aria-current={isPast ? 'page' : undefined}
            className={isPast ? 'rs-tab is-active' : 'rs-tab'}
            href="/events?view=past"
          >
            Past
          </Link>
        </nav>

        {events.docs.length > 0 ? (
          <div className="rs-months">
            {[...eventsByMonth.entries()].map(([month, monthEvents]) => (
              <section aria-label={month} key={month}>
                <h2 className="rs-month">{month}</h2>
                <ul className="rs-rows rs-plain-list">
                  {monthEvents.map((event) => {
                    const date = getDateTile(event.startsAt)
                    const banner = typeof event.banner === 'object' && event.banner ? event.banner : null
                    const eventType = event.eventType ?? 'general'

                    return (
                      <li key={event.id}>
                        <article className="rs-row rs-event-row">
                          <Link aria-label={`View ${event.title}`} className="rs-date-tile" href={`/events/${event.slug}`}>
                            <strong>{date.day}</strong>
                            <span>{date.month}</span>
                          </Link>
                          <div className="rs-row-main">
                            <span className="rs-chip">{eventTypeLabels[eventType]}</span>
                            <h3>
                              <Link href={`/events/${event.slug}`}>{event.title}</Link>
                            </h3>
                            <p>
                              {event.venue || 'Venue to be announced'} &middot;{' '}
                              <time dateTime={event.startsAt}>{formatLagosDateTime(event.startsAt)}</time>
                              {event.endsAt && (
                                <>
                                  {' '}
                                  &ndash;{' '}
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
                            <Link aria-label={`View ${event.title}`} className="rs-event-thumb" href={`/events/${event.slug}`}>
                              <Image
                                alt={banner.alt || ''}
                                fill
                                sizes="160px"
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
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
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