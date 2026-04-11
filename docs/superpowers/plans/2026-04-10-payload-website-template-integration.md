# Payload Website Template Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Payload Website Template capabilities into the existing CMS, migrate legacy travel schema to template-first `pages/posts/categories`, and preserve current frontend route paths.

**Architecture:** Bring over template-compatible CMS modules (plugins, fields, blocks, hero config, access/revalidation hooks) and extend `pages/posts` with travel subtype fields. Add a one-time migration runner that reads legacy collections and writes new docs with relationship remapping. Update web API/data mappers so current routes resolve against new schema without path changes.

**Tech Stack:** Payload CMS v3, Next.js app router, TypeScript, PostgreSQL/SQLite adapters, Lexical editor plugins.

---

### Task 1: Wire template plugin stack and shared CMS modules

**Files:**
- Modify: `apps/cms/package.json`
- Create: `apps/cms/src/plugins/index.ts`
- Create: `apps/cms/src/access/authenticated.ts`
- Create: `apps/cms/src/access/anyone.ts`
- Create: `apps/cms/src/access/authenticatedOrPublished.ts`
- Create: `apps/cms/src/fields/defaultLexical.ts`
- Create: `apps/cms/src/fields/link.ts`
- Create: `apps/cms/src/fields/linkGroup.ts`
- Create: `apps/cms/src/heros/config.ts`

- [ ] Add Payload template plugin dependencies in CMS package.
- [ ] Add plugin wiring module (`plugins/index.ts`) with seo/search/form-builder/redirects/nested-docs.
- [ ] Add access helpers and field utilities used by template collections.
- [ ] Add hero config entry point for template page model.
- [ ] Run: `pnpm --filter @exploregon/cms typecheck`

### Task 2: Replace legacy collection/global configuration with template-first schema

**Files:**
- Modify: `apps/cms/src/payload.config.ts`
- Modify: `apps/cms/src/collections/index.ts`
- Create: `apps/cms/src/collections/Categories.ts`
- Rewrite: `apps/cms/src/collections/Pages.ts`
- Create: `apps/cms/src/collections/Posts.ts`
- Modify: `apps/cms/src/collections/Users.ts`
- Create: `apps/cms/src/globals/Header.ts`
- Rewrite: `apps/cms/src/globals/Footer.ts`
- Modify: `apps/cms/src/globals/index.ts`

- [ ] Move payload config to template-style editor/plugins/globals/collections registration.
- [ ] Implement `pages` with template tabs and travel subtype fields.
- [ ] Implement `posts` with template content/meta and `postType` subtype fields.
- [ ] Add categories collection and switch taxonomy usage from listingCategories.
- [ ] Replace globals with template `header/footer` structure.
- [ ] Run: `pnpm --filter @exploregon/cms typecheck`

### Task 3: Add required block/hook/search modules for template runtime

**Files:**
- Create: `apps/cms/src/blocks/*`
- Create: `apps/cms/src/hooks/populatePublishedAt.ts`
- Create: `apps/cms/src/hooks/revalidatePage.ts`
- Create: `apps/cms/src/hooks/revalidatePost.ts`
- Create: `apps/cms/src/hooks/revalidateHeader.ts`
- Create: `apps/cms/src/hooks/revalidateFooter.ts`
- Create: `apps/cms/src/hooks/revalidateRedirects.ts`
- Create: `apps/cms/src/search/beforeSync.ts`
- Create: `apps/cms/src/search/fieldOverrides.ts`
- Create: `apps/cms/src/utilities/generatePreviewPath.ts`
- Create: `apps/cms/src/utilities/getURL.ts`

- [ ] Add template block configs referenced by page layout.
- [ ] Add revalidation and publishedAt hooks.
- [ ] Add search plugin integration utilities.
- [ ] Run: `pnpm --filter @exploregon/cms typecheck`

### Task 4: Build one-time migration runner from legacy collections to new schema

**Files:**
- Create: `apps/cms/src/migrate/websiteTemplateIntegration.ts`
- Modify: `apps/cms/package.json`

- [ ] Implement dry-run and apply modes.
- [ ] Migrate `listingCategories -> categories`.
- [ ] Migrate `regions/cities/listings -> pages` with `pageType` mapping.
- [ ] Migrate `guides/events/itineraries -> posts` with `postType` mapping.
- [ ] Migrate relevant globals to `header/footer`.
- [ ] Add logging/reporting and record-count summary.

### Task 5: Update web API contract to query template-first schema

**Files:**
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/lib/types.ts`
- Modify: route pages under `apps/web/src/app/**/[slug]/page.tsx` that currently query legacy collections
- Modify: `apps/web/src/lib/api.pages.test.ts`

- [ ] Replace legacy collection fetchers with `pages/posts` typed fetchers filtered by `pageType/postType`.
- [ ] Keep current route paths and page rendering contracts stable.
- [ ] Add tests that prove slug lookups by subtype for each preserved route family.
- [ ] Run: `pnpm --filter @exploregon/web typecheck`

### Task 6: Regenerate types and verify integration

**Files:**
- Modify (generated): `apps/cms/src/payload-types.ts`

- [ ] Run type generation: `pnpm --filter @exploregon/cms typegen`.
- [ ] Verify CMS typecheck: `pnpm --filter @exploregon/cms typecheck`.
- [ ] Verify web tests/typecheck: `pnpm --filter @exploregon/web test` (or targeted test command) + `typecheck`.
- [ ] Validate no stale imports of removed collections.

### Task 7: Cleanup and migration readiness

**Files:**
- Modify: `README.md` (if command/workflow changes)
- Modify: `apps/cms/src/seed/README.md` or migration docs

- [ ] Document migration execution command and expected preflight checks.
- [ ] Document rollback strategy (restore backup).
- [ ] Confirm dev startup and key endpoints load.
