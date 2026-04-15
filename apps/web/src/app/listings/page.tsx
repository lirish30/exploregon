import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getListings, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { NormalizedListing, SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

type ListingsIndexPageProps = {
  searchParams?: Promise<{
    q?: string | string[]
    city?: string | string[]
    category?: string | string[]
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Listings | ExplOregon Coast',
    description: 'Browse Oregon Coast listings by city, category, and planning intent.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial@exploregoncoast.com',
    phone: null
  }
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

const resolveSingleParam = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return (value[0] ?? '').trim()
  }

  return ''
}

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

const listingSearchText = (listing: NormalizedListing): string =>
  [
    listing.name,
    listing.summary,
    listing.description,
    listing.city?.label,
    listing.city?.slug,
    listing.region?.label,
    listing.region?.slug,
    ...listing.categories.map((category) => `${category.label} ${category.slug}`)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const filterListings = (listings: NormalizedListing[], query: string, city: string, category: string): NormalizedListing[] => {
  if (!query) {
    return listings.filter((listing) => {
      const cityMatches = !city || listing.city?.slug === city
      const categoryMatches = !category || listing.categories.some((item) => item.slug === category)
      return cityMatches && categoryMatches
    })
  }

  const tokens = tokenize(query)
  if (tokens.length === 0) {
    return listings
  }

  return listings.filter((listing) => {
    const cityMatches = !city || listing.city?.slug === city
    const categoryMatches = !category || listing.categories.some((item) => item.slug === category)
    if (!cityMatches || !categoryMatches) {
      return false
    }

    const haystack = listingSearchText(listing)
    return tokens.every((token) => haystack.includes(token))
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Oregon Coast Listings',
      description: 'Search and compare Oregon Coast listings by town, activity, and category.',
      path: '/listings'
    },
    settings
  )
}

export default async function ListingsIndexPage({ searchParams }: ListingsIndexPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const query = resolveSingleParam(resolvedSearchParams?.q)
  const requestedCity = resolveSingleParam(resolvedSearchParams?.city)
  const requestedCategory = resolveSingleParam(resolvedSearchParams?.category)
  const listings = await getListings({ sort: 'name', limit: 250 })

  const cityOptions = Array.from(
    new Map(
      listings
        .filter((listing): listing is NormalizedListing & { city: NonNullable<NormalizedListing['city']> } => listing.city !== null)
        .map((listing) => [listing.city.slug, listing.city.label])
    ).entries()
  )
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const categoryOptions = Array.from(
    new Map(listings.flatMap((listing) => listing.categories.map((category) => [category.slug, category.label]))).entries()
  )
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const activeCity = cityOptions.some((city) => city.slug === requestedCity) ? requestedCity : ''
  const activeCategory = categoryOptions.some((category) => category.slug === requestedCategory) ? requestedCategory : ''
  const visibleListings = filterListings(listings, query, activeCity, activeCategory)

  return (
    <>
      <PageHero
        kicker="Directory Listings"
        title="Search and compare Oregon Coast listings"
        description="Filter by city, category, and listing keywords to move from broad planning into final booking decisions."
        actions={[
          { label: 'Browse Categories', href: '/categories', variant: 'secondary' },
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Listings', href: '/listings' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Search"
          title="Find listings by town, activity, or place name"
          lede="Search checks listing names, summaries, city names, region labels, and category labels."
        />

        <form action="/listings" method="get" className="category-filter-form">
          <label htmlFor="listings-search-input">Search listings</label>
          <input
            id="listings-search-input"
            name="q"
            defaultValue={query}
            placeholder="Try Astoria, brewery, beach, hotel..."
          />
          <label htmlFor="listings-city-filter">City</label>
          <select id="listings-city-filter" name="city" defaultValue={activeCity}>
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.label}
              </option>
            ))}
          </select>
          <label htmlFor="listings-category-filter">Category</label>
          <select id="listings-category-filter" name="category" defaultValue={activeCategory}>
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
          <button type="submit" className="button-secondary">
            Search
          </button>
          {query || activeCity || activeCategory ? (
            <Link href="/listings" className="city-inline-link">
              Clear filters
            </Link>
          ) : null}
        </form>

        <p className="category-results-meta">
          {query || activeCity || activeCategory ? (
            <>
              Showing {visibleListings.length} of {listings.length} listings with current filters.
            </>
          ) : (
            <>Showing all {visibleListings.length} published listings.</>
          )}
        </p>

        {visibleListings.length ? (
          <div className="city-card-grid">
            {visibleListings.map((listing) => (
              <article key={listing.slug} className="city-listing-card">
                <p className="city-listing-kicker">
                  {listing.city?.label ?? 'Oregon Coast'}{listing.categories[0]?.label ? ` · ${listing.categories[0].label}` : ''}
                </p>
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
          <p className="city-empty">
            No listings match the current filters. Try a broader city, category, or search term.
          </p>
        )}
      </Section>
    </>
  )
}
