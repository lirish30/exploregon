import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { Container } from '../../components/primitives/container'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getCities, getListings, getSiteSettings } from '../../lib/api'
import { buildBreadcrumbs, createMetadata } from '../../lib/seo'
import type { MapPin } from '../../components/map/coast-map'
import type { SiteSettingsGlobal } from '../../lib/types'

// Load Leaflet client-only — window is required at runtime
const CoastMap = dynamic(
  () => import('../../components/map/coast-map').then((m) => m.CoastMap),
  {
    ssr: false,
    loading: () => (
      <div className="mappage-loading" aria-label="Map loading">
        Loading interactive map…
      </div>
    )
  }
)

export const revalidate = 300

// Seed fallback — Oregon Coast key cities with real coordinates
// Used when Payload is unavailable; replace with live API data when seeded
const SEED_CITY_PINS: MapPin[] = [
  { label: 'Astoria', slug: 'astoria', latitude: 46.188, longitude: -123.831, type: 'city', region: 'North Coast' },
  { label: 'Seaside', slug: 'seaside', latitude: 45.993, longitude: -123.921, type: 'city', region: 'North Coast' },
  { label: 'Cannon Beach', slug: 'cannon-beach', latitude: 45.892, longitude: -123.961, type: 'city', region: 'North Coast' },
  { label: 'Tillamook', slug: 'tillamook', latitude: 45.456, longitude: -123.845, type: 'city', region: 'North Coast' },
  { label: 'Lincoln City', slug: 'lincoln-city', latitude: 44.958, longitude: -124.010, type: 'city', region: 'Central Coast' },
  { label: 'Newport', slug: 'newport', latitude: 44.637, longitude: -124.053, type: 'city', region: 'Central Coast' },
  { label: 'Florence', slug: 'florence', latitude: 43.982, longitude: -124.101, type: 'city', region: 'Central Coast' },
  { label: 'Coos Bay', slug: 'coos-bay', latitude: 43.366, longitude: -124.214, type: 'city', region: 'South Coast' },
  { label: 'Bandon', slug: 'bandon', latitude: 43.119, longitude: -124.408, type: 'city', region: 'South Coast' },
  { label: 'Gold Beach', slug: 'gold-beach', latitude: 42.411, longitude: -124.424, type: 'city', region: 'South Coast' }
]

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'Trusted Oregon Coast trip planning.',
  defaultSeo: { title: 'ExplOregon Coast', description: 'Structured Oregon Coast travel.' },
  socialLinks: [],
  contact: { email: 'editorial-placeholder@exploregoncoast.com', phone: null }
}

export async function generateMetadata(): Promise<Metadata> {
  let settings = fallbackSettings
  try {
    settings = await getSiteSettings()
  } catch {
    // fallback
  }

  return createMetadata(
    {
      title: 'Interactive Oregon Coast Map — Cities, Beaches & Planning Tool',
      description:
        'Explore the Oregon Coast on an interactive map. Browse cities, listings, and coastal destinations from Astoria to Gold Beach.',
      path: '/map'
    },
    settings
  )
}

export default async function MapPage() {
  const breadcrumbs = buildBreadcrumbs([{ label: 'Coast Map', href: '/map' }])

  // Attempt to load live city and listing pins — fall back to seed data
  let pins: MapPin[] = SEED_CITY_PINS

  try {
    const [cities, listings] = await Promise.all([
      getCities({ limit: 50 }),
      getListings({ limit: 100 })
    ])

    const livePins: MapPin[] = [
      ...cities
        .filter((c) => c.latitude && c.longitude)
        .map((c) => ({
          label: c.name,
          slug: c.slug,
          latitude: c.latitude,
          longitude: c.longitude,
          type: 'city' as const,
          region: c.region?.label ?? undefined
        })),
      ...listings
        .filter((l) => l.latitude && l.longitude)
        .map((l) => ({
          label: l.name,
          slug: l.slug,
          latitude: l.latitude,
          longitude: l.longitude,
          type: 'listing' as const,
          region: l.region?.label ?? undefined
        }))
    ]

    if (livePins.length > 0) {
      pins = livePins
    }
  } catch {
    // Payload unavailable — seed pins already set
  }

  const cityPins = pins.filter((p) => p.type === 'city')
  const listingPins = pins.filter((p) => p.type === 'listing')
  const usingLiveData = cityPins.length > 0 && cityPins[0].label !== 'Astoria'

  return (
    <>
      <section className="mappage-hero">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <p className="mappage-kicker">Explore the Oregon Coast</p>
          <h1 className="mappage-title">Interactive Coast Map</h1>
          <p className="mappage-lede">
            Browse {cityPins.length} coastal {cityPins.length === 1 ? 'city' : 'cities'}
            {listingPins.length > 0 ? ` and ${listingPins.length} listings` : ''} along Oregon's
            363-mile coastline.
          </p>
          {!usingLiveData ? (
            <p className="mappage-seed-note">
              [Placeholder] Showing seed city coordinates. Connect Payload to load live listing pins.
            </p>
          ) : null}
        </Container>
      </section>

      <section className="mappage-canvas">
        <Container>
          <CoastMap pins={pins} center={[44.5, -124.0]} zoom={7} height={520} />
          <p className="mappage-attribution">
            Map tiles &copy;{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
              OpenStreetMap
            </a>{' '}
            contributors. Click any pin to view city or listing detail.
          </p>
        </Container>
      </section>

      <Section>
        <SectionHeading kicker="Cities on the Map" title="Oregon Coast city index" />
        <div className="mappage-city-list">
          {['North Coast', 'Central Coast', 'South Coast'].map((regionName) => {
            const regionPins = cityPins.filter((p) => p.region === regionName)
            if (regionPins.length === 0) return null
            return (
              <div key={regionName} className="mappage-region-group">
                <h3 className="mappage-region-name">{regionName}</h3>
                <ul className="mappage-region-links">
                  {regionPins.map((pin) => (
                    <li key={pin.slug}>
                      <Link href={`/cities/${pin.slug}`} className="mappage-city-link">
                        {pin.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </Section>

      <Section surface="muted">
        <div className="mappage-utility-row">
          <div className="mappage-utility-card">
            <p className="mappage-utility-kicker">Live Planning Data</p>
            <h2 className="mappage-utility-title">Weather & Tides</h2>
            <p>Check current coastal conditions before you go.</p>
            <div className="mappage-utility-links">
              <Link href="/nature/weather" className="button-primary">
                Weather Snapshot
              </Link>
              <Link href="/nature/tides" className="button-secondary">
                Tide Predictions
              </Link>
            </div>
          </div>
          <div className="mappage-utility-card">
            <p className="mappage-utility-kicker">Choose Your Base</p>
            <h2 className="mappage-utility-title">Compare Cities</h2>
            <p>Side-by-side comparison of coastal towns by vibe, season, and activities.</p>
            <div className="mappage-utility-links">
              <Link href="/plan/compare" className="button-primary">
                Compare Destinations
              </Link>
              <Link href="/cities" className="button-secondary">
                All Cities
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
