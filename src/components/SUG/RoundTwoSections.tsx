import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Lock, MapPin, ShieldCheck } from 'lucide-react'

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
    month: date.toLocaleDateString('en-NG', { month: 'short', timeZone: 'Africa/Lagos' }),
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
      <section aria-labelledby="rs-events-title" className="rs-section">
        <div className="rs-section-head">
          <h2 id="rs-events-title">Coming up</h2>
          <Link className="rs-see-all" href="/events">
            See all events <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        {eventsArePlaceholder && (
          <p className="rs-sample-note">Sample events - replace with current SUG listings.</p>
        )}
        {events.length > 0 ? (
          <ul className="rs-events">
            {events.map(({ startsAt, title, venue }) => {
              const date = formatEventDate(startsAt)
              return (
                <li className="rs-event" key={`${title}-${startsAt}`}>
                  <div className="rs-date-tile">
                    <strong>{date.day}</strong>
                    <span>{date.month}</span>
                  </div>
                  <div className="rs-event-body">
                    <h3>{title}</h3>
                    <p>
                      <MapPin aria-hidden="true" size={15} />
                      <span>{venue || 'Venue to be announced'}</span>
                    </p>
                    <p>
                      <CalendarDays aria-hidden="true" size={15} />
                      <span>{date.time}</span>
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rs-empty">No upcoming events have been announced yet.</p>
        )}
      </section>

      <section aria-labelledby="rs-exec-title" className="rs-section">
        <div className="rs-section-head">
          <h2 id="rs-exec-title">Meet your executives</h2>
          <Link className="rs-see-all" href="/executives">
            View all <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        {executivesArePlaceholder && (
          <p className="rs-sample-note">Sample executive profiles - update from the SUG admin panel.</p>
        )}
        {executives.length > 0 ? (
          <div className="rs-exec-grid">
            {executives.map(({ fullName, id, photoUrl, position }) => (
              <article className="rs-exec-card" key={id ?? `${fullName}-${position}`}>
                {photoUrl ? (
                  <Image
                    alt={`${fullName}, ${position}`}
                    className="rs-exec-photo"
                    height={96}
                    src={photoUrl}
                    unoptimized
                    width={96}
                  />
                ) : (
                  <div aria-hidden="true" className="rs-exec-initials">
                    {getInitials(fullName)}
                  </div>
                )}
                <h3>{fullName}</h3>
                <p>{position}</p>
                <Link className="rs-btn rs-btn-outline" href={id ? `/executives/${id}` : '/executives'}>
                  View Profile
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="rs-empty">Executive profiles will appear here soon.</p>
        )}
      </section>

      <section aria-labelledby="rs-welfare-title" className="rs-section">
        <div className="rs-welfare">
          <span className="rs-welfare-icon">
            <ShieldCheck aria-hidden="true" size={28} />
          </span>
          <h2 id="rs-welfare-title">Anonymous Welfare</h2>
          <p>Share your concerns safely and anonymously.</p>
          <Link className="rs-btn rs-btn-green" href="/welfare">
            Submit Anonymously
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <small>
            <Lock aria-hidden="true" size={13} /> Your privacy is our priority.
          </small>
        </div>
      </section>
    </>
  )
}