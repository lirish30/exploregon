import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getCategories, getListings, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { NormalizedListing, SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Categories | ExplOregon Coast',
    description: 'Browse Oregon Coast category hubs for stays, activities, and practical trip planning.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial-placeholder@exploregoncoast.com',
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

const listingCountByCategory = (listings: NormalizedListing[]): Map<string, number> => {
  const countMap = new Map<string, number>()

  for (const listing of listings) {
    for (const category of listing.categories) {
      const current = countMap.get(category.slug) ?? 0
      countMap.set(category.slug, current + 1)
    }
  }

  return countMap
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Oregon Coast Category Hubs',
      description: 'Browse listing categories like hotels, campgrounds, beaches, whale watching, and restaurants.',
      path: '/categories'
    },
    settings
  )
}

export default async function CategoriesIndexPage() {
  const [categories, listings] = await Promise.all([getCategories({ sort: 'name', limit: 250 }), getListings({ limit: 250 })])
  const categoryCounts = listingCountByCategory(listings)

  return (
    <>
      <PageHero
        kicker="Category Hubs"
        title="Browse the coast by stay type, activity, and trip intent"
        description="Each category hub combines structured listings with editorial context so users can compare options across towns."
        actions={[
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' },
          { label: 'Open Coast Map', href: '/map', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Categories', href: '/categories' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Directory Intro"
          title="Editorial landing pages with practical listing paths"
          lede="Category pages are scoped to published Payload data and support internal links into cities, guides, and listing detail routes."
        />

        {categories.length ? (
          <div className="cities-index-grid">
            {categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="cities-index-card">
                <p className="cities-index-card-region">{category.icon}</p>
                <h2 className="cities-index-card-title">{category.name}</h2>
                <p className="cities-index-card-summary">{category.description}</p>
                <p className="category-index-count">{categoryCounts.get(category.slug) ?? 0} published listings</p>
                <p className="cities-index-card-link">Open category hub</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="cities-index-empty">Category index placeholder: add listing categories in Payload.</p>
        )}
      </Section>
    </>
  )
}
