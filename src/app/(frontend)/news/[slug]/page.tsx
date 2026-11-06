import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

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
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
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
  const categories = post.categories?.filter((category) => typeof category === 'object') ?? []
  const publishedDate = post.publishedAt || post.createdAt
  const src = image?.url ? getMediaUrl(image.url, image.updatedAt) : '/images/news-1.jpg'

  return (
    <main className="rs-main">
      <div className="rs-wrap rs-inner">
        <article className="rs-article">
          <Link className="rs-back" href="/news">
            <ArrowLeft aria-hidden="true" size={16} /> All news
          </Link>
          <header>
            <div className="rs-article-cats">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <span className="rs-chip" key={category.id}>
                    {category.title}
                  </span>
                ))
              ) : (
                <span className="rs-chip">Union Press</span>
              )}
            </div>
            <h1>{post.title}</h1>
            <p className="rs-byline">
              By {authorNames?.length ? authorNames.join(', ') : 'SUG Press Team'} &middot;{' '}
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
            </p>
          </header>
          <div className="rs-article-cover">
            <Image alt={image?.alt || ''} fill priority sizes="(min-width: 800px) 800px, 100vw" src={src} unoptimized />
          </div>
          <RichText className="rs-article-body" data={post.content} enableGutter={false} enableProse />
        </article>
      </div>
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