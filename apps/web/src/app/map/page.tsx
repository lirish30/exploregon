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
    title: 'Oregon Coast Map | ExplOregon Coast',
    description: 'Interactive Oregon Coast map utility for city and listing planning.'
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
  const page = await getPageBySlug('map')

  if (!page) {
    return createMetadata(
      {
        title: 'Map Page Not Found',
        description: 'Publish a Page with slug "map" in Payload to render this route.',
        path: '/map',
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: page.seo.title,
      description: page.seo.description,
      path: '/map'
    },
    settings
  )
}

export default async function MapPage() {
  const page = await getPageBySlug('map')

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
                { label: 'Browse Cities', href: '/cities', variant: 'secondary' as const },
                { label: 'Browse Categories', href: '/categories', variant: 'secondary' as const }
              ]
        }
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: page.title, href: '/map' }
            ]}
          />
        </div>
        <LexicalRichTextRenderer value={page.body} />
      </Section>
    </>
  )
}
