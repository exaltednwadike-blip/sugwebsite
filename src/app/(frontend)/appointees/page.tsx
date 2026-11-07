import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export const dynamic = 'force-dynamic'

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default async function AppointeesPage() {
  const payload = await getPayload({ config: configPromise })
  const appointees = await payload.find({
    collection: 'appointees',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'sortOrder',
  })

  return (
    <main className="rs-main">
      <PageBanner subtitle="The people serving under the Office of the President." title="Appointees" />
      <div className="rs-wrap rs-inner">
        <Link className="rs-back" href="/officials">
          <ArrowLeft aria-hidden="true" size={16} /> All officials
        </Link>

        {appointees.docs.length > 0 ? (
          <div className="rs-exec-grid">
            {appointees.docs.map((person) => {
              const photo = typeof person.photo === 'object' && person.photo ? person.photo : null
              return (
                <article className="rs-exec-card" key={person.id}>
                  {photo?.url ? (
                    <Image
                      alt={`${person.fullName}, ${person.position}`}
                      className="rs-exec-photo"
                      height={96}
                      src={getMediaUrl(photo.url, photo.updatedAt)}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <div aria-hidden="true" className="rs-exec-initials">
                      {getInitials(person.fullName)}
                    </div>
                  )}
                  <h2>{person.fullName}</h2>
                  <p>{person.position}</p>
                  {person.phone && (
                    <a
                      className="rs-btn rs-btn-outline rs-btn-sm"
                      href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}
                    >
                      <Phone aria-hidden="true" size={15} />
                      {person.phone}
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>Appointees will appear here</h2>
            <p>The list of appointees has not been published yet. Please check back soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Appointees | Student Union Government',
  description: 'The people serving under the Office of the President of the Student Union Government.',
}