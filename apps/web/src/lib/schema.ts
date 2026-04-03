import type { CityStatus, EditorialStatus, ListingStatus } from './types'

export const COLLECTIONS = {
  regions: 'regions',
  cities: 'cities',
  listingCategories: 'listingCategories',
  listings: 'listings',
  guides: 'guides',
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
