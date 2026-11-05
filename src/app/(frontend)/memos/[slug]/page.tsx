import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { formatDate } from '@/utilities/formatDate'

type MemoDetailProps = {
  params: Promise<{
    slug: string
  }>
}

async function getPublishedMemo(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'memos',
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
}

export default async function MemoDetailPage({ params }: MemoDetailProps) {
  const { slug } = await params
  const memo = await getPublishedMemo(decodeURIComponent(slug))

  if (!memo) notFound()

  const pdf = typeof memo.pdf === 'object' && memo.pdf ? memo.pdf : null
  if (!pdf?.url) notFound()

  const downloadHref = `/api/memos/${encodeURIComponent(memo.slug)}/download`

  return (
    <main className="sug-archive">
      <article className="sug-memo-detail">
        <Link className="sug-article-back" href="/memos">
          ← All memos
        </Link>
        <header className="sug-memo-detail-header">
          <span className="sug-memo-reference">{memo.refNumber}</span>
          <h1>{memo.title}</h1>
          <div className="sug-memo-detail-meta">
            <span>Issued by {memo.issuedBy || 'Student Union Government'}</span>
            <time dateTime={memo.issuedDate}>{formatDate(memo.issuedDate)}</time>
            {typeof memo.category === 'object' && memo.category && (
              <span className="sug-news-category">{memo.category.title}</span>
            )}
          </div>
          {memo.summary && <p className="sug-memo-summary">{memo.summary}</p>}
          <a className="sug-memo-button sug-memo-button-primary" href={downloadHref}>
            Download memo PDF
          </a>
        </header>

        <div className="sug-pdf-frame">
          <object data={pdf.url} type="application/pdf" aria-label={`PDF preview of ${memo.title}`}>
            <p>
              Your browser cannot display this PDF.
              {' '}
              <a href={downloadHref}>Download the memo instead.</a>
            </p>
          </object>
        </div>
      </article>
    </main>
  )
}

export async function generateMetadata({ params }: MemoDetailProps): Promise<Metadata> {
  const { slug } = await params
  const memo = await getPublishedMemo(decodeURIComponent(slug))

  if (!memo) {
    return {
      title: 'Memo not found | Student Union Government',
      description: 'This published memo could not be found.',
    }
  }

  return {
    title: `${memo.title} | Student Union Government`,
    description: memo.summary || `${memo.refNumber} — issued ${formatDate(memo.issuedDate)}.`,
  }
}
