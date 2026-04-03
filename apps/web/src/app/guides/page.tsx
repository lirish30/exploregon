import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getGuides, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Guides | ExplOregon Coast',
    description: 'Browse editorial Oregon Coast travel guides by city context and seasonal planning intent.'
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Oregon Coast Travel Guides',
      description: 'Editorial guide archive for seasonal planning, destination fit, and practical trip decisions.',
      path: '/guides'
    },
    settings
  )
}

export default async function GuidesIndexPage() {
  const guides = await getGuides({ limit: 120 })

  return (
    <>
      <PageHero
        kicker="Editorial Guides"
        title="Planning-first Oregon Coast guide archive"
        description="Browse published guides with direct links into city and category pathways, then continue into events and itineraries."
        actions={[
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' },
          { label: 'Browse Events', href: '/events', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Guides', href: '/guides' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Archive"
          title="Published guide articles"
          lede="Each guide detail template includes related cities, related categories, and internal planning links."
        />

        {guides.length ? (
          <div className="city-card-grid">
            {guides.map((guide) => (
              <article key={guide.slug} className="city-listing-card">
                <p className="city-listing-kicker">{guide.travelSeason}</p>
                <h2 className="city-listing-title">{guide.title}</h2>
                <p className="city-listing-summary">{guide.excerpt}</p>
                <Link href={`/guides/${guide.slug}`} className="city-inline-link">
                  Read guide
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">Guide archive placeholder: publish at least one guide in Payload.</p>
        )}
      </Section>
    </>
  )
}
