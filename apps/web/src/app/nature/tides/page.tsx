import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getSiteSettings } from '../../../lib/api'
import { buildBreadcrumbs, createMetadata } from '../../../lib/seo'
import { fetchTidesForStations, formatTideTime, TIDE_STATIONS } from '../../../lib/tides'
import type { SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 900 // 15-minute ISR

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
      title: "Oregon Coast Tide Predictions — Today's High & Low Tides",
      description:
        "Today's NOAA tide predictions for Astoria, Newport, and Coos Bay. Plan beach access, clamming, whale watching, and tidepooling around Oregon Coast tides.",
      path: '/nature/tides'
    },
    settings
  )
}

export default async function TidesPage() {
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Nature & Planning', href: '/nature' },
    { label: 'Tides', href: '/nature/tides' }
  ])

  const results = await fetchTidesForStations(TIDE_STATIONS)
  const dateLabel = results[0]?.dateLabel ?? null

  return (
    <>
      <section className="util-hero">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <p className="util-kicker">Planning Tools</p>
          <h1 className="util-title">Oregon Coast Tide Predictions</h1>
          <p className="util-lede">
            NOAA high and low tide times for North, Central, and South Coast stations
            {dateLabel ? ` — ${dateLabel}` : ''}.
          </p>
          <p className="util-timestamp">
            Source: NOAA CO-OPS. Refreshed every 15 minutes. Times shown in Pacific Local time.
          </p>
        </Container>
      </section>

      <Section>
        <div className="tide-station-grid">
          {results.map((result) => {
            if (!result.ok) {
              return (
                <article key={result.station.id} className="tide-station-card tide-station-error">
                  <p className="tide-region">{result.station.region}</p>
                  <h2 className="tide-station-name">{result.station.name}</h2>
                  <p className="tide-city-label">Near {result.station.city}</p>
                  <p className="tide-error">Tide data unavailable — {result.error}</p>
                </article>
              )
            }

            const { station, predictions } = result
            return (
              <article key={station.id} className="tide-station-card">
                <p className="tide-region">{station.region}</p>
                <h2 className="tide-station-name">{station.name}</h2>
                <p className="tide-city-label">Near {station.city}</p>
                {predictions.length > 0 ? (
                  <table className="tide-table" aria-label={`Tide predictions for ${station.name}`}>
                    <thead>
                      <tr>
                        <th scope="col">Time</th>
                        <th scope="col">Type</th>
                        <th scope="col">Height</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred, idx) => (
                        <tr
                          key={`${station.id}-${idx}`}
                          className={pred.type === 'H' ? 'tide-row-high' : 'tide-row-low'}
                        >
                          <td>{formatTideTime(pred.time)}</td>
                          <td>
                            <span className={`tide-badge tide-badge-${pred.type === 'H' ? 'high' : 'low'}`}>
                              {pred.type === 'H' ? 'High' : 'Low'}
                            </span>
                          </td>
                          <td className="tide-height">{pred.heightFt} ft</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="tide-empty">No tide predictions returned for this station today.</p>
                )}
                <p className="tide-station-id">NOAA station {station.id}</p>
              </article>
            )
          })}
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="How to Use Tides"
          title="Planning around the Oregon Coast tide cycle"
          lede="Oregon Coast tides follow a semi-diurnal pattern with two highs and two lows each day. The range varies from about 2 ft at neap tide to over 8 ft at spring tide."
        />
        <div className="tide-context-grid">
          <div className="tide-context-card">
            <h3>Tidepooling</h3>
            <p>
              Best at minus tides (0 ft and below). Arrive 1 hour before low tide and plan to stay
              through low tide. Cape Perpetua, Yaquina Head, and Haystack Rock are prime sites.
            </p>
          </div>
          <div className="tide-context-card">
            <h3>Clamming & Crabbing</h3>
            <p>
              Razor clamming is permitted on open beaches and regulated by ODFW. Check current
              biotoxin closures before digging. Minus tides expose productive digging zones on
              central coast beaches.
            </p>
          </div>
          <div className="tide-context-card">
            <h3>Beach Access</h3>
            <p>
              Many Oregon Coast beach passages are only accessible at lower tides. Arch Rock,
              Indian Beach, and several short headland trails require tide awareness. Always check
              before attempting sea cave or arch access.
            </p>
          </div>
          <div className="tide-context-card">
            <h3>Whale Watching</h3>
            <p>
              Gray whale migration peaks December–January (southbound) and March–April
              (northbound). Mid-tide is generally the easiest viewing window from headland
              viewpoints. Depoe Bay and Cape Perpetua are top sites.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="util-related-row">
          <Link href="/nature/weather" className="util-related-card">
            <p className="util-related-label">Also useful</p>
            <h3>Weather Snapshot</h3>
            <p>Current conditions at North, Central, and South Coast stations.</p>
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
