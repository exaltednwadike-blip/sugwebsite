import type { Metadata } from 'next'
import Link from 'next/link'

import '../welfare.css'
import { StatusClient } from './StatusClient'

export const metadata: Metadata = {
  title: 'Check my ticket | SUG UNEC',
  description: 'Check the progress of an anonymous welfare ticket.',
  robots: { index: false, follow: false },
}

export default function WelfareStatusPage() {
  return (
    <main>
      <section className="wf-banner">
        <h1>Check my ticket</h1>
        <p>Enter your ticket code and secret to see progress and reply.</p>
      </section>

      <div className="wf-wrap">
        <StatusClient />
        <p className="wf-center">
          Need to report something new? <Link href="/welfare">Submit a concern</Link>
        </p>
      </div>
    </main>
  )
}