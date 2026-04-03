import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 900

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Weather and Tides | ExplOregon Coast',
    description: 'Weather and tide planning utility for Oregon Coast trip timing decisions.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial-placeholder@exploregoncoast.com',
    phone: null
  }
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Weather and Tides',
      description: 'Utility route for Open-Meteo weather and NOAA tide planning context.',
      path: '/weather-tides'
    },
    settings
  )
}

export default function WeatherTidesPage() {
  return (
    <>
      <PageHero
        kicker="Utility"
        title="Weather and tides planning"
        description="MVP utility route reserved for Open-Meteo weather and NOAA tides. Use this page to validate coastal timing assumptions before route planning."
        actions={[
          { label: 'Open Coast Map', href: '/map', variant: 'secondary' },
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Weather & Tides', href: '/weather-tides' }
            ]}
          />
        </div>

        <div className="utility-grid">
          <article id="weather" className="utility-card">
            <p className="utility-kicker">Open-Meteo / NWS</p>
            <h2 className="utility-title">Weather snapshot</h2>
            <p className="utility-copy">
              Placeholder assumption: integrate forecast summaries and basic marine conditions by city coordinates.
            </p>
          </article>

          <article id="tides" className="utility-card">
            <p className="utility-kicker">NOAA</p>
            <h2 className="utility-title">Tide snapshot</h2>
            <p className="utility-copy">
              Placeholder assumption: integrate next high/low tide windows for key Oregon Coast tide stations.
            </p>
          </article>
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="MVP Scope"
          title="Utility route is intentionally minimal"
          lede="This page satisfies the required utility route family while preserving phase-one scope. API wiring is a follow-on step."
        />
      </Section>
    </>
  )
}
