# ExplOregon Coast
## Payload CMS 0-100 Build Plan

This document rewrites the website build plan for a **Payload CMS + Next.js** architecture. It is designed to help an AI coding agent build the site in the correct order with minimal wasted effort, minimal hallucination, and minimal token burn.

---

## 1. Project Goal

Build a high-converting, SEO-driven, headless directory and travel planning website for the Oregon Coast.

The site should combine:
- structured directory listings
- high-value city pages
- category hub pages
- editorial guides
- events
- practical trip-planning utilities
- a later-phase lightweight trip builder

The architecture must be optimized for:
- AI-assisted development
- predictable schema-driven implementation
- low token waste
- minimal rework
- strong SEO foundations
- simple editorial workflows

---

## 2. Recommended Stack

### Core stack
- **Frontend:** Next.js App Router
- **CMS / Backend:** Payload CMS
- **Database:** PostgreSQL
- **Hosting:** Vercel for frontend, Payload on Railway / Render / self-hosted Node environment
- **Maps:** Leaflet + OpenStreetMap
- **Weather:** Open-Meteo or NWS
- **Tides:** NOAA
- **Images:** local media library or cloud storage via Payload adapter
- **Analytics:** GA4 + Google Search Console

### Why this stack
Payload is better aligned with AI-assisted building because:
- collections are defined in code
- admin UI is generated from schema
- REST / GraphQL / Local API are predictable
- seed scripts can generate dummy data reliably
- backend and frontend can share a single typed ecosystem

---

## 3. Non-Negotiable Product Rules

1. This is **not just a blog**.
2. This is **not just a listings directory**.
3. This is a **directory + editorial + utility** product.
4. All content types must be structured from the beginning.
5. Imported data must go through QA before publication.
6. Core SEO templates must be built before growth features.
7. Do not build advanced user account systems early.
8. Do not build large-scale scraping early.
9. Do not overcomplicate search, filtering, or personalization in phase one.
10. The design must feel rugged, editorial, useful, and regional, not generic SaaS.

---

## 4. Correct Development Order

This is the right order. Do not change it unless there is a real technical blocker.

### Phase 0. Environment setup

#### Human tasks
- Create GitHub repo
- Create Vercel project for frontend
- Create Payload hosting environment
- Provision PostgreSQL database
- Set environment variables
- Set frontend domain and CMS/admin subdomain

#### AI tasks
- Scaffold Next.js app
- Scaffold Payload app
- Configure database connection
- Set up linting, formatting, TypeScript, and shared config

#### Deliverables
- running local dev environment
- deployed preview environments
- env variable template

---

### Phase 1. Lock schema before building pages

This is the most important phase.

#### Required collections
- `regions`
- `cities`
- `listingCategories`
- `listings`
- `guides`
- `events`
- `itineraries`
- `media`
- `users`

#### Required globals
- `siteSettings`
- `homepage`
- `navigation`
- `footer`

#### Human tasks
- approve field model
- approve slug rules
- approve status workflow
- approve taxonomy naming

#### AI tasks
- create all Payload collection configs
- create globals
- create relationship fields
- add access control rules
- add timestamps, slug hooks, and validation
- add editorial status fields

#### Deliverables
- schema files complete
- generated admin works
- content editors can create records

---

### Phase 2. Add publishing workflow and QA gates

#### Required listing statuses
- `draft`
- `imported`
- `needsReview`
- `approved`
- `published`
- `archived`

#### Required guide / event / itinerary statuses
- `draft`
- `review`
- `published`
- `archived`

#### Human tasks
- define what counts as publishable
- define QA checklist for listings
- define required fields before publish

#### AI tasks
- implement status fields
- implement hooks that block incomplete publishes
- implement admin labels / filters
- create review helpers

#### Deliverables
- clean editorial workflow
- no raw imported listing can go live automatically

---

### Phase 3. Seed a small real dataset

Do not skip this.

#### Human tasks
Manually define the initial launch data set:
- 3 regions
- 5 core cities
- 25 approved listings
- 2 guide articles
- 1 sample itinerary
- 5 to 10 events

#### AI tasks
- generate seed scripts
- generate dummy media references
- create seed content consistent with real schema
- create realistic description placeholders, not lorem ipsum

#### Deliverables
- database populated with launch-like data
- frontend can be built against real records

---

### Phase 4. Build typed contracts and API utilities

#### Human tasks
- approve data returned to frontend
- approve field naming conventions

#### AI tasks
- create shared TypeScript types
- create API query helpers
- create frontend data mappers
- normalize Payload responses
- add cache and revalidation helpers

#### Deliverables
- `lib/types.ts`
- `lib/api.ts`
- `lib/seo.ts`
- `lib/schema.ts`
- predictable frontend data layer

---

### Phase 5. Build the frontend shell

#### Human tasks
- approve design tokens
- approve header/footer/nav structure

#### AI tasks
- create root layout
- create shared header/footer
- create breadcrumbs
- create page hero component
- create section wrappers
- create cards, chips, badges, accordions, CTA blocks
- create map wrapper component

#### Deliverables
- stable design system
- reusable shell for all templates

---

### Phase 6. Build revenue-driving and SEO-driving pages first

Build in this exact order.

#### 6.1 Homepage
Must include:
- strong hero value proposition
- search entry point
- featured coastal towns
- comparison / utility teaser
- categories preview
- planning CTA
- editorial credibility

#### 6.2 City page template
Must include:
- city intro
- why visit
- when to go
- top things to do
- where to stay / eat / explore
- map module
- FAQs
- nearby cities
- internal links

#### 6.3 Category hub template
Examples:
- campgrounds
- hotels
- restaurants
- beaches
- whale watching

Must include:
- intro copy
- filtered listing grid
- supporting editorial copy
- FAQs
- related cities

#### 6.4 Listing detail page
Must include:
- title
- category
- city / region
- summary
- amenities or attributes
- map
- CTA
- nearby listings
- schema-ready business details

#### 6.5 Region pages
#### 6.6 Events page and event template
#### 6.7 Guide template
#### 6.8 Itinerary template

#### Human tasks
- approve copy structure for each template
- review design against homepage direction

#### AI tasks
- build route structure
- wire metadata generation
- add JSON-LD
- add internal link modules
- add empty / fallback states

---

### Phase 7. Add practical utilities

Only after core pages are live.

#### Priority order
1. Interactive map page
2. Weather widget
3. Tide widget
4. Town comparison module
5. Events surfacing by city or region

#### Human tasks
- define comparison dimensions
- approve utility labels

#### AI tasks
- build utilities with caching
- fail gracefully on bad API responses
- avoid client-heavy architecture when server-side is enough

---

### Phase 8. Build import pipeline and staging flow

This should come after templates work.

#### Human tasks
- define approved sources
- define dedupe rules
- define fields that need manual review

#### AI tasks
- build import script
- normalize source rows
- flag duplicates
- assign `imported` or `needsReview`
- create review tooling in Payload admin

#### Deliverables
- import can accelerate content growth without polluting published content

---

### Phase 9. Build lightweight trip builder MVP

This is not phase one.

#### MVP scope
- save favorite listings
- assemble multi-stop itinerary
- sort or reorder stops
- shareable itinerary URL
- optional lightweight persistence

#### Human tasks
- define what counts as a stop
- define itinerary UX priorities

#### AI tasks
- create minimal itinerary builder
- avoid complex auth unless necessary
- prefer URL state or light account model initially

---

### Phase 10. Performance, SEO, and analytics hardening

#### Human tasks
- connect GA4
- connect GSC
- review indexing priorities

#### AI tasks
- generate sitemap
- implement robots rules
- add canonicals
- add structured data
- optimize images
- add caching and revalidation
- test Core Web Vitals basics

---

## 5. What the Human Should Do vs What the AI Should Do

### Human-owned decisions
- positioning
- taxonomy logic
- SEO priorities
- publish rules
- trust / quality standards
- launch city list
- import source approval
- rankings or “best of” logic
- conversion priorities

### AI-owned implementation
- schema files
- seed scripts
- page templates
- admin structure
- utilities
- typed data mappers
- API layer
- structured data templates
- import pipeline code

### Shared
- content review
- UX refinement
- technical QA
- copy quality

---

## 6. What Not To Build Early

Do not waste time on these before launch:
- advanced auth
- memberships
- community features
- complex personalization
- Algolia
- large scale scraping
- advanced recommendation engines
- user-generated reviews
- native mobile apps
- overbuilt design system abstractions

---

## 7. Token-Saving Rules for AI Build

1. Never ask the AI to build the whole site in one prompt.
2. Work one phase at a time.
3. Lock schemas before page generation.
4. Use one prompt per collection or route family when possible.
5. Reuse the same architecture block in every prompt.
6. Require the AI to output files in exact paths.
7. Require the AI to reference the PRD before changing assumptions.
8. Require the AI to state when it is inventing missing details.
9. Use seed content instead of waiting on real content for layout work.
10. Do not let the AI redesign the product while coding.

---

## 8. Suggested 0-100 Milestone Sequence

1. Setup repo, infra, database, deployments
2. Build Payload schema
3. Add workflow states and publish rules
4. Generate seed data
5. Build typed API contract
6. Build frontend shell
7. Build homepage
8. Build city template
9. Build category hub template
10. Build listing detail template
11. Build guide / itinerary / event templates
12. Build map and utility modules
13. Build import pipeline
14. Build trip builder MVP
15. Harden SEO, performance, analytics
16. Launch first city and category set
17. Expand content footprint

---

## 9. Launch Definition of Done

Minimum launch target:
- 5 city pages
- 2 category hubs
- 25 approved listings
- 2 guides
- 1 itinerary
- homepage complete
- map module live
- weather or tide utility live
- sitemap and structured data live
- analytics live

---

## 10. Final Direction

The fastest smart path is:
- Payload schema first
- real seed content second
- frontend templates third
- utilities fourth
- import pipeline fifth
- trip builder later

Do not reverse that order.
