'use client'

import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'

import { lookupTicket, sendFollowUp } from './actions'
import type { TicketView } from './actions'

type Creds = { code: string; secret: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function StatusClient() {
  const [creds, setCreds] = useState<Creds | null>(null)
  const [ticket, setTicket] = useState<TicketView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const code = String(formData.get('code') ?? '')
    const secret = String(formData.get('secret') ?? '')
    setError(null)
    startTransition(async () => {
      const result = await lookupTicket(code, secret)
      if (result.status === 'ok') {
        setCreds({ code, secret })
        setTicket(result.ticket)
      } else {
        setError(result.message)
      }
    })
  }

  function onRefresh() {
    if (!creds) return
    setError(null)
    startTransition(async () => {
      const result = await lookupTicket(creds.code, creds.secret)
      if (result.status === 'ok') {
        setTicket(result.ticket)
      } else {
        setError(result.message)
      }
    })
  }

  function onReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!creds) return
    const form = event.currentTarget
    const body = String(new FormData(form).get('body') ?? '')
    setError(null)
    startTransition(async () => {
      const result = await sendFollowUp(creds.code, creds.secret, body)
      if (result.status === 'ok') {
        setTicket(result.ticket)
        form.reset()
      } else {
        setError(result.message)
      }
    })
  }

  function onLeave() {
    setCreds(null)
    setTicket(null)
    setError(null)
  }

  if (!ticket) {
    return (
      <form className="wf-card" onSubmit={onLookup}>
        <div className="wf-field">
          <label htmlFor="wf-code">Ticket code</label>
          <input
            autoCapitalize="characters"
            autoComplete="off"
            id="wf-code"
            maxLength={30}
            name="code"
            placeholder="WLF-XXXX-XXXX"
            required
            type="text"
          />
        </div>
        <div className="wf-field">
          <label htmlFor="wf-secret">Secret</label>
          <input
            autoComplete="off"
            id="wf-secret"
            maxLength={60}
            name="secret"
            required
            type="password"
          />
        </div>
        <div aria-live="polite">{error ? <p className="wf-error">{error}</p> : null}</div>
        <button className="wf-btn wf-btn-solid" disabled={pending} type="submit">
          {pending ? 'Checking...' : 'Check my ticket'}
        </button>
        <p className="wf-note">
          Your code and secret are never put in the web address and are not stored on this device.
        </p>
      </form>
    )
  }

  return (
    <div className="wf-wrap-inner">
      <div className="wf-card">
        <div>
          <span className="wf-label">Ticket</span>
          <code className="wf-code">{ticket.ticketCode}</code>
        </div>
        <div>
          <span className="wf-pill">{ticket.statusLabel}</span>
        </div>
        <p className="wf-note">
          {ticket.categoryLabel} &middot; Submitted {formatDate(ticket.createdAt)}
        </p>
        <div className="wf-msg">
          <small>Your original message</small>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
        </div>
      </div>

      <div className="wf-card">
        <h2>Conversation</h2>
        {ticket.messages.length === 0 ? (
          <p className="wf-note">No replies yet. The welfare team will respond here.</p>
        ) : (
          <div className="wf-thread">
            {ticket.messages.map((m) => (
              <div className={m.sender === 'staff' ? 'wf-msg wf-msg-staff' : 'wf-msg'} key={m.id}>
                <small>
                  {m.sender === 'staff' ? 'Welfare team' : 'You'} &middot; {formatDate(m.createdAt)}
                </small>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.body}</p>
              </div>
            ))}
          </div>
        )}
        <button
          className="wf-btn wf-btn-outline"
          disabled={pending}
          onClick={onRefresh}
          type="button"
        >
          {pending ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {ticket.status === 'closed' ? (
        <p className="wf-note">This ticket is closed, so new messages cannot be added.</p>
      ) : (
        <form className="wf-card" onSubmit={onReply}>
          <div className="wf-field">
            <label htmlFor="wf-reply">Send a follow-up message</label>
            <textarea id="wf-reply" maxLength={2000} name="body" required rows={4} />
          </div>
          <div aria-live="polite">{error ? <p className="wf-error">{error}</p> : null}</div>
          <button className="wf-btn wf-btn-solid" disabled={pending} type="submit">
            {pending ? 'Sending...' : 'Send message'}
          </button>
        </form>
      )}

      <button className="wf-btn wf-btn-outline" onClick={onLeave} type="button">
        Done, clear this page
      </button>
    </div>
  )
}