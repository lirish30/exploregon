import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { FaqAccordion } from '../../../components/primitives/faq-accordion'
import { HeroBackground } from '../../../components/primitives/hero-background'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import {
  getCitiesByRegion,
  getCityBySlug,
  getEventsByCity,
  getGuides,
  getListingsByCity,
  getSiteSettings
} from '../../../lib/api'
import { toPayloadMediaUrl } from '../../../lib/schema'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type {
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedListing,
  NormalizedReference,
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
    email: 'editorial@exploregoncoast.com',
    phone: null
  }
}

const formatDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const topCategoriesFromListings = (listings: NormalizedListing[]): NormalizedReference[] => {
  const map = new Map<string, NormalizedReference & { count: number }>()

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
          label: category.label,
          count: 1
        })
      }
    }
  }

  return [...map.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      label: category.label
    }))
    .slice(0, 6)
}

const listingsForCategories = (listings: NormalizedListing[], categorySlugs: string[]): NormalizedListing[] => {
  if (!categorySlugs.length) {
    return []
  }

  const slugSet = new Set(categorySlugs)
  return listings.filter((listing) => listing.categories.some((category) => slugSet.has(category.slug)))
}

const selectedCategorySlugs = (
  categories: NormalizedCity['listingSections']['hotels']['categories'],
  fallbackSlugs: string[]
): string[] => {
  const slugs = categories.map((category) => category.slug)
  return slugs.length ? slugs : fallbackSlugs
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

  const [listings, events, guides, nearbyRegionCities] = await Promise.all([
    getListingsByCity(city.id, { limit: 24 }),
    getEventsByCity(city.id, { limit: 8 }),
    getGuides({ limit: 80 }),
    city.region ? getCitiesByRegion(city.region.id, { sort: 'name', limit: 24 }) : Promise.resolve([])
  ])

  const inferredTopCategories = topCategoriesFromListings(listings)
  const topCategories = city.topCategories.categories.length ? city.topCategories.categories : inferredTopCategories
  const topCategoryListings = listingsForCategories(
    listings,
    topCategories.map((category) => category.slug)
  )
  const relatedGuides = relatedGuidesForCity(guides, city.slug)
  const nearbyCities = nearbyCitiesForRegion(nearbyRegionCities, city)
  const breadcrumbs = buildEntityBreadcrumbs('cities', city.name, city.slug)
  const fallbackCategorySlugs = {
    hotels: ['hotels', 'campgrounds', 'rv-parks', 'vacation-rentals'],
    dining: ['restaurants'],
    attractions: ['beaches', 'family-activities', 'hiking', 'tide-pools', 'whale-watching']
  }
  const listingSections = [
    {
      id: 'hotels',
      section: city.listingSections.hotels,
      listings: listingsForCategories(
        listings,
        selectedCategorySlugs(city.listingSections.hotels.categories, fallbackCategorySlugs.hotels)
      ).slice(0, 6),
      emptyMessage: 'No hotel listings are available for this city yet.'
    },
    {
      id: 'dining',
      section: city.listingSections.dining,
      listings: listingsForCategories(
        listings,
        selectedCategorySlugs(city.listingSections.dining.categories, fallbackCategorySlugs.dining)
      ).slice(0, 6),
      emptyMessage: 'No dining listings are available for this city yet.'
    },
    {
      id: 'attractions',
      section: city.listingSections.attractions,
      listings: listingsForCategories(
        listings,
        selectedCategorySlugs(city.listingSections.attractions.categories, fallbackCategorySlugs.attractions)
      ).slice(0, 6),
      emptyMessage: 'No attraction listings are available for this city yet.'
    }
  ] as const

  const heroBackgroundImage = toPayloadMediaUrl(city.heroImage?.url)

  return (
    <>
      <section className="city-hero">
        <HeroBackground src={heroBackgroundImage} alt={city.heroImage?.alt ?? city.name} />
        <div className="entity-hero-overlay" />
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

      {listingSections.map((listingSection) => (
        <Section key={listingSection.id}>
          <SectionHeading
            kicker={listingSection.section.kicker}
            title={`${listingSection.section.title} in ${city.name}`}
            lede={listingSection.section.lede}
          />
          {listingSection.section.categories.length ? (
            <div className="city-link-row">
              {listingSection.section.categories.map((category) => (
                <Link key={`${listingSection.id}-${category.slug}`} href={`/categories/${category.slug}`} className="city-link-chip">
                  {category.label}
                </Link>
              ))}
            </div>
          ) : null}
          {listingSection.listings.length ? (
            <div className="city-card-grid">
              {listingSection.listings.map((listing) => (
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
            <p className="city-empty">{listingSection.emptyMessage}</p>
          )}
        </Section>
      ))}

      <Section surface="muted">
        <SectionHeading kicker={city.topCategories.kicker} title={city.topCategories.title} lede={city.topCategories.lede} />
        {topCategoryListings.length ? (
          <div className="city-card-grid">
            {topCategoryListings.map((listing) => (
              <article key={listing.slug} className="city-top-category-card">
                <p className="city-top-category-kicker">{city.name}</p>
                <h3 className="city-top-category-title">{listing.name}</h3>
                <p className="city-top-category-summary">{listing.summary}</p>
                <Link href={`/listings/${listing.slug}`} className="city-inline-link">
                  View listing
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No listings are available for the selected categories in this city yet.</p>
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
          <p className="city-empty">No events are available for this city yet.</p>
        )}
      </Section>

      <Section>
        <SectionHeading kicker="FAQ" title={`${city.name} quick answers`} />
        {city.faq.length ? (
          <FaqAccordion items={city.faq} />
        ) : (
          <p className="city-empty">No FAQ entries are available for this city yet.</p>
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
          <p className="city-empty">No nearby cities are available yet.</p>
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
              <p className="city-empty">No related guides are available yet.</p>
            )}
          </div>
          <div>
            <h3 className="city-related-title">Categories</h3>
            {topCategories.length ? (
              <ul className="city-related-list">
                {topCategories.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/categories/${category.slug}`} className="city-inline-link">
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">No related categories are available yet.</p>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
