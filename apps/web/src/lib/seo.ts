import type { Metadata } from 'next'

import { ROUTE_SEGMENTS } from './schema'
import type { SiteSettingsGlobal } from './types'

export type SeoInput = {
  title?: string | null
  description?: string | null
  path?: string
  imageUrl?: string | null
  noIndex?: boolean
}

export type BreadcrumbItem = {
  label: string
  href: string
}

const getSiteUrl = (): string => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return value.replace(/\/$/, '')
}

const toAbsoluteUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}

export const createMetadata = (
  input: SeoInput,
  settings: SiteSettingsGlobal
): Metadata => {
  const siteName = settings.siteName
  const defaultTitle = settings.defaultSeo.title
  const defaultDescription = settings.defaultSeo.description

  const rawTitle = input.title?.trim() || defaultTitle
  const title = rawTitle === defaultTitle ? rawTitle : `${rawTitle} | ${siteName}`
  const description = input.description?.trim() || defaultDescription
  const canonicalPath = input.path || '/'
  const canonicalUrl = toAbsoluteUrl(canonicalPath)
  const imageUrl = input.imageUrl ? toAbsoluteUrl(input.imageUrl) : undefined

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl }] : undefined
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined
    },
    robots: input.noIndex
      ? {
          index: false,
          follow: false
        }
      : undefined
  }
}

export const createMetadataFromSeoFields = (
  seo: { title?: string | null; description?: string | null },
  settings: SiteSettingsGlobal,
  path: string,
  imageUrl?: string | null
): Metadata => {
  return createMetadata(
    {
      title: seo.title,
      description: seo.description,
      path,
      imageUrl
    },
    settings
  )
}

const toPath = (value: string): string => {
  if (value.startsWith('/')) {
    return value
  }

  return `/${value}`
}

export const buildBreadcrumbs = (items: BreadcrumbItem[]): BreadcrumbItem[] => {
  return [{ label: 'Home', href: ROUTE_SEGMENTS.homepage }, ...items.map((item) => ({
    label: item.label,
    href: toPath(item.href)
  }))]
}

export const buildEntityBreadcrumbs = (
  section: Exclude<keyof typeof ROUTE_SEGMENTS, 'homepage'>,
  currentLabel: string,
  currentSlug?: string
): BreadcrumbItem[] => {
  const sectionPath = ROUTE_SEGMENTS[section]
  const currentPath = currentSlug ? `${sectionPath}/${currentSlug}` : sectionPath

  return buildBreadcrumbs([
    {
      label: section.charAt(0).toUpperCase() + section.slice(1),
      href: sectionPath
    },
    {
      label: currentLabel,
      href: currentPath
    }
  ])
}
