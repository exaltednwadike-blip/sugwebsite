'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { Menu, Phone, Search, X } from 'lucide-react'

import { breakingHeadlines, siteNavigation } from '@/data/homepage'
import { emergencyContacts } from '@/data/emergencyContacts'

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {siteNavigation.map(({ href, label }) => (
        <Link className="sug-nav-link" href={href} key={label} onClick={onNavigate}>
          {label}
        </Link>
      ))}
    </>
  )
}

export function SiteHeader() {
  const emergencyDialog = useRef<HTMLDialogElement>(null)
  const mobileDialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <div aria-label="Breaking news" className="sug-breaking">
        <div className="sug-breaking-inner">
          <span className="sug-breaking-label">Breaking</span>
          <div className="sug-breaking-motion">
            <div className="sug-breaking-track">
              {breakingHeadlines.map((headline) => (
                <span className="sug-breaking-item" key={headline}>
                  {headline}
                </span>
              ))}
              <span aria-hidden="true" className="sug-breaking-duplicate">
                {breakingHeadlines.map((headline) => (
                  <span className="sug-breaking-item" key={headline}>
                    {headline}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <ul className="sug-breaking-static">
            {breakingHeadlines.map((headline) => (
              <li key={headline}>{headline}</li>
            ))}
          </ul>
        </div>
      </div>

      <header className="sug-header">
        <div className="sug-header-inner">
          <Link aria-label="Student Union Government home" className="sug-brand" href="/">
            <Image
              alt=""
              className="sug-logo"
              height={48}
              priority
              src="/logo.png"
              width={48}
            />
            <span className="sug-brand-copy">
              <span className="sug-brand-title">Student Union Government</span>
              <span className="sug-brand-subtitle">University of Nigeria, Enugu Campus</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="sug-desktop-nav">
            <NavigationLinks />
          </nav>

          <label className="sug-search">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">Search the website</span>
            <input aria-label="Search the website" placeholder="Search..." type="search" />
          </label>

          <button
            className="sug-emergency-button"
            onClick={() => emergencyDialog.current?.showModal()}
            type="button"
          >
            <Phone aria-hidden="true" size={17} />
            Emergency
          </button>

          <button
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            className="sug-menu-button"
            onClick={() => mobileDialog.current?.showModal()}
            type="button"
          >
            <Menu aria-hidden="true" size={24} />
          </button>
        </div>
      </header>

      <dialog
        aria-labelledby="emergency-dialog-title"
        className="sug-dialog sug-emergency-dialog"
        ref={emergencyDialog}
      >
        <div className="sug-dialog-heading">
          <div>
            <p className="sug-dialog-kicker">Need help now?</p>
            <h2 id="emergency-dialog-title">Emergency contacts</h2>
          </div>
          <button
            aria-label="Close emergency contacts"
            className="sug-icon-button"
            onClick={() => emergencyDialog.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <ul className="sug-contact-list">
          {emergencyContacts.map(({ description, href, name, phone }) => (
            <li className="sug-contact-card" key={name}>
              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
              <a className="sug-contact-phone" href={href}>
                <Phone aria-hidden="true" size={16} />
                <span>{phone}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="sug-placeholder-note">Placeholder contact numbers — please verify before publishing.</p>
      </dialog>

      <dialog aria-label="Mobile navigation" className="sug-dialog sug-mobile-sheet" ref={mobileDialog}>
        <div className="sug-sheet-heading">
          <span>Explore SUG</span>
          <button
            aria-label="Close navigation menu"
            className="sug-icon-button"
            onClick={() => mobileDialog.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="sug-mobile-nav">
          <NavigationLinks onNavigate={() => mobileDialog.current?.close()} />
        </nav>
      </dialog>
    </>
  )
}
