'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'

import { submitReport } from '../actions'
import type { ActionResult } from '../actions'

async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    )
    if (!blob) return file
    return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function ReportForm() {
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setResult(null)
    startTransition(async () => {
      const photo = formData.get('photo')
      if (photo instanceof File && photo.size > 0) {
        formData.set('photo', await shrink(photo))
      } else {
        formData.delete('photo')
      }
      setResult(await submitReport(formData))
    })
  }

  if (result?.ok) {
    return (
      <div className="lf-card lf-success" role="status">
        <h2>Report received</h2>
        <p>{result.message}</p>
        <Link className="lf-btn lf-btn-solid" href="/lost-found">
          Back to Lost &amp; Found
        </Link>
      </div>
    )
  }

  return (
    <form className="lf-card" onSubmit={onSubmit}>
      <div className="lf-field">
        <label htmlFor="lf-kind">What are you reporting?</label>
        <select defaultValue="" id="lf-kind" name="kind" required>
          <option disabled value="">
            Choose one
          </option>
          <option value="lost">I lost something</option>
          <option value="found">I found something</option>
        </select>
      </div>

      <div className="lf-field">
        <label htmlFor="lf-title">Item name</label>
        <input id="lf-title" maxLength={120} minLength={3} name="title" required type="text" />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-desc">Description (optional)</label>
        <textarea id="lf-desc" maxLength={1000} name="description" rows={4} />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-loc">Where?</label>
        <input id="lf-loc" maxLength={160} minLength={2} name="location" required type="text" />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-date">Date</label>
        <input id="lf-date" name="dateOccurred" required type="date" />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-photo">Photo (optional)</label>
        <input accept="image/jpeg,image/png,image/webp" id="lf-photo" name="photo" type="file" />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-cname">Your name (optional)</label>
        <input id="lf-cname" maxLength={100} name="contactName" type="text" />
      </div>

      <div className="lf-field">
        <label htmlFor="lf-cinfo">Phone or email</label>
        <input id="lf-cinfo" maxLength={200} minLength={3} name="contactInfo" required type="text" />
        <p className="lf-note">Only SUG staff can see this. It is never shown on the website.</p>
      </div>

      <input aria-hidden="true" autoComplete="off" className="lf-hp" name="website" tabIndex={-1} type="text" />

      <div aria-live="polite">
        {result && !result.ok ? <p className="lf-error">{result.message}</p> : null}
      </div>

      <button className="lf-btn lf-btn-solid" disabled={pending} type="submit">
        {pending ? 'Sending...' : 'Submit report'}
      </button>
      <p className="lf-note">Reports are reviewed by staff before they appear on the board.</p>
    </form>
  )
}