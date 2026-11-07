export interface HomepageEvent {
  title: string
  startsAt: string
  venue: string
  eventType: 'meeting' | 'town_hall' | 'cultural' | 'sports' | 'academic' | 'general'
  isPlaceholder?: boolean
}

export interface HomepageExecutive {
  id?: number
  fullName: string
  position: string
  photoUrl: string | null
  isPlaceholder?: boolean
}

interface PlaceholderEvent extends Omit<HomepageEvent, 'startsAt'> {
  daysFromNow: number
  time: string
}

export const placeholderEvents = [
  {
    title: 'SUG Town Hall',
    daysFromNow: 7,
    time: '16:00:00.000Z',
    venue: 'Main Auditorium',
    eventType: 'town_hall',
  },
  {
    title: 'Student Community Meet-up',
    daysFromNow: 10,
    time: '14:00:00.000Z',
    venue: 'Campus Green',
    eventType: 'cultural',
  },
  {
    title: 'Open Executive Forum',
    daysFromNow: 14,
    time: '15:00:00.000Z',
    venue: 'SUG Secretariat',
    eventType: 'meeting',
  },
] satisfies readonly PlaceholderEvent[]

export function getPlaceholderEvents(fromDate = new Date()): HomepageEvent[] {
  return placeholderEvents.map(({ daysFromNow, time, ...event }) => {
    const date = new Date(fromDate)
    date.setUTCDate(date.getUTCDate() + daysFromNow)
    const datePart = date.toISOString().slice(0, 10)

    return {
      ...event,
      startsAt: `${datePart}T${time}`,
    }
  })
}

export const placeholderExecutives: HomepageExecutive[] = [
  {
    fullName: 'SUG President',
    position: 'President',
    photoUrl: null,
    isPlaceholder: true,
  },
  {
    fullName: 'SUG Vice President',
    position: 'Vice President',
    photoUrl: null,
    isPlaceholder: true,
  },
  {
    fullName: 'Speaker of the House',
    position: 'Speaker',
    photoUrl: null,
    isPlaceholder: true,
  },
]

export const placeholderSecretariatAddress = 'SUG Secretariat, University of Nigeria, Enugu Campus'
export const placeholderContactEmail = 'sug@example.edu.ng'
export const placeholderContactPhone = '+234 800 000 0000'