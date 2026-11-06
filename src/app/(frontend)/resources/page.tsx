import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, Search } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { Pager } from '@/components/SUG/Pager'
import { formatDate } from '@/utilities/formatDate'

type ResourcesPageProps = {
  searchParams: Promise<{
    category?: string
    page?: string
    q?: string
  }>
}

const resourceCategories = [
  { value: 'constitution', label: 'Constitution' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'forms', label: 'Forms' },
  { value: 'guidelines', label: 'Guidelines' },
  { value: 'other', label: 'Other' },
] as const

type ResourceCategory = (typeof resourceCategories)[number]['value']

function isResourceCategory(value: string | undefined): value is ResourceCategory {
  return resourceCategories.some((category) => category.value === value)
}

function resourcesHref(page: number, category: string, query: string): string {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (query) params.set('q', query)
  if (page > 1) params.set('page', String(page))
  const search = params.toString()
  return search ? `/resources?${search}` : '/resources'
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { category: categoryParam, page: pageParam, q: rawQuery } = await searchParams
  const category = isResourceCategory(categoryParam) ? categoryParam : ''
  const query = rawQuery?.trim().slice(0, 120) ?? ''
  const requestedPage = Number.parseInt(pageParam || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const payload = await getPayload({ config: configPromise })
  const resources = await payload.find({
    collection: 'resources',
    depth: 1,
    draft: false,
    limit: 12,
    overrideAccess: false,
    page,
    sort: '-publishedDate',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(category ? [{ category: { equals: category } }] : []),
        ...(query ? [{ title: { like: query } }] : []),
      ],
    },
  })

  return (
    <main className="rs-main">
      <PageBanner subtitle="Important documents and guides." title="Resources" />
      <div className="rs-wrap rs-inner">
        <nav aria-label="Filter resources by category" className="rs-tabs">
          <Link
            aria-current={!category ? 'page' : undefined}
            className={!category ? 'rs-tab is-active' : 'rs-tab'}
            href={resourcesHref(1, '', query)}
          >
            All
          </Link>
          {resourceCategories.map(({ label, value }) => (
            <Link
              aria-current={category === value ? 'page' : undefined}
              className={category === value ? 'rs-tab is-active' : 'rs-tab'}
              href={resourcesHref(1, value, query)}
              key={value}
            >
              {label}
            </Link>
          ))}
        </nav>

        <form action="/resources" className="rs-searchbar" role="search">
          {category && <input name="category" type="hidden" value={category} />}
          <label className="sr-only" htmlFor="resource-search">
            Search resources by title
          </label>
          <input
            autoComplete="off"
            defaultValue={query}
            id="resource-search"
            maxLength={120}
            name="q"
            placeholder="Search resources"
            type="search"
          />
          <button aria-label="Search" type="submit">
            <Search aria-hidden="true" size={20} />
          </button>
        </form>

        {resources.docs.length > 0 ? (
          <div aria-label="Published resources" className="rs-rows">
            {resources.docs.map((resource) => {
              const file = typeof resource.file === 'object' && resource.file ? resource.file : null
              const categoryLabel =
                resourceCategories.find(({ value }) => value === resource.category)?.label ?? 'Other'
              const downloadHref = `/api/resources/${encodeURIComponent(resource.slug)}/download`
              const isPDF = file?.mimeType === 'application/pdf'

              return (
                <article className="rs-row" key={resource.id}>
                  <span aria-hidden="true" className="rs-file-icon">
                    <FileText size={22} />
                  </span>
                  <div className="rs-row-main">
                    <h2>{resource.title}</h2>
                    <p>
                      <span className="rs-chip">{categoryLabel}</span>{' '}
                      <time dateTime={resource.publishedDate}>{formatDate(resource.publishedDate)}</time>
                    </p>
                    {resource.description && <p>{resource.description}</p>}
                  </div>
                  <div className="rs-row-actions">
                    {isPDF && file?.url && (
                      <a className="rs-btn rs-btn-outline rs-btn-sm" href={file.url} rel="noreferrer" target="_blank">
                        Preview
                      </a>
                    )}
                    <a className="rs-btn rs-btn-green rs-btn-sm" href={downloadHref}>
                      Download
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>{query || category ? 'No matching resources' : 'No Items Yet'}</h2>
            <p>
              {query || category
                ? 'Try another search or choose a different category.'
                : 'Published SUG resources will appear here soon.'}
            </p>
            {(query || category) && <Link className="rs-btn rs-btn-green" href="/resources">Clear filters</Link>}
          </div>
        )}

        <Pager
          hrefFor={(p) => resourcesHref(p, category, query)}
          label="Resource pagination"
          page={page}
          totalPages={resources.totalPages}
        />
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Resources | Student Union Government',
  description: 'Browse published Student Union Government resources and documents.',
}