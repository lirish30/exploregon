import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import payloadConfig from '../payload.config.ts'

type SluggedDoc = {
  id: number | string
  slug?: string
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const cmsRoot = path.resolve(dirname, '../..')
const repoRoot = path.resolve(cmsRoot, '../..')

const loadEnv = (): void => {
  dotenv.config({ path: path.join(repoRoot, '.env') })
  dotenv.config({ path: path.join(cmsRoot, '.env') })
}

const resolveSeedImagePath = (): string => {
  const candidates = [
    path.join(repoRoot, 'files/screen.png'),
    path.join(cmsRoot, 'files/screen.png'),
    path.join(process.cwd(), 'files/screen.png')
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error('Seed image missing. Expected files/screen.png in repository.')
}

const findOneBySlug = async (payload: any, collection: string, slug: string): Promise<SluggedDoc | null> => {
  const existing = await payload.find({
    collection,
    where: {
      slug: {
        equals: slug
      }
    },
    limit: 1,
    depth: 0,
    overrideAccess: true
  })

  return existing.docs[0] || null
}

const upsertBySlug = async (payload: any, collection: string, slug: string, data: Record<string, unknown>): Promise<SluggedDoc> => {
  const existing = await findOneBySlug(payload, collection, slug)

  if (existing) {
    return payload.update({
      collection,
      id: existing.id,
      data,
      depth: 0,
      overrideAccess: true,
      context: {
        disableRevalidate: true
      }
    })
  }

  return payload.create({
    collection,
    data,
    depth: 0,
    overrideAccess: true,
    context: {
      disableRevalidate: true
    }
  })
}

const publishListing = async (payload: any, listingId: number | string): Promise<void> => {
  await payload.update({
    collection: 'listings',
    id: listingId,
    data: { status: 'published' },
    depth: 0,
    overrideAccess: true
  })
}

const publishEditorial = async (
  payload: any,
  collection: 'guides' | 'events' | 'itineraries',
  id: number | string
): Promise<void> => {
  await payload.update({
    collection,
    id,
    data: { status: 'published' },
    depth: 0,
    overrideAccess: true
  })
}

const lexicalRoot = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'QA seed post content for template collection verification.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1
  }
}

export async function seedMinimal(): Promise<void> {
  loadEnv()

  const payload = await getPayload({ config: payloadConfig })
  const heroImagePath = resolveSeedImagePath()

  const existingMedia = await payload.find({
    collection: 'media',
    where: {
      alt: {
        equals: 'ExplOregon Coast minimal seed hero placeholder image'
      }
    },
    limit: 1,
    depth: 0,
    overrideAccess: true
  })

  const heroImage =
    existingMedia.docs[0] ||
    (await payload.create({
      collection: 'media',
      data: {
        alt: 'ExplOregon Coast minimal seed hero placeholder image'
      },
      filePath: heroImagePath,
      depth: 0,
      overrideAccess: true
    }))

  const region = await upsertBySlug(payload, 'regions', 'qa-seed-region', {
    name: 'QA Seed Region',
    slug: 'qa-seed-region',
    summary: 'QA seed region used to validate frontend collection rendering after migration and data resets.',
    intro:
      'This minimal region entry exists to verify region routing, relation wiring, and content rendering after the website-template integration transition.',
    heroImage: heroImage.id,
    seoTitle: 'QA Seed Region | ExplOregon Coast',
    seoDescription: 'QA seed region for validating CMS to frontend rendering and collection relationships.'
  })

  const listingCategory = await upsertBySlug(payload, 'listingCategories', 'qa-seed-category', {
    name: 'QA Seed Category',
    slug: 'qa-seed-category',
    description: 'QA category used to verify listing and category pages are populated and linked correctly.',
    icon: 'beach',
    seoTitle: 'QA Seed Category | ExplOregon Coast',
    seoDescription: 'QA seed category for validating category routes and listing relationships.'
  })

  const city = await upsertBySlug(payload, 'cities', 'lincoln-city', {
    name: 'Lincoln City',
    slug: 'lincoln-city',
    region: region.id,
    heroImage: heroImage.id,
    summary:
      'Lincoln City QA seed record to verify city route rendering and city-linked content modules after data migration.',
    intro:
      'This city entry is intentionally concise and exists to restore a stable city slug for frontend route validation.',
    whyVisit:
      'Use this city entry to validate hero, section content, internal link chips, and city-specific listing and event modules.',
    whenToGo:
      'Any season for QA purposes; this text simply ensures required city narrative fields render correctly in the UI.',
    listingSections: {
      hotels: {
        kicker: 'Hotels',
        title: 'Where to stay',
        lede: 'QA hotels section wired to listing categories for city page rendering checks.',
        categories: [listingCategory.id]
      },
      dining: {
        kicker: 'Dining',
        title: 'Where to eat',
        lede: 'QA dining section present to validate section cards and empty-state behavior.',
        categories: [listingCategory.id]
      },
      attractions: {
        kicker: 'Attractions',
        title: 'Where to explore',
        lede: 'QA attractions section used for category chips and related content modules.',
        categories: [listingCategory.id]
      }
    },
    topCategories: {
      kicker: 'Top Categories',
      title: 'Most useful category paths',
      lede: 'QA top categories section to validate category chips on city templates.',
      categories: [listingCategory.id]
    },
    featuredHighlights: [{ highlight: 'QA seed highlight for migration validation' }],
    latitude: 44.9582,
    longitude: -124.0179,
    faq: [
      {
        question: 'Why does this city record exist?',
        answer: 'It verifies that city pages still render after template integration and data reset scenarios.'
      }
    ],
    seoTitle: 'Lincoln City QA Seed | ExplOregon Coast',
    seoDescription: 'QA seed city used to validate frontend city page rendering and linked modules.',
    status: 'published'
  })

  const listing = await upsertBySlug(payload, 'listings', 'qa-seed-listing', {
    name: 'QA Seed Listing',
    slug: 'qa-seed-listing',
    city: city.id,
    region: region.id,
    categories: [listingCategory.id],
    summary: 'Minimal QA listing used to validate listing detail routes and list modules.',
    description:
      'This listing is intentionally minimal and exists only to verify that listing documents render on the frontend after migration.',
    heroImage: heroImage.id,
    gallery: [heroImage.id],
    address: '123 QA Coast Hwy, Lincoln City, OR 97367',
    latitude: 44.9589,
    longitude: -124.0192,
    websiteUrl: 'https://example.com/qa-seed-listing',
    phone: '541-555-0100',
    attributes: [{ attribute: 'QA Seed Attribute' }],
    amenities: [{ amenity: 'QA Seed Amenity' }],
    priceRange: '$$',
    seasonality: 'Year-round QA availability.',
    editorNotes: 'Minimal seed for frontend verification.',
    sourceType: 'manual',
    status: 'approved',
    seoTitle: 'QA Seed Listing | ExplOregon Coast',
    seoDescription: 'QA listing for validating listing pages and related collection modules.'
  })

  await publishListing(payload, listing.id)

  const guide = await upsertBySlug(payload, 'guides', 'qa-seed-guide', {
    title: 'QA Seed Guide',
    slug: 'qa-seed-guide',
    heroImage: heroImage.id,
    excerpt: 'Minimal QA guide to validate guide listing and detail route rendering.',
    body:
      'This guide exists for QA. It confirms guide indexing, guide detail rendering, and related city/category link modules.',
    relatedCities: [city.id],
    relatedCategories: [listingCategory.id],
    travelSeason: 'All-season QA',
    status: 'review',
    seoTitle: 'QA Seed Guide | ExplOregon Coast',
    seoDescription: 'QA guide for validating frontend guide pages after migration.'
  })

  await publishEditorial(payload, 'guides', guide.id)

  const event = await upsertBySlug(payload, 'events', 'qa-seed-event', {
    title: 'QA Seed Event',
    slug: 'qa-seed-event',
    city: city.id,
    region: region.id,
    startDate: new Date().toISOString(),
    endDate: null,
    venue: 'Lincoln City QA Venue',
    summary: 'Minimal QA event to validate event listing and detail routes.',
    description:
      'This event exists solely to verify event rendering and city/region relationships after migration and reseeding.',
    heroImage: heroImage.id,
    eventUrl: 'https://example.com/qa-seed-event',
    status: 'review',
    seoTitle: 'QA Seed Event | ExplOregon Coast',
    seoDescription: 'QA event for validating event route rendering and internal linking.'
  })

  await publishEditorial(payload, 'events', event.id)

  const itinerary = await upsertBySlug(payload, 'itineraries', 'qa-seed-itinerary', {
    title: 'QA Seed Itinerary',
    slug: 'qa-seed-itinerary',
    summary: 'Minimal QA itinerary to validate itinerary list/detail templates.',
    heroImage: heroImage.id,
    tripLength: '1 day',
    stops: [listing.id],
    body:
      'Start with the QA listing stop, validate route links, and confirm itinerary modules render correctly from CMS data.',
    relatedCities: [city.id],
    status: 'review',
    seoTitle: 'QA Seed Itinerary | ExplOregon Coast',
    seoDescription: 'QA itinerary for validating itinerary routes and listing relationship rendering.'
  })

  await publishEditorial(payload, 'itineraries', itinerary.id)

  await upsertBySlug(payload, 'categories', 'qa-seed-template-category', {
    title: 'QA Seed Template Category',
    slug: 'qa-seed-template-category',
    icon: 'beach'
  })

  await upsertBySlug(payload, 'pages', 'qa-seed-page', {
    title: 'QA Seed Page',
    slug: 'qa-seed-page',
    pageType: 'generic',
    layout: [
      {
        blockType: 'content',
        columns: []
      }
    ],
    meta: {
      title: 'QA Seed Page | ExplOregon Coast',
      description: 'QA generic page used to validate dynamic /[slug] rendering.'
    },
    _status: 'published',
    publishedAt: new Date().toISOString()
  })

  await upsertBySlug(payload, 'posts', 'qa-seed-post', {
    title: 'QA Seed Post',
    slug: 'qa-seed-post',
    postType: 'article',
    content: lexicalRoot,
    meta: {
      title: 'QA Seed Post | ExplOregon Coast',
      description: 'QA template post to verify template collection population.'
    },
    _status: 'published',
    publishedAt: new Date().toISOString()
  })

  payload.logger.info('Minimal seed completed.')
  payload.logger.info('Frontend route checks:')
  payload.logger.info('/cities/lincoln-city')
  payload.logger.info('/categories/qa-seed-category')
  payload.logger.info('/listings/qa-seed-listing')
  payload.logger.info('/guides/qa-seed-guide')
  payload.logger.info('/events/qa-seed-event')
  payload.logger.info('/itineraries/qa-seed-itinerary')
  payload.logger.info('/regions/qa-seed-region')
  payload.logger.info('/qa-seed-page')
}

seedMinimal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
