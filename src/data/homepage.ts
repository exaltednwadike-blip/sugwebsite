export type NewsCategory = 'Academic' | 'Welfare' | 'Sports' | 'Union Press'

export interface HomepageNewsItem {
  category: string
  categorySlug: string | null
  date: string
  headline: string
  author: string
  slug: string | null
}

export interface HomepageNewsFilter {
  label: string
  slug: string
}

export const breakingHeadlines = [
  'SUG town hall holds this week — watch this space for details.',
  'Student welfare desk is open for enquiries and support.',
  'New Union updates and campus notices are now on the website.',
] as const

export const siteNavigation = [
  { label: 'News', href: '/posts' },
  { label: 'Memos', href: '/memos' },
  { label: 'Executives', href: '/executives' },
  { label: 'Events', href: '/events' },
  { label: 'Resources', href: '/resources' },
  { label: 'Welfare', href: '/welfare' },
] as const

export const heroContent = {
  eyebrow: 'New from your union',
  headline: 'Your campus. Your voice.',
  highlight: 'Your union.',
  description:
    'The people, updates and opportunities shaping student life at the University of Nigeria, Enugu Campus.',
  downloadHref: '/memos',
  statementHref: '/memos',
} as const

export const utilityCards = [
  {
    title: 'Report an issue',
    description: 'Get support with a campus concern.',
    href: '/welfare',
    icon: 'message',
    tone: 'red',
  },
  {
    title: 'Lost & Found',
    description: 'Help reunite people with their things.',
    href: '/lost-found',
    icon: 'search',
    tone: 'lime',
  },
  {
    title: 'SUG Constitution',
    description: 'Know the rules that guide your union.',
    href: '/resources',
    icon: 'book',
    tone: 'green',
  },
  {
    title: 'Events calendar',
    description: 'See what is happening around campus.',
    href: '/events',
    icon: 'calendar',
    tone: 'mint',
  },
] as const

export const newsFilters: readonly ('All' | NewsCategory)[] = [
  'All',
  'Academic',
  'Welfare',
  'Sports',
  'Union Press',
]

export const latestNews: {
  category: NewsCategory
  date: string
  headline: string
  author: string
}[] = [
  {
    category: 'Academic',
    date: 'May 12, 2025',
    headline: 'A new semester, a stronger student voice',
    author: 'SUG Press Team',
  },
  {
    category: 'Welfare',
    date: 'May 09, 2025',
    headline: 'Here is how to reach the student welfare desk',
    author: 'Welfare Committee',
  },
  {
    category: 'Sports',
    date: 'May 06, 2025',
    headline: 'Campus games bring students together',
    author: 'Sports Directorate',
  },
  {
    category: 'Union Press',
    date: 'May 02, 2025',
    headline: 'A note from your Student Union Government',
    author: 'Office of the President',
  },
]
