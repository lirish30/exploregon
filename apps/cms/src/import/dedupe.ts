/**
 * Import duplicate detection.
 *
 * Checks a candidate record against existing listings in the database using
 * multiple signals. Returns a match result describing whether a duplicate was
 * found and, if so, which existing record it likely duplicates.
 *
 * Detection signals (checked in priority order):
 *   1. Slug exact match         — definite duplicate
 *   2. Normalized name + city   — probable duplicate
 *   3. Phone match              — probable duplicate (if phone present)
 *   4. Website URL match        — probable duplicate (if URL present)
 *
 * The runner should skip any record flagged as a duplicate.
 * The admin can review skipped records from the runner output log.
 */

import type { Payload } from 'payload'
import { formatSlug } from '../utilities/slug'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DuplicateCheckInput = {
  slug: string
  normalizedName: string
  cityId: string | number | null
  phone?: string
  websiteUrl?: string
}

export type DuplicateCheckResult =
  | { isDuplicate: false }
  | { isDuplicate: true; reason: string; existingSlug: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize a name for comparison: lowercase, strip punctuation, collapse spaces.
 * This allows "Cannon Beach Inn" and "Cannon  Beach Inn." to match.
 */
const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// ─── Main check ───────────────────────────────────────────────────────────────

export const checkForDuplicate = async (
  payload: Payload,
  input: DuplicateCheckInput
): Promise<DuplicateCheckResult> => {
  // 1. Slug exact match
  const slugMatch = await payload.find({
    collection: 'listings',
    where: { slug: { equals: input.slug } },
    limit: 1,
    depth: 0
  })

  if (slugMatch.docs.length > 0) {
    const existing = slugMatch.docs[0] as { slug?: string }
    return {
      isDuplicate: true,
      reason: 'slug-exact-match',
      existingSlug: existing.slug ?? input.slug
    }
  }

  // 2. Normalized name + city match
  if (input.cityId) {
    const normalizedName = normalizeName(input.normalizedName)

    // Fetch all listings in the same city and compare normalized names in memory.
    // This avoids needing a database-level text normalization function.
    const cityListings = await payload.find({
      collection: 'listings',
      where: { city: { equals: input.cityId } },
      limit: 500,
      depth: 0
    })

    for (const doc of cityListings.docs) {
      const existingDoc = doc as { name?: string; slug?: string }
      const existingNormalized = normalizeName(existingDoc.name ?? '')

      if (existingNormalized === normalizedName) {
        return {
          isDuplicate: true,
          reason: 'name-city-match',
          existingSlug: existingDoc.slug ?? formatSlug(existingDoc.name ?? '')
        }
      }
    }
  }

  // 3. Phone match (only if a valid-looking phone was provided)
  if (input.phone && input.phone.replace(/\D/g, '').length >= 10) {
    const phoneMatch = await payload.find({
      collection: 'listings',
      where: { phone: { equals: input.phone } },
      limit: 1,
      depth: 0
    })

    if (phoneMatch.docs.length > 0) {
      const existing = phoneMatch.docs[0] as { slug?: string }
      return {
        isDuplicate: true,
        reason: 'phone-match',
        existingSlug: existing.slug ?? ''
      }
    }
  }

  // 4. Website URL match (if a URL was provided)
  if (input.websiteUrl) {
    const urlMatch = await payload.find({
      collection: 'listings',
      where: { websiteUrl: { equals: input.websiteUrl } },
      limit: 1,
      depth: 0
    })

    if (urlMatch.docs.length > 0) {
      const existing = urlMatch.docs[0] as { slug?: string }
      return {
        isDuplicate: true,
        reason: 'website-url-match',
        existingSlug: existing.slug ?? ''
      }
    }
  }

  return { isDuplicate: false }
}
