import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { CtaBlock } from '../../../components/primitives/cta-block'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getEventBySlug, getEventsByCity, getSiteSettings } from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type EventPageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast event templates with location context and outbound event links.'
  },
  socialLinks: [],
  contact: {
    email: 'editorial-placeholder@exploregoncoast.com',
    phone: null
  }
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

const formatDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date placeholder'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const formatDateRange = (startDate: string, endDate: string | null): string => {
  if (!endDate) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, event] = await Promise.all([getSettings(), getEventBySlug(slug)])

  if (!event) {
    return createMetadata(
      {
        title: 'Event Not Found',
        description: 'The requested event could not be found.',
        path: `/events/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: event.seo.title,
      description: event.seo.description,
      path: `/events/${event.slug}`,
      imageUrl: toPayloadMediaUrl(event.heroImage?.url)
    },
    settings
  )
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const relatedEvents = event.city
    ? (await getEventsByCity(event.city.id, { limit: 10 })).filter((item) => item.slug !== event.slug).slice(0, 4)
    : []

  const breadcrumbs = buildEntityBreadcrumbs('events', event.title, event.slug)
  const heroImageUrl = toPayloadMediaUrl(event.heroImage?.url)
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.18) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  return (
    <>
      <section className="event-hero" style={{ backgroundImage: heroBackground }}>
        <Container>
          <div className="event-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="event-hero-kicker">{formatDateRange(event.startDate, event.endDate)}</p>
            <h1 className="event-hero-title">{event.title}</h1>
            <p className="event-hero-summary">{event.summary}</p>
            <div className="event-hero-chips">
              {event.city ? <Link href={`/cities/${event.city.slug}`}>{event.city.label}</Link> : null}
              {event.region ? <Link href={`/regions/${event.region.slug}`}>{event.region.label}</Link> : null}
              <span>{event.venue}</span>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading kicker="Event Detail" title="Summary and description" lede={event.description} />
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Context"
          title="City and region context"
          lede="Location context supports nearby discovery and practical trip planning."
        />
        <div className="listing-context-row">
          <p>
            <strong>City:</strong>{' '}
            {event.city ? <Link href={`/cities/${event.city.slug}`}>{event.city.label}</Link> : 'City placeholder'}
          </p>
          <p>
            <strong>Region:</strong>{' '}
            {event.region ? <Link href={`/regions/${event.region.slug}`}>{event.region.label}</Link> : 'Region placeholder'}
          </p>
          <p>
            <strong>Venue:</strong> {event.venue}
          </p>
          <p>
            <strong>Date:</strong> {formatDateRange(event.startDate, event.endDate)}
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading
          kicker="Outbound Link"
          title="Official event source"
          lede="Primary outbound CTA to the event organizer's official page."
        />
        {event.eventUrl ? (
          <CtaBlock
            title="View official event details"
            body="Use the official listing for tickets, registration, and latest schedule updates."
            buttonLabel="Open Event Website"
            buttonHref={event.eventUrl}
          />
        ) : (
          <p className="city-empty">Event URL placeholder: add an official event URL in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Internal Links"
          title="More events in this city"
          lede="Internal module for additional published events sharing the same city relationship."
        />
        {relatedEvents.length ? (
          <div className="city-card-grid">
            {relatedEvents.map((item) => (
              <article key={item.slug} className="city-listing-card">
                <p className="city-listing-kicker">{formatDate(item.startDate)}</p>
                <h2 className="city-listing-title">{item.title}</h2>
                <p className="city-listing-summary">{item.summary}</p>
                <Link href={`/events/${item.slug}`} className="city-inline-link">
                  View event
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="city-empty">Related events placeholder: add more published events for this city.</p>
        )}
      </Section>
    </>
  )
}
