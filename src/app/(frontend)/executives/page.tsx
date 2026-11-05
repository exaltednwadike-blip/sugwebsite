import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
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
    where: {
      isCurrent: {
        equals: true,
      },
    },
  })

  return (
    <main className="sug-archive">
      <div className="sug-archive-container">
        <header className="sug-archive-heading">
          <p className="sug-eyebrow">Here to serve</p>
          <h1>Meet your executives</h1>
          <p>Get to know the current Student Union Government team and the work they do for you.</p>
        </header>

        {members.docs.length > 0 ? (
          <div className="sug-executives-grid sug-executives-directory">
            {members.docs.map((member) => {
              const photo = typeof member.photo === 'object' && member.photo ? member.photo : null
              return (
                <article className="sug-executive-card" key={member.id}>
                  {photo?.url ? (
                    <Image
                      alt={`${member.fullName}, ${member.position}`}
                      className="sug-executive-photo"
                      height={104}
                      src={getMediaUrl(photo.url, photo.updatedAt)}
                      unoptimized
                      width={104}
                    />
                  ) : (
                    <div aria-hidden="true" className="sug-executive-initials">
                      {getInitials(member.fullName)}
                    </div>
                  )}
                  <h2>{member.fullName}</h2>
                  <p className="sug-executive-position">{member.position}</p>
                  {member.portfolio && <p className="sug-executive-portfolio">{member.portfolio}</p>}
                  <Link className="sug-contact-button" href={`/executives/${member.id}`}>
                    View profile
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="sug-archive-empty">
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
