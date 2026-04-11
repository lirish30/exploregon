import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { CityDestinationCard } from '../../../components/primitives/city-destination-card'
import { CtaBlock } from '../../../components/primitives/cta-block'
import { HeroBackground } from '../../../components/primitives/hero-background'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import {
  getCitiesByRegion,
  getListingBySlug,
  getListingRecordBySlug,
  getListingsByCategory,
  getListingsByCity,
  getSiteSettings
} from '../../../lib/api'
import { toPayloadMediaUrl } from '../../../lib/schema'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedCity, NormalizedListing, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type ListingPageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast listing details with city context, map orientation, and related pathways.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
    phone: null
  }
}

const toOpenStreetMapUrl = (latitude: number, longitude: number): string => {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

const getRelatedListings = (allListings: NormalizedListing[], listing: NormalizedListing): NormalizedListing[] => {
  const categorySlugs = new Set(listing.categories.map((category) => category.slug))

  return allListings
    .filter((candidate) => {
      if (candidate.slug === listing.slug) {
        return false
      }

      if (listing.city?.slug && candidate.city?.slug && candidate.city.slug === listing.city.slug) {
        return true
      }

      return candidate.categories.some((category) => categorySlugs.has(category.slug))
    })
    .slice(0, 6)
}

const getNearbyCities = (cities: NormalizedCity[], listing: NormalizedListing): NormalizedCity[] => {
  if (!listing.region?.slug || !listing.city?.slug) {
    return []
  }

  return cities
    .filter((city) => city.slug !== listing.city?.slug && city.region?.slug === listing.region?.slug)
    .slice(0, 6)
}

const toJsonLd = (listing: NormalizedListing) => {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    description: listing.summary,
    url: `${siteUrl}/listings/${listing.slug}`,
    telephone: listing.phone ?? undefined,
    image: listing.heroImage?.url ? toPayloadMediaUrl(listing.heroImage.url) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city?.label ?? undefined,
      addressRegion: listing.region?.label ?? undefined,
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude
    },
    additionalProperty: [
      ...(listing.priceRange ? [{ '@type': 'PropertyValue', name: 'Price Range', value: listing.priceRange }] : []),
      ...(listing.seasonality ? [{ '@type': 'PropertyValue', name: 'Seasonality', value: listing.seasonality }] : [])
    ],
    amenityFeature: listing.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true
    }))
  }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, listing, listingRecord] = await Promise.all([
    getSettings(),
    getListingBySlug(slug),
    getListingRecordBySlug(slug)
  ])

  if (listing) {
    return createMetadata(
      {
        title: listing.seo.title,
        description: listing.seo.description,
        path: `/listings/${listing.slug}`,
        imageUrl: toPayloadMediaUrl(listing.heroImage?.url)
      },
      settings
    )
  }

  if (listingRecord) {
    return createMetadata(
      {
        title: `${listingRecord.name} (Unavailable)`,
        description: `${listingRecord.name} exists in our directory but is not yet published.`,
        path: `/listings/${listingRecord.slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
      {
        title: 'Listing Not Found',
        description: 'The requested listing could not be found.',
        path: `/listings/${slug}`,
        noIndex: true
      },
      settings
  )
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params
  const [listing, listingRecord] = await Promise.all([getListingBySlug(slug), getListingRecordBySlug(slug)])

  if (!listingRecord) {
    notFound()
  }

  const breadcrumbs = buildEntityBreadcrumbs('listings', listingRecord.name, listingRecord.slug)

  if (!listing) {
    return (
      <>
        <section className="listing-hero listing-hero-unavailable">
          <Container>
            <div className="listing-hero-inner">
              <Breadcrumbs items={breadcrumbs} />
              <p className="listing-hero-kicker">Listing Record</p>
              <h1 className="listing-hero-title">{listingRecord.name}</h1>
              <p className="listing-hero-summary">
                This listing exists in Payload but is currently <strong>{listingRecord.status}</strong> and not publicly
                available yet.
              </p>
            </div>
          </Container>
        </section>

        <Section>
          <SectionHeading
            kicker="Status"
            title="Listing unavailable"
            lede="Graceful fallback for incomplete or non-published records to protect public routing integrity."
          />
          <div className="listing-availability-panel">
            <p>
              Placeholder note: once this record satisfies publish requirements and status is set to <code>published</code>,
              this route will render the full listing template automatically.
            </p>
            <p>
              Available links:{' '}
              {listingRecord.city?.slug ? <Link href={`/cities/${listingRecord.city.slug}`}>city page</Link> : 'city pending'}{' '}
              and{' '}
              {listingRecord.categories[0]?.slug ? (
                <Link href={`/categories/${listingRecord.categories[0].slug}`}>category hub</Link>
              ) : (
                'category pending'
              )}
              .
            </p>
          </div>
        </Section>
      </>
    )
  }

  const primaryCategory = listing.categories[0]
  const [sameCityListings, sameCategoryListings, nearbyRegionCities] = await Promise.all([
    listing.city ? getListingsByCity(listing.city.id, { limit: 36 }) : Promise.resolve([]),
    primaryCategory ? getListingsByCategory(primaryCategory.id, { limit: 36 }) : Promise.resolve([]),
    listing.region ? getCitiesByRegion(listing.region.id, { sort: 'name', limit: 24 }) : Promise.resolve([])
  ])
  const relatedListings = getRelatedListings([...sameCityListings, ...sameCategoryListings], listing)
  const nearbyCities = getNearbyCities(nearbyRegionCities, listing)
  const heroImageUrl = toPayloadMediaUrl(listing.heroImage?.url)

  const jsonLd = toJsonLd(listing)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="listing-hero">
        <HeroBackground src={heroImageUrl} alt={listing.heroImage?.alt ?? listing.name} />
        <div className="entity-hero-overlay" />
        <Container>
          <div className="listing-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="listing-hero-kicker">{primaryCategory?.label ?? 'Listing Detail'}</p>
            <h1 className="listing-hero-title">{listing.name}</h1>
            <p className="listing-hero-summary">{listing.summary}</p>
            <div className="listing-hero-chips">
              {listing.city?.slug ? <Link href={`/cities/${listing.city.slug}`}>{listing.city.label}</Link> : null}
              {listing.region?.slug ? <Link href={`/regions/${listing.region.slug}`}>{listing.region.label}</Link> : null}
              {listing.priceRange ? <span>{listing.priceRange}</span> : null}
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading kicker="Summary" title="At a glance" lede={listing.description} />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Details"
          title="Attributes and amenities"
          lede="Structured listing detail panel rendered from Payload fields."
        />
        <div className="listing-detail-grid">
          <article className="listing-detail-panel">
            <h3>Core details</h3>
            <dl>
              <div>
                <dt>Address</dt>
                <dd>{listing.address}</dd>
              </div>
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                </dd>
              </div>
              <div>
                <dt>Seasonality</dt>
                <dd>{listing.seasonality ?? 'Not set'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{listing.phone ?? 'Not set'}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {listing.websiteUrl ? (
                    <a href={listing.websiteUrl} target="_blank" rel="noreferrer">
                      Visit official site
                    </a>
                  ) : (
                    'No website URL is available.'
                  )}
                </dd>
              </div>
            </dl>
          </article>

          <article className="listing-detail-panel">
            <h3>Attributes</h3>
            {listing.attributes.length ? (
              <ul>
                {listing.attributes.map((attribute) => (
                  <li key={attribute}>{attribute}</li>
                ))}
              </ul>
            ) : (
              <p>No attributes are listed.</p>
            )}
          </article>

          <article className="listing-detail-panel">
            <h3>Amenities</h3>
            {listing.amenities.length ? (
              <ul>
                {listing.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            ) : (
              <p>No amenities are listed.</p>
            )}
          </article>
        </div>
      </Section>

      <Section>
        <SectionHeading
          kicker="Location"
          title="City and region context"
          lede="Use linked city and region pages for broader destination planning context."
        />
        <div className="listing-context-row">
          <p>
            City:{' '}
            {listing.city?.slug ? (
              <Link href={`/cities/${listing.city.slug}`} className="city-inline-link">
                {listing.city.label}
              </Link>
            ) : (
              'Not set'
            )}
          </p>
          <p>
            Region:{' '}
            {listing.region?.slug ? (
              <Link href={`/regions/${listing.region.slug}`} className="city-inline-link">
                {listing.region.label}
              </Link>
            ) : (
              'Not set'
            )}
          </p>
          <p>
            Category:{' '}
            {primaryCategory?.slug ? (
              <Link href={`/categories/${primaryCategory.slug}`} className="city-inline-link">
                {primaryCategory.label}
              </Link>
            ) : (
              'Not set'
            )}
          </p>
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Map"
          title={`${listing.name} map`}
          lede={`Coordinates sourced from Payload: ${listing.latitude.toFixed(4)}, ${listing.longitude.toFixed(4)}.`}
        />
        <MapPlaceholder
          title={`${listing.name} location map`}
          note="Leaflet + OpenStreetMap integration step: render listing pin and nearby points in this module."
        />
        <p className="listing-map-link-wrap">
          <a href={toOpenStreetMapUrl(listing.latitude, listing.longitude)} target="_blank" rel="noreferrer">
            Open in OpenStreetMap
          </a>
        </p>
      </Section>

      <Section>
        <CtaBlock
          title="Plan this stop"
          body="Use city and category paths to compare alternatives, then finalize where this listing fits in your coast itinerary."
          buttonLabel={listing.city?.slug ? `Explore ${listing.city.label}` : 'Browse cities'}
          buttonHref={listing.city?.slug ? `/cities/${listing.city.slug}` : '/cities'}
          secondaryButtonLabel={primaryCategory?.slug ? `More ${primaryCategory.label}` : 'Browse categories'}
          secondaryButtonHref={primaryCategory?.slug ? `/categories/${primaryCategory.slug}` : '/categories'}
        />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Related Listings"
          title="Nearby and category-adjacent listings"
          lede="Related listing links are generated from shared city or category relationships."
        />
        {relatedListings.length ? (
          <div className="city-card-grid">
            {relatedListings.map((relatedListing) => (
              <article key={relatedListing.slug} className="city-listing-card">
                <p className="city-listing-kicker">{relatedListing.city?.label ?? 'Oregon Coast'}</p>
                <h3 className="city-listing-title">{relatedListing.name}</h3>
                <p className="city-listing-summary">{relatedListing.summary}</p>
                <Link href={`/listings/${relatedListing.slug}`} className="city-inline-link">
                  View listing
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No related listings are currently available.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Nearby Cities"
          title="Continue exploring nearby coastal towns"
          lede="Nearby city links are based on this listing's region relationship."
        />
        {nearbyCities.length ? (
          <div className="coast-home-destination-grid">
            {nearbyCities.map((city) => (
              <CityDestinationCard
                key={city.slug}
                name={city.name}
                summary={city.summary}
                image={city.heroImage}
                href={`/cities/${city.slug}`}
                badges={city.region?.label ? [city.region.label] : []}
                meta={[{ label: 'Base', value: city.region?.label ?? 'Oregon Coast' }]}
                resolveMediaUrl={toPayloadMediaUrl}
                linkLabel={`Explore ${city.name}`}
              />
            ))}
          </div>
        ) : (
          <p className="city-empty">No nearby cities are currently available.</p>
        )}
      </Section>
    </>
  )
}
