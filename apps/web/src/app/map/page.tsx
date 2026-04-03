import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { CtaBlock } from '../../components/primitives/cta-block'
import { MapPlaceholder } from '../../components/primitives/map-placeholder'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Map | ExplOregon Coast',
    description: 'Interactive Oregon Coast map utility for city and listing planning.'
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
      title: 'Oregon Coast Map',
      description: 'Map utility route for Leaflet + OpenStreetMap city and listing exploration.',
      path: '/map'
    },
    settings
  )
}

export default function MapPage() {
  return (
    <>
      <PageHero
        kicker="Utility"
        title="Oregon Coast map"
        description="Planning utility route reserved for Leaflet + OpenStreetMap integration, with city and listing map context."
        actions={[
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' },
          { label: 'Browse Listings', href: '/categories', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Map', href: '/map' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Map Module"
          title="Leaflet + OpenStreetMap utility"
          lede="MVP map route is live and ready for marker integration from published city and listing records."
        />
        <MapPlaceholder
          title="Coast map utility"
          note="Next integration step: render Leaflet map tiles with published city centers and listing markers."
        />
      </Section>

      <Section surface="muted">
        <CtaBlock
          title="Need weather and tides too?"
          body="Pair map planning with the weather and NOAA tide utility route before finalizing destination order."
          buttonLabel="Open Weather & Tides"
          buttonHref="/weather-tides"
        />
      </Section>
    </>
  )
}
