import type { Metadata } from 'next'
import Link from 'next/link'

import '../lf.css'
import { ReportForm } from './ReportForm'

export const metadata: Metadata = {
  title: 'Report an item | SUG UNEC',
  description: 'Report a lost or found item on the UNEC campus.',
}

export default function ReportPage() {
  return (
    <main>
      <section className="lf-banner">
        <h1>Report an item</h1>
        <p>Tell us what was lost or found.</p>
      </section>
      <div className="lf-wrap">
        <ReportForm />
        <p className="lf-center">
          <Link href="/lost-found">Back to Lost &amp; Found</Link>
        </p>
      </div>
    </main>
  )
}