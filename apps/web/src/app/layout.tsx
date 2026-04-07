import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif } from 'next/font/google'
import Script from 'next/script'
import type { ReactNode } from 'react'

import { SiteFooter } from '../components/shell/site-footer'
import { SiteHeader } from '../components/shell/site-header'
import { getFooter, getNavigation, getSiteSettings } from '../lib/api'
import type { FooterGlobal, NavigationGlobal, SiteSettingsGlobal } from '../lib/types'
import './styles.css'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap'
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  style: ['normal', 'italic'],
  weight: '400',
  display: 'swap'
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
const gaMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim()
const shouldLoadAnalytics = process.env.NODE_ENV === 'production' && Boolean(gaMeasurementId)

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: 'ExplOregon Coast',
  description: 'A structured Oregon Coast directory and trip planning guide.',
  alternates: {
    canonical: '/'
  }
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
  headerNavItems: [],
  footerNavGroups: []
}

const fallbackFooter: FooterGlobal = {
  footerNavGroups: []
}

const loadShellData = async (): Promise<{
  siteSettings: SiteSettingsGlobal
  navigation: NavigationGlobal
  footer: FooterGlobal
}> => {
  try {
    const [siteSettings, navigation, footer] = await Promise.all([
      getSiteSettings({ revalidate: 1800 }),
      getNavigation({ revalidate: 1800 }),
      getFooter({ revalidate: 1800 })
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
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
        {shouldLoadAnalytics ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { anonymize_ip: true });`}
            </Script>
          </>
        ) : null}
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
