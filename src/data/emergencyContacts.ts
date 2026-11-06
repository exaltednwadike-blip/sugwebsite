export type EmergencyContactCategory =
  | 'security'
  | 'medical'
  | 'welfare'
  | 'student-affairs'
  | 'other'

export interface EmergencyContactSummary {
  id: string
  name: string
  category: EmergencyContactCategory
  phone: string
  altPhone: string | null
  phoneHref: string
  altPhoneHref: string | null
  description: string
  availability: string
  isPlaceholder: boolean
}

export const emergencyContactCategories: readonly {
  value: EmergencyContactCategory
  label: string
}[] = [
  { value: 'security', label: 'Security' },
  { value: 'medical', label: 'Medical' },
  { value: 'welfare', label: 'Welfare' },
  { value: 'student-affairs', label: 'Student Affairs' },
  { value: 'other', label: 'Other' },
]

export const emergencyContacts: readonly EmergencyContactSummary[] = [
  {
    id: 'placeholder-security',
    name: 'Campus Security',
    category: 'security',
    phone: '+234 803 000 0001',
    altPhone: null,
    phoneHref: 'tel:+2348030000001',
    altPhoneHref: null,
    description: 'For urgent safety concerns on campus.',
    availability: '24 hours',
    isPlaceholder: true,
  },
  {
    id: 'placeholder-medical',
    name: 'Health Centre',
    category: 'medical',
    phone: '+234 803 000 0002',
    altPhone: null,
    phoneHref: 'tel:+2348030000002',
    altPhoneHref: null,
    description: 'For urgent medical assistance.',
    availability: '24 hours',
    isPlaceholder: true,
  },
  {
    id: 'placeholder-welfare',
    name: 'SUG Welfare Desk',
    category: 'welfare',
    phone: '+234 803 000 0003',
    altPhone: null,
    phoneHref: 'tel:+2348030000003',
    altPhoneHref: null,
    description: 'For student welfare support.',
    availability: 'Contact the SUG Welfare Desk.',
    isPlaceholder: true,
  },
]

export function getPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
