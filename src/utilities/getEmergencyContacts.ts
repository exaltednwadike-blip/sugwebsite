import configPromise from '@payload-config'
import { getPayload } from 'payload'

import {
  emergencyContacts as placeholderContacts,
  getPhoneHref,
  type EmergencyContactSummary,
} from '@/data/emergencyContacts'

export async function getActiveEmergencyContacts(): Promise<EmergencyContactSummary[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'emergency-contacts',
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: 'sortOrder',
    where: {
      isActive: {
        equals: true,
      },
    },
  })

  return result.docs.map((contact) => ({
    id: String(contact.id),
    name: contact.name,
    category: contact.category,
    phone: contact.phone,
    altPhone: contact.altPhone || null,
    phoneHref: getPhoneHref(contact.phone),
    altPhoneHref: contact.altPhone ? getPhoneHref(contact.altPhone) : null,
    description: contact.description || '',
    availability: contact.availability || '',
    isPlaceholder: false,
  }))
}

export async function getEmergencyContacts(): Promise<EmergencyContactSummary[]> {
  const contacts = await getActiveEmergencyContacts()
  return contacts.length > 0 ? contacts : [...placeholderContacts]
}
