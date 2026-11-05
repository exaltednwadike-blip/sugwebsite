import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import RichText from '@/components/RichText'
import { formatDate } from '@/utilities/formatDate'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getPayload } from 'payload'

type NewsDetailProps = {
  params: Promise<{
    slug: string
  }>
}

const getPublishedPost = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  return result.docs[0] ?? null
})

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params
  const post = await getPublishedPost(decodeURIComponent(slug))

  if (!post) notFound()

  const image = typeof post.heroImage === 'object' && post.heroImage ? post.heroImage : null
  const authorNames = post.populatedAuthors
    ?.map(({ name }) => name)
    .filter((name): name is string => Boolean(name))
  const categories =
    post.categories?.filter((category) => typeof category === 'object') ?? []
  const publishedDate = post.publishedAt || post.createdAt

  return (
    <main className="sug-article-page">
      <article className="sug-article">
        <Link className="sug-article-back" href="/news">
          ← All news
        </Link>
        <header className="sug-article-header">
          <div className="sug-article-categories">
            {categories.length > 0
              ? categories.map((category) => (
                  <span className="sug-news-category" key={category.id}>
                    {category.title}
                  </span>
                ))
              : <span className="sug-news-category">Union Press</span>}
          </div>
          <h1>{post.title}</h1>
          <div className="sug-article-byline">
            <span>By {authorNames?.length ? authorNames.join(', ') : 'SUG Press Team'}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
          </div>
        </header>

        <div className="sug-article-cover">
          {image?.url ? (
            <Image
              alt={image.alt || ''}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 800px"
              src={getMediaUrl(image.url, image.updatedAt)}
              unoptimized
            />
          ) : (
            <span aria-hidden="true" className="sug-archive-image-placeholder" />
          )}
        </div>

        <RichText
          className="sug-article-body"
          data={post.content}
          enableGutter={false}
          enableProse
        />
      </article>
    </main>
  )
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(decodeURIComponent(slug))

  if (!post) {
    return {
      title: 'News story not found | Student Union Government',
      description: 'This published news story could not be found.',
    }
  }

  return {
    title: `${post.title} | Student Union Government`,
    description: post.meta?.description || `Read ${post.title} from your Student Union Government.`,
  }
}
