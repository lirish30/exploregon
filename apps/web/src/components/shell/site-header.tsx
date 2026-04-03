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
          <div className="brand-block">
            <Link href="/" className="brand-name">
              {siteName}
            </Link>
            <p className="brand-tagline">{siteTagline}</p>
          </div>
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
        </div>
      </Container>
    </header>
  )
}
