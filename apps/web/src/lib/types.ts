export type ID = number | string

export type ListingStatus = 'draft' | 'imported' | 'needsReview' | 'approved' | 'published' | 'archived'
export type EditorialStatus = 'draft' | 'review' | 'published' | 'archived'
export type CityStatus = 'draft' | 'published' | 'archived'

export type SeoFields = {
  seoTitle: string
  seoDescription: string
}

export type PayloadMedia = {
  id: ID
  alt?: string | null
  url?: string | null
  filename?: string | null
  width?: number | null
  height?: number | null
}

export type PayloadRelationship<T> = ID | T

export type RegionDoc = SeoFields & {
  id: ID
  name: string
  slug: string
  summary: string
  intro: string
  sectionHeadings?: {
    intro?: {
      kicker?: string
      headline?: string
    }
    cities?: {
      kicker?: string
      headline?: string
    }
    listings?: {
      kicker?: string
      headline?: string
    }
    map?: {
      kicker?: string
      headline?: string
    }
    events?: {
      kicker?: string
      headline?: string
    }
    guides?: {
      kicker?: string
      headline?: string
    }
  }
  heroImage: PayloadRelationship<PayloadMedia>
  createdAt?: string
  updatedAt?: string
}

export type CityDoc = SeoFields & {
  id: ID
  name: string
  slug: string
  region: PayloadRelationship<RegionDoc>
  heroImage: PayloadRelationship<PayloadMedia>
  summary: string
  intro: string
  whyVisit: string
  whenToGo: string
  listingSections?: {
    hotels?: {
      kicker: string
      title: string
      lede: string
      categories?: Array<PayloadRelationship<ListingCategoryDoc>>
    }
    dining?: {
      kicker: string
      title: string
      lede: string
      categories?: Array<PayloadRelationship<ListingCategoryDoc>>
    }
    attractions?: {
      kicker: string
      title: string
      lede: string
      categories?: Array<PayloadRelationship<ListingCategoryDoc>>
    }
  }
  topCategories?: {
    kicker: string
    title: string
    lede: string
    categories?: Array<PayloadRelationship<ListingCategoryDoc>>
  }
  featuredHighlights?: Array<{ highlight: string }>
  latitude: number
  longitude: number
  faq?: Array<{ question: string; answer: string }>
  status: CityStatus
  createdAt?: string
  updatedAt?: string
}

export type ListingCategoryDoc = SeoFields & {
  id: ID
  name: string
  slug: string
  description: string
  icon: string
  createdAt?: string
  updatedAt?: string
}

export type ListingDoc = SeoFields & {
  id: ID
  name: string
  slug: string
  city: PayloadRelationship<CityDoc>
  region: PayloadRelationship<RegionDoc>
  categories: Array<PayloadRelationship<ListingCategoryDoc>>
  summary: string
  description: string
  heroImage: PayloadRelationship<PayloadMedia>
  gallery?: Array<PayloadRelationship<PayloadMedia>>
  address: string
  latitude: number
  longitude: number
  websiteUrl?: string | null
  phone?: string | null
  attributes?: Array<{ attribute: string }>
  amenities?: Array<{ amenity: string }>
  priceRange?: string | null
  seasonality?: string | null
  editorNotes?: string | null
  sourceType: 'manual' | 'imported' | 'partner'
  status: ListingStatus
  createdAt?: string
  updatedAt?: string
}

export type GuideDoc = SeoFields & {
  id: ID
  title: string
  slug: string
  heroImage: PayloadRelationship<PayloadMedia>
  excerpt: string
  body: string
  relatedCities?: Array<PayloadRelationship<CityDoc>>
  relatedCategories?: Array<PayloadRelationship<ListingCategoryDoc>>
  travelSeason: string
  status: EditorialStatus
  createdAt?: string
  updatedAt?: string
}

export type EventDoc = SeoFields & {
  id: ID
  title: string
  slug: string
  city: PayloadRelationship<CityDoc>
  region: PayloadRelationship<RegionDoc>
  startDate: string
  endDate?: string | null
  venue: string
  summary: string
  description: string
  heroImage: PayloadRelationship<PayloadMedia>
  eventUrl?: string | null
  status: EditorialStatus
  createdAt?: string
  updatedAt?: string
}

export type ItineraryDoc = SeoFields & {
  id: ID
  title: string
  slug: string
  summary: string
  heroImage: PayloadRelationship<PayloadMedia>
  tripLength: string
  stops: Array<PayloadRelationship<ListingDoc>>
  body: string
  relatedCities?: Array<PayloadRelationship<CityDoc>>
  status: EditorialStatus
  createdAt?: string
  updatedAt?: string
}

export type LexicalRichText = {
  root: {
    type: string
    children: Array<Record<string, unknown>>
    direction: 'ltr' | 'rtl' | null
    format: string
    indent: number
    version: number
  }
  [k: string]: unknown
}

export type PageDoc = SeoFields & {
  id: ID
  title: string
  slug: string
  body: LexicalRichText
  header?: {
    kicker?: string
    title?: string
    description?: string
    actions?: Array<{
      label: string
      url: string
      openInNewTab?: boolean
    }>
  }
  status: EditorialStatus
  createdAt?: string
  updatedAt?: string
}

export type HomepageGlobal = {
  heroImage?: PayloadRelationship<PayloadMedia>
  heroHeadline: string
  heroSubheadline: string
  heroCta?: { label: string; url: string }
  featuredCities?: Array<PayloadRelationship<CityDoc>>
  featuredCategories?: Array<PayloadRelationship<ListingCategoryDoc>>
  editorialIntroBlock?: { headline: string; body: string }
  utilityTeaserBlock?: {
    headline: string
    body: string
    primaryButtonLabel: string
    primaryButtonUrl: string
    secondaryButtonLabel: string
    secondaryButtonUrl: string
    resultsButtonLabel: string
    resultsBaseUrl: string
  }
  planningCtaBlock?: {
    headline: string
    body: string
    buttonLabel: string
    buttonUrl: string
  }
}

export type SiteSettingsGlobal = {
  siteName: string
  siteTagline: string
  defaultSeo: {
    title: string
    description: string
  }
  socialLinks?: Array<{ platform: string; url: string }>
  contact?: { email: string; phone?: string | null }
}

export type PayloadFindResponse<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export type LinkItem = {
  label: string
  url: string
  openInNewTab?: boolean
}

export type HeaderActionButton = {
  label: string
  url: string
  openInNewTab?: boolean
}

export type NavigationGlobal = {
  logo?: NormalizedMedia | null
  headerNavItems?: LinkItem[]
  headerActionButtons?: HeaderActionButton[]
  footerNavGroups?: Array<{
    groupLabel: string
    links: LinkItem[]
  }>
}

export type FooterGlobal = {
  footerNavGroups?: Array<{
    groupLabel: string
    links: LinkItem[]
  }>
}

export type NormalizedMedia = {
  id: ID
  alt: string | null
  url: string | null
  width: number | null
  height: number | null
}

export type NormalizedReference = {
  id: ID
  slug: string
  label: string
}

export type NormalizedSeo = {
  title: string
  description: string
}

export type NormalizedRegion = {
  id: ID
  name: string
  slug: string
  summary: string
  intro: string
  sectionHeadings: {
    intro: {
      kicker: string
      headline: string
    }
    cities: {
      kicker: string
      headline: string
    }
    listings: {
      kicker: string
      headline: string
    }
    map: {
      kicker: string
      headline: string
    }
    events: {
      kicker: string
      headline: string
    }
    guides: {
      kicker: string
      headline: string
    }
  }
  heroImage: NormalizedMedia | null
  seo: NormalizedSeo
}

export type NormalizedCity = {
  id: ID
  name: string
  slug: string
  region: NormalizedReference | null
  summary: string
  intro: string
  whyVisit: string
  whenToGo: string
  listingSections: {
    hotels: {
      kicker: string
      title: string
      lede: string
      categories: NormalizedReference[]
    }
    dining: {
      kicker: string
      title: string
      lede: string
      categories: NormalizedReference[]
    }
    attractions: {
      kicker: string
      title: string
      lede: string
      categories: NormalizedReference[]
    }
  }
  topCategories: {
    kicker: string
    title: string
    lede: string
    categories: NormalizedReference[]
  }
  featuredHighlights: string[]
  latitude: number
  longitude: number
  faq: Array<{ question: string; answer: string }>
  heroImage: NormalizedMedia | null
  seo: NormalizedSeo
}

export type NormalizedCategory = {
  id: ID
  name: string
  slug: string
  description: string
  icon: string
  seo: NormalizedSeo
}

export type NormalizedListing = {
  id: ID
  name: string
  slug: string
  status: ListingStatus
  sourceType: 'manual' | 'imported' | 'partner'
  city: NormalizedReference | null
  region: NormalizedReference | null
  categories: NormalizedReference[]
  summary: string
  description: string
  address: string
  latitude: number
  longitude: number
  websiteUrl: string | null
  phone: string | null
  attributes: string[]
  amenities: string[]
  priceRange: string | null
  seasonality: string | null
  editorNotes: string | null
  heroImage: NormalizedMedia | null
  gallery: NormalizedMedia[]
  seo: NormalizedSeo
}

export type NormalizedGuide = {
  id: ID
  title: string
  slug: string
  excerpt: string
  body: string
  travelSeason: string
  heroImage: NormalizedMedia | null
  relatedCities: NormalizedReference[]
  relatedCategories: NormalizedReference[]
  seo: NormalizedSeo
}

export type NormalizedEvent = {
  id: ID
  title: string
  slug: string
  city: NormalizedReference | null
  region: NormalizedReference | null
  startDate: string
  endDate: string | null
  venue: string
  summary: string
  description: string
  heroImage: NormalizedMedia | null
  eventUrl: string | null
  seo: NormalizedSeo
}

export type NormalizedItinerary = {
  id: ID
  title: string
  slug: string
  summary: string
  tripLength: string
  body: string
  heroImage: NormalizedMedia | null
  stops: NormalizedReference[]
  relatedCities: NormalizedReference[]
  seo: NormalizedSeo
}

export type NormalizedPage = {
  id: ID
  title: string
  slug: string
  body: LexicalRichText
  header: {
    kicker: string | null
    title: string
    description: string
    actions: HeaderActionButton[]
  }
  seo: NormalizedSeo
  createdAt: string | null
  updatedAt: string | null
}

export type NormalizedHomepage = {
  heroImage: NormalizedMedia | null
  heroHeadline: string
  heroSubheadline: string
  heroCta: { label: string; url: string } | null
  featuredCities: NormalizedReference[]
  featuredCategories: NormalizedReference[]
  editorialIntroBlock: { headline: string; body: string } | null
  utilityTeaserBlock: {
    headline: string
    body: string
    primaryButtonLabel: string
    primaryButtonUrl: string
    secondaryButtonLabel: string
    secondaryButtonUrl: string
    resultsButtonLabel: string
    resultsBaseUrl: string
  } | null
  planningCtaBlock: {
    headline: string
    body: string
    buttonLabel: string
    buttonUrl: string
  } | null
}
