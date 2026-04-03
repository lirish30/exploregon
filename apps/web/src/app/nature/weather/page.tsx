import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getSiteSettings } from '../../../lib/api'
import { buildBreadcrumbs, createMetadata } from '../../../lib/seo'
import { fetchWeatherForStations, WEATHER_STATIONS } from '../../../lib/weather'
import type { SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 1800 // 30-minute ISR

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
      title: 'Oregon Coast Weather — Current Conditions at Key Coastal Towns',
      description:
        'Check current Oregon Coast weather for Cannon Beach, Newport, and Bandon. Temperature, wind, and coastal conditions updated every 30 minutes.',
      path: '/nature/weather'
    },
    settings
  )
}

const formatFetchTime = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'America/Los_Angeles'
    }).format(new Date(iso))
  } catch {
    return 'recently'
  }
}

export default async function WeatherPage() {
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Nature & Planning', href: '/nature' },
    { label: 'Weather', href: '/nature/weather' }
  ])

  const results = await fetchWeatherForStations(WEATHER_STATIONS)
  const fetchedAt = results.find((r) => r.ok)?.ok
    ? formatFetchTime((results.find((r) => r.ok) as { ok: true; data: { fetchedAt: string } }).data.fetchedAt)
    : null

  return (
    <>
      <section className="util-hero">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <p className="util-kicker">Planning Tools</p>
          <h1 className="util-title">Oregon Coast Weather</h1>
          <p className="util-lede">
            Current conditions at North, Central, and South Coast monitoring points. Updated
            automatically every 30 minutes via Open-Meteo.
          </p>
          {fetchedAt ? (
            <p className="util-timestamp">Last fetched: {fetchedAt}</p>
          ) : null}
        </Container>
      </section>

      <Section>
        <div className="weather-grid">
          {results.map((result) => {
            if (!result.ok) {
              return (
                <article key={result.station.slug} className="weather-card weather-card-error">
                  <p className="weather-region">{result.station.region}</p>
                  <h2 className="weather-city">{result.station.name}</h2>
                  <p className="weather-error">
                    Conditions unavailable — {result.error}
                  </p>
                  <Link href={`/cities/${result.station.slug}`} className="weather-city-link">
                    View city guide →
                  </Link>
                </article>
              )
            }

            const { data } = result
            return (
              <article key={data.station.slug} className="weather-card">
                <p className="weather-region">{data.station.region}</p>
                <h2 className="weather-city">{data.station.name}</h2>
                <div className="weather-temp">{data.temperatureF}°F</div>
                <p className="weather-condition">{data.condition}</p>
                <dl className="weather-details">
                  <div className="weather-detail-row">
                    <dt>Wind</dt>
                    <dd>{data.windSpeedMph} mph</dd>
                  </div>
                  <div className="weather-detail-row">
                    <dt>Humidity</dt>
                    <dd>{data.humidity}%</dd>
                  </div>
                </dl>
                <Link href={`/cities/${data.station.slug}`} className="weather-city-link">
                  {data.station.name} city guide →
                </Link>
              </article>
            )
          })}
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Planning Context"
          title="Oregon Coast weather patterns"
          lede="The Oregon Coast experiences a temperate marine climate year-round. Summers are cool and dry (55–70°F), while winters bring heavy rainfall and occasional wind events. Microclimates vary significantly between the north and south coast."
        />
        <div className="weather-context-grid">
          <div className="weather-context-card">
            <h3>Summer (June–Sep)</h3>
            <p>
              June gloom burns off by late July. The clearest, driest weather typically runs
              July–September. Expect 60–72°F inland and 55–65°F at the shore. Wind picks up in
              afternoons along central coast beaches.
            </p>
          </div>
          <div className="weather-context-card">
            <h3>Fall (Oct–Nov)</h3>
            <p>
              Shoulder season with fewer crowds and spectacular storm-watching potential. Warm
              September can extend well into October on some years. First rain events usually arrive
              by mid-October.
            </p>
          </div>
          <div className="weather-context-card">
            <h3>Winter (Dec–Mar)</h3>
            <p>
              Prime storm-watching season. Dramatic wave action, turbulent skies, and dramatic
              seabird activity. Temperatures rarely drop below freezing at sea level. Snow is
              extremely rare on the coast itself.
            </p>
          </div>
          <div className="weather-context-card">
            <h3>Spring (Apr–May)</h3>
            <p>
              Wildflower bloom and whale migration season. Weather is variable — clear mornings and
              afternoon fog are common. Lower prices and manageable crowds make this a strong
              alternative to summer.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="util-related-row">
          <Link href="/nature/tides" className="util-related-card">
            <p className="util-related-label">Also useful</p>
            <h3>Tide Predictions</h3>
            <p>NOAA tide charts for Astoria, Newport, and Coos Bay.</p>
          </Link>
          <Link href="/map" className="util-related-card">
            <p className="util-related-label">See it mapped</p>
            <h3>Coast Map</h3>
            <p>Interactive map of Oregon Coast cities and listings.</p>
          </Link>
          <Link href="/plan/compare" className="util-related-card">
            <p className="util-related-label">Choose your base</p>
            <h3>Compare Cities</h3>
            <p>Side-by-side comparison of coastal destinations.</p>
          </Link>
        </div>
      </Section>
    </>
  )
}
