import Link from 'next/link'
import type { Metadata } from 'next'

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
import type { NormalizedCategory, NormalizedCity, NormalizedEvent, NormalizedGuide, NormalizedHomepage, NormalizedItinerary, NormalizedListing, SiteSettingsGlobal } from '../lib/types'

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
  heroHeadline: 'Plan the Oregon Coast with trusted local structure, not guesswork.',
  heroSubheadline:
    'Launch placeholder: discover where to stay, what to do, and which coastal towns fit your trip style using curated directory data and practical planning tools.',
  heroCta: {
    label: 'Start with Cities',
    url: '/cities'
  },
  featuredCities: [],
  featuredCategories: [],
  editorialIntroBlock: {
    headline: 'Coastal Pulse and Editors Choice',
    body: 'Launch placeholder for editorial highlights until full module data is available.'
  },
  utilityTeaserBlock: {
    headline: 'Real-Time Dashboard Teaser',
    body: 'Launch placeholder for weather, tides, and map signals.'
  },
  planningCtaBlock: {
    headline: 'Trip Planning Teaser',
    body: 'Use editorial itinerary structure and city/category pages to build a practical coast route.',
    buttonLabel: 'View Seed Itinerary',
    buttonUrl: '/itineraries/3-day-oregon-coast-weekend-itinerary'
  }
}

const extractSlugFromPath = (path: string | undefined): string | null => {
  if (!path) {
    return null
  }

  const parts = path.split('/').filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 1] : null
}

const formatEventDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date placeholder'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
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

type HomepageViewModel = {
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

const loadHomepageViewModel = async (): Promise<HomepageViewModel> => {
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
      getItineraryBySlug(extractSlugFromPath(homepage.planningCtaBlock?.buttonUrl ?? undefined) ?? undefined)
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
  const model = await loadHomepageViewModel()

  return createMetadata(
    {
      title: model.settings.defaultSeo.title,
      description: model.homepage.heroSubheadline || model.settings.defaultSeo.description,
      path: '/'
    },
    model.settings
  )
}

export default async function HomePage() {
  const model = await loadHomepageViewModel()
  const websiteJsonLd = buildWebsiteJsonLd(model.settings)
  const heroMediaUrl = toPayloadMediaUrl(
    model.featuredCities[0]?.heroImage?.url ??
      model.editorsChoiceListings[0]?.heroImage?.url ??
      model.planningItinerary?.heroImage?.url
  )
  const heroBackground = heroMediaUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.24) 0%, rgba(8, 39, 47, 0.64) 100%), url('${heroMediaUrl}')`
    : `linear-gradient(180deg, rgba(8, 39, 47, 0.24) 0%, rgba(8, 39, 47, 0.64) 100%)`

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="home-hero">
        <div className="container">
          <div className="home-hero-layout">
            <div className="home-hero-media" aria-hidden="true" style={{ backgroundImage: heroBackground }} />
            <div className="home-hero-content">
              <p className="home-kicker">Oregon Coast Directory</p>
              <h1 className="home-hero-title">{model.homepage.heroHeadline}</h1>
              <p className="home-hero-copy">{model.homepage.heroSubheadline}</p>
              <form className="home-search" action="/listings" method="get">
                <label htmlFor="home-search-q" className="sr-only">
                  Search listings
                </label>
                <input
                  id="home-search-q"
                  name="q"
                  className="home-search-input"
                  placeholder="Search city, listing, or category"
                />
                <label htmlFor="home-search-city" className="sr-only">
                  Filter by city
                </label>
                <select id="home-search-city" name="city" className="home-search-select" defaultValue="">
                  <option value="">All cities</option>
                  {model.featuredCities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="home-search-category" className="sr-only">
                  Filter by category
                </label>
                <select id="home-search-category" name="category" className="home-search-select" defaultValue="">
                  <option value="">All categories</option>
                  {model.featuredCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="button-primary">
                  Browse Coast Data
                </button>
              </form>
              <div className="home-hero-actions">
                <Link href={model.homepage.heroCta?.url ?? '/cities'} className="button-secondary">
                  {model.homepage.heroCta?.label ?? 'Start with Cities'}
                </Link>
                <Link href="/map" className="button-secondary">
                  Open Coast Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-section-tight">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading-kicker">Browse Fast</p>
            <h2 className="section-heading-title">Category shortcuts</h2>
          </div>
          <div className="home-category-grid">
            {model.featuredCategories.length > 0 ? (
              model.featuredCategories.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`} className="home-category-tile">
                  <p className="home-category-name">{category.name}</p>
                  <p className="home-category-copy">{category.description}</p>
                </Link>
              ))
            ) : (
              <div className="home-placeholder">Category data placeholder: seed featured categories in Payload homepage global.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading-kicker">Top Coastal Towns</p>
            <h2 className="section-heading-title">Featured city cards</h2>
          </div>
          <div className="home-city-grid">
            {model.featuredCities.length > 0 ? (
              model.featuredCities.map((city) => (
                <article key={city.slug} className="home-city-card">
                  <p className="home-city-region">{city.region?.label ?? 'Oregon Coast'}</p>
                  <h3 className="home-city-name">{city.name}</h3>
                  <p className="home-city-summary">{city.summary}</p>
                  <div className="home-chip-row">
                    {city.featuredHighlights.slice(0, 2).map((highlight) => (
                      <span className="chip" key={`${city.slug}-${highlight}`}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <Link href={`/cities/${city.slug}`} className="home-inline-link">
                    Explore {city.name}
                  </Link>
                </article>
              ))
            ) : (
              <div className="home-placeholder">City data placeholder: seed featured cities in Payload homepage global.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-surface">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading-kicker">Choose Your Base</p>
            <h2 className="section-heading-title">Destination comparison</h2>
            <p className="section-heading-lede">Seeded launch comparison for planning North vs Central Coast trip style.</p>
          </div>
          <div className="home-compare-grid">
            {model.compareCities.length > 0 ? (
              model.compareCities.map((city) => (
                <article key={city.slug} className="home-compare-card">
                  <h3>{city.name}</h3>
                  <p>{city.summary}</p>
                  <p className="home-compare-meta">Best for</p>
                  <ul>
                    {city.featuredHighlights.slice(0, 3).map((highlight) => (
                      <li key={`${city.slug}-${highlight}`}>{highlight}</li>
                    ))}
                  </ul>
                </article>
              ))
            ) : (
              <div className="home-placeholder">Comparison data placeholder: city records are unavailable.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="home-dashboard-teaser">
            <div>
              <p className="section-heading-kicker">Live Planning Signals</p>
              <h2 className="section-heading-title">{model.homepage.utilityTeaserBlock?.headline ?? 'Real-Time Dashboard Teaser'}</h2>
              <p className="home-dashboard-copy">
                {model.homepage.utilityTeaserBlock?.body ??
                  'Placeholder utility summary until weather and tides module fields are modeled in CMS.'}
              </p>
              <div className="home-hero-actions">
                <Link href="/map" className="button-primary">
                  Open Live Map
                </Link>
                <Link href="/weather-tides#weather" className="button-secondary">
                  Weather Snapshot
                </Link>
                <Link href="/weather-tides#tides" className="button-secondary">
                  Tide Snapshot
                </Link>
              </div>
            </div>
            <div className="home-dashboard-panel" aria-hidden="true">
              <p>Today on the coast</p>
              <ul>
                <li>Weather feed: Pending model wiring (Placeholder)</li>
                <li>Tide feed: Pending model wiring (Placeholder)</li>
                <li>Whale migration pulse: Seed editorial teaser</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section section-surface">
        <div className="container">
          <article className="home-planning-cta">
            <div>
              <p className="section-heading-kicker">Build a Better Weekend</p>
              <h2 className="section-heading-title">{model.homepage.planningCtaBlock?.headline ?? 'Trip Planning Teaser'}</h2>
              <p>{model.homepage.planningCtaBlock?.body}</p>
              {model.planningItinerary ? (
                <p className="home-planning-itinerary-note">
                  Seed itinerary: <strong>{model.planningItinerary.title}</strong> ({model.planningItinerary.tripLength})
                </p>
              ) : null}
              <div className="home-hero-actions">
                <Link href={model.homepage.planningCtaBlock?.buttonUrl ?? '/itineraries'} className="button-primary">
                  {model.homepage.planningCtaBlock?.buttonLabel ?? 'View Itinerary'}
                </Link>
                <Link href="/cities" className="button-secondary">
                  Browse by City
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading-kicker">Staff Curated</p>
            <h2 className="section-heading-title">Editor's choice directory cards</h2>
          </div>
          <div className="home-editor-grid">
            {model.editorsChoiceListings.length > 0 ? (
              model.editorsChoiceListings.map((listing) => (
                <article key={listing.slug} className="home-editor-card">
                  <p className="home-editor-city">{listing.city?.label ?? 'Oregon Coast'}</p>
                  <h3>{listing.name}</h3>
                  <p>{listing.summary}</p>
                  <Link href={`/listings/${listing.slug}`} className="home-inline-link">
                    Open listing
                  </Link>
                </article>
              ))
            ) : (
              <div className="home-placeholder">Editor's choice placeholder: listing records unavailable.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section section-surface">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading-kicker">Coastal Pulse</p>
            <h2 className="section-heading-title">Editorial preview</h2>
            <p className="section-heading-lede">
              {model.homepage.editorialIntroBlock?.body ?? 'Placeholder editorial intro until additional homepage fields are modeled.'}
            </p>
          </div>
          <div className="home-pulse-layout">
            <div className="home-pulse-guides">
              {model.coastalPulseGuides.map((guide) => (
                <article key={guide.slug} className="home-pulse-guide-card">
                  <p className="home-pulse-tag">Guide</p>
                  <h3>{guide.title}</h3>
                  <p>{guide.excerpt}</p>
                  <Link href={`/guides/${guide.slug}`} className="home-inline-link">
                    Read guide
                  </Link>
                </article>
              ))}
              {model.coastalPulseGuides.length === 0 ? (
                <div className="home-placeholder">Editorial guide placeholder: guide records unavailable.</div>
              ) : null}
            </div>
            <div className="home-pulse-events">
              {model.coastalPulseEvents.map((event) => (
                <article key={event.slug} className="home-pulse-event-card">
                  <p className="home-pulse-date">{formatEventDate(event.startDate)}</p>
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                  <Link href={`/events/${event.slug}`} className="home-inline-link">
                    View event
                  </Link>
                </article>
              ))}
              {model.coastalPulseEvents.length === 0 ? (
                <div className="home-placeholder">Event placeholder: launch event records unavailable.</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="newsletter home-newsletter">
            <div className="newsletter-inner">
              <h2 className="newsletter-title">Get local tide, event, and travel tips.</h2>
              <p className="newsletter-copy">
                Free launch lead magnet: Hidden Beaches Map (placeholder offer text until email system modeling is finalized).
              </p>
              <form className="newsletter-form" action="#" method="post">
                <label htmlFor="newsletter-email-home" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email-home"
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="input-field"
                />
                <button type="submit" className="button-primary">
                  Send Me the Map
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
