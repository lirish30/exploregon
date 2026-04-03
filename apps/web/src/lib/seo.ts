import type { Metadata } from 'next'

import { ROUTE_SEGMENTS, toPayloadMediaUrl } from './schema'
import type {
  NormalizedCity,
  NormalizedCategory,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedItinerary,
  NormalizedListing,
  SiteSettingsGlobal
} from './types'

export type SeoInput = {
  title?: string | null
  description?: string | null
  path?: string
  imageUrl?: string | null
  noIndex?: boolean
}

export type BreadcrumbItem = {
  label: string
  href: string
}

const getSiteUrl = (): string => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return value.replace(/\/$/, '')
}

const toAbsoluteUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}

export const createMetadata = (
  input: SeoInput,
  settings: SiteSettingsGlobal
): Metadata => {
  const siteName = settings.siteName
  const defaultTitle = settings.defaultSeo.title
  const defaultDescription = settings.defaultSeo.description

  const rawTitle = input.title?.trim() || defaultTitle
  const title = rawTitle === defaultTitle ? rawTitle : `${rawTitle} | ${siteName}`
  const description = input.description?.trim() || defaultDescription
  const canonicalPath = input.path || '/'
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const imageUrl = input.imageUrl ? toAbsoluteUrl(input.imageUrl) : undefined

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  }
}

export const createMetadataFromSeoFields = (
  seo: { title?: string | null; description?: string | null },
  settings: SiteSettingsGlobal,
  path: string,
  imageUrl?: string | null
): Metadata => {
  return createMetadata(
    {
      title: seo.title,
      description: seo.description,
      path,
      imageUrl
    },
    settings
  )
}

const toPath = (value: string): string => {
  if (value.startsWith('/')) {
    return value
  }

  return `/${value}`
}

export const buildBreadcrumbs = (items: BreadcrumbItem[]): BreadcrumbItem[] => {
  return [{ label: 'Home', href: ROUTE_SEGMENTS.homepage }, ...items.map((item) => ({
    label: item.label,
    href: toPath(item.href)
  }))]
}

export const buildEntityBreadcrumbs = (
  section: Exclude<keyof typeof ROUTE_SEGMENTS, 'homepage'>,
  currentLabel: string,
  currentSlug?: string
): BreadcrumbItem[] => {
  const sectionPath = ROUTE_SEGMENTS[section]
  const currentPath = currentSlug ? `${sectionPath}/${currentSlug}` : sectionPath

  return buildBreadcrumbs([
    {
      label: section.charAt(0).toUpperCase() + section.slice(1),
      href: sectionPath
    },
    {
      label: currentLabel,
      href: currentPath
    }
  ])
}

// ─── Per-content-type metadata generators ────────────────────────────────────
//
// These helpers encapsulate the path construction, image URL resolution, and
// not-found fallback for each major content type. Pages import whichever helper
// they need and pass in the resolved doc + site settings.
//
// Pattern:
//   const metadata = await generateListingMetadata(listing, params.slug, settings)

/** Shared not-found fallback. */
const notFoundMetadata = (
  label: string,
  path: string,
  settings: SiteSettingsGlobal
): Metadata =>
  createMetadata(
    {
      title: `${label} Not Found`,
      description: `The requested ${label.toLowerCase()} page could not be found on ExplOregon Coast.`,
      path,
      noIndex: true
    },
    settings
  )

export const generateListingMetadata = (
  listing: NormalizedListing | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!listing) return notFoundMetadata('Listing', `/listings/${slug}`, settings)

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

export const generateCityMetadata = (
  city: NormalizedCity | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!city) return notFoundMetadata('City', `/cities/${slug}`, settings)

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

export const generateCategoryMetadata = (
  category: NormalizedCategory | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!category) return notFoundMetadata('Category', `/categories/${slug}`, settings)

  return createMetadata(
    {
      title: category.seo.title,
      description: category.seo.description,
      path: `/categories/${category.slug}`
      // categories don't have hero images in the current schema
    },
    settings
  )
}

export const generateGuideMetadata = (
  guide: NormalizedGuide | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!guide) return notFoundMetadata('Guide', `/guides/${slug}`, settings)

  return createMetadata(
    {
      title: guide.seo.title,
      description: guide.seo.description,
      path: `/guides/${guide.slug}`,
      imageUrl: toPayloadMediaUrl(guide.heroImage?.url)
    },
    settings
  )
}

export const generateEventMetadata = (
  event: NormalizedEvent | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!event) return notFoundMetadata('Event', `/events/${slug}`, settings)

  return createMetadata(
    {
      title: event.seo.title,
      description: event.seo.description,
      path: `/events/${event.slug}`,
      imageUrl: toPayloadMediaUrl(event.heroImage?.url)
    },
    settings
  )
}

export const generateItineraryMetadata = (
  itinerary: NormalizedItinerary | null,
  slug: string,
  settings: SiteSettingsGlobal
): Metadata => {
  if (!itinerary) return notFoundMetadata('Itinerary', `/itineraries/${slug}`, settings)

  return createMetadata(
    {
      title: itinerary.seo.title,
      description: itinerary.seo.description,
      path: `/itineraries/${itinerary.slug}`,
      imageUrl: toPayloadMediaUrl(itinerary.heroImage?.url)
    },
    settings
  )
}

// Re-export toPayloadMediaUrl so pages only need to import from seo.ts or schema.ts
export { toPayloadMediaUrl }
