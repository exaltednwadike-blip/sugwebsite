import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { PageBanner } from '@/components/SUG/PageBanner'
import { isHouseOffice, officeRank } from '@/lib/offices'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import './officials.css'

export const dynamic = 'force-dynamic'

async function loadMembers() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'exco-members',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: { isCurrent: { equals: true } },
  })
  return result.docs
}

type Member = Awaited<ReturnType<typeof loadMembers>>[number]

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function byRank(a: Member, b: Member): number {
  const ra = officeRank(a.office)
  const rb = officeRank(b.office)
  if (ra !== rb) return ra - rb
  const sa = a.sortOrder ?? 0
  const sb = b.sortOrder ?? 0
  if (sa !== sb) return sa - sb
  return a.fullName.localeCompare(b.fullName)
}

function OfficialCard({ member }: { member: Member }) {
  const photo = typeof member.photo === 'object' && member.photo ? member.photo : null
  return (
    <article className="rs-exec-card">
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
      <h3>{member.fullName}</h3>
      <p>{member.position}</p>
      <Link className="rs-btn rs-btn-outline rs-btn-sm" href={`/officials/${member.id}`}>
        View Profile
        <ArrowRight aria-hidden="true" size={15} />
      </Link>
    </article>
  )
}

export default async function OfficialsPage() {
  const members = await loadMembers()
  const executives = members.filter((m) => !isHouseOffice(m.office)).sort(byRank)
  const house = members.filter((m) => isHouseOffice(m.office)).sort(byRank)

  return (
    <main className="rs-main">
      <PageBanner subtitle="Meet the people who serve you." title="SUG Officials" />
      <div className="rs-wrap rs-inner">
        {members.length === 0 ? (
          <div className="rs-empty-state">
            <Image alt="" height={160} src="/images/empty-state.png" width={160} />
            <h2>Official profiles are on the way</h2>
            <p>Current SUG officials will appear here soon.</p>
          </div>
        ) : (
          <>
            {executives.length > 0 ? (
              <section aria-labelledby="of-exec-title" className="of-section">
                <h2 className="of-title" id="of-exec-title">
                  Executives
                </h2>
                <p className="of-sub">The executive council of the Student Union Government.</p>
                <div className="rs-exec-grid">
                  {executives.map((m) => (
                    <OfficialCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            ) : null}

            {house.length > 0 ? (
              <section aria-labelledby="of-house-title" className="of-section">
                <h2 className="of-title" id="of-house-title">
                  The House
                </h2>
                <p className="of-sub">The legislative arm of the Student Union Government.</p>
                <div className="rs-exec-grid">
                  {house.map((m) => (
                    <OfficialCard key={m.id} member={m} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'SUG Officials | Student Union Government',
  description:
    'Meet the executives and House members of the Student Union Government at UNN Enugu Campus.',
}