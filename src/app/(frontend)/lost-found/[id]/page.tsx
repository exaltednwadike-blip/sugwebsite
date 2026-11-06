import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

import '../lf.css'
import { ClaimForm } from './ClaimForm'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

async function loadItem(rawId: string) {
  const id = Number.parseInt(rawId, 10)
  if (!Number.isInteger(id)) return null
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'lost-found-items',
    where: { and: [{ id: { equals: id } }, { status: { equals: 'approved' } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const item = await loadItem(id)
  return { title: item ? `${item.title} | Lost & Found | SUG UNEC` : 'Lost & Found | SUG UNEC' }
}

export default async function LostFoundItemPage({ params }: { params: Params }) {
  const { id } = await params
  const item = await loadItem(id)
  if (!item) notFound()

  const photo: Media | null = typeof item.photo === 'object' ? item.photo : null
  const isLost = item.kind === 'lost'

  return (
    <main>
      <section className="lf-banner">
        <h1>{item.title}</h1>
        <p>{isLost ? 'Reported lost' : 'Reported found'}</p>
      </section>

      <div className="lf-wrap">
        <div className="lf-card">
          {photo?.url ? (
            <div className="lf-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={photo.alt || item.title} src={photo.url} />
            </div>
          ) : null}
          <span className={isLost ? 'lf-tag lf-tag-lost' : 'lf-tag lf-tag-found'}>
            {isLost ? 'Lost' : 'Found'}
          </span>
          <p className="lf-meta">Where: {item.location}</p>
          <p className="lf-meta">
            Date:{' '}
            {new Date(item.dateOccurred).toLocaleDateString('en-GB', {
              timeZone: 'Africa/Lagos',
              dateStyle: 'long',
            })}
          </p>
          {item.description ? <p style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p> : null}
        </div>

        <ClaimForm itemId={item.id} kind={item.kind} />

        <p className="lf-center">
          <Link href="/lost-found">Back to Lost &amp; Found</Link>
        </p>
      </div>
    </main>
  )
}