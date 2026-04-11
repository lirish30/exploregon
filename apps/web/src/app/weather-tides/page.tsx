import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '../../components/primitives/breadcrumbs'
import { LexicalRichTextRenderer } from '../../components/primitives/lexical-rich-text'
import { PageHero } from '../../components/primitives/page-hero'
import { Section } from '../../components/primitives/section'
import { getPageBySlug, getSiteSettings } from '../../lib/api'
import { createMetadata } from '../../lib/seo'
import type { SiteSettingsGlobal } from '../../lib/types'

export const revalidate = 300

const fallbackSettings: SiteSettingsGlobal = {
  siteName: 'ExplOregon Coast',
  siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
  defaultSeo: {
    title: 'Weather and Tides | ExplOregon Coast',
    description: 'Weather and tide planning utility for Oregon Coast trip timing decisions.'
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const page = await getPageBySlug('weather-tides')

  if (!page) {
    return createMetadata(
      {
        title: 'Weather & Tides Page Not Found',
        description: 'Publish a Page with slug "weather-tides" in Payload to render this route.',
        path: '/weather-tides',
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: page.seo.title,
      description: page.seo.description,
      path: '/weather-tides'
    },
    settings
  )
}

export default async function WeatherTidesPage() {
  const page = await getPageBySlug('weather-tides')

  if (!page) {
    notFound()
  }

  return (
    <>
      <PageHero
        kicker={page.header.kicker ?? 'Utility'}
        title={page.header.title}
        description={page.header.description}
        actions={
          page.header.actions.length
            ? page.header.actions.map((action) => ({
                label: action.label,
                href: action.url,
                openInNewTab: action.openInNewTab,
                variant: 'secondary' as const
              }))
            : [
                { label: 'Open Coast Map', href: '/map', variant: 'secondary' as const },
                { label: 'Browse Cities', href: '/cities', variant: 'secondary' as const }
              ]
        }
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: page.title, href: '/weather-tides' }
            ]}
          />
        </div>
        <LexicalRichTextRenderer value={page.body} />
      </Section>
    </>
  )
}
