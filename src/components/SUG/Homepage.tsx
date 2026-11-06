import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FileText, FolderOpen, Search, ShieldCheck } from 'lucide-react'

import { heroContent, utilityCards, type HomepageNewsItem } from '@/data/homepage'
import type { HomepageEvent, HomepageExecutive } from '@/data/homepageRoundTwo'
import { LatestNews } from './LatestNews'
import { RoundTwoSections } from './RoundTwoSections'

interface HomepageProps {
  events: HomepageEvent[]
  executives: HomepageExecutive[]
  eventsArePlaceholder: boolean
  executivesArePlaceholder: boolean
  newsItems: HomepageNewsItem[]
}

const hubIcons = {
  memos: FileText,
  resources: FolderOpen,
  lost: Search,
  welfare: ShieldCheck,
} as const

export function Homepage({
  events,
  executives,
  eventsArePlaceholder,
  executivesArePlaceholder,
  newsItems,
}: HomepageProps) {
  return (
    <main className="rs-main">
      <div className="rs-wrap">
        <section aria-labelledby="rs-hero-title" className="rs-hero">
          <div className="rs-hero-media">
            <Image
              alt={heroContent.imageAlt}
              className="rs-hero-img"
              fill
              priority
              sizes="(min-width: 1200px) 1200px, 100vw"
              src={heroContent.image}
              unoptimized
            />
          </div>
          <div className="rs-hero-copy">
            <h1 id="rs-hero-title">{heroContent.headline}</h1>
            <p>{heroContent.subline}</p>
            <div className="rs-hero-actions">
              <Link className="rs-btn rs-btn-green" href={heroContent.primary.href}>
                {heroContent.primary.label}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link className="rs-btn rs-btn-outline" href={heroContent.secondary.href}>
                {heroContent.secondary.label}
              </Link>
            </div>
          </div>
        </section>

        <section aria-label="Quick links" className="rs-hub">
          {utilityCards.map(({ description, href, icon, title }) => {
            const Icon = hubIcons[icon]
            return (
              <Link className="rs-hub-card" href={href} key={title}>
                <span className="rs-hub-icon">
                  <Icon aria-hidden="true" size={24} />
                </span>
                <span className="rs-hub-title">{title}</span>
                <span className="rs-hub-desc">{description}</span>
              </Link>
            )
          })}
        </section>

        <LatestNews items={newsItems} />
        <RoundTwoSections
          events={events}
          eventsArePlaceholder={eventsArePlaceholder}
          executives={executives}
          executivesArePlaceholder={executivesArePlaceholder}
        />
      </div>
    </main>
  )
}