import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type DownloadRouteProps = {
  params: Promise<{
    slug: string
  }>
}

function isAllowedFileHost(url: URL): boolean {
  const siteHost = new URL(getServerSideURL()).host
  const configuredStorageEndpoint = process.env.S3_ENDPOINT
  const storageHost = configuredStorageEndpoint
    ? new URL(configuredStorageEndpoint).host
    : null

  return (
    url.host === siteHost ||
    url.host === storageHost ||
    url.hostname.endsWith('.amazonaws.com')
  )
}

export async function GET(_request: Request, { params }: DownloadRouteProps): Promise<Response> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'memos',
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [
        { slug: { equals: decodeURIComponent(slug) } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  const memo = result.docs[0]
  const pdf = memo && typeof memo.pdf === 'object' ? memo.pdf : null

  if (!pdf?.url || pdf.mimeType !== 'application/pdf') {
    return new Response('Published memo PDF not found.', { status: 404 })
  }

  const fileURL = new URL(pdf.url, getServerSideURL())
  if (
    (fileURL.protocol !== 'https:' && fileURL.protocol !== 'http:') ||
    !isAllowedFileHost(fileURL)
  ) {
    return new Response('Memo PDF host is not allowed.', { status: 502 })
  }

  const fileResponse = await fetch(fileURL, {
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(20_000),
  })
  if (!fileResponse.ok || !fileResponse.body) {
    return new Response('The memo PDF is currently unavailable.', { status: 502 })
  }

  const filename = (pdf.filename || `${memo.refNumber}.pdf`)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.pdf$/i, '')
  const headers = new Headers({
    'Content-Disposition': `attachment; filename="${filename}.pdf"`,
    'Content-Type': 'application/pdf',
    'X-Content-Type-Options': 'nosniff',
  })
  const contentLength = fileResponse.headers.get('content-length')
  if (contentLength) {
    headers.set('Content-Length', contentLength)
  }

  return new Response(fileResponse.body, {
    headers,
  })
}
