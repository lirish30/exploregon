import type { Metadata } from 'next'

import { HomepagePage } from '../components/home/homepage-page'
import { buildHomepageViewModel } from '../components/home/homepage-view-model'
import {
  getCities,
  getCategories,
  getUpcomingEvents,
  getGuides,
  getCategoryBySlug,
  getCityBySlug,
  getHomepageData,
  getItineraryBySlug,
  getItineraries,
  getListings,
  getSiteSettings
} from '../lib/api'
import { toPayloadMediaUrl } from '../lib/schema'
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

const extractSlugFromPath = (path: string | undefined): string | null => {
  if (!path) {
    return null
  }

  const parts = path.split('/').filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : null
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

const loadHomepageRouteModelImpl = async (): Promise<HomepageRouteModel> => {
  const [settings, homepage] = await Promise.all([
    getSiteSettings({ revalidate: 300 }),
    getHomepageData({ revalidate: 60 })
  ])

  const featuredCitySlugs = homepage.featuredCities.map((city) => city.slug)
  const featuredCategorySlugs = homepage.featuredCategories.map((category) => category.slug)
  const itinerarySlugFromCta = extractSlugFromPath(
    homepage.heroCta?.url?.startsWith('/itineraries/') ? homepage.heroCta.url : homepage.planningCtaBlock?.buttonUrl
  )

  const [
    featuredCityResults,
    featuredCategoryResults,
    fallbackCities,
    fallbackCategories,
    editorsChoiceListings,
    coastalPulseGuides,
    coastalPulseEvents,
    itineraryFromCta,
    fallbackItineraries
  ] = await Promise.all([
    Promise.all(featuredCitySlugs.map((slug) => getCityBySlug(slug, { revalidate: 60 }))),
    Promise.all(featuredCategorySlugs.map((slug) => getCategoryBySlug(slug, { revalidate: 60 }))),
    getCities({ limit: 4, revalidate: 60 }),
    getCategories({ limit: 6, revalidate: 60 }),
    getListings({ limit: 4, sort: '-updatedAt' }),
    getGuides({ limit: 2, sort: '-updatedAt' }),
    getUpcomingEvents({ limit: 2, sort: 'startDate' }),
    itinerarySlugFromCta ? getItineraryBySlug(itinerarySlugFromCta, { revalidate: 60 }) : Promise.resolve(null),
    getItineraries({ limit: 1, sort: '-updatedAt' })
  ])

  const resolvedFeaturedCities = featuredCityResults.filter((city): city is NormalizedCity => city !== null)
  const resolvedFeaturedCategories = featuredCategoryResults.filter((category): category is NormalizedCategory => category !== null)

  return {
    settings,
    homepage,
    featuredCities: resolvedFeaturedCities.length > 0 ? resolvedFeaturedCities : fallbackCities,
    featuredCategories: resolvedFeaturedCategories.length > 0 ? resolvedFeaturedCategories : fallbackCategories,
    compareCities: resolvedFeaturedCities.length > 0 ? resolvedFeaturedCities : fallbackCities,
    editorsChoiceListings,
    coastalPulseGuides,
    coastalPulseEvents,
    planningItinerary: itineraryFromCta ?? fallbackItineraries[0] ?? null
  }
}

const loadHomepageRouteModel = loadHomepageRouteModelImpl

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
