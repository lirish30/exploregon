import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getItineraries, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Itineraries | ExplOregon Coast',
    description: 'Browse ready-to-use Oregon Coast itinerary templates with stop lists and city context.'
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
      title: 'Oregon Coast Itineraries',
      description: 'Itinerary archive with structured trip lengths, stop lists, and related city pathways.',
      path: '/itineraries'
    },
    settings
  )
}

export default async function ItinerariesIndexPage() {
  const itineraries = await getItineraries({ limit: 120 })

  return (
    <>
      <PageHero
        kicker="Itineraries"
        title="Published trip routes for the Oregon Coast"
        description="Browse itinerary templates by trip length, then open full route detail pages with stop lists and related city links."
        actions={[
          { label: 'Browse Cities', href: '/cities', variant: 'secondary' },
          { label: 'Browse Guides', href: '/guides', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Itineraries', href: '/itineraries' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Archive"
          title="Published itinerary records"
          lede="Each itinerary includes trip length, stop sequence, and supporting body content managed in Payload."
        />

        {itineraries.length ? (
          <div className="city-card-grid">
            {itineraries.map((itinerary) => (
              <article key={itinerary.slug} className="city-listing-card">
                <p className="city-listing-kicker">{itinerary.tripLength}</p>
                <h2 className="city-listing-title">{itinerary.title}</h2>
                <p className="city-listing-summary">{itinerary.summary}</p>
                <p className="category-index-count">{itinerary.stops.length} mapped stops</p>
                <Link href={`/itineraries/${itinerary.slug}`} className="city-inline-link">
                  View itinerary
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">Itinerary archive placeholder: publish at least one itinerary in Payload.</p>
        )}
      </Section>
    </>
  )
}
