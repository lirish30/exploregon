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
    title: 'ExplOregon Coast',
    description: 'Structured Oregon Coast travel and planning resources.'
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, settings] = await Promise.all([params, getSettings()])
  const page = await getPageBySlug(slug)

  if (!page) {
    return createMetadata(
      {
        title: 'Page Not Found',
        description: 'The requested page could not be found on ExplOregon Coast.',
        path: `/${slug}`,
        noIndex: true
      },
      settings
    )
  }

  return createMetadata(
    {
      title: page.seo.title,
      description: page.seo.description,
      path: `/${page.slug}`
    },
    settings
  )
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <>
      <PageHero
        kicker="Page"
        title={page.title}
        description={page.seo.description}
        actions={[{ label: 'Back Home', href: '/', variant: 'secondary' }]}
      />

      <Section>
        <div className="cities-index-breadcrumb-wrap">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: page.title, href: `/${page.slug}` }
            ]}
          />
        </div>
        <LexicalRichTextRenderer value={page.body} />
      </Section>
    </>
  )
}
