import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Search } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { Pager } from '@/components/SUG/Pager'
import { formatDate } from '@/utilities/formatDate'

type MemosPageProps = {
  searchParams: Promise<{
    page?: string
    q?: string
  }>
}

function memoPageHref(page: number, query: string): string {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (page > 1) params.set('page', String(page))
  const search = params.toString()
  return search ? `/memos?${search}` : '/memos'
}

export default async function MemosPage({ searchParams }: MemosPageProps) {
  const { page: pageParam, q: rawQuery } = await searchParams
  const query = rawQuery?.trim().slice(0, 120) ?? ''
  const requestedPage = Number.parseInt(pageParam || '1', 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const payload = await getPayload({ config: configPromise })
  const memos = await payload.find({
    collection: 'memos',
    depth: 1,
    draft: false,
    limit: 10,
    overrideAccess: false,
    page,
    sort: '-issuedDate',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(query ? [{ or: [{ title: { like: query } }, { refNumber: { like: query } }] }] : []),
      ],
    },
  })

  return (
    <main className="rs-main">
      <PageBanner subtitle="Official memos and circulars." title="Memos" />
      <div className="rs-wrap rs-inner">
        <form action="/memos" className="rs-searchbar" role="search">
          <label className="sr-only" htmlFor="memo-search">
            Search by title or reference number
          </label>
          <input
            autoComplete="off"
            defaultValue={query}
            id="memo-search"
            maxLength={120}
            name="q"
            placeholder="Search memos by title or reference number"
            type="search"
          />
          <button aria-label="Search" type="submit">
            <Search aria-hidden="true" size={20} />
          </button>
        </form>

        {memos.docs.length > 0 ? (
          <div aria-label="Published memos" className="rs-rows">
            {memos.docs.map((memo) => (
              <article className="rs-row" key={memo.id}>
                <div className="rs-row-main">
                  <span className="rs-ref">{memo.refNumber}</span>
                  <h2>{memo.title}</h2>
                  <time dateTime={memo.issuedDate}>{formatDate(memo.issuedDate)}</time>
                </div>
                <div className="rs-row-actions">
                  <Link className="rs-btn rs-btn-outline rs-btn-sm" href={`/memos/${memo.slug}`}>
                    Preview
                  </Link>
                  <Link
                    className="rs-btn rs-btn-green rs-btn-sm"
                    href={`/api/memos/${encodeURIComponent(memo.slug)}/download`}
                  >
                    Download
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>{query ? 'No matching memos' : 'No Items Yet'}</h2>
            <p>
              {query
                ? 'Try another title or reference number.'
                : 'There are no memos at the moment. Check back later.'}
            </p>
            {query && <Link className="rs-btn rs-btn-green" href="/memos">Clear search</Link>}
          </div>
        )}

        <Pager
          hrefFor={(p) => memoPageHref(p, query)}
          label="Memo pagination"
          page={page}
          totalPages={memos.totalPages}
        />
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Memos | Student Union Government',
  description: 'Browse and download published Student Union Government memos.',
}