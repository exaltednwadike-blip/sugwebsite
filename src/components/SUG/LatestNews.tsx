'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { latestNews, newsFilters } from '@/data/homepage'

export function LatestNews() {
  const [activeFilter, setActiveFilter] = useState<(typeof newsFilters)[number]>('All')
  const visibleNews =
    activeFilter === 'All'
      ? latestNews.slice(0, 3)
      : latestNews.filter(({ category }) => category === activeFilter)

  return (
    <section aria-labelledby="latest-news-title" className="sug-news-section">
      <div className="sug-section-heading">
        <div>
          <p className="sug-eyebrow">On campus, in the know</p>
          <h2 id="latest-news-title">Latest from the union</h2>
        </div>
        <div aria-label="Filter news by category" className="sug-news-filters">
          {newsFilters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter}
              className={`sug-filter-pill${activeFilter === filter ? ' is-active' : ''}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="sug-news-grid">
        {visibleNews.map(({ author, category, date, headline }, index) => (
          <article
            className={`sug-news-card${index === 0 ? ' sug-news-featured' : ''}`}
            key={headline}
          >
            <div className="sug-news-meta">
              <span className="sug-news-category">{category}</span>
              <time>{date}</time>
            </div>
            <h3>{headline}</h3>
            <p className="sug-news-author">By {author}</p>
            <Link aria-label={`Read: ${headline}`} className="sug-news-link" href="/posts">
              <span>Read story</span>
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </article>
        ))}
        {visibleNews.length === 0 && (
          <p className="sug-news-empty">No updates in this category just yet. Check back soon.</p>
        )}
      </div>
    </section>
  )
}
