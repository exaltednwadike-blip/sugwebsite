import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { HomepageNewsItem } from '@/data/homepage'

const fallbackImages = ['/images/news-1.jpg', '/images/news-2.jpg', '/images/news-1.jpg'] as const

export function LatestNews({ items }: { items: HomepageNewsItem[] }) {
  const visible = items.slice(0, 3)
  if (visible.length === 0) return null

  return (
    <section aria-labelledby="rs-news-title" className="rs-section">
      <div className="rs-section-head">
        <h2 id="rs-news-title">Latest from the Union</h2>
        <Link className="rs-see-all" href="/news">
          See all news <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <div className="rs-news-grid">
        {visible.map((item, index) => {
          const href = item.slug ? `/news/${item.slug}` : '/news'
          const image = item.imageUrl ?? fallbackImages[index % fallbackImages.length]
          return (
            <article className="rs-news-card" key={item.headline}>
              <Link className="rs-news-link" href={href}>
                <div className="rs-news-image">
                  <Image alt="" fill sizes="(min-width: 900px) 33vw, 100vw" src={image} unoptimized />
                </div>
                <div className="rs-news-body">
                  <div className="rs-news-meta">
                    <span className="rs-chip">{item.category}</span>
                    <time>{item.date}</time>
                  </div>
                  <h3>{item.headline}</h3>
                  {item.excerpt && <p>{item.excerpt}</p>}
                  <span className="rs-read-more">
                    Read more <ArrowRight aria-hidden="true" size={15} />
                  </span>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}