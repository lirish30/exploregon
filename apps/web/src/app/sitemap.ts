import type { MetadataRoute } from 'next'

import { getCategories, getCities, getEvents, getGuides, getItineraries, getListings, getRegions } from '../lib/api'
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
  const [cities, categories, listings, guides, events, itineraries, regions] = await Promise.all([
    getCities({ limit: 500 }),
    getCategories({ limit: 500 }),
    getListings({ limit: 1000 }),
    getGuides({ limit: 500 }),
    getEvents({ limit: 500 }),
    getItineraries({ limit: 500 }),
    getRegions({ limit: 100 })
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
    }))
  ]

  return [...staticEntries, ...dynamicEntries].sort(byUrl)
}
