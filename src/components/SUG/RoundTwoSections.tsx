import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'

import type { HomepageEvent, HomepageExecutive } from '@/data/homepageRoundTwo'

interface RoundTwoSectionsProps {
  events: HomepageEvent[]
  executives: HomepageExecutive[]
  eventsArePlaceholder: boolean
  executivesArePlaceholder: boolean
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatEventDate(startsAt: string): { day: string; month: string; time: string } {
  const date = new Date(startsAt)
  return {
    day: date.toLocaleDateString('en-NG', { day: '2-digit', timeZone: 'Africa/Lagos' }),
    month: date.toLocaleDateString('en-NG', {
      month: 'short',
      timeZone: 'Africa/Lagos',
    }),
    time: date.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Africa/Lagos',
    }),
  }
}

export function RoundTwoSections({
  events,
  executives,
  eventsArePlaceholder,
  executivesArePlaceholder,
}: RoundTwoSectionsProps) {
  return (
    <>
      <section aria-labelledby="upcoming-events-title" className="sug-events-section">
        <div className="sug-round-section-heading">
          <div>
            <p className="sug-eyebrow">Make a little time</p>
            <h2 id="upcoming-events-title">Coming up</h2>
          </div>
          <Link className="sug-text-link" href="/events">
            See all events <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        {eventsArePlaceholder && (
          <p className="sug-placeholder-label">Sample events — replace with current SUG listings.</p>
        )}
        {events.length > 0 ? (
          <ul className="sug-events-list">
            {events.map(({ eventType, startsAt, title, venue }) => {
              const date = formatEventDate(startsAt)
              return (
                <li className="sug-event-row" key={`${title}-${startsAt}`}>
                  <div className={`sug-date-tile event-${eventType}`}>
                    <span>{date.day}</span>
                    <strong>{date.month}</strong>
                  </div>
                  <div className="sug-event-details">
                    <h3>{title}</h3>
                    <p>
                      <MapPin aria-hidden="true" size={15} />
                      <span>{venue || 'Venue to be announced'}</span>
                      <span aria-hidden="true" className="sug-detail-divider">
                        ·
                      </span>
                      <CalendarDays aria-hidden="true" size={15} />
                      <span>{date.time}</span>
                    </p>
                  </div>
                  <ArrowRight aria-hidden="true" className="sug-event-arrow" size={20} />
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="sug-empty-message">No upcoming events have been announced yet.</p>
        )}
      </section>

      <section aria-labelledby="executives-title" className="sug-executives-section">
        <div className="sug-round-section-heading">
          <div>
            <p className="sug-eyebrow">The people behind the work</p>
            <h2 id="executives-title">Meet your executives</h2>
          </div>
        </div>
        {executivesArePlaceholder && (
          <p className="sug-placeholder-label">Sample executive profiles — update from the SUG admin panel.</p>
        )}
        {executives.length > 0 ? (
          <div className="sug-executives-grid">
            {executives.map(({ fullName, photoUrl, position }) => (
              <article className="sug-executive-card" key={`${fullName}-${position}`}>
                {photoUrl ? (
                  <Image
                    alt={`${fullName}, ${position}`}
                    className="sug-executive-photo"
                    height={104}
                    src={photoUrl}
                    unoptimized
                    width={104}
                  />
                ) : (
                  <div aria-hidden="true" className="sug-executive-initials">
                    {getInitials(fullName)}
                  </div>
                )}
                <h3>{fullName}</h3>
                <p>{position}</p>
                <Link className="sug-contact-button" href="/executives">
                  Contact
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="sug-empty-message">Executive profiles will appear here soon.</p>
        )}
      </section>

      <section aria-labelledby="welfare-banner-title" className="sug-welfare-banner">
        <div>
          <p className="sug-eyebrow">Your wellbeing matters</p>
          <h2 id="welfare-banner-title">Something wrong on campus? Say it safely.</h2>
          <p>
            No name needed. You get a ticket code to follow up, and only the Welfare team can read
            your report.
          </p>
        </div>
        <Link className="sug-welfare-button" href="/welfare">
          Submit anonymously
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </section>
    </>
  )
}
