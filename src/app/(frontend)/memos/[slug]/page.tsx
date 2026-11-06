import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'

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
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
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
    <main className="rs-main">
      <div className="rs-wrap rs-inner">
        <article className="rs-article rs-article-wide">
          <Link className="rs-back" href="/memos">
            <ArrowLeft aria-hidden="true" size={16} /> All memos
          </Link>
          <header>
            <span className="rs-ref">{memo.refNumber}</span>
            <h1>{memo.title}</h1>
            <p className="rs-byline">
              Issued by {memo.issuedBy || 'Student Union Government'} &middot;{' '}
              <time dateTime={memo.issuedDate}>{formatDate(memo.issuedDate)}</time>
              {typeof memo.category === 'object' && memo.category && (
                <>
                  {' '}
                  <span className="rs-chip">{memo.category.title}</span>
                </>
              )}
            </p>
            {memo.summary && <p className="rs-lead">{memo.summary}</p>}
            <a className="rs-btn rs-btn-green" href={downloadHref}>
              <Download aria-hidden="true" size={18} /> Download memo PDF
            </a>
          </header>

          <div className="rs-pdf">
            <object aria-label={`PDF preview of ${memo.title}`} data={pdf.url} type="application/pdf">
              <p>
                Your browser cannot display this PDF. <a href={downloadHref}>Download the memo instead.</a>
              </p>
            </object>
          </div>
        </article>
      </div>
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
    description: memo.summary || `${memo.refNumber} - issued ${formatDate(memo.issuedDate)}.`,
  }
}