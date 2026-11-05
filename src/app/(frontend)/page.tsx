import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { Homepage } from '@/components/SUG/Homepage'
import {
  getPlaceholderEvents,
  placeholderExecutives,
  type HomepageEvent,
  type HomepageExecutive,
} from '@/data/homepageRoundTwo'
import { latestNews, newsFilters, type HomepageNewsFilter, type HomepageNewsItem } from '@/data/homepage'
import { getPayload } from 'payload'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()
  const [eventResult, executiveResult, postsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'events',
      depth: 1,
      draft: false,
      limit: 3,
      overrideAccess: false,
      sort: 'startsAt',
      where: {
        startsAt: {
          greater_than_equal: now,
        },
      },
    }),
    payload.find({
      collection: 'exco-members',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: 'sortOrder',
      where: {
        isSpotlight: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      limit: 3,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: 'title',
    }),
  ])

  const eventItems: HomepageEvent[] = eventResult.docs.map((event) => ({
    title: event.title,
    startsAt: event.startsAt,
    venue: event.venue ?? '',
    eventType: event.eventType ?? 'general',
  }))
  const executiveItems: HomepageExecutive[] = executiveResult.docs.map((executive) => ({
    id: executive.id,
    fullName: executive.fullName,
    position: executive.position,
    photoUrl: typeof executive.photo === 'object' ? (executive.photo?.url ?? null) : null,
  }))
  const newsItems: HomepageNewsItem[] = postsResult.docs.map((post) => {
    const category = post.categories?.find((item) => typeof item === 'object')
    return {
      category: typeof category === 'object' ? category.title : 'Union Press',
      categorySlug: typeof category === 'object' ? category.slug : null,
      date: new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      headline: post.title,
      author: post.populatedAuthors?.[0]?.name || 'SUG Press Team',
      slug: post.slug,
    }
  })
  const fallbackNewsItems: HomepageNewsItem[] = latestNews.map((item) => ({
    ...item,
    categorySlug: item.category.toLowerCase().replace(/\s+/g, '-'),
    slug: null,
  }))
  const newsCategories: HomepageNewsFilter[] =
    categoriesResult.docs.length > 0
      ? categoriesResult.docs.map(({ slug, title }) => ({ label: title, slug }))
      : newsFilters
          .filter((category) => category !== 'All')
          .map((label) => ({ label, slug: label.toLowerCase().replace(/\s+/g, '-') }))

  return (
    <Homepage
      events={eventItems.length > 0 ? eventItems : getPlaceholderEvents()}
      eventsArePlaceholder={eventItems.length === 0}
      executives={executiveItems.length > 0 ? executiveItems : placeholderExecutives}
      executivesArePlaceholder={executiveItems.length === 0}
      newsItems={newsItems.length > 0 ? newsItems : fallbackNewsItems}
      newsCategories={newsCategories}
    />
  )
}

export const metadata: Metadata = {
  title: 'Student Union Government | University of Nigeria, Enugu Campus',
  description:
    'News, updates, resources and support from the Student Union Government of the University of Nigeria, Enugu Campus.',
}
