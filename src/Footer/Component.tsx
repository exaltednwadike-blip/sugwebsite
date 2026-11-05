import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'

import {
  placeholderContactEmail,
  placeholderContactPhone,
  placeholderSecretariatAddress,
} from '@/data/homepageRoundTwo'

export async function Footer() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: false,
  })
  const address = settings.secretariatAddress || placeholderSecretariatAddress
  const email = settings.contactEmail || placeholderContactEmail
  const phone = settings.contactPhone || placeholderContactPhone
  const year = new Date().getFullYear()

  return (
    <footer className="sug-footer">
      <div className="sug-footer-main">
        <div className="sug-footer-brand">
          <Link aria-label="Student Union Government home" className="sug-footer-logo-link" href="/">
            <Image alt="" height={48} src="/logo.png" width={48} />
          </Link>
          <p className="sug-footer-name">Student Union Government</p>
          <p className="sug-footer-campus">University of Nigeria, Enugu Campus</p>
          <address>{address}</address>
        </div>
        <nav aria-label="Read" className="sug-footer-column">
          <h2>Read</h2>
          <Link href="/posts">News</Link>
          <Link href="/memos">Memos</Link>
          <Link href="/resources">Resources</Link>
        </nav>
        <nav aria-label="Students" className="sug-footer-column">
          <h2>Students</h2>
          <Link href="/welfare">Report an issue</Link>
          <Link href="/lost-found">Lost &amp; Found</Link>
          <Link href="/events">Events</Link>
        </nav>
        <div className="sug-footer-column">
          <h2>Contact</h2>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
          {settings.socialLinks?.map(({ id, label, url }) => (
            <a href={url} key={id ?? `${label}-${url}`} rel="noreferrer" target="_blank">
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="sug-footer-bottom">
        <p>© {year} Student Union Government, University of Nigeria, Enugu Campus.</p>
      </div>
    </footer>
  )
}
