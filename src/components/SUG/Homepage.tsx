import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  CalendarDays,
  MessageCircleWarning,
  Search,
} from 'lucide-react'

import { heroContent, utilityCards } from '@/data/homepage'
import type { HomepageEvent, HomepageExecutive } from '@/data/homepageRoundTwo'
import { LatestNews } from './LatestNews'
import { RoundTwoSections } from './RoundTwoSections'

interface HomepageProps {
  events: HomepageEvent[]
  executives: HomepageExecutive[]
  eventsArePlaceholder: boolean
  executivesArePlaceholder: boolean
}

const utilityIcons = {
  message: MessageCircleWarning,
  search: Search,
  book: BookOpen,
  calendar: CalendarDays,
} as const

export function Homepage({
  events,
  executives,
  eventsArePlaceholder,
  executivesArePlaceholder,
}: HomepageProps) {
  return (
    <main className="sug-home">
      <div className="sug-home-container">
        <section aria-labelledby="hero-title" className="sug-hero">
          <div className="sug-hero-copy">
            <span className="sug-hero-eyebrow">{heroContent.eyebrow}</span>
            <h1 id="hero-title">
              {heroContent.headline}
              <span className="sug-hero-highlight">{heroContent.highlight}</span>
            </h1>
            <p className="sug-hero-description">{heroContent.description}</p>
            <div className="sug-hero-actions">
              <Link className="sug-hero-button sug-hero-button-primary" href={heroContent.downloadHref}>
                <ArrowDownToLine aria-hidden="true" size={18} />
                Download PDF
              </Link>
              <Link className="sug-hero-button sug-hero-button-secondary" href={heroContent.statementHref}>
                Read statement
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="sug-hero-art">
            <span className="sug-art-circle sug-art-lime" />
            <span className="sug-art-circle sug-art-dark" />
            <div className="sug-art-card sug-art-card-campus">
              <span className="sug-art-sun" />
              <span className="sug-art-card-label">[Campus photo]</span>
            </div>
            <div className="sug-art-card sug-art-card-event">
              <span className="sug-art-card-label">[Event photo]</span>
              <span className="sug-art-event-lines" />
            </div>
            <div className="sug-art-sticker">
              <span>Town hall</span>
              <strong>[Day] · [Time]</strong>
            </div>
          </div>
        </section>

        <section aria-label="Student resources and quick links" className="sug-utility-grid">
          {utilityCards.map(({ description, href, icon, title, tone }) => {
            const Icon = utilityIcons[icon]
            return (
              <Link className="sug-utility-card" href={href} key={title}>
                <span className={`sug-utility-icon tone-${tone}`}>
                  <Icon aria-hidden="true" size={23} />
                </span>
                <span className="sug-utility-title">{title}</span>
                <span className="sug-utility-description">{description}</span>
                <ArrowRight aria-hidden="true" className="sug-utility-arrow" size={19} />
              </Link>
            )
          })}
        </section>

        <LatestNews />
        <RoundTwoSections
          events={events}
          executives={executives}
          eventsArePlaceholder={eventsArePlaceholder}
          executivesArePlaceholder={executivesArePlaceholder}
        />
      </div>
    </main>
  )
}
