import type { Metadata } from 'next'

import { Homepage } from '@/components/SUG/Homepage'

export default function HomePage() {
  return <Homepage />
}

export const metadata: Metadata = {
  title: 'Student Union Government | University of Nigeria, Enugu Campus',
  description:
    'News, updates, resources and support from the Student Union Government of the University of Nigeria, Enugu Campus.',
}
