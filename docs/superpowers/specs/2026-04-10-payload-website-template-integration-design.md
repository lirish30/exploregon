# Payload Website Template Full Integration Design (Existing CMS Preservation + Schema Migration)

Date: 2026-04-10  
Repository: /Users/loganirish/Documents/GitHub/ExplOregon Coast

## 1. Objective

Integrate the full Payload CMS Website Template feature set into the existing build without regenerating a new backend project. The current CMS remains the runtime foundation, but its schema and feature surface will be migrated to a Website-Template-first architecture.

User constraints:
- Keep the current CMS project and deployment footprint.
- Include all Website Template capabilities.
- Migrate existing travel collections into the template schema.
- Preserve current public URL structure where possible (`/cities/[slug]`, `/listings/[slug]`, etc.).
- No redirect dependency required for route continuity.
- One-time migration is allowed.

## 2. Scope

### In scope
- Payload config migration to template plugin stack and editor patterns.
- Collection/global schema migration to template-aligned model.
- Frontend API/query updates to read new schema while preserving existing route patterns.
- One-time data migration script from legacy collections/globals into new collections/globals.
- Type regeneration and verification.

### Out of scope
- Spinning up a separate template app/backend.
- Preserving legacy collections indefinitely.
- URL redirect rollout as a required migration step.

## 3. Target Architecture

## 3.1 Core CMS platform (template parity)
- Enable Website Template plugin stack:
  - `@payloadcms/plugin-seo`
  - `@payloadcms/plugin-search`
  - `@payloadcms/plugin-form-builder`
  - `@payloadcms/plugin-redirects`
  - `@payloadcms/plugin-nested-docs`
- Adopt template lexical/editor defaults and link field behavior.
- Adopt template hero + block layout patterns for pages.
- Adopt drafts/versions/live preview behavior from template collections.
- Use template-style revalidation hooks for content and global changes.

## 3.2 Data model (template-first)
Primary collections:
- `pages` (destination/location/listing and generic pages)
- `posts` (guides/events/itineraries/articles)
- `categories` (taxonomy, including former listing categories)
- `media`
- `users`

Globals:
- `header`
- `footer`
- Optional minimal `settings` global only if required by web app runtime behavior.

Legacy collections to deprecate after successful migration:
- `regions`
- `cities`
- `listings`
- `guides`
- `events`
- `itineraries`
- `listingCategories`

Legacy globals to deprecate or collapse:
- `navigation`
- `siteSettings`
- `homepage`

## 4. Schema Design

## 4.1 `pages` (template + travel extensions)
Retain template fields:
- `title`
- `hero`
- `layout` (template blocks)
- `meta` (plugin-seo fields)
- `publishedAt`
- `slug`
- drafts/versions settings

Add travel extensions:
- `pageType` (enum): `home | city | region | listing | generic`
- `route` group:
  - `legacyType` (enum) used by web route resolvers
  - `pathPattern` (optional guard/debug metadata)
- `location` group:
  - relationships to canonical city/region pages when needed
  - latitude/longitude
- `cityDetails` group:
  - `summary`, `intro`, `whyVisit`, `whenToGo`
  - `featuredHighlights[]`
  - `faq[]`
  - listing-section configuration currently used on city pages
- `regionDetails` group:
  - `summary`, `intro`
- `listingDetails` group:
  - `summary`, `description`, `address`, `phone`, `websiteUrl`
  - `priceRange`, `seasonality`, `attributes[]`, `amenities[]`
  - `gallery`
  - category relations
- editorial/source metadata from current workflow:
  - source type/import metadata where applicable
  - status fields/hook compatibility where required

## 4.2 `posts` (template + subtype model)
Retain template fields:
- `title`
- `heroImage`
- `content`
- `relatedPosts`
- `categories`
- `meta`
- `publishedAt`
- `authors`
- `slug`
- drafts/versions

Add subtype fields:
- `postType` (enum): `guide | event | itinerary | article`
- `guideDetails`:
  - `excerpt`, `travelSeason`, related city/category references
- `eventDetails`:
  - `venue`, `startDate`, `endDate`, `eventUrl`, related city/region references
- `itineraryDetails`:
  - `summary`, `tripLength`, `stops` (relationships to `pages` entries where `pageType='listing'`)

## 4.3 `categories`
- Base template `categories` model.
- Add optional `icon` select/text field to preserve existing frontend icon mapping.

## 4.4 Globals
- `header` and `footer` from template fields (link arrays).
- If current web runtime still requires additional site-level keys, create lightweight `settings` global and migrate only required keys.

## 5. Route Preservation Strategy

Goal: keep existing public routes with no redirect dependency.

Approach:
- Keep current Next.js route files in `apps/web/src/app`.
- Update route-level data loaders to query `pages` or `posts` by:
  - `slug`
  - subtype discriminator (`pageType` / `postType`)
- Enforce uniqueness constraints via migration and validation to prevent slug collisions across incompatible types.

Examples:
- `/cities/[slug]` -> query `pages` where `pageType='city'` and `slug`.
- `/regions/[slug]` -> query `pages` where `pageType='region'` and `slug`.
- `/listings/[slug]` -> query `pages` where `pageType='listing'` and `slug`.
- `/guides/[slug]` -> query `posts` where `postType='guide'` and `slug`.
- `/events/[slug]` -> query `posts` where `postType='event'` and `slug`.
- `/itineraries/[slug]` -> query `posts` where `postType='itinerary'` and `slug`.

## 6. Migration Plan (One-Time)

## 6.1 Pre-migration safeguards
1. Export/backup current database and media references.
2. Freeze content writes during migration window.
3. Add migration dry-run mode and reporting.

## 6.2 Migration sequence
1. Add new schema in code (template-first collections/globals/plugins).
2. Generate types and run migration script in dry-run mode.
3. Migrate taxonomies:
   - `listingCategories` -> `categories`.
4. Migrate location and listing entities:
   - `regions`, `cities`, `listings` -> `pages` with `pageType` and mapped detail groups.
5. Migrate editorial entities:
   - `guides`, `events`, `itineraries` -> `posts` with `postType` detail groups.
6. Migrate globals:
   - existing navigation/footer/home/site settings -> template globals + optional settings.
7. Re-link relationships (city/region/listing/category/post references).
8. Validate record counts and required field completeness.
9. Cut web queries to new model.
10. Remove legacy collections/globals from config after validation pass.

## 6.3 Migration tooling
- Implement migration runner under `apps/cms/src/migrate/websiteTemplateIntegration.ts`.
- Include:
  - ID mapping tables (legacy ID -> new ID)
  - per-collection transformation functions
  - structured log output and failure summaries
  - optional rollback guidance via backup restoration (not in-process transaction if cross-collection writes exceed transaction boundaries)

## 7. Implementation Plan (Execution Order)

1. Add template dependencies to `apps/cms/package.json`.
2. Introduce template modules into `apps/cms/src`:
   - fields (`link`, lexical defaults)
   - blocks (`Content`, `CallToAction`, `MediaBlock`, `ArchiveBlock`, `FormBlock`, etc.)
   - plugins index
   - access helpers and hooks
3. Refactor `payload.config.ts` to include:
   - template editor defaults
   - plugin stack
   - updated collections/globals
4. Replace/augment collection definitions with template-based `pages/posts/categories/users/media`.
5. Implement migration script and run dry-run validation.
6. Update web API adapters (`apps/web/src/lib/api.ts`, typed mappers, page route loaders).
7. Regenerate Payload types and update compile errors.
8. Run project verification:
   - CMS typecheck
   - Web typecheck/tests
   - route-level smoke checks
9. Final data migration execution and content spot-check.

## 8. Testing and Verification

Required verification:
- CMS boot with updated config and plugin stack.
- Type generation succeeds and no stale payload type imports remain.
- Existing route URLs render correctly from new schema:
  - city, region, listing, guide, event, itinerary pages.
- Search index population works for selected collections.
- Form Builder block submissions work end-to-end.
- SEO fields persist and metadata generation remains stable.
- Draft preview/live preview works for pages and posts.

Data verification:
- Per-collection before/after counts.
- Random sampling for field parity (at least 10 records per migrated type, or full scan if lower volume).
- Relationship integrity checks (no dangling references).

## 9. Risks and Mitigations

1. Slug collisions after consolidation into `pages/posts`.
- Mitigation: preflight scan + deterministic conflict strategy before write.

2. Frontend assumptions on legacy shape.
- Mitigation: typed mapping/adapters and staged route conversion with compile-time checks.

3. Plugin integration complexity in existing custom project.
- Mitigation: incremental plugin activation with targeted smoke checks.

4. Editorial workflow regressions.
- Mitigation: preserve existing status constraints as extension fields/hooks where necessary.

## 10. Rollout Strategy

1. Land code changes with migration in dry-run mode.
2. Validate in local/dev with seeded backup.
3. Execute migration in a controlled window.
4. Run verification checklist and route smoke tests.
5. Remove deprecated legacy collections from active config.

## 11. Acceptance Criteria

- Existing CMS project remains in place; no generated replacement backend introduced.
- Website Template capabilities are functionally present (plugins, blocks, SEO/search/forms, preview/drafts).
- Legacy travel data is migrated to template-backed schema.
- Existing public URLs continue to work without redirect reliance.
- Typecheck and core tests pass after migration.
