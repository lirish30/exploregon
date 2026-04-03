/**
 * Import runner — main entry point for the listing staging pipeline.
 *
 * Usage:
 *   pnpm --filter @exploregon/cms import --source "my-source-name" --file ./path/to/input.json
 *   pnpm --filter @exploregon/cms import --source "my-source-name" --file ./path/to/input.json --verbose
 *
 * What it does:
 *   1. Reads a JSON array of RawListingInput records from --file
 *   2. Resolves city, region, and category IDs from slugs
 *   3. Normalizes each record
 *   4. Validates completeness → produces flags
 *   5. Checks for duplicates in the database
 *   6. Assigns status (imported | needsReview)
 *   7. Creates the record in Payload with importMeta populated
 *   8. Prints a summary and writes a JSON report to ./import-report-<batch>.json
 *
 * Rules enforced:
 *   - imported data NEVER enters published or approved
 *   - incomplete records get needsReview, not imported
 *   - duplicates are skipped, logged, and reported
 *   - source provenance is stored in importMeta on every record
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import payloadConfig from '../payload.config'
import type { RawListingInput, ImportRecordResult, ImportSummary } from './types'
import { normalizeRawListing } from './normalize'
import { validateRecord, assignStatus } from './validate'
import { checkForDuplicate } from './dedupe'

// ─── Environment ──────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '../../.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

// ─── Argument parsing ─────────────────────────────────────────────────────────

const parseArgs = (): { source: string; file: string; verbose: boolean } => {
  const args = process.argv.slice(2)
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const source = get('--source')
  const file = get('--file')
  const verbose = args.includes('--verbose')

  if (!source) {
    console.error('Error: --source is required (e.g. --source "yelp-export-2024-06")')
    process.exit(1)
  }

  if (!file) {
    console.error('Error: --file is required (e.g. --file ./data/listings.json)')
    process.exit(1)
  }

  return { source, file, verbose }
}

// ─── Slug resolution cache ────────────────────────────────────────────────────

type IdCache = Map<string, string | number>

const buildCityCache = async (payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never): Promise<IdCache> => {
  const result = await payload.find({ collection: 'cities', limit: 500, depth: 0 })
  const cache: IdCache = new Map()
  for (const doc of result.docs) {
    const d = doc as { slug?: string; id: string | number }
    if (d.slug) cache.set(d.slug, d.id)
  }
  return cache
}

const buildRegionCache = async (payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never): Promise<IdCache> => {
  const result = await payload.find({ collection: 'regions', limit: 100, depth: 0 })
  const cache: IdCache = new Map()
  for (const doc of result.docs) {
    const d = doc as { slug?: string; id: string | number }
    if (d.slug) cache.set(d.slug, d.id)
  }
  return cache
}

const buildCategoryCache = async (payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never): Promise<IdCache> => {
  const result = await payload.find({ collection: 'listingCategories', limit: 200, depth: 0 })
  const cache: IdCache = new Map()
  for (const doc of result.docs) {
    const d = doc as { slug?: string; id: string | number }
    if (d.slug) cache.set(d.slug, d.id)
  }
  return cache
}

// ─── City → Region lookup ─────────────────────────────────────────────────────

/**
 * Resolve a region ID from a city record's region relation.
 * Used when raw input provides citySlug but not regionSlug.
 */
const resolveCityRegion = async (
  payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never,
  cityId: string | number
): Promise<string | number | null> => {
  const city = await payload.findByID({
    collection: 'cities',
    id: cityId,
    depth: 0
  })
  const c = city as { region?: string | number | { id: string | number } }
  if (!c.region) return null
  if (typeof c.region === 'object' && 'id' in c.region) return c.region.id
  return c.region
}

// ─── Runner ───────────────────────────────────────────────────────────────────

const run = async (): Promise<void> => {
  const { source, file, verbose } = parseArgs()

  // Resolve file path
  const inputPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file)
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: input file not found at ${inputPath}`)
    process.exit(1)
  }

  let rawRecords: RawListingInput[]
  try {
    const content = fs.readFileSync(inputPath, 'utf-8')
    rawRecords = JSON.parse(content) as RawListingInput[]
    if (!Array.isArray(rawRecords)) {
      console.error('Error: input file must contain a JSON array.')
      process.exit(1)
    }
  } catch (err) {
    console.error(`Error reading or parsing input file: ${String(err)}`)
    process.exit(1)
  }

  const importBatch = `batch-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`
  const importedAt = new Date().toISOString()

  console.log(`\n━━━ ExplOregon Import Pipeline ━━━`)
  console.log(`Source:  ${source}`)
  console.log(`Batch:   ${importBatch}`)
  console.log(`Records: ${rawRecords.length}`)
  console.log(`File:    ${inputPath}\n`)

  const payload = await getPayload({ config: payloadConfig })

  // Build lookup caches up front to minimize DB round-trips
  const [cityCache, regionCache, categoryCache] = await Promise.all([
    buildCityCache(payload),
    buildRegionCache(payload),
    buildCategoryCache(payload)
  ])

  const results: ImportRecordResult[] = []

  for (let i = 0; i < rawRecords.length; i++) {
    const raw = rawRecords[i]

    if (!raw.name || typeof raw.name !== 'string') {
      results.push({
        outcome: 'error',
        rawName: `[record ${i}]`,
        slug: '',
        status: 'needsReview',
        flags: ['missing-name'],
        error: 'Record is missing required "name" field.'
      })
      if (verbose) console.log(`  [${i + 1}] SKIP  — missing name`)
      continue
    }

    // ── Normalize ──────────────────────────────────────────────────────────

    const normalized = normalizeRawListing(raw)

    // ── Resolve relations ──────────────────────────────────────────────────

    const resolvedCityId = raw.citySlug ? (cityCache.get(raw.citySlug) ?? null) : null

    let resolvedRegionId: string | number | null =
      raw.regionSlug ? (regionCache.get(raw.regionSlug) ?? null) : null

    // If region slug not provided but city resolved, derive from city
    if (!resolvedRegionId && resolvedCityId) {
      resolvedRegionId = await resolveCityRegion(payload, resolvedCityId)
    }

    const resolvedCategoryIds: (string | number)[] = (raw.categorySlugs ?? [])
      .map((slug) => categoryCache.get(slug))
      .filter((id): id is string | number => id !== undefined)

    // ── Validate ───────────────────────────────────────────────────────────

    const flags = validateRecord({
      raw,
      normalized,
      resolvedCityId,
      resolvedRegionId,
      resolvedCategoryIds
    })

    const status = assignStatus(flags)

    // ── Duplicate check ────────────────────────────────────────────────────

    const dedupeResult = await checkForDuplicate(payload, {
      slug: normalized.slug,
      normalizedName: normalized.name,
      cityId: resolvedCityId,
      phone: normalized.phone || undefined,
      websiteUrl: normalized.websiteUrl || undefined
    })

    if (dedupeResult.isDuplicate) {
      results.push({
        outcome: 'skipped_duplicate',
        rawName: raw.name,
        slug: normalized.slug,
        status,
        flags,
        duplicateOfSlug: dedupeResult.existingSlug
      })
      if (verbose) {
        console.log(`  [${i + 1}] SKIP  — duplicate of "${dedupeResult.existingSlug}" (${dedupeResult.reason})  ${raw.name}`)
      }
      continue
    }

    // ── Build Payload create payload ───────────────────────────────────────

    const createData: Record<string, unknown> = {
      name: normalized.name,
      slug: normalized.slug,
      summary: normalized.summary,
      description: normalized.description,
      address: normalized.address,
      latitude: normalized.latitude ?? 0,
      longitude: normalized.longitude ?? 0,
      websiteUrl: normalized.websiteUrl || undefined,
      phone: normalized.phone || undefined,
      attributes: normalized.attributes,
      amenities: normalized.amenities,
      priceRange: normalized.priceRange || undefined,
      seasonality: normalized.seasonality || undefined,
      seoTitle: normalized.seoTitle,
      seoDescription: normalized.seoDescription,
      sourceType: 'imported',
      status,
      importMeta: {
        importSource: source,
        importBatch,
        importedAt,
        rawName: raw.name,
        rawAddress: raw.address ?? null,
        flags: flags.map((f) => ({ flag: f })),
        duplicateSuspected: false,
        duplicateOfSlug: null
      }
    }

    // Attach resolved relations only when they exist
    if (resolvedCityId) createData.city = resolvedCityId
    if (resolvedRegionId) createData.region = resolvedRegionId
    if (resolvedCategoryIds.length > 0) createData.categories = resolvedCategoryIds

    // ── Write to Payload ───────────────────────────────────────────────────

    try {
      await payload.create({
        collection: 'listings',
        data: createData as Parameters<typeof payload.create>[0]['data'],
        overrideAccess: true
      })

      results.push({
        outcome: 'created',
        rawName: raw.name,
        slug: normalized.slug,
        status,
        flags
      })

      if (verbose) {
        const flagNote = flags.length > 0 ? `  [${flags.length} flags]` : ''
        console.log(`  [${i + 1}] OK    — ${status.padEnd(12)} "${normalized.slug}"${flagNote}`)
      }
    } catch (err) {
      results.push({
        outcome: 'error',
        rawName: raw.name,
        slug: normalized.slug,
        status: 'needsReview',
        flags,
        error: String(err)
      })
      if (verbose) {
        console.log(`  [${i + 1}] ERROR — "${normalized.slug}" — ${String(err)}`)
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  const summary: ImportSummary = {
    importBatch,
    importSource: source,
    total: rawRecords.length,
    created: results.filter((r) => r.outcome === 'created').length,
    skippedDuplicates: results.filter((r) => r.outcome === 'skipped_duplicate').length,
    errors: results.filter((r) => r.outcome === 'error').length,
    needsReview: results.filter((r) => r.status === 'needsReview').length,
    results
  }

  console.log(`\n━━━ Import Complete ━━━`)
  console.log(`  Created:    ${summary.created}`)
  console.log(`  Duplicates: ${summary.skippedDuplicates} (skipped)`)
  console.log(`  Errors:     ${summary.errors}`)
  console.log(`  NeedsReview:${summary.needsReview} of ${summary.created} created`)

  // Write report JSON next to the input file
  const reportPath = path.join(
    path.dirname(inputPath),
    `import-report-${importBatch}.json`
  )
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2))
  console.log(`\n  Report saved to: ${reportPath}\n`)

  process.exit(summary.errors > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Unhandled error in import runner:', err)
  process.exit(1)
})
