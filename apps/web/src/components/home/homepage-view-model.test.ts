import test from 'node:test'
import assert from 'node:assert/strict'

import { buildHomepageViewModel } from './homepage-view-model'
import type {
  NormalizedCategory,
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedHomepage,
  NormalizedItinerary,
  NormalizedListing,
  SiteSettingsGlobal
} from '../../lib/types'

const baseSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'Plan the coast with trust.',
  defaultSeo: {
    title: 'ExplOregon Coast | Trusted Oregon Coast Trip Planning',
    description: 'Structured Oregon Coast travel planning with city guides, listings, and practical utilities.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
    phone: '503-555-0142'
  }
}

const baseHomepage: NormalizedHomepage = {
  heroHeadline: 'Plan the Oregon Coast trip that actually fits your style',
  heroSubheadline: 'Discover the best towns, stays, and hidden gems with practical planning tools.',
  heroCta: {
    label: 'Build a Trip',
    url: '/itineraries/3-day-oregon-coast-weekend-itinerary'
  },
  featuredCities: [],
  featuredCategories: [],
  editorialIntroBlock: {
    headline: 'Coastal Pulse',
    body: 'Editorial context block'
  },
  utilityTeaserBlock: {
    headline: 'Find your ideal match',
    body: 'Filter by budget, vibe, and coast zone.'
  },
  planningCtaBlock: {
    headline: 'Get local tide, event, and travel tips.',
    body: 'Newsletter body',
    buttonLabel: 'Sign up free',
    buttonUrl: '#newsletter'
  }
}

const makeCity = (overrides: Partial<NormalizedCity>): NormalizedCity => ({
  id: 'city-1',
  name: 'Cannon Beach',
  slug: 'cannon-beach',
  region: {
    id: 'region-1',
    slug: 'north-coast',
    label: 'North Coast'
  },
  summary: 'A postcard-worthy coastal town.',
  intro: 'Intro',
  whyVisit: 'Why visit',
  whenToGo: 'When to go',
  featuredHighlights: ['Immediate beach access', 'Luxury resorts', 'Walkable galleries'],
  latitude: 45.8918,
  longitude: -123.9615,
  faq: [],
  heroImage: {
    id: 'media-1',
    alt: 'Haystack Rock',
    url: '/media/cannon.jpg',
    width: 1200,
    height: 900
  },
  seo: {
    title: 'Cannon Beach',
    description: 'Cannon Beach'
  },
  ...overrides
})

const makeCategory = (overrides: Partial<NormalizedCategory>): NormalizedCategory => ({
  id: 'category-1',
  name: 'Hotels',
  slug: 'hotels',
  description: 'Oceanfront stays and motels.',
  icon: 'hotel',
  seo: {
    title: 'Hotels',
    description: 'Hotels'
  },
  ...overrides
})

const makeListing = (overrides: Partial<NormalizedListing>): NormalizedListing => ({
  id: 'listing-1',
  name: 'Hallmark Resort Cannon Beach',
  slug: 'hallmark-resort-cannon-beach',
  status: 'published',
  sourceType: 'manual',
  city: {
    id: 'city-1',
    slug: 'cannon-beach',
    label: 'Cannon Beach'
  },
  region: {
    id: 'region-1',
    slug: 'north-coast',
    label: 'North Coast'
  },
  categories: [
    {
      id: 'category-1',
      slug: 'hotels',
      label: 'Hotels'
    }
  ],
  summary: 'Oceanfront resort with direct beach access.',
  description: 'Longer description',
  address: '1400 S Hemlock St',
  latitude: 45.884,
  longitude: -123.965,
  websiteUrl: null,
  phone: null,
  attributes: ['Oceanfront'],
  amenities: ['Spa'],
  priceRange: '$$$',
  seasonality: 'Year-round',
  editorNotes: 'Editors choice',
  heroImage: {
    id: 'media-2',
    alt: 'Resort exterior',
    url: '/media/resort.jpg',
    width: 1200,
    height: 900
  },
  gallery: [],
  seo: {
    title: 'Hallmark Resort',
    description: 'Hallmark Resort'
  },
  ...overrides
})

const makeGuide = (overrides: Partial<NormalizedGuide>): NormalizedGuide => ({
  id: 'guide-1',
  title: 'Oregon Coast Whale Watching Guide',
  slug: 'oregon-coast-whale-watching-guide-2026',
  excerpt: 'Track migration windows and top lookouts.',
  body: 'Guide body',
  travelSeason: 'Spring',
  heroImage: {
    id: 'media-3',
    alt: 'Whale watching',
    url: '/media/guide.jpg',
    width: 1200,
    height: 900
  },
  relatedCities: [],
  relatedCategories: [],
  seo: {
    title: 'Guide',
    description: 'Guide'
  },
  ...overrides
})

const makeEvent = (overrides: Partial<NormalizedEvent>): NormalizedEvent => ({
  id: 'event-1',
  title: 'Lincoln City Coastal Kite Weekend',
  slug: 'lincoln-city-coastal-kite-weekend-seed',
  city: {
    id: 'city-2',
    slug: 'lincoln-city',
    label: 'Lincoln City'
  },
  region: {
    id: 'region-1',
    slug: 'central-coast',
    label: 'Central Coast'
  },
  startDate: '2026-06-15T00:00:00.000Z',
  endDate: null,
  venue: 'D River State Recreation Site',
  summary: 'A seeded launch event for coastal momentum.',
  description: 'Event body',
  heroImage: {
    id: 'media-4',
    alt: 'Kites on the coast',
    url: '/media/event.jpg',
    width: 1200,
    height: 900
  },
  eventUrl: null,
  seo: {
    title: 'Event',
    description: 'Event'
  },
  ...overrides
})

const makeItinerary = (overrides: Partial<NormalizedItinerary>): NormalizedItinerary => ({
  id: 'itinerary-1',
  title: '3-Day Oregon Coast Weekend Itinerary',
  slug: '3-day-oregon-coast-weekend-itinerary',
  summary: 'Three days across the coast.',
  tripLength: '3 days',
  body: 'Itinerary body',
  heroImage: {
    id: 'media-5',
    alt: 'Coastal road trip',
    url: '/media/itinerary.jpg',
    width: 1200,
    height: 900
  },
  stops: [],
  relatedCities: [],
  seo: {
    title: 'Itinerary',
    description: 'Itinerary'
  },
  ...overrides
})

test('buildHomepageViewModel prefers real media and preserves key homepage modules', () => {
  const featuredCities = [makeCity({}), makeCity({ id: 'city-2', name: 'Newport', slug: 'newport' })]
  const result = buildHomepageViewModel({
    settings: baseSettings,
    homepage: baseHomepage,
    featuredCities,
    featuredCategories: [makeCategory({}), makeCategory({ id: 'category-2', name: 'Campgrounds', slug: 'campgrounds' })],
    compareCities: featuredCities,
    editorsChoiceListings: [makeListing({})],
    coastalPulseGuides: [makeGuide({})],
    coastalPulseEvents: [makeEvent({})],
    planningItinerary: makeItinerary({})
  })

  assert.equal(result.hero.image?.url, '/media/cannon.jpg')
  assert.equal(result.hero.quickLinks.length, 2)
  assert.equal(result.destinationStrip.length, 2)
  assert.equal(result.editorsChoice.length, 1)
  assert.equal(result.coastalPulse.guides.length, 1)
  assert.equal(result.coastalPulse.events.length, 1)
  assert.equal(result.planningBanner.button.href, '#newsletter')
})

test('buildHomepageViewModel falls back to placeholders when seeded content is incomplete', () => {
  const result = buildHomepageViewModel({
    settings: baseSettings,
    homepage: {
      ...baseHomepage,
      featuredCategories: [],
      utilityTeaserBlock: null,
      planningCtaBlock: null
    },
    featuredCities: [],
    featuredCategories: [],
    compareCities: [],
    editorsChoiceListings: [],
    coastalPulseGuides: [],
    coastalPulseEvents: [],
    planningItinerary: null
  })

  assert.equal(result.hero.image, null)
  assert.equal(result.hero.quickLinks[0]?.label, 'Hotels')
  assert.match(result.tripFinder.intro, /placeholder/i)
  assert.match(result.utilitySnapshot.metrics[0]?.value ?? '', /placeholder/i)
  assert.match(result.coastalPulse.guides[0]?.title ?? '', /Placeholder/i)
  assert.equal(result.planningBanner.button.href, '/itineraries')
})
