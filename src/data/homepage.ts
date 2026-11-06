export type NewsCategory = 'Academic' | 'Welfare' | 'Sports' | 'Union Press'

export interface HomepageNewsItem {
  category: string
  categorySlug: string | null
  date: string
  headline: string
  author: string
  slug: string | null
  excerpt: string
  imageUrl: string | null
}

export interface HomepageNewsFilter {
  label: string
  slug: string
}

export const breakingHeadlines = [
  'SUG Advocates for a Better Learning Environment',
  'Student welfare desk is open for enquiries and support.',
  'New Union updates and campus notices are now on the website.',
] as const

export const siteNavigation = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Memos', href: '/memos' },
  { label: 'Events', href: '/events' },
  { label: 'Officials', href: '/officials' },
  { label: 'Resources', href: '/resources' },
  { label: 'Contact', href: '/contact' },
] as const

export const heroContent = {
  headline: 'Together for a Greater UNEC',
  subline: 'Your Student Union. Your Voice. Our Priority.',
  primary: { label: 'Latest news', href: '/news' },
  secondary: { label: 'Contact the SUG', href: '/contact' },
  image: '/images/hero.jpg',
  imageAlt: 'Smiling students standing together on the university campus',
} as const

export const utilityCards = [
  { title: 'Memos', description: 'View official memos', href: '/memos', icon: 'memos' },
  { title: 'Resources', description: 'Access useful resources', href: '/resources', icon: 'resources' },
  { title: 'Lost & Found', description: 'Find or report items', href: '/lost-found', icon: 'lost' },
  { title: 'Anonymous Welfare', description: 'Share concerns safely', href: '/welfare', icon: 'welfare' },
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
  excerpt: string
}[] = [
  {
    category: 'Academic',
    date: 'May 12, 2025',
    headline: 'A new semester, a stronger student voice',
    author: 'SUG Press Team',
    excerpt: 'What the new semester means for students and how your union is working for you.',
  },
  {
    category: 'Welfare',
    date: 'May 09, 2025',
    headline: 'Here is how to reach the student welfare desk',
    author: 'Welfare Committee',
    excerpt: 'Support is available. Here is where to go and what to bring.',
  },
  {
    category: 'Sports',
    date: 'May 06, 2025',
    headline: 'Campus games bring students together',
    author: 'Sports Directorate',
    excerpt: 'A look at the games and the students who made them happen.',
  },
]