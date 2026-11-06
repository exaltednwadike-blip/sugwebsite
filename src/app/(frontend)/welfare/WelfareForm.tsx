'use client'

import Script from 'next/script'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'

import { WELFARE_CATEGORIES } from '@/lib/welfareCategories'

import { submitTicket } from './actions'
import type { SubmitState } from './actions'

declare global {
  interface Window {
    turnstile?: { reset: () => void }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)

  return (
    <button
      aria-label={`Copy ${label}`}
      className="wf-btn wf-btn-outline"
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setDone(true)
            setTimeout(() => setDone(false), 2000)
          })
          .catch(() => undefined)
      }}
      type="button"
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

export function WelfareForm() {
  const [state, setState] = useState<SubmitState | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await submitTicket(formData)
      setState(result)
      if (result.status === 'error') {
        window.turnstile?.reset()
      }
    })
  }

  if (state?.status === 'success') {
    return (
      <div className="wf-card wf-success" role="status">
        <h2>Your concern has been received</h2>
        <p>Save these two items now. The secret is shown only once and cannot be recovered.</p>
        <div className="wf-secret-row">
          <div>
            <span className="wf-label">Ticket code</span>
            <code className="wf-code">{state.ticketCode}</code>
          </div>
          <CopyButton label="ticket code" value={state.ticketCode} />
        </div>
        <div className="wf-secret-row">
          <div>
            <span className="wf-label">Secret</span>
            <code className="wf-code">{state.secret}</code>
          </div>
          <CopyButton label="secret" value={state.secret} />
        </div>
        <p className="wf-note">
          You need both to check progress or reply to the welfare team. Without them, nobody can
          find your ticket, not even us.
        </p>
        <Link className="wf-btn wf-btn-solid" href="/welfare/status">
          Check my ticket
        </Link>
      </div>
    )
  }

  return (
    <form className="wf-card" onSubmit={onSubmit}>
      <div className="wf-field">
        <label htmlFor="wf-category">Category</label>
        <select defaultValue="" id="wf-category" name="category" required>
          <option disabled value="">
            Select a category
          </option>
          {WELFARE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="wf-field">
        <label htmlFor="wf-description">Describe your concern</label>
        <textarea
          id="wf-description"
          maxLength={3000}
          minLength={10}
          name="description"
          required
          rows={7}
        />
      </div>

      <div className="wf-field">
        <label htmlFor="wf-contact">Contact details (optional)</label>
        <input id="wf-contact" maxLength={200} name="optionalContact" type="text" />
        <p className="wf-note">
          Adding an email or phone number lets us reach you, but it makes you less anonymous. Leave
          it empty to stay fully anonymous.
        </p>
      </div>

      <input aria-hidden="true" autoComplete="off" className="wf-hp" name="website" tabIndex={-1} type="text" />

      {SITE_KEY ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={SITE_KEY} />
        </>
      ) : null}

      <div aria-live="polite">
        {state?.status === 'error' ? <p className="wf-error">{state.message}</p> : null}
      </div>

      <button className="wf-btn wf-btn-solid" disabled={pending} type="submit">
        {pending ? 'Submitting...' : 'Submit anonymously'}
      </button>
      <p className="wf-note">We do not record your name, account, device or IP address.</p>
    </form>
  )
}