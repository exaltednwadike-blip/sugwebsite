import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'

type DownloadRouteProps = {
  params: Promise<{
    slug: string
  }>
}

const downloadableMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

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
    collection: 'resources',
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
  const resource = result.docs[0]
  const file = resource && typeof resource.file === 'object' ? resource.file : null

  if (!file?.url || !file.mimeType || !downloadableMimeTypes.has(file.mimeType)) {
    return new Response('Published resource file not found.', { status: 404 })
  }

  const fileURL = new URL(file.url, getServerSideURL())
  if (
    (fileURL.protocol !== 'https:' && fileURL.protocol !== 'http:') ||
    !isAllowedFileHost(fileURL)
  ) {
    return new Response('Resource file host is not allowed.', { status: 502 })
  }

  const fileResponse = await fetch(fileURL, {
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(20_000),
  })
  if (!fileResponse.ok || !fileResponse.body) {
    return new Response('The resource file is currently unavailable.', { status: 502 })
  }

  const fallbackExtension =
    file.mimeType === 'application/pdf'
      ? '.pdf'
      : file.mimeType === 'application/msword'
        ? '.doc'
        : '.docx'
  const filename = (file.filename || `${resource.title}${fallbackExtension}`)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 180)
  const headers = new Headers({
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Type': file.mimeType,
    'X-Content-Type-Options': 'nosniff',
  })
  const contentLength = fileResponse.headers.get('content-length')
  if (contentLength) {
    headers.set('Content-Length', contentLength)
  }

  return new Response(fileResponse.body, { headers })
}
