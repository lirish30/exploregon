import type { CityStatus, EditorialStatus, ListingStatus, NormalizedEvent, NormalizedListing } from './types'

export const COLLECTIONS = {
  regions: 'regions',
  cities: 'cities',
  listingCategories: 'listingCategories',
  listings: 'listings',
  guides: 'guides',
  pages: 'pages',
  events: 'events',
  itineraries: 'itineraries'
} as const

export const GLOBALS = {
  homepage: 'homepage',
  siteSettings: 'siteSettings',
  navigation: 'navigation',
  footer: 'footer'
} as const

export const LISTING_STATUSES: readonly ListingStatus[] = [
  'draft',
  'imported',
  'needsReview',
  'approved',
  'published',
  'archived'
]

export const EDITORIAL_STATUSES: readonly EditorialStatus[] = [
  'draft',
  'review',
  'published',
  'archived'
]

export const CITY_STATUSES: readonly CityStatus[] = ['draft', 'published', 'archived']

const ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const ROUTE_SEGMENTS = {
  homepage: '/',
  cities: '/cities',
  categories: '/categories',
  listings: '/listings',
  regions: '/regions',
  guides: '/guides',
  events: '/events',
  itineraries: '/itineraries'
} as const

export const normalizeRouteSlug = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  const slug = value.trim().toLowerCase()

  if (!slug || !ROUTE_SLUG_PATTERN.test(slug)) {
    return null
  }

  return slug
}

export const isPublishedStatus = (value: unknown): value is 'published' => value === 'published'

// ─── Runtime URL helpers ──────────────────────────────────────────────────────

/**
 * Public site URL. Falls back to localhost for dev environments.
 * Use this wherever an absolute URL is needed (JSON-LD, OG, canonical).
 */
export const getSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/**
 * Resolve a Payload media path to an absolute URL.
 *
 * Payload stores media URLs as either:
 *   - Relative paths: "/media/hero.jpg"  → prepend PAYLOAD_PUBLIC_SERVER_URL
 *   - Absolute URLs:  "https://cdn.example.com/..." → return as-is
 *
 * Use this in every place a media URL is passed to Next.js metadata, OG tags,
 * JSON-LD, or an <img> src that needs to be absolute.
 */
export const toPayloadMediaUrl = (pathOrUrl: string | null | undefined): string | null => {
  if (!pathOrUrl) return null

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  const payloadBase = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!payloadBase) return pathOrUrl

  return `${payloadBase.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

// ─── JSON-LD builders ─────────────────────────────────────────────────────────

/**
 * Category slugs that map to TouristAttraction rather than LocalBusiness.
 * Extend this set as the taxonomy grows.
 */
const TOURIST_ATTRACTION_SLUGS = new Set([
  'beaches',
  'hiking',
  'whale-watching',
  'parks',
  'viewpoints',
  'lighthouses',
  'wildlife',
  'tide-pools',
  'scenic-byways',
])

/**
 * LocalBusiness JSON-LD for commercial listings (hotels, restaurants, shops, etc.)
 */
export const buildLocalBusinessJsonLd = (listing: NormalizedListing): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: listing.name,
  description: listing.summary,
  url: `${getSiteUrl()}/listings/${listing.slug}`,
  telephone: listing.phone ?? undefined,
  image: toPayloadMediaUrl(listing.heroImage?.url) ?? undefined,
  address: {
    '@type': 'PostalAddress',
    streetAddress: listing.address,
    addressLocality: listing.city?.label ?? undefined,
    addressRegion: listing.region?.label ?? undefined,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: listing.latitude,
    longitude: listing.longitude,
  },
  additionalProperty: [
    ...(listing.priceRange
      ? [{ '@type': 'PropertyValue', name: 'Price Range', value: listing.priceRange }]
      : []),
    ...(listing.seasonality
      ? [{ '@type': 'PropertyValue', name: 'Seasonality', value: listing.seasonality }]
      : []),
  ],
  amenityFeature: listing.amenities.map((amenity) => ({
    '@type': 'LocationFeatureSpecification',
    name: amenity,
    value: true,
  })),
})

/**
 * TouristAttraction JSON-LD for natural features, parks, viewpoints, etc.
 */
export const buildTouristAttractionJsonLd = (listing: NormalizedListing): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: listing.name,
  description: listing.summary,
  url: `${getSiteUrl()}/listings/${listing.slug}`,
  image: toPayloadMediaUrl(listing.heroImage?.url) ?? undefined,
  address: {
    '@type': 'PostalAddress',
    streetAddress: listing.address,
    addressLocality: listing.city?.label ?? undefined,
    addressRegion: listing.region?.label ?? undefined,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: listing.latitude,
    longitude: listing.longitude,
  },
  touristType: listing.categories.map((c) => c.label).join(', ') || undefined,
})

/**
 * Pick the right JSON-LD type based on listing categories.
 * Listings in natural-feature categories get TouristAttraction;
 * all others get LocalBusiness.
 */
export const buildListingJsonLd = (listing: NormalizedListing): Record<string, unknown> => {
  const isTouristAttraction = listing.categories.some((c) =>
    TOURIST_ATTRACTION_SLUGS.has(c.slug)
  )
  return isTouristAttraction
    ? buildTouristAttractionJsonLd(listing)
    : buildLocalBusinessJsonLd(listing)
}

/**
 * Event JSON-LD for event detail pages.
 */
export const buildEventJsonLd = (event: NormalizedEvent): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.title,
  description: event.summary,
  url: event.eventUrl ?? `${getSiteUrl()}/events/${event.slug}`,
  image: toPayloadMediaUrl(event.heroImage?.url) ?? undefined,
  startDate: event.startDate,
  endDate: event.endDate ?? undefined,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: event.venue,
    address: {
      '@type': 'PostalAddress',
      addressLocality: event.city?.label ?? undefined,
      addressRegion: event.region?.label ?? undefined,
      addressCountry: 'US',
    },
  },
  ...(event.city
    ? {
        organizer: {
          '@type': 'Organization',
          name: event.city.label,
        },
      }
    : {}),
})
