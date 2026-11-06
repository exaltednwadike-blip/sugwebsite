import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'

import configPromise from '@payload-config'
import { PageBanner } from '@/components/SUG/PageBanner'
import { emergencyContactCategories } from '@/data/emergencyContacts'
import { getActiveEmergencyContacts } from '@/utilities/getEmergencyContacts'
import { getPayload } from 'payload'

export default async function ContactPage() {
  const payload = await getPayload({ config: configPromise })
  const [settings, contacts] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
    getActiveEmergencyContacts(),
  ])
  const contactsByCategory = emergencyContactCategories
    .map(({ label, value }) => ({
      label,
      contacts: contacts.filter((contact) => contact.category === value),
    }))
    .filter(({ contacts: categoryContacts }) => categoryContacts.length > 0)
  const hasSecretariat = settings.secretariatAddress || settings.contactEmail || settings.contactPhone

  return (
    <main className="rs-main">
      <PageBanner subtitle="Get in touch with the SUG." title="Contact Us" />
      <div className="rs-wrap rs-inner rs-two-col">
        <section aria-labelledby="secretariat-title" className="rs-panel">
          <h2 id="secretariat-title">Secretariat details</h2>
          {hasSecretariat ? (
            <ul className="rs-info-list">
              {settings.secretariatAddress && (
                <li>
                  <MapPin aria-hidden="true" size={18} />
                  <address>{settings.secretariatAddress}</address>
                </li>
              )}
              {settings.contactPhone && (
                <li>
                  <Phone aria-hidden="true" size={18} />
                  <a href={`tel:${settings.contactPhone.replace(/[^\d+]/g, '')}`}>{settings.contactPhone}</a>
                </li>
              )}
              {settings.contactEmail && (
                <li>
                  <Mail aria-hidden="true" size={18} />
                  <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                </li>
              )}
            </ul>
          ) : (
            <p>Secretariat contact details have not been added yet.</p>
          )}
          <p>
            Need to reach a specific executive? <Link href="/executives">Meet your executives</Link> and send
            them a message from their profile.
          </p>
        </section>

        <section aria-labelledby="emergency-contacts-title" className="rs-panel">
          <h2 id="emergency-contacts-title">Emergency contacts</h2>
          {contactsByCategory.length > 0 ? (
            contactsByCategory.map(({ contacts: categoryContacts, label }) => (
              <div className="rs-contact-group" key={label}>
                <h3>{label}</h3>
                <ul className="rs-contact-list">
                  {categoryContacts.map(
                    ({ altPhone, altPhoneHref, availability, description, id, name, phone, phoneHref }) => (
                      <li className="rs-contact-card" key={id}>
                        <div>
                          <h4>{name}</h4>
                          {description && <p>{description}</p>}
                          {availability && <p>{availability}</p>}
                        </div>
                        <div className="rs-contact-numbers">
                          <a className="rs-contact-phone" href={phoneHref}>
                            <Phone aria-hidden="true" size={16} />
                            {phone}
                          </a>
                          {altPhone && altPhoneHref && (
                            <a className="rs-contact-phone" href={altPhoneHref}>
                              <Phone aria-hidden="true" size={16} />
                              {altPhone} (alternate)
                            </a>
                          )}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))
          ) : (
            <div className="rs-empty-state">
              <Image alt="" height={120} src="/images/empty-state.png" width={120} />
              <p>There are no active emergency contacts listed right now.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Contact | Student Union Government',
  description: 'Contact the Student Union Government secretariat and campus emergency services.',
}