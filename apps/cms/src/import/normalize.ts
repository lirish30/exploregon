/**
 * Import normalization helpers.
 *
 * Converts raw source values into clean, consistent strings suitable
 * for Payload field values. Does not resolve relations (that happens in runner).
 */

import type { RawListingInput } from './types'
import { formatSlug } from '../utilities/slug'

// ─── Text ─────────────────────────────────────────────────────────────────────

/** Trim whitespace and collapse internal runs of multiple spaces. */
export const cleanText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s{2,}/g, ' ')
}

/**
 * Truncate a string to `max` characters, appending `…` if truncated.
 * Used to keep fields within Payload maxLength constraints.
 */
export const truncate = (value: string, max: number): string => {
  if (value.length <= max) return value
  return value.slice(0, max - 1) + '…'
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/**
 * Normalize phone to a consistent (XXX) XXX-XXXX format when possible.
 * Falls back to the original cleaned string for non-US numbers.
 */
export const normalizePhone = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const digits = value.replace(/\D/g, '')

  // US 10-digit
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // US 11-digit with leading 1
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return cleaned original for non-US or unusual formats
  return cleanText(value)
}

// ─── URL ──────────────────────────────────────────────────────────────────────

/**
 * Ensure a URL has a protocol. Returns empty string for clearly invalid values.
 */
export const normalizeUrl = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Add https:// for bare domains
  if (trimmed.includes('.')) {
    return `https://${trimmed}`
  }

  return ''
}

// ─── Coordinates ──────────────────────────────────────────────────────────────

/**
 * Parse a coordinate value to a float. Returns null if unparseable or out of range.
 */
export const parseCoordinate = (
  value: unknown,
  min: number,
  max: number
): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(n) || n < min || n > max) return null
  return n
}

export const parseLatitude = (value: unknown): number | null =>
  parseCoordinate(value, -90, 90)

export const parseLongitude = (value: unknown): number | null =>
  parseCoordinate(value, -180, 180)

// ─── Arrays → Payload array fields ────────────────────────────────────────────

export const toAttributeArray = (
  values: string[] | undefined
): { attribute: string }[] =>
  (values ?? [])
    .map((v) => cleanText(v))
    .filter(Boolean)
    .map((v) => ({ attribute: truncate(v, 80) }))

export const toAmenityArray = (
  values: string[] | undefined
): { amenity: string }[] =>
  (values ?? [])
    .map((v) => cleanText(v))
    .filter(Boolean)
    .map((v) => ({ amenity: truncate(v, 80) }))

// ─── Placeholder helpers ──────────────────────────────────────────────────────

const PLACEHOLDER_SUFFIX = ' — [IMPORT: NEEDS REVIEW]'

/**
 * Return the value if non-empty, otherwise a placeholder that satisfies
 * Payload's minLength and signals that the field needs an editor's attention.
 */
export const withPlaceholder = (value: string, fieldLabel: string): string => {
  if (value.length > 0) return value
  return `${fieldLabel}${PLACEHOLDER_SUFFIX}`
}

// ─── Primary normalizer ───────────────────────────────────────────────────────

export type NormalizedFields = {
  name: string
  slug: string
  summary: string
  description: string
  address: string
  latitude: number | null
  longitude: number | null
  websiteUrl: string
  phone: string
  attributes: { attribute: string }[]
  amenities: { amenity: string }[]
  priceRange: string
  seasonality: string
  seoTitle: string
  seoDescription: string
}

/**
 * Normalize a raw input record into clean field values.
 * Does NOT resolve relations — caller must map city/region/category IDs.
 */
export const normalizeRawListing = (raw: RawListingInput): NormalizedFields => {
  const name = truncate(cleanText(raw.name), 120)
  const slug = formatSlug(name)

  const summary = truncate(
    withPlaceholder(cleanText(raw.summary), 'Summary'),
    300
  )

  const description = withPlaceholder(cleanText(raw.description), 'Description')

  const address = withPlaceholder(
    truncate(cleanText(raw.address), 200),
    'Address'
  )

  const latitude = parseLatitude(raw.latitude)
  const longitude = parseLongitude(raw.longitude)

  const websiteUrl = normalizeUrl(raw.websiteUrl)
  const phone = normalizePhone(raw.phone)

  const priceRange = truncate(cleanText(raw.priceRange), 50)
  const seasonality = truncate(cleanText(raw.seasonality), 500)

  const seoTitle = truncate(
    withPlaceholder(cleanText(raw.seoTitle ?? name), 'SEO Title'),
    70
  )

  const seoDescription = truncate(
    withPlaceholder(cleanText(raw.seoDescription), 'SEO description'),
    160
  )

  return {
    name,
    slug,
    summary,
    description,
    address,
    latitude,
    longitude,
    websiteUrl,
    phone,
    attributes: toAttributeArray(raw.attributes),
    amenities: toAmenityArray(raw.amenities),
    priceRange,
    seasonality,
    seoTitle,
    seoDescription
  }
}
