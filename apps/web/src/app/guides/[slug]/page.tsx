import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../../components/primitives/breadcrumbs'
import { Container } from '../../../components/primitives/container'
import { Section } from '../../../components/primitives/section'
import { SectionHeading } from '../../../components/primitives/section-heading'
import { getGuideBySlug, getGuides, getItineraries, getSiteSettings } from '../../../lib/api'
import { buildEntityBreadcrumbs, createMetadata } from '../../../lib/seo'
import type { NormalizedGuide, NormalizedItinerary, SiteSettingsGlobal } from '../../../lib/types'

export const revalidate = 300

type GuidePageProps = {
  params: Promise<{
    slug: string
  }>
}

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast guide templates with city/category context and internal planning links.'
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

const relatedItineraries = (itineraries: NormalizedItinerary[], guide: NormalizedGuide): NormalizedItinerary[] => {
  const citySlugs = new Set(guide.relatedCities.map((city) => city.slug))

  return itineraries
    .filter((itinerary) => itinerary.relatedCities.some((city) => citySlugs.has(city.slug)))
    .slice(0, 4)
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const [settings, guide] = await Promise.all([getSettings(), getGuideBySlug(slug)])

  if (!guide) {
    return createMetadata(
      {
        title: 'Guide Not Found',
        description: 'The requested guide could not be found.',
        path: `/guides/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: guide.seo.title,
      description: guide.seo.description,
      path: `/guides/${guide.slug}`,
      imageUrl: toPayloadMediaUrl(guide.heroImage?.url)
    },
    settings
  )
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = await getGuideBySlug(slug)

  if (!guide) {
    notFound()
  }

  const [guides, itineraries] = await Promise.all([getGuides({ limit: 120 }), getItineraries({ limit: 120 })])
  const breadcrumbs = buildEntityBreadcrumbs('guides', guide.title, guide.slug)
  const heroImageUrl = toPayloadMediaUrl(guide.heroImage?.url)
  const heroBackground = heroImageUrl
    ? `linear-gradient(180deg, rgba(8, 39, 47, 0.18) 0%, rgba(8, 39, 47, 0.72) 100%), url('${heroImageUrl}')`
    : 'linear-gradient(166deg, rgba(7, 52, 62, 0.9), rgba(12, 47, 56, 0.75)), #173f49'

  const bodyParagraphs = splitBody(guide.body)
  const moreGuides = guides.filter((item) => item.slug !== guide.slug).slice(0, 4)
  const linkedItineraries = relatedItineraries(itineraries, guide)

  return (
    <>
      <section className="guide-hero" style={{ backgroundImage: heroBackground }}>
        <Container>
          <div className="guide-hero-inner">
            <Breadcrumbs items={breadcrumbs} />
            <p className="guide-hero-kicker">{guide.travelSeason}</p>
            <h1 className="guide-hero-title">{guide.title}</h1>
            <p className="guide-hero-summary">{guide.excerpt}</p>
          </div>
        </Container>
      </section>

      <Section>
        <SectionHeading kicker="Guide Body" title="Editorial detail" lede="Long-form guide content managed in Payload." />
        <article className="editorial-body">
          {bodyParagraphs.length ? (
            bodyParagraphs.map((paragraph) => <p key={paragraph.slice(0, 28)}>{paragraph}</p>)
          ) : (
            <p>Body placeholder: add guide body content in Payload.</p>
          )}
        </article>
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Related Cities"
          title="City pathways"
          lede="Connected city links for internal navigation and geographic context."
        />
        {guide.relatedCities.length ? (
          <div className="city-link-row">
            {guide.relatedCities.map((city) => (
              <Link key={city.slug} href={`/cities/${city.slug}`} className="city-link-chip">
                {city.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Related cities placeholder: connect city references in Payload.</p>
        )}
      </Section>

      <Section>
        <SectionHeading
          kicker="Related Categories"
          title="Category pathways"
          lede="Connected category links to move readers from editorial context into listing hubs."
        />
        {guide.relatedCategories.length ? (
          <div className="city-link-row">
            {guide.relatedCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="city-link-chip">
                {category.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="city-empty">Related categories placeholder: connect listing categories in Payload.</p>
        )}
      </Section>

      <Section surface="muted">
        <SectionHeading
          kicker="Internal Links"
          title="Continue planning"
          lede="Internal linking modules for adjacent guides and linked itineraries."
        />
        <div className="city-related-grid">
          <div>
            <h2 className="city-related-title">More guides</h2>
            {moreGuides.length ? (
              <ul className="city-related-list">
                {moreGuides.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/guides/${item.slug}`} className="city-inline-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">No additional guides are published yet.</p>
            )}
          </div>
          <div>
            <h2 className="city-related-title">Related itineraries</h2>
            {linkedItineraries.length ? (
              <ul className="city-related-list">
                {linkedItineraries.map((itinerary) => (
                  <li key={itinerary.slug}>
                    <Link href={`/itineraries/${itinerary.slug}`} className="city-inline-link">
                      {itinerary.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="city-empty">Related itinerary placeholder: connect itinerary related cities in Payload.</p>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
