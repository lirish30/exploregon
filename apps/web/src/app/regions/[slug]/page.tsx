import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getCities, getEvents, getGuides, getListings, getRegionBySlug, getSiteSettings } from '../../../lib/api'
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

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
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

  const [cities, listings, events, guides] = await Promise.all([
    getCities({ sort: 'name', limit: 250 }),
    getListings({ sort: 'name', limit: 250 }),
    getEvents({ sort: 'startDate', limit: 120 }),
    getGuides({ sort: '-createdAt', limit: 120 })
  ])

  const regionCities = cities.filter((city) => city.region?.slug === region.slug).slice(0, 8)
  const regionListings = listings.filter((listing) => listing.region?.slug === region.slug).slice(0, 8)
  const regionEvents = events.filter((event) => event.region?.slug === region.slug).slice(0, 6)
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
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.18) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  return (
    <>
      <section className="city-hero" style={{ backgroundImage: heroBackground }}>
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
        <SectionHeading kicker="Region Intro" title={`${region.name} planning context`} lede={region.intro} />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Cities"
          title="Core city pages in this region"
          lede="Published city records assigned to this region."
        />
        {regionCities.length ? (
          <div className="city-card-grid">
            {regionCities.map((city) => (
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
          <p className="city-empty">Region cities placeholder: publish cities linked to this region in Payload.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Listings"
          title="Featured listings in this region"
          lede="Published listing records assigned to this region."
        />
        {regionListings.length ? (
          <div className="city-card-grid">
            {regionListings.map((listing) => (
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
          <p className="city-empty">Region listings placeholder: publish listings linked to this region in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Map"
          title={`${region.name} map module`}
          lede="Route-level map placeholder for Leaflet + OpenStreetMap integration."
        />
        <MapPlaceholder
          title={`${region.name} map preview`}
          note="Plot region city clusters and listing markers in the map integration step."
        />
      </Section>

      <Section>
        <SectionHeading kicker="Events" title={`Upcoming events in ${region.name}`} />
        {regionEvents.length ? (
          <div className="city-card-grid">
            {regionEvents.map((event) => (
              <article key={event.slug} className="city-listing-card">
                <p className="city-listing-kicker">{event.city?.label ?? 'Region Event'}</p>
                <h2 className="city-listing-title">{event.title}</h2>
                <p className="city-listing-summary">{event.summary}</p>
                <Link href={`/events/${event.slug}`} className="city-inline-link">
                  View event
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">Region events placeholder: publish events linked to this region in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Guides"
          title="Related editorial guides"
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
          <p className="city-empty">Region guide placeholder: add guide-city links for this region.</p>
        )}
      </Section>
    </>
  )
}
