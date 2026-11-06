import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'

import {
  placeholderContactEmail,
  placeholderContactPhone,
  placeholderSecretariatAddress,
} from '@/data/homepageRoundTwo'
import { getEmergencyContacts } from '@/utilities/getEmergencyContacts'

export async function Footer() {
  const payload = await getPayload({ config: configPromise })
  const [settings, emergencyContacts] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: false,
    }),
    getEmergencyContacts(),
  ])
  const address = settings.secretariatAddress || placeholderSecretariatAddress
  const email = settings.contactEmail || placeholderContactEmail
  const phone = settings.contactPhone || placeholderContactPhone
  const year = new Date().getFullYear()

  return (
    <footer className="rs-footer">
      <div className="rs-wrap rs-footer-grid">
        <div className="rs-footer-brand">
          <Link aria-label="Student Union Government home" className="rs-footer-logo" href="/">
            <Image alt="" height={56} src="/logo.png" width={56} />
            <span>
              <strong>Student Union Government</strong>
              <small>UNN Enugu Campus</small>
            </span>
          </Link>
        </div>
        <nav aria-label="Quick links" className="rs-footer-col">
          <h2>Quick Links</h2>
          <Link href="/news">News</Link>
          <Link href="/memos">Memos</Link>
          <Link href="/events">Events</Link>
          <Link href="/officials">Officials</Link>
          <Link href="/resources">Resources</Link>
        </nav>
        <div className="rs-footer-col">
          <h2>Emergency Numbers</h2>
          {emergencyContacts.map(({ id, name, phone: number, phoneHref }) => (
            <a href={phoneHref} key={id}>
              {name}: {number}
            </a>
          ))}
          {emergencyContacts.some(({ isPlaceholder }) => isPlaceholder) && (
            <span className="rs-footer-note">Placeholder numbers - verify before use.</span>
          )}
        </div>
        <div className="rs-footer-col">
          <h2>Get in Touch</h2>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
          <address>{address}</address>
          {settings.socialLinks?.map(({ id, label, url }) => (
            <a href={url} key={id ?? `${label}-${url}`} rel="noreferrer" target="_blank">
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="rs-wrap rs-footer-bottom">
        <p>&copy; {year} Student Union Government, University of Nigeria, Enugu Campus. All rights reserved.</p>
      </div>
    </footer>
  )
}