import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { FaqAccordion } from '../../../components/primitives/faq-accordion'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import {
  getCities,
  getCityBySlug,
  getEventsByCity,
  getGuides,
  getListingsByCity,
  getSiteSettings
} from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type {
  NormalizedCategory,
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedListing,
  SiteSettingsGlobal
} from '../../../lib/types'

export const revalidate = 300

type CityPageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast city planning with trusted directory and editorial context.'
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

const formatDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date placeholder'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const topCategoriesFromListings = (listings: NormalizedListing[]): NormalizedCategory[] => {
  const map = new Map<string, NormalizedCategory & { count: number }>()

  for (const listing of listings) {
    for (const category of listing.categories) {
      const existing = map.get(category.slug)

      if (existing) {
        existing.count += 1
        map.set(category.slug, existing)
      } else {
        map.set(category.slug, {
          id: category.id,
          slug: category.slug,
          name: category.label,
          description: '',
          icon: '',
          seo: {
            title: category.label,
            description: ''
          },
          count: 1
        })
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 6)
}

const relatedGuidesForCity = (guides: NormalizedGuide[], citySlug: string): NormalizedGuide[] => {
  return guides
    .filter((guide) => guide.relatedCities.some((relatedCity) => relatedCity.slug === citySlug))
    .slice(0, 4)
}

const nearbyCitiesForRegion = (cities: NormalizedCity[], currentCity: NormalizedCity): NormalizedCity[] => {
  return cities
    .filter((city) => city.slug !== currentCity.slug && city.region?.slug && city.region.slug === currentCity.region?.slug)
    .slice(0, 4)
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, city] = await Promise.all([getSettings(), getCityBySlug(slug)])

  if (!city) {
    return createMetadata(
      {
        title: 'City Not Found',
        description: 'The requested Oregon Coast city page could not be found.',
        path: `/cities/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: city.seo.title,
      description: city.seo.description,
      path: `/cities/${city.slug}`,
      imageUrl: toPayloadMediaUrl(city.heroImage?.url)
    },
    settings
  )
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params
  const city = await getCityBySlug(slug)

  if (!city) {
    notFound()
  }

  const [listings, events, guides, cities] = await Promise.all([
    getListingsByCity(city.id, { limit: 24 }),
    getEventsByCity(city.id, { limit: 8 }),
    getGuides({ limit: 120 }),
    getCities({ sort: 'name', limit: 250 })
  ])

  const featuredListings = listings.slice(0, 6)
  const topCategories = topCategoriesFromListings(listings)
  const relatedGuides = relatedGuidesForCity(guides, city.slug)
  const nearbyCities = nearbyCitiesForRegion(cities, city)
  const breadcrumbs = buildEntityBreadcrumbs('cities', city.name, city.slug)

  const heroBackgroundImage = toPayloadMediaUrl(city.heroImage?.url)
  const heroBackground = heroBackgroundImage
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.2) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroBackgroundImage}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  return (
    <>
      <section className="city-hero" style={{ backgroundImage: heroBackground }}>
        <Container>
          <div className="city-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="city-hero-kicker">{city.region?.label ?? 'Oregon Coast City'}</p>
            <h1 className="city-hero-title">{city.name}</h1>
            <p className="city-hero-summary">{city.summary}</p>
            {city.featuredHighlights.length ? (
              <ul className="city-hero-highlights" aria-label="Featured highlights">
                {city.featuredHighlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading kicker="Intro" title={`Welcome to ${city.name}`} lede={city.intro} />
      </Section>

      <Section surface="muted">
        <div className="city-copy-grid">
          <article className="city-copy-card">
            <SectionHeading kicker="Why Visit" title={`Why travelers choose ${city.name}`} />
            <p className="city-copy-text">{city.whyVisit}</p>
          </article>
          <article className="city-copy-card">
            <SectionHeading kicker="When To Go" title={`Best seasons for ${city.name}`} />
            <p className="city-copy-text">{city.whenToGo}</p>
          </article>
        </div>
      </Section>

      <Section>
        <SectionHeading
          kicker="Featured Listings"
          title={`Where to stay, eat, and explore in ${city.name}`}
          lede="Curated published listings connected to this city in Payload."
        />
        {featuredListings.length ? (
          <div className="city-card-grid">
            {featuredListings.map((listing) => (
              <article key={listing.slug} className="city-listing-card">
                <p className="city-listing-kicker">{listing.categories[0]?.label ?? 'Featured Listing'}</p>
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
          <p className="city-empty">Featured listings placeholder: publish listings related to this city in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Top Categories"
          title="Most useful category paths"
          lede="These categories are inferred from currently published city listings."
        />
        {topCategories.length ? (
          <div className="city-link-row">
            {topCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="city-link-chip">
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Top categories placeholder: add categorized listings for this city.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Map"
          title={`${city.name} orientation map`}
          lede={`City center coordinates: ${city.latitude.toFixed(4)}, ${city.longitude.toFixed(4)}.`}
        />
        <MapPlaceholder
          title={`${city.name} map preview`}
          note="Leaflet + OpenStreetMap integration step: plot city center plus related listing pins."
        />
      </Section>

      <Section surface="muted">
        <SectionHeading kicker="Events" title={`Upcoming events near ${city.name}`} />
        {events.length ? (
          <div className="city-card-grid">
            {events.slice(0, 4).map((event: NormalizedEvent) => (
              <article key={event.slug} className="city-listing-card">
                <p className="city-listing-kicker">{formatDate(event.startDate)}</p>
                <h3 className="city-listing-title">{event.title}</h3>
                <p className="city-listing-summary">{event.summary}</p>
                <Link href={`/events/${event.slug}`} className="city-inline-link">
                  View event
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">Events placeholder: publish city events to populate this preview.</p>
        )}
      </Section>

      <Section>
        <SectionHeading kicker="FAQ" title={`${city.name} quick answers`} />
        {city.faq.length ? (
          <FaqAccordion items={city.faq} />
        ) : (
          <p className="city-empty">FAQ placeholder: add city FAQ entries in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Nearby Cities"
          title="Explore nearby coastal towns"
          lede="Nearby city links are generated from the same region relationship."
        />
        {nearbyCities.length ? (
          <div className="city-link-row">
            {nearbyCities.map((nearbyCity) => (
              <Link key={nearbyCity.slug} href={`/cities/${nearbyCity.slug}`} className="city-link-chip">
                {nearbyCity.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Nearby cities placeholder: add additional cities within this region.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Related Guides"
          title="Internal guide links"
          lede="Editorial guides related to this city and category pathways for deeper planning."
        />
        <div className="city-related-grid">
          <div>
            <h3 className="city-related-title">Guides</h3>
            {relatedGuides.length ? (
              <ul className="city-related-list">
                {relatedGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className="city-inline-link">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">Related guides placeholder: connect published guides to this city.</p>
            )}
          </div>
          <div>
            <h3 className="city-related-title">Categories</h3>
            {topCategories.length ? (
              <ul className="city-related-list">
                {topCategories.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/categories/${category.slug}`} className="city-inline-link">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">Related categories placeholder: add categorized city listings.</p>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
