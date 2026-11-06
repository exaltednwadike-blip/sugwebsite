import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { Pager } from '@/components/SUG/Pager'
import { formatDate } from '@/utilities/formatDate'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type NewsPageProps = {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
}

function pageHref(page: number, category?: string): string {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/news?${query}` : '/news'
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { category: categorySlug, page: pageParam } = await searchParams
  const requestedPage = Number.parseInt(pageParam || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const payload = await getPayload({ config: configPromise })
  const categoriesResult = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })
  const selectedCategory = categoriesResult.docs.find(({ slug }) => slug === categorySlug)

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: 9,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(selectedCategory ? [{ categories: { contains: selectedCategory.id } }] : []),
      ],
    },
  })

  return (
    <main className="rs-main">
      <PageBanner subtitle="Stay updated with the latest from the SUG." title="News" />
      <div className="rs-wrap rs-inner">
        <nav aria-label="Filter news by category" className="rs-tabs">
          <Link
            aria-current={!selectedCategory ? 'page' : undefined}
            className={!selectedCategory ? 'rs-tab is-active' : 'rs-tab'}
            href="/news"
          >
            All
          </Link>
          {categoriesResult.docs.map((category) => (
            <Link
              aria-current={selectedCategory?.id === category.id ? 'page' : undefined}
              className={selectedCategory?.id === category.id ? 'rs-tab is-active' : 'rs-tab'}
              href={pageHref(1, category.slug)}
              key={category.id}
            >
              {category.title}
            </Link>
          ))}
        </nav>

        {posts.docs.length > 0 ? (
          <div className="rs-news-grid">
            {posts.docs.map((post) => {
              const image = typeof post.heroImage === 'object' && post.heroImage ? post.heroImage : null
              const category = post.categories?.find((item) => typeof item === 'object')
              const src = image?.url ? getMediaUrl(image.url, image.updatedAt) : '/images/news-1.jpg'

              return (
                <article className="rs-news-card" key={post.id}>
                  <Link className="rs-news-link" href={`/news/${post.slug}`}>
                    <div className="rs-news-image">
                      <Image alt={image?.alt || ''} fill sizes="(min-width: 900px) 33vw, 100vw" src={src} unoptimized />
                    </div>
                    <div className="rs-news-body">
                      <div className="rs-news-meta">
                        <span className="rs-chip">
                          {typeof category === 'object' ? category.title : 'Union Press'}
                        </span>
                        <time dateTime={post.publishedAt || post.createdAt}>
                          {formatDate(post.publishedAt || post.createdAt)}
                        </time>
                      </div>
                      <h2>{post.title}</h2>
                      {post.meta?.description && <p>{post.meta.description}</p>}
                      <span className="rs-read-more">
                        Read more <ArrowRight aria-hidden="true" size={15} />
                      </span>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>No news found just yet</h2>
            <p>
              {selectedCategory
                ? `There are no published stories in ${selectedCategory.title} yet.`
                : 'Published SUG stories will appear here. Please check back soon.'}
            </p>
            {selectedCategory && <Link className="rs-btn rs-btn-green" href="/news">See all news</Link>}
          </div>
        )}

        <Pager
          hrefFor={(p) => pageHref(p, selectedCategory?.slug)}
          label="News pagination"
          page={page}
          totalPages={posts.totalPages}
        />
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'News | Student Union Government',
  description: 'Read the latest news, notices and updates from your Student Union Government.',
}