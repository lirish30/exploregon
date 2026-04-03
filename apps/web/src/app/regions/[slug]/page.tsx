import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import {
  getCitiesByRegion,
  getGuides,
  getListingsByRegion,
  getRegionBySlug,
  getRegions,
  getSiteSettings
} from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type {
  NormalizedCity,
  NormalizedGuide,
  NormalizedListing,
  SiteSettingsGlobal
} from '../../../lib/types'

export const revalidate = 300

type RegionPageProps = {
  params: {
    slug: string
  }
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast planning with trusted directory and editorial context.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial-placeholder@exploregoncoast.com',
    phone: null
  }
}

const toPayloadMediaUrl = (pathOrUrl: string | null | undefined): string | null => {
  if (!pathOrUrl) {
    return null
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  const payloadBase = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!payloadBase) {
    return pathOrUrl
  }

  return `${payloadBase.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

const relatedGuidesForRegion = (
  guides: NormalizedGuide[],
  citySlugs: string[]
): NormalizedGuide[] => {
  const slugSet = new Set(citySlugs)

  return guides
    .filter((guide) => guide.relatedCities.some((city) => slugSet.has(city.slug)))
    .slice(0, 4)
}

const topCategorySlugsFromListings = (
  listings: NormalizedListing[]
): Array<{ slug: string; label: string }> => {
  const map = new Map<string, { slug: string; label: string; count: number }>()

  for (const listing of listings) {
    for (const category of listing.categories) {
      const existing = map.get(category.slug)
      if (existing) {
        existing.count += 1
      } else {
        map.set(category.slug, { slug: category.slug, label: category.label, count: 1 })
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 6)
    .map(({ slug, label }) => ({ slug, label }))
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

export async function generateStaticParams() {
  try {
    const regions = await getRegions({ limit: 50 })
    return regions.map((region) => ({ slug: region.slug }))
  } catch {
    return [
      { slug: 'north-coast' },
      { slug: 'central-coast' },
      { slug: 'south-coast' }
    ]
  }
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const [settings, region] = await Promise.all([getSettings(), getRegionBySlug(params.slug)])

  if (!region) {
    return createMetadata(
      {
        title: 'Region Not Found',
        description: 'The requested Oregon Coast region page could not be found.',
        path: `/regions/${params.slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: region.seo.title,
      description: region.seo.description,
      path: `/regions/${region.slug}`,
      imageUrl: toPayloadMediaUrl(region.heroImage?.url)
    },
    settings
  )
}

export default async function RegionPage({ params }: RegionPageProps) {
  const region = await getRegionBySlug(params.slug)

  if (!region) {
    notFound()
  }

  const [cities, listings, guides] = await Promise.all([
    getCitiesByRegion(region.id, { limit: 24 }),
    getListingsByRegion(region.id, { limit: 24 }),
    getGuides({ limit: 120 })
  ])

  const featuredListings = listings.slice(0, 6)
  const citySlugs = cities.map((city) => city.slug)
  const relatedGuides = relatedGuidesForRegion(guides, citySlugs)
  const topCategories = topCategorySlugsFromListings(listings)
  const breadcrumbs = buildEntityBreadcrumbs('regions', region.name, region.slug)

  const heroImageUrl = toPayloadMediaUrl(region.heroImage?.url)
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.15) 0%, rgba(8, 39, 47, 0.78) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.92), rgba(12, 47, 56, 0.8)), #122e35'

  return (
    <>
      {/* Hero */}
      <section className="region-hero" style={{ backgroundImage: heroBackground }}>
        <Container>
          <div className="region-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="region-hero-kicker">Oregon Coast Region</p>
            <h1 className="region-hero-title">{region.name}</h1>
            <p className="region-hero-summary">{region.summary}</p>
            {cities.length > 0 && (
              <div className="region-hero-cities">
                <span className="region-hero-cities-label">Anchor towns:</span>
                {cities.slice(0, 5).map((city, i) => (
                  <span key={city.slug}>
                    <Link href={`/cities/${city.slug}`} className="region-hero-city-link">
                      {city.name}
                    </Link>
                    {i < Math.min(cities.length, 5) - 1 && (
                      <span className="region-hero-cities-sep">,</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Introduction */}
      <Section>
        <SectionHeading
          kicker="About This Region"
          title={`Explore the ${region.name}`}
          lede={region.intro}
        />
      </Section>

      {/* Featured Cities */}
      <Section surface="muted">
        <SectionHeading
          kicker="Cities & Towns"
          title={`Where to go on the ${region.name}`}
          lede="Each city page includes listings, events, a local map, and trip planning context."
        />
        {cities.length > 0 ? (
          <div className="region-city-grid">
            {cities.map((city: NormalizedCity) => (
              <article key={city.slug} className="region-city-card">
                <h3 className="region-city-name">
                  <Link href={`/cities/${city.slug}`} className="region-city-link">
                    {city.name}
                  </Link>
                </h3>
                <p className="region-city-summary">{city.summary}</p>
                {city.featuredHighlights.length > 0 && (
                  <ul className="region-city-highlights">
                    {city.featuredHighlights.slice(0, 3).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
                <Link href={`/cities/${city.slug}`} className="region-city-cta">
                  Explore {city.name} →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="region-empty">
            City placeholder: publish cities assigned to this region in Payload.
          </p>
        )}
      </Section>

      {/* Featured Listings */}
      <Section>
        <SectionHeading
          kicker="Featured Listings"
          title={`Things to do and places to stay on the ${region.name}`}
          lede="A curated cross-section of published listings across this region."
        />
        {featuredListings.length > 0 ? (
          <div className="city-card-grid">
            {featuredListings.map((listing) => (
              <article key={listing.slug} className="city-listing-card">
                <p className="city-listing-kicker">
                  {listing.categories[0]?.label ?? 'Featured Listing'}
                  {listing.city ? ` · ${listing.city.label}` : ''}
                </p>
                <h3 className="city-listing-title">{listing.name}</h3>
                <p className="city-listing-summary">{listing.summary}</p>
                <div className="city-listing-links">
                  <Link href={`/listings/${listing.slug}`} className="city-inline-link">
                    View listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="region-empty">
            Listings placeholder: publish listings assigned to this region in Payload.
          </p>
        )}
        {listings.length > 6 && (
          <div className="region-view-all">
            <Link href={`/listings?region=${region.slug}`} className="region-view-all-link">
              View all {region.name} listings
            </Link>
          </div>
        )}
      </Section>

      {/* Browse by Category */}
      {topCategories.length > 0 && (
        <Section surface="muted">
          <SectionHeading
            kicker="Browse by Category"
            title={`What to find on the ${region.name}`}
          />
          <div className="city-link-row">
            {topCategories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="city-link-chip">
                {cat.label}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Related Guides */}
      <Section>
        <SectionHeading
          kicker="Planning Guides"
          title={`${region.name} travel guides`}
          lede="Editorial guides connected to cities and destinations in this region."
        />
        {relatedGuides.length > 0 ? (
          <div className="city-card-grid">
            {relatedGuides.map((guide: NormalizedGuide) => (
              <article key={guide.slug} className="city-listing-card">
                {guide.travelSeason && (
                  <p className="city-listing-kicker">{guide.travelSeason}</p>
                )}
                <h3 className="city-listing-title">{guide.title}</h3>
                <p className="city-listing-summary">{guide.excerpt}</p>
                <div className="city-listing-links">
                  <Link href={`/guides/${guide.slug}`} className="city-inline-link">
                    Read guide
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="region-empty">
            Guides placeholder: connect published guides to cities in this region.
          </p>
        )}
      </Section>

      {/* Internal Links */}
      <Section surface="muted">
        <SectionHeading
          kicker="Plan Your Visit"
          title={`More ways to explore the ${region.name}`}
        />
        <div className="region-links-grid">
          <div className="region-links-group">
            <h3 className="region-links-label">Cities in this region</h3>
            {cities.length > 0 ? (
              <ul className="city-related-list">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/cities/${city.slug}`} className="city-inline-link">
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="region-empty">No cities published yet.</p>
            )}
          </div>
          <div className="region-links-group">
            <h3 className="region-links-label">Planning tools</h3>
            <ul className="city-related-list">
              <li>
                <Link href="/map" className="city-inline-link">
                  Interactive coast map
                </Link>
              </li>
              <li>
                <Link href="/weather-tides" className="city-inline-link">
                  Weather &amp; tides
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="city-inline-link">
                  Oregon Coast itineraries
                </Link>
              </li>
              <li>
                <Link href="/guides" className="city-inline-link">
                  All travel guides
                </Link>
              </li>
            </ul>
          </div>
          <div className="region-links-group">
            <h3 className="region-links-label">Browse by type</h3>
            <ul className="city-related-list">
              <li>
                <Link href="/categories/hotels" className="city-inline-link">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/categories/campgrounds" className="city-inline-link">
                  Campgrounds
                </Link>
              </li>
              <li>
                <Link href="/categories/restaurants" className="city-inline-link">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/categories/beaches" className="city-inline-link">
                  Beaches
                </Link>
              </li>
              <li>
                <Link href="/categories/hiking" className="city-inline-link">
                  Hiking
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
