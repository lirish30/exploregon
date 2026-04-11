import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { HeroBackground } from '../../../components/primitives/hero-background'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import {
  getCitiesByRegion,
  getEventsByRegion,
  getGuides,
  getListingsByRegion,
  getRegionBySlug,
  getSiteSettings
} from '../../../lib/api'
import { toPayloadMediaUrl } from '../../../lib/schema'
import { buildBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type RegionPageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast region pages with city context, listings, and planning links.'
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

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, region] = await Promise.all([getSettings(), getRegionBySlug(slug)])

  if (!region) {
    return createMetadata(
      {
        title: 'Region Not Found',
        description: 'The requested region page could not be found.',
        path: `/regions/${slug}`,
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
  const { slug } = await params
  const region = await getRegionBySlug(slug)

  if (!region) {
    notFound()
  }

  const [regionCities, regionListings, regionEvents, guides] = await Promise.all([
    getCitiesByRegion(region.id, { sort: 'name', limit: 24 }),
    getListingsByRegion(region.id, { sort: 'name', limit: 36 }),
    getEventsByRegion(region.id, { sort: 'startDate', limit: 24 }),
    getGuides({ sort: '-createdAt', limit: 80 })
  ])
  const featuredRegionCities = regionCities.slice(0, 8)
  const featuredRegionListings = regionListings.slice(0, 8)
  const featuredRegionEvents = regionEvents.slice(0, 6)
  const regionCitySlugs = new Set(regionCities.map((city) => city.slug))
  const regionGuides = guides
    .filter((guide) => guide.relatedCities.some((city) => regionCitySlugs.has(city.slug)))
    .slice(0, 4)

  const breadcrumbs = buildBreadcrumbs([
    {
      label: region.name,
      href: `/regions/${region.slug}`
    }
  ])

  const heroImageUrl = toPayloadMediaUrl(region.heroImage?.url)

  return (
    <>
      <section className="city-hero">
        <HeroBackground src={heroImageUrl} alt={region.heroImage?.alt ?? region.name} />
        <div className="entity-hero-overlay" />
        <Container>
          <div className="city-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="city-hero-kicker">Region</p>
            <h1 className="city-hero-title">{region.name}</h1>
            <p className="city-hero-summary">{region.summary}</p>
          </div>
        </Container>
      </section>

      <Section>
        <div className="city-intro-layout">
          <div>
            <SectionHeading
              kicker={region.sectionHeadings.intro.kicker}
              title={region.sectionHeadings.intro.headline}
              lede={region.intro}
            />
          </div>
          <aside className="city-events-compact" aria-label={`Upcoming events near ${region.name}`}>
            <h2 className="city-events-compact-title">
              {region.sectionHeadings.events.kicker
                ? `${region.sectionHeadings.events.kicker}: ${region.sectionHeadings.events.headline}`
                : region.sectionHeadings.events.headline}
            </h2>
            {featuredRegionEvents.length ? (
              <div className="city-events-compact-list">
                {featuredRegionEvents.slice(0, 4).map((event) => (
                  <article key={`intro-event-${event.slug}`} className="city-events-compact-card">
                    <p className="city-events-compact-kicker">{formatDate(event.startDate)}</p>
                    <h3 className="city-events-compact-event-title">{event.title}</h3>
                    <Link href={`/events/${event.slug}`} className="city-inline-link city-inline-link--compact">
                      View event
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="city-empty">No events are currently linked to this region.</p>
            )}
          </aside>
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker={region.sectionHeadings.cities.kicker}
          title={region.sectionHeadings.cities.headline}
          lede="Published city records assigned to this region."
        />
        {featuredRegionCities.length ? (
          <div className="city-card-grid">
            {featuredRegionCities.map((city) => (
              <article key={city.slug} className="city-listing-card">
                <h2 className="city-listing-title">{city.name}</h2>
                <p className="city-listing-summary">{city.summary}</p>
                <Link href={`/cities/${city.slug}`} className="city-inline-link">
                  Open city page
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No cities are currently linked to this region.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker={region.sectionHeadings.listings.kicker}
          title={region.sectionHeadings.listings.headline}
          lede="Published listing records assigned to this region."
        />
        {featuredRegionListings.length ? (
          <div className="city-card-grid">
            {featuredRegionListings.map((listing) => (
              <article key={listing.slug} className="city-listing-card">
                <p className="city-listing-kicker">{listing.city?.label ?? 'Oregon Coast'}</p>
                <h2 className="city-listing-title">{listing.name}</h2>
                <p className="city-listing-summary">{listing.summary}</p>
                <Link href={`/listings/${listing.slug}`} className="city-inline-link">
                  View listing
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No listings are currently linked to this region.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker={region.sectionHeadings.map.kicker}
          title={region.sectionHeadings.map.headline}
          lede="Route-level map module for Leaflet + OpenStreetMap integration."
        />
        <MapPlaceholder
          title={`${region.name} map preview`}
          note="Plot region city clusters and listing markers in the map integration step."
        />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker={region.sectionHeadings.guides.kicker}
          title={region.sectionHeadings.guides.headline}
          lede="Guides are included when they relate to city records in this region."
        />
        {regionGuides.length ? (
          <ul className="city-related-list">
            {regionGuides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="city-inline-link">
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="city-empty">No related guides are currently available for this region.</p>
        )}
      </Section>
    </>
  )
}
