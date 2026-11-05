import type { Metadata } from 'next'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
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
        ...(query
          ? [
              {
                or: [
                  { title: { like: query } },
                  { refNumber: { like: query } },
                ],
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
          <p className="sug-eyebrow">Official notices and documents</p>
          <h1>Union memos</h1>
          <p>Find official statements, notices and resources issued by your Student Union Government.</p>
        </header>

        <form action="/memos" className="sug-memo-search" role="search">
          <label htmlFor="memo-search">Search by title or reference number</label>
          <div className="sug-memo-search-controls">
            <input
              autoComplete="off"
              id="memo-search"
              maxLength={120}
              name="q"
              placeholder="e.g. SUG/MEMO/2026/014"
              type="search"
              defaultValue={query}
            />
            <button type="submit">Search</button>
          </div>
        </form>

        {memos.docs.length > 0 ? (
          <div aria-label="Published memos" className="sug-memo-list">
            {memos.docs.map((memo) => (
              <article className="sug-memo-row" key={memo.id}>
                <div className="sug-memo-information">
                  <span className="sug-memo-reference">{memo.refNumber}</span>
                  <h2>{memo.title}</h2>
                  <time dateTime={memo.issuedDate}>{formatDate(memo.issuedDate)}</time>
                </div>
                <div className="sug-memo-actions">
                  <Link className="sug-memo-button sug-memo-button-secondary" href={`/memos/${memo.slug}`}>
                    Preview
                  </Link>
                  <Link
                    className="sug-memo-button sug-memo-button-primary"
                    href={`/api/memos/${encodeURIComponent(memo.slug)}/download`}
                  >
                    Download
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sug-archive-empty">
            <h2>{query ? 'No matching memos' : 'No memos published yet'}</h2>
            <p>
              {query
                ? 'Try another title or reference number.'
                : 'Official SUG memos will appear here once they are published.'}
            </p>
            {query && <Link href="/memos">Clear search</Link>}
          </div>
        )}

        {memos.totalPages > 1 && (
          <nav aria-label="Memo pagination" className="sug-pagination">
            {page > 1 ? (
              <Link className="sug-pagination-link" href={memoPageHref(page - 1, query)}>
                Previous
              </Link>
            ) : (
              <span aria-disabled="true" className="sug-pagination-link is-disabled">
                Previous
              </span>
            )}
            <span aria-live="polite">
              Page {memos.page || page} of {memos.totalPages}
            </span>
            {page < memos.totalPages ? (
              <Link className="sug-pagination-link" href={memoPageHref(page + 1, query)}>
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
  title: 'Memos | Student Union Government',
  description: 'Browse and download published Student Union Government memos.',
}
