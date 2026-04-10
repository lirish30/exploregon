import { COLLECTIONS, GLOBALS, normalizeRouteSlug } from './schema'
import type {
  CityDoc,
  FooterGlobal,
  GuideDoc,
  HeaderActionButton,
  HomepageGlobal,
  ID,
  ItineraryDoc,
  LexicalRichText,
  ListingCategoryDoc,
  ListingDoc,
  NavigationGlobal,
  NormalizedCategory,
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedHomepage,
  NormalizedItinerary,
  NormalizedListing,
  NormalizedMedia,
  NormalizedPage,
  NormalizedReference,
  NormalizedRegion,
  PageDoc,
  PayloadFindResponse,
  PayloadMedia,
  PayloadRelationship,
  RegionDoc,
  SiteSettingsGlobal,
  EventDoc
} from './types'

type FetchBehavior = {
  depth?: number
  revalidate?: number | false
  tags?: string[]
}

type SlugQuery = FetchBehavior & {
  status?: string
}

type CollectionQuery = FetchBehavior & {
  status?: string
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, string | number | undefined>
}

const DEFAULT_DEPTH = 1
const DEFAULT_REVALIDATE = 1800

const ensurePayloadBaseUrl = (): string => {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!baseUrl) {
    if (process.env.NODE_ENV !== 'production') {
      return 'http://localhost:3001'
    }

    throw new Error('Missing PAYLOAD_PUBLIC_SERVER_URL. Add it to your environment.')
  }

  if (process.env.NODE_ENV !== 'production' && siteUrl && baseUrl.replace(/\/$/, '') === siteUrl.replace(/\/$/, '')) {
    throw new Error(
      `PAYLOAD_PUBLIC_SERVER_URL (${baseUrl}) points to NEXT_PUBLIC_SITE_URL. Set PAYLOAD_PUBLIC_SERVER_URL to your CMS server (usually http://localhost:3001).`
    )
  }

  return baseUrl.replace(/\/$/, '')
}

const withQueryString = (path: string, params: Record<string, string | number | undefined>): string => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    query.set(key, String(value))
  })

  const queryString = query.toString()
  return queryString ? `${path}?${queryString}` : path
}

const payloadFetch = async <T>(path: string, behavior: FetchBehavior = {}): Promise<T> => {
  const baseUrl = ensurePayloadBaseUrl()
  const { revalidate = DEFAULT_REVALIDATE, tags } = behavior
  const resolvedRevalidate = process.env.NODE_ENV === 'production' ? revalidate : 0

  const response = await fetch(`${baseUrl}${path}`, {
    next: {
      revalidate: resolvedRevalidate,
      tags
    }
  })

  if (!response.ok) {
    throw new Error(`Payload request failed (${response.status}) for ${path}`)
  }

  return response.json() as Promise<T>
}

const fetchGlobal = <T>(slug: string, behavior: FetchBehavior = {}): Promise<T> => {
  const depth = behavior.depth ?? DEFAULT_DEPTH
  const path = withQueryString(`/api/globals/${slug}`, { depth })
  return payloadFetch<T>(path, behavior)
}

const fetchBySlug = async <T>(
  collection: string,
  slug: string,
  { depth = DEFAULT_DEPTH, status, ...behavior }: SlugQuery = {}
): Promise<T | null> => {
  try {
    const path = withQueryString(`/api/${collection}`, {
      depth,
      limit: 1,
      'where[slug][equals]': slug,
      'where[status][equals]': status
    })

    const result = await payloadFetch<PayloadFindResponse<T>>(path, behavior)
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

const fetchCollection = async <T>(
  collection: string,
  { depth = DEFAULT_DEPTH, status, limit = 24, page = 1, sort, where = {}, ...behavior }: CollectionQuery = {}
): Promise<T[]> => {
  try {
    const path = withQueryString(`/api/${collection}`, {
      depth,
      limit,
      page,
      sort,
      'where[status][equals]': status,
      ...where
    })

    const result = await payloadFetch<PayloadFindResponse<T>>(path, behavior)
    return result.docs
  } catch {
    return []
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asDoc = <T extends Record<string, unknown>>(value: PayloadRelationship<T>): T | null => {
  return isRecord(value) ? (value as T) : null
}

const normalizeMedia = (value: PayloadRelationship<PayloadMedia> | undefined): NormalizedMedia | null => {
  const media = value ? asDoc(value) : null

  if (!media) {
    return null
  }

  return {
    id: media.id,
    alt: typeof media.alt === 'string' ? media.alt : null,
    url: typeof media.url === 'string' ? media.url : null,
    width: typeof media.width === 'number' ? media.width : null,
    height: typeof media.height === 'number' ? media.height : null
  }
}

const normalizeReference = (
  value: PayloadRelationship<Record<string, unknown>>,
  labelKeys: string[]
): NormalizedReference | null => {
  const doc = asDoc(value)

  if (!doc || typeof doc.id === 'undefined' || typeof doc.slug !== 'string') {
    return null
  }

  const label = labelKeys.reduce<string | null>((acc, key) => {
    if (acc) {
      return acc
    }

    const candidate = doc[key]
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }

    return null
  }, null)

  if (!label) {
    return null
  }

  return {
    id: doc.id as ID,
    slug: doc.slug,
    label
  }
}

const normalizeReferences = (
  values: Array<PayloadRelationship<Record<string, unknown>>> | undefined,
  labelKeys: string[]
): NormalizedReference[] => {
  if (!Array.isArray(values)) {
    return []
  }

  return values
    .map((value) => normalizeReference(value, labelKeys))
    .filter((value): value is NormalizedReference => value !== null)
}

const asNonEmptyString = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : fallback
}

const normalizeRegion = (doc: RegionDoc): NormalizedRegion => ({
  id: doc.id,
  name: doc.name,
  slug: doc.slug,
  summary: doc.summary,
  intro: doc.intro,
  heroImage: normalizeMedia(doc.heroImage),
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizeCity = (doc: CityDoc): NormalizedCity => {
  const defaultSection = (
    section: { kicker?: string; title?: string; lede?: string; categories?: Array<PayloadRelationship<Record<string, unknown>>> } | undefined,
    fallback: { kicker: string; title: string; lede: string }
  ) => ({
    kicker: asNonEmptyString(section?.kicker, fallback.kicker),
    title: asNonEmptyString(section?.title, fallback.title),
    lede: asNonEmptyString(section?.lede, fallback.lede),
    categories: normalizeReferences(section?.categories, ['name', 'title'])
  })

  return {
  id: doc.id,
  name: doc.name,
  slug: doc.slug,
  region: normalizeReference(doc.region, ['name', 'title']),
  summary: doc.summary,
  intro: doc.intro,
  whyVisit: doc.whyVisit,
  whenToGo: doc.whenToGo,
  listingSections: {
    hotels: defaultSection(doc.listingSections?.hotels, {
      kicker: 'Hotels',
      title: 'Where to stay',
      lede: 'Curated places to stay connected to this city in Payload.'
    }),
    dining: defaultSection(doc.listingSections?.dining, {
      kicker: 'Dining',
      title: 'Where to eat',
      lede: 'Curated dining spots connected to this city in Payload.'
    }),
    attractions: defaultSection(doc.listingSections?.attractions, {
      kicker: 'Attractions',
      title: 'Where to explore',
      lede: 'Curated attractions and experiences connected to this city in Payload.'
    })
  },
  topCategories: {
    kicker: asNonEmptyString(doc.topCategories?.kicker, 'Top Categories'),
    title: asNonEmptyString(doc.topCategories?.title, 'Most useful category paths'),
    lede: asNonEmptyString(
      doc.topCategories?.lede,
      'These categories are inferred from currently published city listings.'
    ),
    categories: normalizeReferences(doc.topCategories?.categories, ['name', 'title'])
  },
  featuredHighlights: (doc.featuredHighlights ?? []).map((item) => item.highlight),
  latitude: doc.latitude,
  longitude: doc.longitude,
  faq: (doc.faq ?? []).map((item) => ({
    question: item.question,
    answer: item.answer
  })),
  heroImage: normalizeMedia(doc.heroImage),
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
  }
}

const normalizeCategory = (doc: ListingCategoryDoc): NormalizedCategory => ({
  id: doc.id,
  name: doc.name,
  slug: doc.slug,
  description: doc.description,
  icon: doc.icon,
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizeListing = (doc: ListingDoc): NormalizedListing => ({
  id: doc.id,
  name: doc.name,
  slug: doc.slug,
  status: doc.status,
  sourceType: doc.sourceType,
  city: normalizeReference(doc.city, ['name', 'title']),
  region: normalizeReference(doc.region, ['name', 'title']),
  categories: normalizeReferences(doc.categories as Array<PayloadRelationship<Record<string, unknown>>>, [
    'name',
    'title'
  ]),
  summary: doc.summary,
  description: doc.description,
  address: doc.address,
  latitude: doc.latitude,
  longitude: doc.longitude,
  websiteUrl: doc.websiteUrl ?? null,
  phone: doc.phone ?? null,
  attributes: (doc.attributes ?? []).map((item) => item.attribute),
  amenities: (doc.amenities ?? []).map((item) => item.amenity),
  priceRange: doc.priceRange ?? null,
  seasonality: doc.seasonality ?? null,
  editorNotes: doc.editorNotes ?? null,
  heroImage: normalizeMedia(doc.heroImage),
  gallery: (doc.gallery ?? [])
    .map((image) => normalizeMedia(image))
    .filter((image): image is NormalizedMedia => image !== null),
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizeGuide = (doc: GuideDoc): NormalizedGuide => ({
  id: doc.id,
  title: doc.title,
  slug: doc.slug,
  excerpt: doc.excerpt,
  body: doc.body,
  travelSeason: doc.travelSeason,
  heroImage: normalizeMedia(doc.heroImage),
  relatedCities: normalizeReferences(doc.relatedCities as Array<PayloadRelationship<Record<string, unknown>>> | undefined, [
    'name',
    'title'
  ]),
  relatedCategories: normalizeReferences(
    doc.relatedCategories as Array<PayloadRelationship<Record<string, unknown>>> | undefined,
    ['name', 'title']
  ),
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizeEvent = (doc: EventDoc): NormalizedEvent => ({
  id: doc.id,
  title: doc.title,
  slug: doc.slug,
  city: normalizeReference(doc.city, ['name', 'title']),
  region: normalizeReference(doc.region, ['name', 'title']),
  startDate: doc.startDate,
  endDate: doc.endDate ?? null,
  venue: doc.venue,
  summary: doc.summary,
  description: doc.description,
  heroImage: normalizeMedia(doc.heroImage),
  eventUrl: doc.eventUrl ?? null,
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizeItinerary = (doc: ItineraryDoc): NormalizedItinerary => ({
  id: doc.id,
  title: doc.title,
  slug: doc.slug,
  summary: doc.summary,
  tripLength: doc.tripLength,
  body: doc.body,
  heroImage: normalizeMedia(doc.heroImage),
  stops: normalizeReferences(doc.stops as Array<PayloadRelationship<Record<string, unknown>>>, [
    'name',
    'title'
  ]),
  relatedCities: normalizeReferences(doc.relatedCities as Array<PayloadRelationship<Record<string, unknown>>> | undefined, [
    'name',
    'title'
  ]),
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  }
})

const normalizePage = (doc: PageDoc): NormalizedPage => ({
  id: doc.id,
  title: doc.title,
  slug: doc.slug,
  body: doc.body as LexicalRichText,
  seo: {
    title: doc.seoTitle,
    description: doc.seoDescription
  },
  createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : null,
  updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : null
})

const normalizeHomepage = (global: Partial<HomepageGlobal> | null | undefined): NormalizedHomepage => ({
  heroImage: normalizeMedia(global?.heroImage as PayloadRelationship<PayloadMedia> | undefined),
  heroHeadline: asNonEmptyString(global?.heroHeadline, 'Explore the Oregon Coast'),
  heroSubheadline: asNonEmptyString(global?.heroSubheadline, 'Plan your route, stays, and activities from CMS content.'),
  heroCta: global?.heroCta
    ? {
        label: global.heroCta.label,
        url: global.heroCta.url
      }
    : null,
  featuredCities: normalizeReferences(
    global?.featuredCities as Array<PayloadRelationship<Record<string, unknown>>> | undefined,
    ['name', 'title']
  ),
  featuredCategories: normalizeReferences(
    global?.featuredCategories as Array<PayloadRelationship<Record<string, unknown>>> | undefined,
    ['name', 'title']
  ),
  editorialIntroBlock: global?.editorialIntroBlock
    ? {
        headline: global.editorialIntroBlock.headline,
        body: global.editorialIntroBlock.body
      }
    : null,
  utilityTeaserBlock: global?.utilityTeaserBlock
    ? {
        headline: global.utilityTeaserBlock.headline,
        body: global.utilityTeaserBlock.body
      }
    : null,
  planningCtaBlock: global?.planningCtaBlock
    ? {
        headline: global.planningCtaBlock.headline,
        body: global.planningCtaBlock.body,
        buttonLabel: global.planningCtaBlock.buttonLabel,
        buttonUrl: global.planningCtaBlock.buttonUrl
      }
    : null
})

const normalizeSiteSettings = (settings: Partial<SiteSettingsGlobal> | null | undefined): SiteSettingsGlobal => ({
  siteName: asNonEmptyString(settings?.siteName, 'ExplOregon Coast'),
  siteTagline: asNonEmptyString(settings?.siteTagline, 'Plan the Oregon Coast with trusted local structure.'),
  defaultSeo: {
    title: asNonEmptyString(settings?.defaultSeo?.title, 'ExplOregon Coast'),
    description: asNonEmptyString(
      settings?.defaultSeo?.description,
      'Structured Oregon Coast travel and planning resources.'
    )
  },
  socialLinks: Array.isArray(settings?.socialLinks) ? settings.socialLinks : [],
  contact: {
    email: asNonEmptyString(settings?.contact?.email, 'editorial@exploregoncoast.com'),
    phone: typeof settings?.contact?.phone === 'string' ? settings.contact.phone : null
  }
})

const normalizeNavigation = (navigation: Partial<NavigationGlobal> | null | undefined): NavigationGlobal => ({
  logo: normalizeMedia((navigation as { logo?: PayloadRelationship<PayloadMedia> } | null | undefined)?.logo),
  headerNavItems: Array.isArray(navigation?.headerNavItems) ? navigation.headerNavItems : [],
  headerActionButtons: Array.isArray(navigation?.headerActionButtons)
    ? navigation.headerActionButtons
        .map((button): HeaderActionButton | null => {
          if (!button || typeof button.label !== 'string' || typeof button.url !== 'string') {
            return null
          }

          const label = button.label.trim()
          const url = button.url.trim()
          if (!label || !url) {
            return null
          }

          return {
            label,
            url,
            openInNewTab: button.openInNewTab === true
          }
        })
        .filter((button): button is HeaderActionButton => button !== null)
    : [],
  footerNavGroups: Array.isArray(navigation?.footerNavGroups) ? navigation.footerNavGroups : []
})

const normalizeFooter = (footer: Partial<FooterGlobal> | null | undefined): FooterGlobal => ({
  footerNavGroups: Array.isArray(footer?.footerNavGroups) ? footer.footerNavGroups : []
})

export const getHomepageData = async (behavior: FetchBehavior = {}): Promise<NormalizedHomepage> => {
  try {
    const data = await fetchGlobal<HomepageGlobal>(GLOBALS.homepage, behavior)
    return normalizeHomepage(data)
  } catch {
    return normalizeHomepage(null)
  }
}

export const getSiteSettings = async (behavior: FetchBehavior = {}): Promise<SiteSettingsGlobal> => {
  try {
    const data = await fetchGlobal<SiteSettingsGlobal>(GLOBALS.siteSettings, behavior)
    return normalizeSiteSettings(data)
  } catch {
    return normalizeSiteSettings(null)
  }
}

export const getNavigation = async (behavior: FetchBehavior = {}): Promise<NavigationGlobal> => {
  try {
    const data = await fetchGlobal<NavigationGlobal>(GLOBALS.navigation, behavior)
    return normalizeNavigation(data)
  } catch {
    return normalizeNavigation(null)
  }
}

export const getFooter = async (behavior: FetchBehavior = {}): Promise<FooterGlobal> => {
  try {
    const data = await fetchGlobal<FooterGlobal>(GLOBALS.footer, behavior)
    return normalizeFooter(data)
  } catch {
    return normalizeFooter(null)
  }
}

export const getCityBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedCity | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<CityDoc>(COLLECTIONS.cities, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizeCity(doc) : null
}

export const getCities = async (options: CollectionQuery = {}): Promise<NormalizedCity[]> => {
  const docs = await fetchCollection<CityDoc>(COLLECTIONS.cities, {
    status: 'published',
    sort: 'name',
    limit: 250,
    ...options
  })

  return docs.map((doc) => normalizeCity(doc))
}

export const getCategoryBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedCategory | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<ListingCategoryDoc>(COLLECTIONS.listingCategories, slug, options)
  return doc ? normalizeCategory(doc) : null
}

export const getCategories = async (options: CollectionQuery = {}): Promise<NormalizedCategory[]> => {
  const docs = await fetchCollection<ListingCategoryDoc>(COLLECTIONS.listingCategories, {
    sort: 'name',
    limit: 250,
    ...options
  })

  return docs.map((doc) => normalizeCategory(doc))
}

export const getListingBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedListing | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<ListingDoc>(COLLECTIONS.listings, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizeListing(doc) : null
}

export const getListingRecordBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedListing | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<ListingDoc>(COLLECTIONS.listings, slug, options)
  return doc ? normalizeListing(doc) : null
}

export const getListings = async (options: CollectionQuery = {}): Promise<NormalizedListing[]> => {
  const docs = await fetchCollection<ListingDoc>(COLLECTIONS.listings, {
    status: 'published',
    sort: 'name',
    limit: 250,
    ...options
  })

  return docs.map((doc) => normalizeListing(doc))
}

export const getListingsByCity = async (
  cityId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedListing[]> => {
  const docs = await fetchCollection<ListingDoc>(COLLECTIONS.listings, {
    status: 'published',
    sort: 'name',
    limit: 48,
    where: {
      'where[city][equals]': cityId
    },
    ...options
  })

  return docs.map((doc) => normalizeListing(doc))
}

export const getRegionBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedRegion | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<RegionDoc>(COLLECTIONS.regions, slug, options)
  return doc ? normalizeRegion(doc) : null
}

export const getGuideBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedGuide | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<GuideDoc>(COLLECTIONS.guides, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizeGuide(doc) : null
}

export const getPageBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedPage | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<PageDoc>(COLLECTIONS.pages, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizePage(doc) : null
}

export const getPages = async (options: CollectionQuery = {}): Promise<NormalizedPage[]> => {
  const docs = await fetchCollection<PageDoc>(COLLECTIONS.pages, {
    status: 'published',
    sort: 'title',
    limit: 250,
    ...options
  })

  return docs.map((doc) => normalizePage(doc))
}

export const getGuides = async (options: CollectionQuery = {}): Promise<NormalizedGuide[]> => {
  const docs = await fetchCollection<GuideDoc>(COLLECTIONS.guides, {
    status: 'published',
    sort: '-createdAt',
    limit: 120,
    ...options
  })

  return docs.map((doc) => normalizeGuide(doc))
}

export const getEventBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedEvent | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<EventDoc>(COLLECTIONS.events, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizeEvent(doc) : null
}

export const getEventsByCity = async (
  cityId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedEvent[]> => {
  const docs = await fetchCollection<EventDoc>(COLLECTIONS.events, {
    status: 'published',
    sort: 'startDate',
    limit: 24,
    where: {
      'where[city][equals]': cityId
    },
    ...options
  })

  return docs.map((doc) => normalizeEvent(doc))
}

export const getEventsByRegion = async (
  regionId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedEvent[]> => {
  const docs = await fetchCollection<EventDoc>(COLLECTIONS.events, {
    status: 'published',
    sort: 'startDate',
    limit: 24,
    where: {
      'where[region][equals]': regionId
    },
    ...options
  })

  return docs.map((doc) => normalizeEvent(doc))
}

export const getEvents = async (options: CollectionQuery = {}): Promise<NormalizedEvent[]> => {
  const docs = await fetchCollection<EventDoc>(COLLECTIONS.events, {
    status: 'published',
    sort: 'startDate',
    limit: 120,
    ...options
  })

  return docs.map((doc) => normalizeEvent(doc))
}

export const getItineraryBySlug = async (
  routeSlug: string | string[] | undefined,
  options: FetchBehavior = {}
): Promise<NormalizedItinerary | null> => {
  const slug = normalizeRouteSlug(routeSlug)
  if (!slug) {
    return null
  }

  const doc = await fetchBySlug<ItineraryDoc>(COLLECTIONS.itineraries, slug, {
    ...options,
    status: 'published'
  })

  return doc ? normalizeItinerary(doc) : null
}

export const getItineraries = async (options: CollectionQuery = {}): Promise<NormalizedItinerary[]> => {
  const docs = await fetchCollection<ItineraryDoc>(COLLECTIONS.itineraries, {
    status: 'published',
    sort: '-createdAt',
    limit: 120,
    ...options
  })

  return docs.map((doc) => normalizeItinerary(doc))
}

// ─── Additional query helpers ─────────────────────────────────────────────────

/**
 * All regions, sorted alphabetically. Rarely changes so revalidate is long.
 */
export const getRegions = async (options: CollectionQuery = {}): Promise<NormalizedRegion[]> => {
  const docs = await fetchCollection<RegionDoc>(COLLECTIONS.regions, {
    sort: 'name',
    limit: 50,
    revalidate: 3600,
    ...options
  })

  return docs.map((doc) => normalizeRegion(doc))
}

/**
 * Published cities in a specific region.
 */
export const getCitiesByRegion = async (
  regionId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedCity[]> => {
  const docs = await fetchCollection<CityDoc>(COLLECTIONS.cities, {
    status: 'published',
    sort: 'name',
    limit: 50,
    where: {
      'where[region][equals]': regionId
    },
    ...options
  })

  return docs.map((doc) => normalizeCity(doc))
}

/**
 * Published listings belonging to a specific category.
 * Uses Payload's `[in]` operator for the hasMany categories field.
 */
export const getListingsByCategory = async (
  categoryId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedListing[]> => {
  const docs = await fetchCollection<ListingDoc>(COLLECTIONS.listings, {
    status: 'published',
    sort: 'name',
    limit: 48,
    where: {
      'where[categories][in][0]': categoryId
    },
    ...options
  })

  return docs.map((doc) => normalizeListing(doc))
}

export const getListingsByRegion = async (
  regionId: ID,
  options: CollectionQuery = {}
): Promise<NormalizedListing[]> => {
  const docs = await fetchCollection<ListingDoc>(COLLECTIONS.listings, {
    status: 'published',
    sort: 'name',
    limit: 48,
    where: {
      'where[region][equals]': regionId
    },
    ...options
  })

  return docs.map((doc) => normalizeListing(doc))
}

/**
 * Published events with a start date on or after today, sorted ascending.
 * Use for "upcoming events" modules and the events index.
 */
export const getUpcomingEvents = async (options: CollectionQuery = {}): Promise<NormalizedEvent[]> => {
  const todayIso = new Date().toISOString()

  const docs = await fetchCollection<EventDoc>(COLLECTIONS.events, {
    status: 'published',
    sort: 'startDate',
    limit: 120,
    where: {
      'where[startDate][greater_than_equal]': todayIso
    },
    ...options
  })

  return docs.map((doc) => normalizeEvent(doc))
}
