import Link from 'next/link'
import type { Metadata } from 'next'

import { getCities, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { NormalizedCity, SiteSettingsGlobal } from '../../lib/types'
import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Cities | ExplOregon Coast',
    description: 'Browse Oregon Coast cities by region with practical summaries and direct links into listings and guides.'
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

const groupCitiesByRegion = (cities: NormalizedCity[]): Array<{ region: string; cities: NormalizedCity[] }> => {
  const grouped = cities.reduce<Map<string, NormalizedCity[]>>((map, city) => {
    const key = city.region?.label ?? 'Coastwide'
    const existing = map.get(key) ?? []
    existing.push(city)
    map.set(key, existing)
    return map
  }, new Map())

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, groupedCities]) => ({
      region,
      cities: groupedCities.sort((a, b) => a.name.localeCompare(b.name))
    }))
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Oregon Coast Cities',
      description: 'Explore Oregon Coast cities by region and jump directly into trusted listings, events, and guides.',
      path: '/cities'
    },
    settings
  )
}

export default async function CitiesIndexPage() {
  const [cities] = await Promise.all([getCities({ sort: 'name', limit: 250 })])
  const groupedCities = groupCitiesByRegion(cities)

  return (
    <>
      <PageHero
        kicker="City Directory"
        title="Find the right Oregon Coast town for your trip"
        description="Browse city pages grouped by region, then jump into listings, events, and practical planning guides for each destination."
        actions={[
          { label: 'View Coast Map', href: '/map', variant: 'secondary' },
          { label: 'Browse Guides', href: '/guides', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Cities', href: '/cities' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Directory Intro"
          title="Coastal city hubs with structured trip context"
          lede="Each city template connects local highlights, featured listings, events, and internal planning links so users can compare destinations without leaving the site architecture."
        />

        {groupedCities.length ? (
          <div className="cities-index-region-stack">
            {groupedCities.map((group) => (
              <section key={group.region} className="cities-index-region-block" aria-label={`${group.region} cities`}>
                <h2 className="cities-index-region-title">{group.region}</h2>
                <div className="cities-index-grid">
                  {group.cities.map((city) => (
                    <Link key={city.slug} href={`/cities/${city.slug}`} className="cities-index-card">
                      <p className="cities-index-card-region">{city.region?.label ?? 'Coastwide'}</p>
                      <h3 className="cities-index-card-title">{city.name}</h3>
                      <p className="cities-index-card-summary">{city.summary}</p>
                      <p className="cities-index-card-link">Open city page</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="cities-index-empty">
            No published cities are available yet.
          </p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Internal Links"
          title="Continue planning by content type"
          lede="Use these section hubs when users want to compare by activity, stay type, or season across multiple cities."
        />
        <div className="cities-index-links">
          <Link href="/categories" className="cities-index-link-pill">
            Listing Categories
          </Link>
          <Link href="/guides" className="cities-index-link-pill">
            Travel Guides
          </Link>
          <Link href="/events" className="cities-index-link-pill">
            Events
          </Link>
        </div>
      </Section>
    </>
  )
}
