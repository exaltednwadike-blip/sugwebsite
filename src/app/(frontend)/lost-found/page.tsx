import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import type { Where } from 'payload'

import type { Media } from '@/payload-types'

import './lf.css'

export const metadata: Metadata = {
  title: 'Lost & Found | SUG UNEC',
  description: 'Report or find lost items on the UNEC campus.',
}

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ kind?: string; q?: string; page?: string }>

function href(kind: string, q: string, page: number): string {
  const p = new URLSearchParams()
  if (kind) p.set('kind', kind)
  if (q) p.set('q', q)
  if (page > 1) p.set('page', String(page))
  const s = p.toString()
  return s ? `/lost-found?${s}` : '/lost-found'
}

export default async function LostFoundPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const kind = sp.kind === 'lost' || sp.kind === 'found' ? sp.kind : ''
  const q = (sp.q ?? '').trim().slice(0, 80)
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  const and: Where[] = [{ status: { equals: 'approved' } }]
  if (kind) and.push({ kind: { equals: kind } })
  if (q) and.push({ or: [{ title: { contains: q } }, { location: { contains: q } }] })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'lost-found-items',
    where: { and },
    sort: '-createdAt',
    limit: 12,
    page,
    depth: 1,
    overrideAccess: false,
  })

  const pills: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Lost', value: 'lost' },
    { label: 'Found', value: 'found' },
  ]

  return (
    <main>
      <section className="lf-banner">
        <h1>Lost &amp; Found</h1>
        <p>Report or find lost items on campus.</p>
      </section>

      <div className="lf-wrap">
        <Link className="lf-btn lf-btn-solid lf-block" href="/lost-found/report">
          Report an item
        </Link>

        <nav aria-label="Filter by type" className="lf-pills">
          {pills.map((p) => (
            <Link
              aria-current={kind === p.value ? 'page' : undefined}
              className={kind === p.value ? 'lf-pill lf-pill-on' : 'lf-pill'}
              href={href(p.value, q, 1)}
              key={p.label}
            >
              {p.label}
            </Link>
          ))}
        </nav>

        <form action="/lost-found" className="lf-search" method="get" role="search">
          {kind ? <input name="kind" type="hidden" value={kind} /> : null}
          <label className="lf-sr" htmlFor="lf-q">
            Search items
          </label>
          <input defaultValue={q} id="lf-q" name="q" placeholder="Search items or places" type="search" />
          <button className="lf-btn lf-btn-solid" type="submit">
            Search
          </button>
        </form>

        {result.docs.length === 0 ? (
          <div className="lf-card lf-empty">
            <h2>No items found</h2>
            <p>
              {q || kind
                ? 'Nothing matches your search. Try a different filter.'
                : 'Nothing has been posted yet. Be the first to report an item.'}
            </p>
          </div>
        ) : (
          <ul className="lf-grid">
            {result.docs.map((item) => {
              const photo: Media | null = typeof item.photo === 'object' ? item.photo : null
              return (
                <li className="lf-card lf-item" key={item.id}>
                  <Link className="lf-item-link" href={`/lost-found/${item.id}`}>
                    <div className="lf-thumb">
                      {photo?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt={photo.alt || item.title} loading="lazy" src={photo.url} />
                      ) : (
                        <span aria-hidden="true">No photo</span>
                      )}
                    </div>
                    <div className="lf-item-body">
                      <h2>{item.title}</h2>
                      <p className="lf-meta">{item.location}</p>
                      <p className="lf-meta">
                        {new Date(item.dateOccurred).toLocaleDateString('en-GB', {
                          timeZone: 'Africa/Lagos',
                          dateStyle: 'medium',
                        })}
                      </p>
                      <span className={item.kind === 'lost' ? 'lf-tag lf-tag-lost' : 'lf-tag lf-tag-found'}>
                        {item.kind === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {result.totalPages > 1 ? (
          <nav aria-label="Pagination" className="lf-pager">
            {result.hasPrevPage ? (
              <Link className="lf-btn lf-btn-outline" href={href(kind, q, page - 1)}>
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            {result.hasNextPage ? (
              <Link className="lf-btn lf-btn-outline" href={href(kind, q, page + 1)}>
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </main>
  )
}