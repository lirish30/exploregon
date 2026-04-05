import type {
  NormalizedCategory,
  NormalizedCity,
  NormalizedEvent,
  NormalizedGuide,
  NormalizedHomepage,
  NormalizedItinerary,
  NormalizedListing,
  NormalizedMedia,
  SiteSettingsGlobal
} from '../../lib/types'

export type HomepageHeroLink = {
  label: string
  href: string
}

export type HomepageDestinationCard = {
  name: string
  href: string
  summary: string
  badges: string[]
  meta: Array<{ label: string; value: string }>
  image: NormalizedMedia | null
}

export type HomepageFilterGroup = {
  label: string
  options: string[]
}

export type HomepageMetricCard = {
  label: string
  value: string
  detail: string
}

export type HomepageEditorialCard = {
  eyebrow: string
  title: string
  summary: string
  href: string
  image: NormalizedMedia | null
}

export type HomepageListingCard = {
  name: string
  href: string
  city: string
  summary: string
  category: string
  image: NormalizedMedia | null
}

export type HomepagePlanningBanner = {
  title: string
  body: string
  button: HomepageHeroLink
}

export type HomepageViewModel = {
  settings: SiteSettingsGlobal
  hero: {
    eyebrow: string
    title: string
    summary: string
    image: NormalizedMedia | null
    primaryCta: HomepageHeroLink
    secondaryCta: HomepageHeroLink
    quickLinks: HomepageHeroLink[]
  }
  categoryHighlights: Array<{
    name: string
    description: string
    href: string
  }>
  destinationStrip: HomepageDestinationCard[]
  tripFinder: {
    title: string
    intro: string
    filters: HomepageFilterGroup[]
  }
  utilitySnapshot: {
    title: string
    intro: string
    metrics: HomepageMetricCard[]
    primaryLink: HomepageHeroLink
    secondaryLink: HomepageHeroLink
  }
  editorsChoice: HomepageListingCard[]
  coastalPulse: {
    title: string
    intro: string
    guides: HomepageEditorialCard[]
    events: HomepageEditorialCard[]
  }
  planningBanner: HomepagePlanningBanner
}

type BuildHomepageViewModelArgs = {
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

const toTitleCase = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const compact = <T>(items: Array<T | null | undefined>): T[] => items.filter((item): item is T => Boolean(item))

const categoryLinks = (categories: NormalizedCategory[]): HomepageHeroLink[] =>
  categories.slice(0, 6).map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`
  }))

const buildDestinationCard = (city: NormalizedCity): HomepageDestinationCard => ({
  name: city.name,
  href: `/cities/${city.slug}`,
  summary: city.summary,
  badges: city.featuredHighlights.slice(0, 2),
  meta: [
    {
      label: 'Base',
      value: city.region?.label ?? 'Oregon Coast'
    },
    {
      label: 'Best for',
      value: city.featuredHighlights[0] ?? 'Coastal planning'
    }
  ],
  image: city.heroImage
})

const buildListingCard = (listing: NormalizedListing): HomepageListingCard => ({
  name: listing.name,
  href: `/listings/${listing.slug}`,
  city: listing.city?.label ?? 'Oregon Coast',
  summary: listing.summary,
  category: listing.categories[0]?.label ?? 'Directory pick',
  image: listing.heroImage
})

const buildGuideCard = (guide: NormalizedGuide): HomepageEditorialCard => ({
  eyebrow: 'Guide',
  title: guide.title,
  summary: guide.excerpt,
  href: `/guides/${guide.slug}`,
  image: guide.heroImage
})

const formatEventDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Event'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const buildEventCard = (event: NormalizedEvent): HomepageEditorialCard => ({
  eyebrow: formatEventDate(event.startDate),
  title: event.title,
  summary: event.summary,
  href: `/events/${event.slug}`,
  image: event.heroImage
})

const buildTripFinderIntro = (homepage: NormalizedHomepage): string =>
  homepage.utilityTeaserBlock?.body ?? 'Use filters to narrow your route by city and category.'

export const buildHomepageViewModel = ({
  settings,
  homepage,
  featuredCities,
  featuredCategories,
  compareCities,
  editorsChoiceListings,
  coastalPulseGuides,
  coastalPulseEvents,
  planningItinerary
}: BuildHomepageViewModelArgs): HomepageViewModel => {
  const quickLinks = categoryLinks(featuredCategories)
  const heroImage = homepage.heroImage ?? featuredCities[0]?.heroImage ?? editorsChoiceListings[0]?.heroImage ?? planningItinerary?.heroImage ?? null

  return {
    settings,
    hero: {
      eyebrow: 'Oregon Coast Directory',
      title: homepage.heroHeadline,
      summary: homepage.heroSubheadline,
      image: heroImage,
      primaryCta: {
        label: homepage.heroCta?.label ?? 'Build a Trip',
        href: homepage.heroCta?.url ?? '/itineraries'
      },
      secondaryCta: {
        label: 'Browse the Coast Map',
        href: '/map'
      },
      quickLinks
    },
    categoryHighlights:
      featuredCategories.length > 0
        ? featuredCategories.slice(0, 5).map((category) => ({
            name: category.name,
            description: category.description,
            href: `/categories/${category.slug}`
          }))
        : [],
    destinationStrip:
      featuredCities.length > 0
        ? featuredCities.slice(0, 4).map(buildDestinationCard)
        : compareCities.slice(0, 4).map(buildDestinationCard),
    tripFinder: {
      title: homepage.utilityTeaserBlock?.headline ?? 'Find your ideal match',
      intro: buildTripFinderIntro(homepage),
      filters: [
        {
          label: 'City',
          options: featuredCities.map((city) => city.name)
        },
        {
          label: 'Category',
          options: featuredCategories.map((category) => category.name)
        }
      ].filter((group) => group.options.length > 0)
    },
    utilitySnapshot: {
      title: 'Coast conditions and timing',
      intro:
        homepage.editorialIntroBlock?.headline ??
        'Practical planning signals anchored by weather, tides, and seasonal editorial guidance.',
      metrics:
        compact([
          featuredCities[0]
            ? {
                label: 'Top basecamp',
                value: featuredCities[0].name,
                detail: featuredCities[0].summary
              }
            : null,
          coastalPulseEvents[0]
            ? {
                label: 'Next event',
                value: coastalPulseEvents[0].title,
                detail: formatEventDate(coastalPulseEvents[0].startDate)
              }
            : null,
          coastalPulseGuides[0]
            ? {
                label: 'Editor watch',
                value: toTitleCase(coastalPulseGuides[0].travelSeason),
                detail: coastalPulseGuides[0].title
              }
            : null
        ]).length > 0
          ? compact([
              featuredCities[0]
                ? {
                    label: 'Top basecamp',
                    value: featuredCities[0].name,
                    detail: featuredCities[0].summary
                  }
                : null,
              coastalPulseEvents[0]
                ? {
                    label: 'Next event',
                    value: coastalPulseEvents[0].title,
                    detail: formatEventDate(coastalPulseEvents[0].startDate)
                  }
                : null,
              coastalPulseGuides[0]
                ? {
                    label: 'Editor watch',
                    value: toTitleCase(coastalPulseGuides[0].travelSeason),
                    detail: coastalPulseGuides[0].title
                  }
                : null
            ])
          : [],
      primaryLink: {
        label: 'Weather + tides',
        href: '/weather-tides'
      },
      secondaryLink: {
        label: 'Open coast map',
        href: '/map'
      }
    },
    editorsChoice:
      editorsChoiceListings.length > 0
        ? editorsChoiceListings.slice(0, 4).map(buildListingCard)
        : compact([
            planningItinerary
              ? {
                  name: planningItinerary.title,
                  href: `/itineraries/${planningItinerary.slug}`,
                  city: 'Sample itinerary',
                  summary: planningItinerary.summary,
                  category: planningItinerary.tripLength,
                  image: planningItinerary.heroImage
                }
              : null
          ]),
    coastalPulse: {
      title: homepage.editorialIntroBlock?.headline ?? 'Coastal Pulse',
      intro: homepage.editorialIntroBlock?.body ?? 'Latest published guides and events.',
      guides: coastalPulseGuides.slice(0, 2).map(buildGuideCard),
      events: coastalPulseEvents.slice(0, 2).map(buildEventCard)
    },
    planningBanner: {
      title: homepage.planningCtaBlock?.headline ?? 'Get local tide, event, and travel tips.',
      body: homepage.planningCtaBlock?.body ?? 'Subscribe for planning updates and coast highlights.',
      button: {
        label: homepage.planningCtaBlock?.buttonLabel ?? 'Browse itineraries',
        href: homepage.planningCtaBlock?.buttonUrl ?? '/itineraries'
      }
    }
  }
}
