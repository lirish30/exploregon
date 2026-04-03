import type { Metadata } from 'next'

import { HomepagePage } from '../components/home/homepage-page'
import { buildHomepageViewModel } from '../components/home/homepage-view-model'
import {
  getCategoryBySlug,
  getCityBySlug,
  getEventBySlug,
  getGuideBySlug,
  getHomepageData,
  getItineraryBySlug,
  getListingBySlug,
  getSiteSettings
} from '../lib/api'
import { buildWebsiteJsonLd, createMetadata } from '../lib/seo'
import type {
  NormalizedCategory,
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedHomepage,
  NormalizedItinerary,
  NormalizedListing,
  SiteSettingsGlobal
} from '../lib/types'

export const revalidate = 300

const EDITORS_CHOICE_LISTING_SLUGS = [
  'hallmark-resort-cannon-beach',
  'yaquina-head-outstanding-natural-area',
  'roads-end-state-recreation-site'
] as const

const COASTAL_PULSE_GUIDE_SLUGS = ['oregon-coast-whale-watching-guide-2026', 'oregon-coast-camping-guide-2026'] as const

const COASTAL_PULSE_EVENT_SLUGS = ['lincoln-city-coastal-kite-weekend-seed', 'newport-bayfront-seafood-weekend-seed'] as const

const DESTINATION_COMPARE_CITY_SLUGS = ['cannon-beach', 'newport', 'lincoln-city'] as const

const fallbackSiteSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast | Trusted Oregon Coast Trip Planning',
    description: 'Structured Oregon Coast travel planning with city guides, listings, and practical utilities.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial-placeholder@exploregoncoast.com',
    phone: '503-555-0142'
  }
}

const fallbackHomepage: NormalizedHomepage = {
  heroHeadline: 'Plan the Oregon Coast trip that actually fits your style',
  heroSubheadline:
    'Discover the best towns, stays, and hidden gems with our expert planning tools. Rugged adventures or quiet mists, find your path.',
  heroCta: {
    label: 'Build a Trip',
    url: '/itineraries/3-day-oregon-coast-weekend-itinerary'
  },
  featuredCities: [],
  featuredCategories: [],
  editorialIntroBlock: {
    headline: 'Coastal Pulse',
    body: 'Launch placeholder for editorial highlights until full module data is available.'
  },
  utilityTeaserBlock: {
    headline: 'Find your ideal match',
    body: 'Launch placeholder for weather, tides, and trip-fit filtering until utility integrations are wired.'
  },
  planningCtaBlock: {
    headline: 'Get local tide, event, and travel tips.',
    body: 'Launch placeholder for the hidden beaches lead magnet and email capture flow.',
    buttonLabel: 'Sign up free',
    buttonUrl: '/guides'
  }
}

const extractSlugFromPath = (path: string | undefined): string | null => {
  if (!path) {
    return null
  }

  const parts = path.split('/').filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : null
}

const toPayloadMediaUrl = (pathOrUrl: string | null | undefined): string | null => {
  if (!pathOrUrl) {
    return null
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  const payloadBase = process.env.PAYLOAD_PUBLIC_SERVER_URL
  if (!payloadBase) {
    return pathOrUrl
  }

  return `${payloadBase.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

type HomepageRouteModel = {
  settings: SiteSettingsGlobal
  homepage: NormalizedHomepage
  featuredCities: NormalizedCity[]
  featuredCategories: NormalizedCategory[]
  compareCities: NormalizedCity[]
  editorsChoiceListings: NormalizedListing[]
  coastalPulseGuides: NormalizedGuide[]
  coastalPulseEvents: NormalizedEvent[]
  planningItinerary: NormalizedItinerary | null
}

const loadHomepageRouteModel = async (): Promise<HomepageRouteModel> => {
  const [settingsResult, homepageResult] = await Promise.allSettled([getSiteSettings(), getHomepageData()])

  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : fallbackSiteSettings
  const homepage = homepageResult.status === 'fulfilled' ? homepageResult.value : fallbackHomepage

  const featuredCitySlugs = homepage.featuredCities.map((city) => city.slug)
  const featuredCategorySlugs = homepage.featuredCategories.map((category) => category.slug)

  const [featuredCityResults, featuredCategoryResults, compareCityResults, editorsChoiceResults, guideResults, eventResults, itineraryResult] =
    await Promise.all([
      Promise.all(featuredCitySlugs.map((slug) => getCityBySlug(slug))),
      Promise.all(featuredCategorySlugs.map((slug) => getCategoryBySlug(slug))),
      Promise.all(DESTINATION_COMPARE_CITY_SLUGS.map((slug) => getCityBySlug(slug))),
      Promise.all(EDITORS_CHOICE_LISTING_SLUGS.map((slug) => getListingBySlug(slug))),
      Promise.all(COASTAL_PULSE_GUIDE_SLUGS.map((slug) => getGuideBySlug(slug))),
      Promise.all(COASTAL_PULSE_EVENT_SLUGS.map((slug) => getEventBySlug(slug))),
      getItineraryBySlug(extractSlugFromPath(homepage.heroCta?.url ?? homepage.planningCtaBlock?.buttonUrl ?? undefined) ?? undefined)
    ])

  return {
    settings,
    homepage,
    featuredCities: featuredCityResults.filter((city): city is NormalizedCity => city !== null),
    featuredCategories: featuredCategoryResults.filter((category): category is NormalizedCategory => category !== null),
    compareCities: compareCityResults.filter((city): city is NormalizedCity => city !== null),
    editorsChoiceListings: editorsChoiceResults.filter((listing): listing is NormalizedListing => listing !== null),
    coastalPulseGuides: guideResults.filter((guide): guide is NormalizedGuide => guide !== null),
    coastalPulseEvents: eventResults.filter((event): event is NormalizedEvent => event !== null),
    planningItinerary: itineraryResult
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const model = await loadHomepageRouteModel()
  const viewModel = buildHomepageViewModel(model)

  return createMetadata(
    {
      title: model.settings.defaultSeo.title,
      description: viewModel.hero.summary || model.settings.defaultSeo.description,
      path: '/',
      imageUrl: toPayloadMediaUrl(viewModel.hero.image?.url)
    },
    model.settings
  )
}

export default async function HomePage() {
  const routeModel = await loadHomepageRouteModel()
  const viewModel = buildHomepageViewModel(routeModel)
  const websiteJsonLd = buildWebsiteJsonLd(routeModel.settings)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomepagePage model={viewModel} resolveMediaUrl={toPayloadMediaUrl} />
    </>
  )
}
