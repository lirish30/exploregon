import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getGuides, getItineraryBySlug, getSiteSettings } from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedGuide, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type ItineraryPageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast itinerary templates with stop lists and linked city context.'
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

const splitBody = (body: string): string[] => {
  return body
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

const getSettings = async (): Promise<SiteSettingsGlobal> => {
  try {
    return await getSiteSettings()
  } catch {
    return fallbackSettings
  }
}

const guidesForCities = (guides: NormalizedGuide[], citySlugs: Set<string>): NormalizedGuide[] => {
  return guides
    .filter((guide) => guide.relatedCities.some((city) => citySlugs.has(city.slug)))
    .slice(0, 4)
}

export async function generateMetadata({ params }: ItineraryPageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, itinerary] = await Promise.all([getSettings(), getItineraryBySlug(slug)])

  if (!itinerary) {
    return createMetadata(
      {
        title: 'Itinerary Not Found',
        description: 'The requested itinerary could not be found.',
        path: `/itineraries/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: itinerary.seo.title,
      description: itinerary.seo.description,
      path: `/itineraries/${itinerary.slug}`,
      imageUrl: toPayloadMediaUrl(itinerary.heroImage?.url)
    },
    settings
  )
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { slug } = await params
  const itinerary = await getItineraryBySlug(slug)

  if (!itinerary) {
    notFound()
  }

  const guides = await getGuides({ limit: 120 })
  const breadcrumbs = buildEntityBreadcrumbs('itineraries', itinerary.title, itinerary.slug)

  const heroImageUrl = toPayloadMediaUrl(itinerary.heroImage?.url)
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.18) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  const bodyParagraphs = splitBody(itinerary.body)
  const citySlugSet = new Set(itinerary.relatedCities.map((city) => city.slug))
  const relatedGuides = guidesForCities(guides, citySlugSet)

  return (
    <>
      <section className="itinerary-hero" style={{ backgroundImage: heroBackground }}>
        <Container>
          <div className="itinerary-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="itinerary-hero-kicker">{itinerary.tripLength}</p>
            <h1 className="itinerary-hero-title">{itinerary.title}</h1>
            <p className="itinerary-hero-summary">{itinerary.summary}</p>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading
          kicker="Trip Summary"
          title="Route overview"
          lede="Trip length and stop order are managed in Payload and rendered in this itinerary template."
        />
        <div className="itinerary-meta-row">
          <p>
            <strong>Trip length:</strong> {itinerary.tripLength}
          </p>
          <p>
            <strong>Stop count:</strong> {itinerary.stops.length}
          </p>
        </div>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Stop List"
          title="Planned stops"
          lede="Ordered stops linked to listing detail pages for practical planning."
        />
        {itinerary.stops.length ? (
          <ol className="itinerary-stop-list">
            {itinerary.stops.map((stop, index) => (
              <li key={stop.slug} className="itinerary-stop-item">
                <span className="itinerary-stop-index">Stop {index + 1}</span>
                <Link href={`/listings/${stop.slug}`} className="city-inline-link">
                  {stop.label}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="city-empty">Stop list placeholder: add at least one listing relationship in Payload.</p>
        )}
      </Section>

      <Section>
        <SectionHeading kicker="Body" title="Editorial itinerary notes" />
        <article className="editorial-body">
          {bodyParagraphs.length ? (
            bodyParagraphs.map((paragraph) => <p key={paragraph.slice(0, 28)}>{paragraph}</p>)
          ) : (
            <p>Body placeholder: add itinerary body content in Payload.</p>
          )}
        </article>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Related Cities"
          title="City pathways"
          lede="Connected city links for destination-level context and comparison."
        />
        {itinerary.relatedCities.length ? (
          <div className="city-link-row">
            {itinerary.relatedCities.map((city) => (
              <Link key={city.slug} href={`/cities/${city.slug}`} className="city-link-chip">
                {city.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Related cities placeholder: connect city relationships in Payload.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Internal Links"
          title="Related planning guides"
          lede="Internal linking module to guides sharing related city context."
        />
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
          <p className="city-empty">Related guide placeholder: add city-linked guides in Payload.</p>
        )}
      </Section>
    </>
  )
}
