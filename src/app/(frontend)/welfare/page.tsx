import type { Metadata } from 'next'
import Link from 'next/link'

import { WelfareForm } from './WelfareForm'
import './welfare.css'

export const metadata: Metadata = {
  title: 'Anonymous Welfare | SUG UNEC',
  description: 'Share a concern with the SUG welfare team safely and anonymously.',
}

export default function WelfarePage() {
  return (
    <main>
      <section className="wf-banner">
        <h1>Anonymous Welfare</h1>
        <p>Share your concerns safely and anonymously.</p>
      </section>

      <div className="wf-wrap">
        <div className="wf-card wf-how">
          <h2>How it works</h2>
          <ol>
            <li>Describe your concern. No account or name is needed.</li>
            <li>You receive a ticket code and a secret. Keep both safe.</li>
            <li>
              Use them on the <Link href="/welfare/status">status page</Link> to see progress and
              reply to the welfare team.
            </li>
          </ol>
        </div>

        <WelfareForm />

        <p className="wf-center">
          Already submitted? <Link href="/welfare/status">Check my ticket</Link>
        </p>
      </div>
    </main>
  )
}