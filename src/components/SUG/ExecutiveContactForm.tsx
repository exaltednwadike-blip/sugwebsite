'use client'

import { useActionState } from 'react'

import {
  submitExecutiveMessage,
  type ContactFormState,
} from '@/app/(frontend)/executives/actions'

const initialState: ContactFormState = {
  status: 'idle',
  message: '',
}

export function ExecutiveContactForm({
  memberID,
  memberName,
}: {
  memberID: number
  memberName: string
}) {
  const [state, formAction, isPending] = useActionState(submitExecutiveMessage, initialState)

  return (
    <section aria-labelledby="executive-contact-title" className="sug-contact-form-section">
      <h2 id="executive-contact-title">Send a message to {memberName}</h2>
      <form action={formAction} className="sug-contact-form">
        <input name="memberID" type="hidden" value={memberID} />
        <div aria-hidden="true" className="sug-honeypot">
          <label htmlFor="executive-website">Leave this field empty</label>
          <input
            autoComplete="off"
            id="executive-website"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </div>
        <div className="sug-contact-form-grid">
          <div className="sug-form-field">
            <label htmlFor="senderName">Your name</label>
            <input autoComplete="name" id="senderName" maxLength={100} name="senderName" required />
          </div>
          <div className="sug-form-field">
            <label htmlFor="senderEmail">Email address</label>
            <input
              autoComplete="email"
              id="senderEmail"
              maxLength={254}
              name="senderEmail"
              required
              type="email"
            />
          </div>
          <div className="sug-form-field sug-form-field-full">
            <label htmlFor="subject">Subject</label>
            <input id="subject" maxLength={160} name="subject" required />
          </div>
          <div className="sug-form-field sug-form-field-full">
            <label htmlFor="message">Message</label>
            <textarea id="message" maxLength={2000} name="message" required rows={6} />
            <span className="sug-form-help">Maximum 2,000 characters.</span>
          </div>
        </div>
        <button className="sug-contact-submit" disabled={isPending} type="submit">
          {isPending ? 'Sending…' : 'Send message'}
        </button>
        <p aria-live="polite" className={`sug-form-feedback is-${state.status}`} role="status">
          {state.message}
        </p>
        <p className="sug-form-note">Your message goes to the SUG secretariat.</p>
      </form>
    </section>
  )
}
