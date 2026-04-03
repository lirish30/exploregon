import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { CtaBlock } from '../../../components/primitives/cta-block'
import { MapPlaceholder } from '../../../components/primitives/map-placeholder'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getCities, getListingBySlug, getListingRecordBySlug, getListings, getSiteSettings } from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedCity, NormalizedListing, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type ListingPageProps = {
  params: {
    slug: string
  }
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
  const [settings, listing, listingRecord] = await Promise.all([
    getSettings(),
    getListingBySlug(params.slug),
    getListingRecordBySlug(params.slug)
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
      path: `/listings/${params.slug}`,
      noIndex: true
    },
    settings
  )
}

export default async function ListingPage({ params }: ListingPageProps) {
  const [listing, listingRecord] = await Promise.all([getListingBySlug(params.slug), getListingRecordBySlug(params.slug)])

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

  const [allListings, allCities] = await Promise.all([getListings({ limit: 250 }), getCities({ sort: 'name', limit: 250 })])
  const relatedListings = getRelatedListings(allListings, listing)
  const nearbyCities = getNearbyCities(allCities, listing)
  const heroImageUrl = toPayloadMediaUrl(listing.heroImage?.url)
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.18) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  const jsonLd = toJsonLd(listing)
  const primaryCategory = listing.categories[0]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="listing-hero" style={{ backgroundImage: heroBackground }}>
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
                <dd>{listing.seasonality ?? 'Seasonality placeholder: add seasonal guidance in Payload.'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{listing.phone ?? 'Phone placeholder: add contact number in Payload.'}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {listing.websiteUrl ? (
                    <a href={listing.websiteUrl} target="_blank" rel="noreferrer">
                      Visit official site
                    </a>
                  ) : (
                    'Website placeholder: add official URL in Payload.'
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
              <p>Attributes placeholder: add listing attributes in Payload.</p>
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
              <p>Amenities placeholder: add listing amenities in Payload.</p>
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
              'City placeholder'
            )}
          </p>
          <p>
            Region:{' '}
            {listing.region?.slug ? (
              <Link href={`/regions/${listing.region.slug}`} className="city-inline-link">
                {listing.region.label}
              </Link>
            ) : (
              'Region placeholder'
            )}
          </p>
          <p>
            Category:{' '}
            {primaryCategory?.slug ? (
              <Link href={`/categories/${primaryCategory.slug}`} className="city-inline-link">
                {primaryCategory.label}
              </Link>
            ) : (
              'Category placeholder'
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
          <p className="city-empty">Related listings placeholder: publish additional city/category listings.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Nearby Cities"
          title="Continue exploring nearby coastal towns"
          lede="Nearby city links are based on this listing's region relationship."
        />
        {nearbyCities.length ? (
          <div className="city-link-row">
            {nearbyCities.map((city) => (
              <Link key={city.slug} href={`/cities/${city.slug}`} className="city-link-chip">
                {city.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Nearby city placeholder: add additional cities in this listing's region.</p>
        )}
      </Section>
    </>
  )
}
