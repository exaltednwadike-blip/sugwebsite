'use client'

import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'

import { submitClaim } from '../actions'
import type { ActionResult } from '../actions'

export function ClaimForm({ itemId, kind }: { itemId: number; kind: 'lost' | 'found' }) {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  const heading = kind === 'found' ? 'Is this yours?' : 'Have you seen this item?'
  const button = kind === 'found' ? 'Claim this item' : 'I have information'

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setResult(null)
    startTransition(async () => {
      setResult(await submitClaim(itemId, formData))
    })
  }

  if (result?.ok) {
    return (
      <div className="lf-card lf-success" role="status">
        <h2>Message sent</h2>
        <p>{result.message}</p>
      </div>
    )
  }

  return (
    <form className="lf-card" onSubmit={onSubmit}>
      <h2>{heading}</h2>
      <p className="lf-note">
        Send a message to the SUG team. They will contact you. Your details are never shown publicly.
      </p>

      <div className="lf-field">
        <label htmlFor="lf-claim-name">Your name</label>
        <input id="lf-claim-name" maxLength={100} minLength={2} name="claimerName" required type="text" />
      </div>
      <div className="lf-field">
        <label htmlFor="lf-claim-contact">Phone or email</label>
        <input id="lf-claim-contact" maxLength={200} minLength={3} name="claimerContact" required type="text" />
      </div>
      <div className="lf-field">
        <label htmlFor="lf-claim-msg">Message</label>
        <textarea
          id="lf-claim-msg"
          maxLength={1000}
          minLength={10}
          name="message"
          placeholder={kind === 'found' ? 'Describe the item so staff can confirm it is yours.' : 'Where and when did you see it?'}
          required
          rows={4}
        />
      </div>

      <input aria-hidden="true" autoComplete="off" className="lf-hp" name="website" tabIndex={-1} type="text" />

      <div aria-live="polite">
        {result && !result.ok ? <p className="lf-error">{result.message}</p> : null}
      </div>

      <button className="lf-btn lf-btn-solid" disabled={pending} type="submit">
        {pending ? 'Sending...' : button}
      </button>
    </form>
  )
}