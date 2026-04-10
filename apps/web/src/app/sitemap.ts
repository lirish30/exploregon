import type { MetadataRoute } from 'next'

import { getCategories, getCities, getEvents, getGuides, getItineraries, getListings, getPages, getRegions } from '../lib/api'
import { getSiteUrl } from '../lib/seo'

type Entry = MetadataRoute.Sitemap[number]

const now = new Date()

const toUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}

const staticEntries: Entry[] = [
  {
    url: toUrl('/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1
  },
  {
    url: toUrl('/cities'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9
  },
  {
    url: toUrl('/categories'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9
  },
  {
    url: toUrl('/guides'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: toUrl('/events'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: toUrl('/itineraries'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7
  },
  {
    url: toUrl('/map'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: toUrl('/weather-tides'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  }
]

const byUrl = (a: Entry, b: Entry): number => a.url.localeCompare(b.url)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, categories, listings, guides, events, itineraries, regions, pages] = await Promise.all([
    getCities({ limit: 250 }),
    getCategories({ limit: 250 }),
    getListings({ limit: 500 }),
    getGuides({ limit: 250 }),
    getEvents({ limit: 250 }),
    getItineraries({ limit: 250 }),
    getRegions({ limit: 60 }),
    getPages({ limit: 250 })
  ])

  const reservedTopLevelSlugs = new Set([
    'cities',
    'categories',
    'listings',
    'guides',
    'events',
    'itineraries',
    'regions',
    'map',
    'weather-tides'
  ])

  const dynamicEntries: Entry[] = [
    ...cities.map((city) => ({
      url: toUrl(`/cities/${city.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...categories.map((category) => ({
      url: toUrl(`/categories/${category.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...listings.map((listing) => ({
      url: toUrl(`/listings/${listing.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6
    })),
    ...guides.map((guide) => ({
      url: toUrl(`/guides/${guide.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    })),
    ...events.map((event) => ({
      url: toUrl(`/events/${event.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    })),
    ...itineraries.map((itinerary) => ({
      url: toUrl(`/itineraries/${itinerary.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    })),
    ...regions.map((region) => ({
      url: toUrl(`/regions/${region.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...pages
      .filter((page) => !reservedTopLevelSlugs.has(page.slug))
      .map((page) => ({
        url: toUrl(`/${page.slug}`),
        lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.7
    }))
  ]

  return [...staticEntries, ...dynamicEntries].sort(byUrl)
}
