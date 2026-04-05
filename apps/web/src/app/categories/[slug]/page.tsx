import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { FaqAccordion } from '../../../components/primitives/faq-accordion'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getCategories, getCategoryBySlug, getGuides, getListingsByCategory, getSiteSettings } from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedCategory, NormalizedGuide, NormalizedListing, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    city?: string | string[]
  }>
}

type RelatedCity = {
  slug: string
  name: string
  summary: string
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast category planning with curated listings, related cities, and editorial pathways.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
    phone: null
  }
}

const categoryEditorialCopy: Record<string, { planningNote: string; comparisonNote: string }> = {
  hotels: {
    planningNote:
      'Use this hotels hub to compare oceanfront access, practical booking fit, and trip-base convenience across launch towns.',
    comparisonNote:
      'Prioritize location and parking confidence, then compare amenities and shoulder-season value.'
  },
  campgrounds: {
    planningNote:
      'Use this campgrounds hub to compare tent, RV, and state-park style options with a city-by-city planning lens.',
    comparisonNote:
      'Compare reservation windows and site style before optimizing for add-on amenities.'
  },
  beaches: {
    planningNote:
      'Use this beaches hub to evaluate easy-access shore stops, scenic landmarks, and nearby dining or stay options.',
    comparisonNote:
      'Compare beach access logistics and safety context before adding optional activity stops.'
  },
  'whale-watching': {
    planningNote:
      'Use this whale-watching hub to compare shoreline viewpoints, seasonal timing assumptions, and nearby city bases.',
    comparisonNote:
      'Pair migration-season assumptions with weather and visibility checks before final routing.'
  },
  restaurants: {
    planningNote:
      'Use this restaurants hub to compare dining clusters by city and connect meal planning to nearby attractions.',
    comparisonNote:
      'Prioritize location and opening-hour reliability before choosing by cuisine preference.'
  }
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

const getRelatedCities = (listings: NormalizedListing[]): RelatedCity[] => {
  const related = new Map<string, RelatedCity>()

  for (const listing of listings) {
    const cityRef = listing.city
    if (!cityRef) {
      continue
    }

    related.set(cityRef.slug, {
      slug: cityRef.slug,
      name: cityRef.label,
      summary: 'City summary is available on the city detail page.'
    })
  }

  return [...related.values()].sort((a, b) => a.name.localeCompare(b.name))
}

const getRelatedGuides = (guides: NormalizedGuide[], categorySlug: string): NormalizedGuide[] => {
  return guides.filter((guide) => guide.relatedCategories.some((category) => category.slug === categorySlug)).slice(0, 6)
}

const buildFaq = (category: NormalizedCategory, listingCount: number, relatedCities: RelatedCity[]) => {
  const topCities = relatedCities.slice(0, 3).map((city) => city.name).join(', ')

  return [
    {
      question: `What is included in the ${category.name} category?`,
      answer: `Published listings tagged "${category.name}" in Payload appear here. Use category-tagged published listings to keep this section current.`
    },
    {
      question: `Which cities currently have ${category.name.toLowerCase()} listings?`,
      answer:
        relatedCities.length > 0
          ? `${relatedCities.length} city pages are currently connected, including ${topCities}.`
          : 'No related cities are currently connected.'
    },
    {
      question: `How should I compare ${category.name.toLowerCase()} options on this page?`,
      answer: `Start with listing summaries and city context, then follow into listing detail routes for final comparison. Current published count: ${listingCount}.`
    }
  ]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, category] = await Promise.all([getSettings(), getCategoryBySlug(slug)])

  if (!category) {
    return createMetadata(
      {
        title: 'Category Not Found',
        description: 'The requested category page could not be found.',
        path: `/categories/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: category.seo.title,
      description: category.seo.description,
      path: `/categories/${category.slug}`
    },
    settings
  )
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const [categoryListings, guides, allCategories] = await Promise.all([
    getListingsByCategory(category.id, { limit: 120 }),
    getGuides({ limit: 120 }),
    getCategories({ sort: 'name', limit: 250 })
  ])

  const relatedCities = getRelatedCities(categoryListings)
  const relatedGuides = getRelatedGuides(guides, category.slug)
  const breadcrumbs = buildEntityBreadcrumbs('categories', category.name, category.slug)
  const editorialCopy = categoryEditorialCopy[category.slug]
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedCity = typeof resolvedSearchParams?.city === 'string' ? resolvedSearchParams.city : null
  const activeCityFilter = relatedCities.some((city) => city.slug === requestedCity) ? requestedCity : null
  const visibleListings = activeCityFilter
    ? categoryListings.filter((listing) => listing.city?.slug === activeCityFilter)
    : categoryListings

  const faqItems = buildFaq(category, categoryListings.length, relatedCities)
  const nearbyCategories = allCategories.filter((item) => item.slug !== category.slug).slice(0, 6)

  return (
    <>
      <section className="category-hero">
        <Container>
          <div className="category-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="category-hero-kicker">Category Hub</p>
            <h1 className="category-hero-title">{category.name}</h1>
            <p className="category-hero-summary">{category.description}</p>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading
          kicker="Category Intro"
          title={`Plan with the ${category.name} hub`}
          lede="Hybrid template: editorial category landing page plus practical listing directory paths."
        />
      </Section>

      <Section surface="muted">
        <div className="city-copy-grid">
          <article className="city-copy-card">
            <SectionHeading kicker="Editorial Copy" title={`How to use ${category.name}`} />
            <p className="city-copy-text">
              {editorialCopy?.planningNote ??
                `Use this ${category.name.toLowerCase()} hub to compare options by city and move into listing detail pages quickly.`}
            </p>
          </article>
          <article className="city-copy-card">
            <SectionHeading kicker="Comparison Note" title="What to compare first" />
            <p className="city-copy-text">
              {editorialCopy?.comparisonNote ??
                'Prioritize city fit and trip intent first, then compare listing-level details.'}
            </p>
          </article>
        </div>
      </Section>

      <Section>
        <SectionHeading
          kicker="Listing Grid"
          title={`${category.name} listings`}
          lede="Published listings are read from Payload and grouped in this category template."
        />
        <form action={`/categories/${category.slug}`} method="get" className="category-filter-form">
          <label htmlFor="category-city-filter">Filter by city</label>
          <select id="category-city-filter" name="city" defaultValue={activeCityFilter ?? ''}>
            <option value="">All related cities</option>
            {relatedCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
          <button type="submit" className="button-secondary">
            Apply
          </button>
          {activeCityFilter ? (
            <Link href={`/categories/${category.slug}`} className="city-inline-link">
              Clear filter
            </Link>
          ) : null}
        </form>
        <p className="category-results-meta">
          Showing {visibleListings.length} of {categoryListings.length} published listings.
        </p>
        {visibleListings.length ? (
          <div className="city-card-grid">
            {visibleListings.map((listing) => (
              <article key={listing.slug} className="city-listing-card">
                <p className="city-listing-kicker">{listing.city?.label ?? 'Oregon Coast'}</p>
                <h2 className="city-listing-title">{listing.name}</h2>
                <p className="city-listing-summary">{listing.summary}</p>
                <div className="city-listing-links">
                  <Link href={`/listings/${listing.slug}`} className="city-inline-link">
                    View listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No listings are currently tagged with this category.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Related Cities"
          title={`Cities connected to ${category.name}`}
          lede="Related city links are derived from published listings assigned to this category."
        />
        {relatedCities.length ? (
          <div className="category-city-grid">
            {relatedCities.map((city) => (
              <article key={city.slug} className="city-listing-card">
                <h2 className="city-listing-title">{city.name}</h2>
                <p className="city-listing-summary">{city.summary}</p>
                <Link href={`/cities/${city.slug}`} className="city-inline-link">
                  Open city page
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No related cities are currently available.</p>
        )}
      </Section>

      <Section>
        <SectionHeading kicker="FAQ" title={`${category.name} quick answers`} />
        <FaqAccordion items={faqItems} />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Internal Links"
          title="Continue to related guides and category paths"
          lede="Supports crawl pathways between category hubs, guides, and listings."
        />
        <div className="city-related-grid">
          <div>
            <h3 className="city-related-title">Guides</h3>
            {relatedGuides.length ? (
              <ul className="city-related-list">
                {relatedGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className="city-inline-link">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">No related guides are currently available.</p>
            )}
          </div>
          <div>
            <h3 className="city-related-title">Other Categories</h3>
            {nearbyCategories.length ? (
              <ul className="city-related-list">
                {nearbyCategories.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/categories/${item.slug}`} className="city-inline-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">No additional categories are currently available.</p>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
