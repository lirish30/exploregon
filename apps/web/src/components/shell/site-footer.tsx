import Link from 'next/link'

import type { FooterGlobal } from '../../lib/types'
import { Container } from '../primitives/container'

type SiteFooterProps = {
  siteName: string
  siteTagline: string
  navGroups: NonNullable<FooterGlobal['footerNavGroups']>
  contactEmail: string | null
}

export const SiteFooter = ({ siteName, siteTagline, navGroups, contactEmail }: SiteFooterProps) => {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <p className="footer-brand-name">{siteName}</p>
            <p className="footer-brand-text">{siteTagline}</p>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="footer-link">
                {contactEmail}
              </a>
            ) : null}
          </div>
          {navGroups.map((group) => (
            <div key={group.groupLabel}>
              <p className="footer-column-title">{group.groupLabel}</p>
              <ul className="footer-links">
                {group.links.map((link) => (
                  <li key={`${group.groupLabel}-${link.label}-${link.url}`}>
                    <Link
                      href={link.url}
                      className="footer-link"
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noreferrer' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </footer>
  )
}
