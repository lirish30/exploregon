import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { CtaBlock } from '../../components/primitives/cta-block'
import { MapPlaceholder } from '../../components/primitives/map-placeholder'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getCities, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { MapCity } from '../../components/map/coast-map'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

// Dynamic import: Leaflet requires browser APIs — SSR must be false
const CoastMap = dynamic(
  () => import('../../components/map/coast-map').then((mod) => mod.CoastMap),
  {
    ssr: false,
    loading: () => (
      <MapPlaceholder
        title="Loading coast map…"
        note="Fetching city coordinates from Payload."
      />
    )
  }
)

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Map | ExplOregon Coast',
    description: 'Interactive Oregon Coast map utility for city and listing planning.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
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
      description: 'Interactive Leaflet + OpenStreetMap map of Oregon Coast cities.',
      path: '/map'
    },
    settings
  )
}

export default async function MapPage() {
  const cities = await getCities({ status: 'published', limit: 50 }).catch(() => [])

  const mapCities: MapCity[] = cities
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      latitude: c.latitude,
      longitude: c.longitude
    }))

  return (
    <>
      <PageHero
        kicker="Utility"
        title="Oregon Coast map"
        description="Published coastal cities plotted on an interactive OpenStreetMap. Click any marker to jump to that city's guide."
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
          kicker="Map"
          title="Coast city map"
          lede={`${mapCities.length} published ${mapCities.length === 1 ? 'city' : 'cities'} plotted via Leaflet + OpenStreetMap.`}
        />

        {mapCities.length > 0 ? (
          <CoastMap cities={mapCities} />
        ) : (
          <MapPlaceholder
            title="No published cities found"
            note="Run the seed script to populate city records with coordinates."
          />
        )}
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
