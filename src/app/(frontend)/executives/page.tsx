import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { getMediaUrl } from '@/utilities/getMediaUrl'

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default async function ExecutivesPage() {
  const payload = await getPayload({ config: configPromise })
  const members = await payload.find({
    collection: 'exco-members',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    sort: 'sortOrder',
    where: { isCurrent: { equals: true } },
  })

  return (
    <main className="rs-main">
      <PageBanner subtitle="Meet the team that serves you." title="Our Executives" />
      <div className="rs-wrap rs-inner">
        {members.docs.length > 0 ? (
          <div className="rs-exec-grid">
            {members.docs.map((member) => {
              const photo = typeof member.photo === 'object' && member.photo ? member.photo : null
              return (
                <article className="rs-exec-card" key={member.id}>
                  {photo?.url ? (
                    <Image
                      alt={`${member.fullName}, ${member.position}`}
                      className="rs-exec-photo"
                      height={96}
                      src={getMediaUrl(photo.url, photo.updatedAt)}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <div aria-hidden="true" className="rs-exec-initials">
                      {getInitials(member.fullName)}
                    </div>
                  )}
                  <h2>{member.fullName}</h2>
                  <p>{member.position}</p>
                  <Link className="rs-btn rs-btn-outline rs-btn-sm" href={`/executives/${member.id}`}>
                    View Profile
                    <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>Executive profiles are on the way</h2>
            <p>Current SUG executive profiles will appear here soon.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Executives | Student Union Government',
  description: 'Meet the current Student Union Government executives at UNN Enugu Campus.',
}