import Link from 'next/link'

import { toPayloadMediaUrl } from '../../lib/schema'
import type { HeaderActionButton, LinkItem, NormalizedMedia } from '../../lib/types'
import { Container } from '../primitives/container'

type SiteHeaderProps = {
  siteName: string
  logo: NormalizedMedia | null
  navItems: LinkItem[]
  actionButtons: HeaderActionButton[]
}

export const SiteHeader = ({ siteName, logo, navItems, actionButtons }: SiteHeaderProps) => {
  const logoUrl = toPayloadMediaUrl(logo?.url)
  const logoAlt = logo?.alt?.trim() || `${siteName} logo`
  const rightButtons = actionButtons.slice(0, 2)

  return (
    <header className="site-header">
      <Container>
        <div className="site-header-inner">
          {/* Brand */}
          <div className="brand-block">
            <Link href="/" className="brand-name">
              {logoUrl ? (
                <img src={logoUrl} alt={logoAlt} className="brand-logo" />
              ) : (
                siteName
              )}
            </Link>
          </div>
          {/*
           * Nav uses a <details>/<summary> approach so it is:
           *   - Server-renderable (no 'use client' needed)
           *   - A real hamburger toggle on mobile (via CSS + browser details behaviour)
           *   - A plain inline nav on desktop (summary hidden via CSS, nav always shown)
           *
           * On desktop: .nav-toggle is display:none and .header-nav is always flex.
           * On mobile:  .nav-toggle shows the hamburger/close icon; .header-nav is
           *             hidden until details[open], then slides in as a dropdown.
          */}
          <nav aria-label="Primary" className="header-nav header-nav-desktop">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.url}`}
                href={item.url}
                className="header-nav-link"
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noreferrer' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <details className="nav-details">
              <summary className="nav-toggle" aria-label="Toggle navigation">
                {/* Hamburger bars — shown when menu is closed */}
                <span className="nav-hamburger-icon" aria-hidden="true">
                  <span className="nav-bar" />
                  <span className="nav-bar" />
                  <span className="nav-bar" />
                </span>
                {/* Close icon — shown when menu is open */}
                <span className="nav-close-icon" aria-hidden="true">
                  ✕
                </span>
              </summary>
              <nav aria-label="Primary" className="header-nav header-nav-mobile">
                {navItems.map((item) => (
                  <Link
                    key={`${item.label}-${item.url}`}
                    href={item.url}
                    className="header-nav-link"
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noreferrer' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
            {rightButtons.length > 0 ? (
              <div className="header-utility-links">
                {rightButtons.map((button, index) => (
                  <Link
                    key={`${button.label}-${button.url}-${index}`}
                    href={button.url}
                    className={index === 0 ? 'header-utility-link' : 'button-primary header-cta'}
                    target={button.openInNewTab ? '_blank' : undefined}
                    rel={button.openInNewTab ? 'noreferrer' : undefined}
                  >
                    {button.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  )
}
