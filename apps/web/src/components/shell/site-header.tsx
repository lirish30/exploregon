import Link from 'next/link'

import type { LinkItem } from '../../lib/types'
import { Container } from '../primitives/container'

type SiteHeaderProps = {
  siteName: string
  siteTagline: string
  navItems: LinkItem[]
}

export const SiteHeader = ({ siteName, siteTagline, navItems }: SiteHeaderProps) => {
  return (
    <header className="site-header">
      <Container>
        <div className="site-header-inner">
          {/* Brand */}
          <div className="brand-block">
            <Link href="/" className="brand-name">
              {siteName}
            </Link>
            <p className="brand-tagline">{siteTagline}</p>
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
          <details className="nav-details">
            <summary className="nav-toggle" aria-label="Toggle navigation">
              {/* Hamburger bars — shown when menu is closed */}
              <span className="nav-hamburger-icon" aria-hidden="true">
                <span className="nav-bar" />
                <span className="nav-bar" />
                <span className="nav-bar" />
              </span>
              {/* Close icon — shown when menu is open */}
              <span className="nav-close-icon" aria-hidden="true">✕</span>
            </summary>

            <nav aria-label="Primary" className="header-nav">
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
        </div>
      </Container>
    </header>
  )
}
