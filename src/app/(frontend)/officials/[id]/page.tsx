import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import configPromise from '@payload-config'
import { ExecutiveContactForm } from '@/components/SUG/ExecutiveContactForm'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getPayload } from 'payload'

type ExecutiveProfileProps = {
  params: Promise<{
    id: string
  }>
}

async function findCurrentMember(id: string) {
  if (!/^[1-9]\d*$/.test(id)) {
    return null
  }

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'exco-members',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ id: { equals: Number(id) } }, { isCurrent: { equals: true } }],
    },
  })

  return result.docs[0] ?? null
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default async function ExecutiveProfilePage({ params }: ExecutiveProfileProps) {
  const { id } = await params
  const member = await findCurrentMember(id)

  if (!member) notFound()

  const photo = typeof member.photo === 'object' && member.photo ? member.photo : null

  return (
    <main className="rs-main">
      <div className="rs-wrap rs-inner">
        <article className="rs-article">
          <Link className="rs-back" href="/officials">
            <ArrowLeft aria-hidden="true" size={16} /> All officials
          </Link>
          <header className="rs-profile-head">
            {photo?.url ? (
              <Image
                alt={`${member.fullName}, ${member.position}`}
                className="rs-profile-photo"
                height={140}
                src={getMediaUrl(photo.url, photo.updatedAt)}
                unoptimized
                width={140}
              />
            ) : (
              <div aria-hidden="true" className="rs-profile-photo rs-exec-initials">
                {getInitials(member.fullName)}
              </div>
            )}
            <div>
              <span className="rs-chip">{member.position}</span>
              <h1>{member.fullName}</h1>
            </div>
          </header>

          {member.portfolio && (
            <section aria-labelledby="profile-portfolio-title" className="rs-panel">
              <h2 id="profile-portfolio-title">About the portfolio</h2>
              <p>{member.portfolio}</p>
            </section>
          )}

          <section aria-labelledby="profile-contact-title" className="rs-panel">
            <h2 id="profile-contact-title">Office and contact</h2>
            {member.officeHours && (
              <p>
                <strong>Office hours:</strong> {member.officeHours}
              </p>
            )}
            {member.publicEmail && (
              <p>
                <strong>Email:</strong> <a href={`mailto:${member.publicEmail}`}>{member.publicEmail}</a>
              </p>
            )}
            {member.publicPhone && (
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${member.publicPhone.replace(/[^\d+]/g, '')}`}>{member.publicPhone}</a>
              </p>
            )}
            {!member.officeHours && !member.publicEmail && !member.publicPhone && (
              <p>Contact details have not been added yet. Send a message using the form below.</p>
            )}
          </section>

          <ExecutiveContactForm memberID={member.id} memberName={member.fullName} />
        </article>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: ExecutiveProfileProps): Promise<Metadata> {
  const { id } = await params
  const member = await findCurrentMember(id)

  if (!member) {
    return {
      title: 'Executive profile not found | Student Union Government',
      description: 'This current executive profile could not be found.',
    }
  }

  return {
    title: `${member.fullName} | Student Union Government`,
    description: `${member.position} at the University of Nigeria, Enugu Campus Student Union Government.`,
  }
}