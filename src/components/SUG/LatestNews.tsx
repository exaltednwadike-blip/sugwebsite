'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import type { HomepageNewsFilter, HomepageNewsItem } from '@/data/homepage'

export function LatestNews({
  items,
  categories,
}: {
  items: HomepageNewsItem[]
  categories: HomepageNewsFilter[]
}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const visibleNews =
    activeFilter === 'all'
      ? items.slice(0, 3)
      : items.filter(
          ({ category, categorySlug }) =>
            categorySlug === activeFilter ||
            (!categorySlug && category.toLowerCase() === activeFilter.toLowerCase()),
        )

  return (
    <section aria-labelledby="latest-news-title" className="sug-news-section">
      <div className="sug-section-heading">
        <div>
          <p className="sug-eyebrow">On campus, in the know</p>
          <h2 id="latest-news-title">Latest from the union</h2>
        </div>
        <div aria-label="Filter news by category" className="sug-news-filters" role="group">
          <button
            aria-pressed={activeFilter === 'all'}
            className={`sug-filter-pill${activeFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
            type="button"
          >
            All
          </button>
          {categories.map((filter) => (
            <button
              aria-pressed={activeFilter === filter.slug}
              className={`sug-filter-pill${activeFilter === filter.slug ? ' is-active' : ''}`}
              key={filter.slug}
              onClick={() => setActiveFilter(filter.slug)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      <div className="sug-news-grid">
        {visibleNews.map(({ author, category, date, headline, slug }, index) => (
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
            <Link
              aria-label={`Read: ${headline}`}
              className="sug-news-link"
              href={slug ? `/news/${slug}` : '/news'}
            >
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
