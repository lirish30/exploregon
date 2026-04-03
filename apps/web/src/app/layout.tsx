import type { Metadata } from 'next'
import { Manrope, Newsreader } from 'next/font/google'
import type { ReactNode } from 'react'

import { SiteFooter } from '../components/shell/site-footer'
import { SiteHeader } from '../components/shell/site-header'
import { getFooter, getNavigation, getSiteSettings } from '../lib/api'
import type { FooterGlobal, NavigationGlobal, SiteSettingsGlobal } from '../lib/types'
import './styles.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'ExplOregon Coast',
  description: 'A structured Oregon Coast directory and trip planning guide.'
}

const fallbackSiteSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'Plan the Oregon Coast with trusted local structure.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast travel and planning.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
    phone: null
  }
}

const fallbackNavigation: NavigationGlobal = {
  headerNavItems: [
    { label: 'Cities', url: '/cities' },
    { label: 'Categories', url: '/categories' },
    { label: 'Guides', url: '/guides' },
    { label: 'Map', url: '/map' }
  ],
  footerNavGroups: []
}

const fallbackFooter: FooterGlobal = {
  footerNavGroups: [
    {
      groupLabel: 'Explore',
      links: [
        { label: 'Cities', url: '/cities' },
        { label: 'Categories', url: '/categories' },
        { label: 'Guides', url: '/guides' }
      ]
    },
    {
      groupLabel: 'Plan',
      links: [
        { label: 'Weather & Tides', url: '/weather-tides' },
        { label: 'Map', url: '/map' },
        { label: 'Itineraries', url: '/itineraries' }
      ]
    }
  ]
}

const loadShellData = async (): Promise<{
  siteSettings: SiteSettingsGlobal
  navigation: NavigationGlobal
  footer: FooterGlobal
}> => {
  try {
    const [siteSettings, navigation, footer] = await Promise.all([
      getSiteSettings({ revalidate: 3600 }),
      getNavigation({ revalidate: 3600 }),
      getFooter({ revalidate: 3600 })
    ])

    return { siteSettings, navigation, footer }
  } catch {
    return {
      siteSettings: fallbackSiteSettings,
      navigation: fallbackNavigation,
      footer: fallbackFooter
    }
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { siteSettings, navigation, footer } = await loadShellData()
  const footerGroups = footer.footerNavGroups?.length ? footer.footerNavGroups : fallbackFooter.footerNavGroups

  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${manrope.variable}`}>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <div className="site-shell">
          <SiteHeader
            siteName={siteSettings.siteName}
            siteTagline={siteSettings.siteTagline}
            navItems={navigation.headerNavItems ?? fallbackNavigation.headerNavItems ?? []}
          />
          <main id="content" className="shell-main">
            {children}
          </main>
          <SiteFooter
            siteName={siteSettings.siteName}
            siteTagline={siteSettings.siteTagline}
            navGroups={footerGroups ?? []}
            contactEmail={siteSettings.contact?.email ?? null}
          />
        </div>
      </body>
    </html>
  )
}
