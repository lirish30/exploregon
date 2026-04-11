import dotenv from 'dotenv'
import { getPayload } from 'payload'

import payloadConfig from '../payload.config.ts'

type ID = number | string

type LegacyRelationship = ID | { id: ID }

const relId = (value: LegacyRelationship | null | undefined): ID | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && 'id' in value) return value.id
  return value
}

const ensureArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : [])

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply')

const upsertBySlug = async ({
  payload,
  collection,
  slug,
  data
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  collection: 'categories' | 'pages' | 'posts'
  slug: string
  data: any
}) => {
  const existing = await payload.find({
    collection,
    limit: 1,
    where: {
      slug: {
        equals: slug
      }
    }
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: data as any
    })
  }

  return payload.create({
    collection,
    data: data as any
  })
}

const run = async () => {
  dotenv.config()
  const payload = await getPayload({ config: payloadConfig })

  payload.logger.info(`Website-template migration mode: ${isDryRun ? 'dry-run' : 'apply'}`)

  const [legacyCategories, legacyRegions, legacyCities, legacyListings, legacyGuides, legacyEvents, legacyItineraries] =
    await Promise.all([
      payload.find({ collection: 'listingCategories', depth: 0, limit: 1000 }),
      payload.find({ collection: 'regions', depth: 0, limit: 1000 }),
      payload.find({ collection: 'cities', depth: 1, limit: 1000 }),
      payload.find({ collection: 'listings', depth: 1, limit: 2000 }),
      payload.find({ collection: 'guides', depth: 1, limit: 2000 }),
      payload.find({ collection: 'events', depth: 1, limit: 2000 }),
      payload.find({ collection: 'itineraries', depth: 1, limit: 2000 })
    ])

  payload.logger.info(
    `Legacy docs -> categories:${legacyCategories.totalDocs} regions:${legacyRegions.totalDocs} cities:${legacyCities.totalDocs} listings:${legacyListings.totalDocs} guides:${legacyGuides.totalDocs} events:${legacyEvents.totalDocs} itineraries:${legacyItineraries.totalDocs}`
  )

  if (isDryRun) {
    payload.logger.info('Dry-run complete. Re-run with --apply to write migrated docs.')
    process.exit(0)
  }

  const categoryMap = new Map<ID, ID>()
  const pageMap = new Map<string, ID>()

  for (const doc of legacyCategories.docs) {
    const upserted = await upsertBySlug({
      payload,
      collection: 'categories',
      slug: doc.slug,
      data: {
        title: doc.name,
        slug: doc.slug,
        icon: doc.icon
      }
    })

    categoryMap.set(doc.id, upserted.id)
  }

  for (const doc of legacyRegions.docs) {
    const upserted = await upsertBySlug({
      payload,
      collection: 'pages',
      slug: doc.slug,
      data: {
        title: doc.name,
        slug: doc.slug,
        pageType: 'region',
        route: { legacyType: 'region', pathPattern: '/regions/[slug]' },
        regionDetails: {
          summary: doc.summary,
          intro: doc.intro
        },
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })

    pageMap.set(`region:${doc.id}`, upserted.id)
  }

  for (const doc of legacyCities.docs) {
    const regionId = relId(doc.region)

    const upserted = await upsertBySlug({
      payload,
      collection: 'pages',
      slug: doc.slug,
      data: {
        title: doc.name,
        slug: doc.slug,
        pageType: 'city',
        route: { legacyType: 'city', pathPattern: '/cities/[slug]' },
        location: {
          region: regionId ? pageMap.get(`region:${regionId}`) : null,
          latitude: doc.latitude,
          longitude: doc.longitude
        },
        cityDetails: {
          summary: doc.summary,
          intro: doc.intro,
          whyVisit: doc.whyVisit,
          whenToGo: doc.whenToGo,
          featuredHighlights: ensureArray(doc.featuredHighlights),
          faq: ensureArray(doc.faq)
        },
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })

    pageMap.set(`city:${doc.id}`, upserted.id)
  }

  for (const doc of legacyListings.docs) {
    const regionId = relId(doc.region)
    const cityId = relId(doc.city)

    const upserted = await upsertBySlug({
      payload,
      collection: 'pages',
      slug: doc.slug,
      data: {
        title: doc.name,
        slug: doc.slug,
        pageType: 'listing',
        route: { legacyType: 'listing', pathPattern: '/listings/[slug]' },
        location: {
          region: regionId ? pageMap.get(`region:${regionId}`) : null,
          city: cityId ? pageMap.get(`city:${cityId}`) : null,
          latitude: doc.latitude,
          longitude: doc.longitude
        },
        listingDetails: {
          summary: doc.summary,
          description: doc.description,
          address: doc.address,
          phone: doc.phone,
          websiteUrl: doc.websiteUrl,
          priceRange: doc.priceRange,
          seasonality: doc.seasonality,
          attributes: ensureArray(doc.attributes),
          amenities: ensureArray(doc.amenities),
          gallery: ensureArray(doc.gallery).map((item) => relId(item)).filter(Boolean),
          categories: ensureArray(doc.categories)
            .map((item) => relId(item))
            .map((id) => (id ? categoryMap.get(id) : null))
            .filter(Boolean),
          sourceType: doc.sourceType
        },
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })

    pageMap.set(`listing:${doc.id}`, upserted.id)
  }

  for (const doc of legacyGuides.docs) {
    await upsertBySlug({
      payload,
      collection: 'posts',
      slug: doc.slug,
      data: {
        title: doc.title,
        slug: doc.slug,
        postType: 'guide',
        heroImage: relId(doc.heroImage),
        content: {
          root: {
            type: 'root',
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        guideDetails: {
          excerpt: doc.excerpt,
          body: doc.body,
          travelSeason: doc.travelSeason,
          relatedCities: ensureArray(doc.relatedCities)
            .map((item) => relId(item))
            .map((id) => (id ? pageMap.get(`city:${id}`) : null))
            .filter(Boolean)
        },
        categories: ensureArray(doc.relatedCategories)
          .map((item) => relId(item))
          .map((id) => (id ? categoryMap.get(id) : null))
          .filter(Boolean),
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })
  }

  for (const doc of legacyEvents.docs) {
    const regionId = relId(doc.region)
    const cityId = relId(doc.city)

    await upsertBySlug({
      payload,
      collection: 'posts',
      slug: doc.slug,
      data: {
        title: doc.title,
        slug: doc.slug,
        postType: 'event',
        heroImage: relId(doc.heroImage),
        content: {
          root: {
            type: 'root',
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        eventDetails: {
          venue: doc.venue,
          startDate: doc.startDate,
          endDate: doc.endDate,
          eventUrl: doc.eventUrl,
          city: cityId ? pageMap.get(`city:${cityId}`) : null,
          region: regionId ? pageMap.get(`region:${regionId}`) : null,
          summary: doc.summary,
          description: doc.description
        },
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })
  }

  for (const doc of legacyItineraries.docs) {
    await upsertBySlug({
      payload,
      collection: 'posts',
      slug: doc.slug,
      data: {
        title: doc.title,
        slug: doc.slug,
        postType: 'itinerary',
        heroImage: relId(doc.heroImage),
        content: {
          root: {
            type: 'root',
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        itineraryDetails: {
          summary: doc.summary,
          tripLength: doc.tripLength,
          body: doc.body,
          stops: ensureArray(doc.stops)
            .map((item) => relId(item))
            .map((id) => (id ? pageMap.get(`listing:${id}`) : null))
            .filter(Boolean),
          relatedCities: ensureArray(doc.relatedCities)
            .map((item) => relId(item))
            .map((id) => (id ? pageMap.get(`city:${id}`) : null))
            .filter(Boolean)
        },
        meta: {
          title: doc.seoTitle,
          description: doc.seoDescription
        },
        _status: 'published'
      }
    })
  }

  payload.logger.info('Migration completed.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
