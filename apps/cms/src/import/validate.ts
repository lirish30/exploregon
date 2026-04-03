/**
 * Import validation and flag generation.
 *
 * Produces a list of human-readable flag strings describing what is missing
 * or suspicious in a record. Flags are stored in importMeta.flags and drive
 * status assignment (imported vs needsReview).
 *
 * A record with NO flags is considered reasonably complete → status: imported.
 * A record with ANY flag needs editorial attention → status: needsReview.
 */

import type { RawListingInput } from './types'
import type { NormalizedFields } from './normalize'

// ─── Flag constants ───────────────────────────────────────────────────────────

export const FLAG = {
  MISSING_CITY: 'missing-city',
  MISSING_REGION: 'missing-region',
  MISSING_CATEGORIES: 'missing-categories',
  MISSING_SUMMARY: 'missing-summary',
  MISSING_DESCRIPTION: 'missing-description',
  MISSING_ADDRESS: 'missing-address',
  MISSING_LATITUDE: 'missing-latitude',
  MISSING_LONGITUDE: 'missing-longitude',
  MISSING_HERO_IMAGE: 'missing-hero-image',
  MISSING_SEO_TITLE: 'missing-seo-title',
  MISSING_SEO_DESCRIPTION: 'missing-seo-description',
  PLACEHOLDER_SUMMARY: 'placeholder-summary',
  PLACEHOLDER_DESCRIPTION: 'placeholder-description',
  PLACEHOLDER_ADDRESS: 'placeholder-address',
  PLACEHOLDER_SEO: 'placeholder-seo',
  COORDINATE_ZERO: 'coordinate-zero-fallback',
  UNRESOLVED_CITY_SLUG: 'unresolved-city-slug',
  UNRESOLVED_REGION_SLUG: 'unresolved-region-slug',
  UNRESOLVED_CATEGORY_SLUGS: 'unresolved-category-slugs',
  SUSPICIOUS_COORDINATE: 'suspicious-coordinate',
} as const

export type ImportFlag = (typeof FLAG)[keyof typeof FLAG]

// ─── Validation ───────────────────────────────────────────────────────────────

const PLACEHOLDER_MARKER = '[IMPORT: NEEDS REVIEW]'

const isPlaceholder = (value: string): boolean =>
  value.includes(PLACEHOLDER_MARKER)

export type ValidationInput = {
  raw: RawListingInput
  normalized: NormalizedFields
  resolvedCityId: string | number | null
  resolvedRegionId: string | number | null
  resolvedCategoryIds: (string | number)[]
}

/**
 * Validate a record and return all flags describing issues found.
 * An empty array means the record is sufficiently complete.
 */
export const validateRecord = ({
  raw,
  normalized,
  resolvedCityId,
  resolvedRegionId,
  resolvedCategoryIds,
}: ValidationInput): string[] => {
  const flags: string[] = []

  // ── Relations ──────────────────────────────────────────────────────────────

  if (!raw.citySlug) {
    flags.push(FLAG.MISSING_CITY)
  } else if (!resolvedCityId) {
    flags.push(FLAG.UNRESOLVED_CITY_SLUG)
  }

  if (!raw.regionSlug && !resolvedRegionId) {
    flags.push(FLAG.MISSING_REGION)
  } else if (raw.regionSlug && !resolvedRegionId) {
    flags.push(FLAG.UNRESOLVED_REGION_SLUG)
  }

  if (!raw.categorySlugs || raw.categorySlugs.length === 0) {
    flags.push(FLAG.MISSING_CATEGORIES)
  } else if (resolvedCategoryIds.length === 0) {
    flags.push(FLAG.UNRESOLVED_CATEGORY_SLUGS)
  }

  // ── Text content ───────────────────────────────────────────────────────────

  if (!raw.summary) {
    flags.push(FLAG.MISSING_SUMMARY)
  } else if (isPlaceholder(normalized.summary)) {
    flags.push(FLAG.PLACEHOLDER_SUMMARY)
  }

  if (!raw.description) {
    flags.push(FLAG.MISSING_DESCRIPTION)
  } else if (isPlaceholder(normalized.description)) {
    flags.push(FLAG.PLACEHOLDER_DESCRIPTION)
  }

  if (!raw.address) {
    flags.push(FLAG.MISSING_ADDRESS)
  } else if (isPlaceholder(normalized.address)) {
    flags.push(FLAG.PLACEHOLDER_ADDRESS)
  }

  // ── Coordinates ────────────────────────────────────────────────────────────

  if (raw.latitude === null || raw.latitude === undefined || raw.latitude === '') {
    flags.push(FLAG.MISSING_LATITUDE)
  } else if (normalized.latitude === null) {
    flags.push(FLAG.SUSPICIOUS_COORDINATE)
  } else if (normalized.latitude === 0) {
    flags.push(FLAG.COORDINATE_ZERO)
  }

  if (raw.longitude === null || raw.longitude === undefined || raw.longitude === '') {
    flags.push(FLAG.MISSING_LONGITUDE)
  } else if (normalized.longitude === null) {
    flags.push(FLAG.SUSPICIOUS_COORDINATE)
  } else if (normalized.longitude === 0) {
    flags.push(FLAG.COORDINATE_ZERO)
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  // Hero image is never in raw import — always flag so editors know to add it.
  flags.push(FLAG.MISSING_HERO_IMAGE)

  // ── SEO ────────────────────────────────────────────────────────────────────

  if (!raw.seoTitle) {
    flags.push(FLAG.MISSING_SEO_TITLE)
  } else if (isPlaceholder(normalized.seoTitle)) {
    flags.push(FLAG.PLACEHOLDER_SEO)
  }

  if (!raw.seoDescription) {
    flags.push(FLAG.MISSING_SEO_DESCRIPTION)
  } else if (isPlaceholder(normalized.seoDescription)) {
    flags.push(FLAG.PLACEHOLDER_SEO)
  }

  return [...new Set(flags)] // deduplicate (e.g. two placeholder-seo entries)
}

// ─── Status assignment ────────────────────────────────────────────────────────

/**
 * Blocking flags prevent a record from reaching even `imported` status.
 * These indicate the record is too incomplete to be useful without manual work.
 */
const BLOCKING_FLAGS: Set<string> = new Set([
  FLAG.MISSING_CITY,
  FLAG.UNRESOLVED_CITY_SLUG,
  FLAG.MISSING_SUMMARY,
  FLAG.MISSING_DESCRIPTION,
  FLAG.MISSING_LATITUDE,
  FLAG.MISSING_LONGITUDE,
  FLAG.SUSPICIOUS_COORDINATE,
])

/**
 * Assign a workflow status based on the flags list.
 *
 * - Any blocking flag → needsReview
 * - Non-blocking flags only (e.g. missing hero image, missing SEO) → imported
 * - No flags → imported
 *
 * Neither `approved` nor `published` can be assigned by the import pipeline.
 */
export const assignStatus = (flags: string[]): 'imported' | 'needsReview' => {
  if (flags.some((f) => BLOCKING_FLAGS.has(f))) {
    return 'needsReview'
  }
  return 'imported'
}
