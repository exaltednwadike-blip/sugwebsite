'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { ChevronRight, Menu, Phone, Search, X } from 'lucide-react'

import { siteNavigation } from '@/data/homepage'
import type { EmergencyContactSummary } from '@/data/emergencyContacts'
import type { BreakingItem } from '@/utilities/getBreakingNews'

function TickerText({ item, hidden = false }: { item: BreakingItem; hidden?: boolean }) {
  if (!item.href) return <>{item.text}</>
  return (
    <Link
      href={item.href}
      style={{ color: 'inherit', textDecoration: 'none' }}
      tabIndex={hidden ? -1 : undefined}
    >
      {item.text}
    </Link>
  )
}

export function SiteHeader({
  contacts,
  breaking,
}: {
  contacts: EmergencyContactSummary[]
  breaking: BreakingItem[]
}) {
  const pathname = usePathname()
  const emergencyDialog = useRef<HTMLDialogElement>(null)
  const menuDialog = useRef<HTMLDialogElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  const openEmergency = () => {
    menuDialog.current?.close()
    emergencyDialog.current?.showModal()
  }

  return (
    <>
      <header className="rs-header">
        <div className="rs-wrap rs-header-inner">
          <Link aria-label="Student Union Government home" className="rs-brand" href="/">
            <Image alt="" className="rs-logo" height={44} priority src="/logo.png" width={44} />
            <span className="rs-brand-copy">
              <span className="rs-brand-title">Student Union Government</span>
              <span className="rs-brand-sub">UNN Enugu Campus</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="rs-nav rs-desktop-only">
            {siteNavigation.map(({ href, label }) => (
              <Link
                aria-current={isActive(href) ? 'page' : undefined}
                className={isActive(href) ? 'rs-nav-link is-active' : 'rs-nav-link'}
                href={href}
                key={label}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            aria-expanded={searchOpen}
            aria-label="Search the website"
            className="rs-icon-btn"
            onClick={() => setSearchOpen((open) => !open)}
            type="button"
          >
            <Search aria-hidden="true" size={21} />
          </button>
          <button
            aria-label="Emergency contacts"
            className="rs-icon-btn rs-icon-btn-red"
            onClick={openEmergency}
            type="button"
          >
            <Phone aria-hidden="true" size={19} />
          </button>
          <Link className="rs-btn rs-btn-green rs-desktop-only" href="/welfare">
            Welfare
          </Link>
          <button
            aria-haspopup="dialog"
            aria-label="Open navigation menu"
            className="rs-icon-btn rs-mobile-only"
            onClick={() => menuDialog.current?.showModal()}
            type="button"
          >
            <Menu aria-hidden="true" size={24} />
          </button>
        </div>

        {searchOpen && (
          <div className="rs-wrap rs-search-panel">
            <form className="rs-search" onSubmit={(event) => event.preventDefault()} role="search">
              <Search aria-hidden="true" size={18} />
              <input aria-label="Search the website" autoFocus placeholder="Search..." type="search" />
            </form>
          </div>
        )}
      </header>

      {breaking.length > 0 && (
        <div aria-label="Breaking news" className="rs-ticker" role="region">
          <div className="rs-wrap rs-ticker-inner">
            <span className="rs-ticker-label">Breaking:</span>
            <div className="rs-ticker-window">
              <div className="rs-ticker-track">
                <div className="rs-ticker-group">
                  {breaking.map((item, index) => (
                    <span className="rs-ticker-item" key={`${index}-${item.text}`}>
                      <TickerText item={item} />
                    </span>
                  ))}
                </div>
                <div aria-hidden="true" className="rs-ticker-group">
                  {breaking.map((item, index) => (
                    <span className="rs-ticker-item" key={`${index}-${item.text}`}>
                      <TickerText hidden item={item} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ul className="rs-ticker-static">
              {breaking.map((item, index) => (
                <li key={`${index}-${item.text}`}>
                  <TickerText item={item} />
                </li>
              ))}
            </ul>
            <Link aria-label="All news" className="rs-ticker-more" href="/news">
              <ChevronRight aria-hidden="true" size={20} />
            </Link>
          </div>
        </div>
      )}

      <dialog aria-labelledby="rs-emergency-title" className="rs-dialog" ref={emergencyDialog}>
        <div className="rs-dialog-head">
          <div>
            <p className="rs-dialog-kicker">Need help now?</p>
            <h2 id="rs-emergency-title">Emergency contacts</h2>
          </div>
          <button
            aria-label="Close emergency contacts"
            className="rs-icon-btn"
            onClick={() => emergencyDialog.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <ul className="rs-contact-list">
          {contacts.map(
            ({ altPhone, altPhoneHref, availability, description, id, name, phone, phoneHref }) => (
              <li className="rs-contact-card" key={id}>
                <div>
                  <h3>{name}</h3>
                  {description && <p>{description}</p>}
                  {availability && <p>{availability}</p>}
                </div>
                <div className="rs-contact-numbers">
                  <a className="rs-contact-phone" href={phoneHref}>
                    <Phone aria-hidden="true" size={16} />
                    <span>{phone}</span>
                  </a>
                  {altPhone && altPhoneHref && (
                    <a className="rs-contact-phone" href={altPhoneHref}>
                      <Phone aria-hidden="true" size={16} />
                      <span>{altPhone} (alternate)</span>
                    </a>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
        {contacts.some(({ isPlaceholder }) => isPlaceholder) && (
          <p className="rs-dialog-note">Placeholder contact numbers - please verify before publishing.</p>
        )}
        <Link className="rs-dialog-link" href="/contact">
          All contact information
        </Link>
      </dialog>

      <dialog aria-label="Mobile navigation" className="rs-dialog rs-sheet" ref={menuDialog}>
        <div className="rs-dialog-head">
          <p className="rs-dialog-kicker rs-kicker-green">Explore SUG</p>
          <button
            aria-label="Close navigation menu"
            className="rs-icon-btn"
            onClick={() => menuDialog.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="rs-sheet-nav">
          {siteNavigation.map(({ href, label }) => (
            <Link
              className="rs-sheet-link"
              href={href}
              key={label}
              onClick={() => menuDialog.current?.close()}
            >
              {label}
            </Link>
          ))}
          <Link className="rs-sheet-link" href="/welfare" onClick={() => menuDialog.current?.close()}>
            Welfare
          </Link>
        </nav>
        <button className="rs-emergency-pill rs-sheet-emergency" onClick={openEmergency} type="button">
          <Phone aria-hidden="true" size={17} />
          Emergency contacts
        </button>
      </dialog>
    </>
  )
}
