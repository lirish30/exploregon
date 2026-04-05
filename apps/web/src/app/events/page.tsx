import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { SectionHeading } from '../../components/primitives/section-heading'
import { getEvents, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Oregon Coast Events | ExplOregon Coast',
    description: 'Browse upcoming Oregon Coast events with city and venue context.'
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

const formatDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  return createMetadata(
    {
      title: 'Oregon Coast Events',
      description: 'Event archive for festivals, seasonal happenings, and city-level planning updates.',
      path: '/events'
    },
    settings
  )
}

export default async function EventsIndexPage() {
  const events = await getEvents({ limit: 60 })

  return (
    <>
      <PageHero
        kicker="Events"
        title="Upcoming Oregon Coast events"
        description="Browse published events by date with city and venue context, then open individual event detail pages for full descriptions."
        actions={[
          { label: 'Browse Guides', href: '/guides', variant: 'secondary' },
          { label: 'Browse Itineraries', href: '/itineraries', variant: 'secondary' }
        ]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Events', href: '/events' }
            ]}
          />
        </div>

        <SectionHeading
          kicker="Archive"
          title="Published event records"
          lede="Events are pulled from Payload with date, place, and outbound registration link context."
        />

        {events.length ? (
          <div className="city-card-grid">
            {events.map((event) => (
              <article key={event.slug} className="city-listing-card">
                <p className="city-listing-kicker">{formatDate(event.startDate)}</p>
                <h2 className="city-listing-title">{event.title}</h2>
                <p className="city-listing-summary">{event.summary}</p>
                <p className="category-index-count">
                  {event.city?.label ?? 'Not set'} · {event.venue}
                </p>
                <Link href={`/events/${event.slug}`} className="city-inline-link">
                  View event
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">No published events are available yet.</p>
        )}
      </Section>
    </>
  )
}
