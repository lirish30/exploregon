import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getCities, getSiteSettings } from '../../../lib/api'
import { buildBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedCity, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

// Seed comparison data — used when Payload city data is unavailable
// [PLACEHOLDER] Replace with CMS-driven comparison fields when city records are seeded
type CompareCity = {
  name: string
  slug: string
  region: string
  summary: string
  vibe: string
  bestFor: string[]
  whenToGo: string
  avgDriveFromPortland: string
  priceLevel: string // '$' | '$$' | '$$$'
  highlights: string[]
}

const SEED_COMPARE_CITIES: CompareCity[] = [
  {
    name: 'Cannon Beach',
    slug: 'cannon-beach',
    region: 'North Coast',
    summary: "The Oregon Coast's most iconic resort town — Haystack Rock, galleries, and upscale dining.",
    vibe: 'Upscale resort village',
    bestFor: ['Couples', 'Weekend getaways', 'Photography', 'Art galleries'],
    whenToGo: 'July–October for clearest weather; January for storm watching',
    avgDriveFromPortland: '1.5 hours',
    priceLevel: '$$$',
    highlights: ['Haystack Rock', 'Ecola State Park', 'Cannon Beach Art Galleries', 'Tolovana Beach']
  },
  {
    name: 'Newport',
    slug: 'newport',
    region: 'Central Coast',
    summary: 'Working harbor town with the best marine science infrastructure and a thriving culinary scene.',
    vibe: 'Working harbor meets family destination',
    bestFor: ['Families', 'Seafood lovers', 'Marine science', 'Whale watching'],
    whenToGo: 'Year-round; summer for whale watches, winter for crab season',
    avgDriveFromPortland: '2.5 hours',
    priceLevel: '$$',
    highlights: ['Oregon Coast Aquarium', 'Bayfront District', 'Yaquina Head', 'Hatfield Marine Science Center']
  },
  {
    name: 'Lincoln City',
    slug: 'lincoln-city',
    region: 'Central Coast',
    summary: 'Practical north-central coast hub with glass blowing, kite flying, and casino options.',
    vibe: 'Accessible family & entertainment hub',
    bestFor: ['Families', 'Budget travelers', 'Kite flying', 'Glass art'],
    whenToGo: 'Spring and fall for better deals; summer for kite festivals',
    avgDriveFromPortland: '1.75 hours',
    priceLevel: '$$',
    highlights: ['D River Wayside', 'Glass float program', 'Chinook Winds Casino', 'Taft District']
  },
  {
    name: 'Astoria',
    slug: 'astoria',
    region: 'North Coast',
    summary: "Oregon's oldest city — Victorian architecture, maritime history, and a craft beer scene.",
    vibe: 'Historic maritime port city',
    bestFor: ['History buffs', 'Foodies', 'Film fans', 'Cyclists'],
    whenToGo: 'Summer for best weather; fall for Crab, Seafood & Wine festival',
    avgDriveFromPortland: '1.75 hours',
    priceLevel: '$$',
    highlights: ['Astoria Column', 'Fort Clatsop', 'Flavel House', 'Astoria–Megler Bridge']
  },
  {
    name: 'Bandon',
    slug: 'bandon',
    region: 'South Coast',
    summary: 'World-class golf, dramatic sea stacks, and Old Town charm on the quieter south coast.',
    vibe: 'Remote, scenic, golf destination',
    bestFor: ['Golfers', 'Beachcombers', 'Storm watching', 'Cranberry country'],
    whenToGo: 'May–September for golf weather; winter for dramatic sea stacks',
    avgDriveFromPortland: '4.5 hours',
    priceLevel: '$$$',
    highlights: ['Face Rock Wayside', 'Old Town Bandon', 'Bandon Dunes Golf Resort', 'Cape Blanco']
  }
]

const PRICE_LABELS: Record<string, string> = {
  '$': 'Budget-friendly',
  '$$': 'Mid-range',
  '$$$': 'Premium'
}

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
      title: 'Compare Oregon Coast Cities — Cannon Beach vs Newport vs Astoria & More',
      description:
        'Side-by-side comparison of top Oregon Coast destinations. Compare vibe, best season, activities, drive time, and price level to choose the right coastal base for your trip.',
      path: '/plan/compare'
    },
    settings
  )
}

// Merge live city data into the seed comparison structure
const buildCompareCities = (liveCities: NormalizedCity[], seeds: CompareCity[]): CompareCity[] => {
  if (liveCities.length === 0) return seeds

  return seeds.map((seed) => {
    const live = liveCities.find((c) => c.slug === seed.slug)
    if (!live) return seed
    return {
      ...seed,
      summary: live.summary || seed.summary,
      whenToGo: live.whenToGo || seed.whenToGo,
      highlights: live.featuredHighlights.length > 0 ? live.featuredHighlights.slice(0, 4) : seed.highlights
    }
  })
}

export default async function ComparePage() {
  const breadcrumbs = buildBreadcrumbs([
    { label: 'Plan', href: '/plan' },
    { label: 'Compare Cities', href: '/plan/compare' }
  ])

  // Load live cities if available, otherwise fall back to seed data
  let compareCities = SEED_COMPARE_CITIES

  try {
    const targetSlugs = SEED_COMPARE_CITIES.map((c) => c.slug)
    const liveCities = await getCities({ limit: 50 })
    const filtered = liveCities.filter((c) => targetSlugs.includes(c.slug as string))
    compareCities = buildCompareCities(filtered, SEED_COMPARE_CITIES)
  } catch {
    // Payload unavailable — seed data already set
  }

  const usingSeeds = compareCities === SEED_COMPARE_CITIES

  return (
    <>
      <section className="util-hero">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <p className="util-kicker">Trip Planning</p>
          <h1 className="util-title">Compare Oregon Coast Cities</h1>
          <p className="util-lede">
            Not sure which coastal town fits your trip? Compare {compareCities.length} destinations
            by vibe, activities, season, and drive time from Portland.
          </p>
          {usingSeeds ? (
            <p className="util-seed-note">
              [Placeholder] Showing curated seed comparison data. City summaries and highlights update
              automatically when Payload city records are published.
            </p>
          ) : null}
        </Container>
      </section>

      <Section>
        <div className="compare-grid">
          {compareCities.map((city) => (
            <article key={city.slug} className="compare-card">
              <div className="compare-card-header">
                <p className="compare-region">{city.region}</p>
                <h2 className="compare-city-name">{city.name}</h2>
                <p className="compare-vibe">{city.vibe}</p>
              </div>

              <p className="compare-summary">{city.summary}</p>

              <dl className="compare-metrics">
                <div className="compare-metric">
                  <dt>Best for</dt>
                  <dd className="compare-chips">
                    {city.bestFor.map((b) => (
                      <span key={b} className="chip">{b}</span>
                    ))}
                  </dd>
                </div>
                <div className="compare-metric">
                  <dt>When to go</dt>
                  <dd>{city.whenToGo}</dd>
                </div>
                <div className="compare-metric">
                  <dt>Drive from Portland</dt>
                  <dd>{city.avgDriveFromPortland}</dd>
                </div>
                <div className="compare-metric">
                  <dt>Price level</dt>
                  <dd>
                    <span className="compare-price-badge">{city.priceLevel}</span>
                    {' '}
                    <span className="compare-price-label">{PRICE_LABELS[city.priceLevel]}</span>
                  </dd>
                </div>
              </dl>

              {city.highlights.length > 0 ? (
                <div className="compare-highlights">
                  <p className="compare-highlights-label">Top attractions</p>
                  <ul>
                    {city.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Link href={`/cities/${city.slug}`} className="compare-cta button-primary">
                Explore {city.name}
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Quick Guide"
          title="Which Oregon Coast city is right for you?"
        />
        <div className="compare-quick-guide">
          <div className="compare-quick-row">
            <span className="compare-quick-label">If you want iconic scenery and romance</span>
            <Link href="/cities/cannon-beach" className="compare-quick-link">→ Cannon Beach</Link>
          </div>
          <div className="compare-quick-row">
            <span className="compare-quick-label">If you want the best seafood and aquarium</span>
            <Link href="/cities/newport" className="compare-quick-link">→ Newport</Link>
          </div>
          <div className="compare-quick-row">
            <span className="compare-quick-label">If you want history, food, and culture</span>
            <Link href="/cities/astoria" className="compare-quick-link">→ Astoria</Link>
          </div>
          <div className="compare-quick-row">
            <span className="compare-quick-label">If you want world-class golf and solitude</span>
            <Link href="/cities/bandon" className="compare-quick-link">→ Bandon</Link>
          </div>
          <div className="compare-quick-row">
            <span className="compare-quick-label">If you want a practical, family-friendly hub</span>
            <Link href="/cities/lincoln-city" className="compare-quick-link">→ Lincoln City</Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="util-related-row">
          <Link href="/map" className="util-related-card">
            <p className="util-related-label">See it mapped</p>
            <h3>Coast Map</h3>
            <p>All cities plotted on an interactive Oregon Coast map.</p>
          </Link>
          <Link href="/nature/weather" className="util-related-card">
            <p className="util-related-label">Check conditions</p>
            <h3>Weather Snapshot</h3>
            <p>Current coastal conditions before you pack.</p>
          </Link>
          <Link href="/nature/tides" className="util-related-card">
            <p className="util-related-label">Plan beach time</p>
            <h3>Tide Predictions</h3>
            <p>NOAA tide charts for beach access and clamming.</p>
          </Link>
        </div>
      </Section>
    </>
  )
}
