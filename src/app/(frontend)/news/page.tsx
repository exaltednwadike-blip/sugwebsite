import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
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
        {
          _status: {
            equals: 'published',
          },
        },
        ...(selectedCategory
          ? [
              {
                categories: {
                  contains: selectedCategory.id,
                },
              },
            ]
          : []),
      ],
    },
  })

  return (
    <main className="sug-archive">
      <div className="sug-archive-container">
        <header className="sug-archive-heading">
          <p className="sug-eyebrow">Campus voices, union updates</p>
          <h1>News from your union</h1>
          <p>Stories, notices and updates from across the University of Nigeria, Enugu Campus.</p>
        </header>

        <nav aria-label="Filter news by category" className="sug-archive-filters">
          <Link
            aria-current={!selectedCategory ? 'page' : undefined}
            className={`sug-filter-pill${!selectedCategory ? ' is-active' : ''}`}
            href="/news"
          >
            All
          </Link>
          {categoriesResult.docs.map((category) => (
            <Link
              aria-current={selectedCategory?.id === category.id ? 'page' : undefined}
              className={`sug-filter-pill${selectedCategory?.id === category.id ? ' is-active' : ''}`}
              href={pageHref(1, category.slug)}
              key={category.id}
            >
              {category.title}
            </Link>
          ))}
        </nav>

        {posts.docs.length > 0 ? (
          <div className="sug-archive-grid">
            {posts.docs.map((post) => {
              const image =
                typeof post.heroImage === 'object' && post.heroImage
                  ? post.heroImage
                  : null
              const category = post.categories?.find((item) => typeof item === 'object')

              return (
                <article className="sug-archive-card" key={post.id}>
                  <Link
                    aria-label={`Read ${post.title}`}
                    className="sug-archive-image"
                    href={`/news/${post.slug}`}
                  >
                    {image?.url ? (
                      <Image
                        alt={image.alt || ''}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={getMediaUrl(image.url, image.updatedAt)}
                        unoptimized
                      />
                    ) : (
                      <span aria-hidden="true" className="sug-archive-image-placeholder" />
                    )}
                  </Link>
                  <div className="sug-archive-card-copy">
                    <div className="sug-archive-meta">
                      <span className="sug-news-category">
                        {typeof category === 'object' ? category.title : 'Union Press'}
                      </span>
                      <time dateTime={post.publishedAt || post.createdAt}>
                        {formatDate(post.publishedAt || post.createdAt)}
                      </time>
                    </div>
                    <h2>
                      <Link href={`/news/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.meta?.description && <p>{post.meta.description}</p>}
                    <Link className="sug-news-link" href={`/news/${post.slug}`}>
                      Read story <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="sug-archive-empty">
            <h2>No news found just yet</h2>
            <p>
              {selectedCategory
                ? `There are no published stories in ${selectedCategory.title} yet.`
                : 'Published SUG stories will appear here. Please check back soon.'}
            </p>
            {selectedCategory && <Link href="/news">See all news</Link>}
          </div>
        )}

        {posts.totalPages > 1 && (
          <nav aria-label="News pagination" className="sug-pagination">
            {page > 1 ? (
              <Link className="sug-pagination-link" href={pageHref(page - 1, selectedCategory?.slug)}>
                Previous
              </Link>
            ) : (
              <span aria-disabled="true" className="sug-pagination-link is-disabled">
                Previous
              </span>
            )}
            <span aria-live="polite">
              Page {posts.page || page} of {posts.totalPages}
            </span>
            {page < posts.totalPages ? (
              <Link className="sug-pagination-link" href={pageHref(page + 1, selectedCategory?.slug)}>
                Next
              </Link>
            ) : (
              <span aria-disabled="true" className="sug-pagination-link is-disabled">
                Next
              </span>
            )}
          </nav>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'News | Student Union Government',
  description: 'Read the latest news, notices and updates from your Student Union Government.',
}
