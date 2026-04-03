# ExplOregon Coast
## Product Requirements Document
## Payload CMS + Next.js Implementation Reference for AI Agent

This PRD exists to reduce hallucination during AI-assisted development. The agent must follow this document as the source of truth unless explicitly overridden by the human.

---

# 1. Product Summary

ExplOregon Coast is a headless directory and travel planning website focused on the Oregon Coast.

It is intended to combine:
- structured business and destination listings
- city landing pages
- category landing pages
- editorial travel guides
- events
- planning utilities
- a later lightweight trip builder

The product is designed to compete on usefulness, structure, local intent coverage, and trip-planning practicality.

This is not a generic tourism blog.
This is not only a directory.
This is not a marketplace.

---

# 2. Primary Goal

Build a high-converting, SEO-driven website that can scale city pages, category hubs, listings, and utilities across the Oregon Coast while maintaining structured editorial control.

---

# 3. Technical Architecture

## Required stack
- Frontend: Next.js App Router
- CMS / backend: Payload CMS
- Database: PostgreSQL
- Hosting: Vercel for frontend, Node-compatible hosting for Payload
- Mapping: Leaflet + OpenStreetMap
- Weather: Open-Meteo or NWS
- Tides: NOAA
- Analytics: GA4 + Google Search Console

## Architecture principles
1. Payload is the system of record.
2. Frontend renders from structured Payload content.
3. All major content types must be represented as collections or globals.
4. The AI agent should prefer server-rendered or statically regenerated pages.
5. The AI agent should not invent alternative CMS platforms.
6. The AI agent should not introduce unnecessary paid APIs.
7. The AI agent should not create complex infrastructure unless required.

---

# 4. Core User Value

Users should be able to:
- discover coastal towns
- compare destinations
- browse things to do and where to stay
- plan visits using weather, tides, and location context
- read trustworthy guides
- explore categorized listings
- eventually build and save a simple trip itinerary

---

# 5. Required Content Model

## Collections
The AI agent must create these Payload collections.

### 5.1 `regions`
Purpose: top-level geographic grouping.

Required fields:
- `name`
- `slug`
- `summary`
- `heroImage`
- `intro`
- `seoTitle`
- `seoDescription`

### 5.2 `cities`
Purpose: major SEO and navigation entity.

Required fields:
- `name`
- `slug`
- `region` relation
- `heroImage`
- `summary`
- `intro`
- `whyVisit`
- `whenToGo`
- `featuredHighlights`
- `latitude`
- `longitude`
- `faq`
- `seoTitle`
- `seoDescription`
- `status`

### 5.3 `listingCategories`
Purpose: controlled taxonomy for listings.

Required fields:
- `name`
- `slug`
- `description`
- `icon`
- `seoTitle`
- `seoDescription`

Examples:
- hotels
- campgrounds
- restaurants
- beaches
- whale-watching
- hiking
- family-activities

### 5.4 `listings`
Purpose: individual business, place, or point-of-interest detail pages.

Required fields:
- `name`
- `slug`
- `city` relation
- `region` relation
- `categories` relation array
- `summary`
- `description`
- `heroImage`
- `gallery`
- `address`
- `latitude`
- `longitude`
- `websiteUrl`
- `phone`
- `attributes`
- `amenities`
- `priceRange`
- `seasonality`
- `editorNotes`
- `sourceType`
- `status`
- `seoTitle`
- `seoDescription`

### 5.5 `guides`
Purpose: editorial SEO and planning content.

Required fields:
- `title`
- `slug`
- `heroImage`
- `excerpt`
- `body`
- `relatedCities`
- `relatedCategories`
- `travelSeason`
- `seoTitle`
- `seoDescription`
- `status`

### 5.6 `events`
Purpose: event discovery and freshness.

Required fields:
- `title`
- `slug`
- `city`
- `region`
- `startDate`
- `endDate`
- `venue`
- `summary`
- `description`
- `heroImage`
- `eventUrl`
- `status`
- `seoTitle`
- `seoDescription`

### 5.7 `itineraries`
Purpose: editorial and later user-assisted trip plans.

Required fields:
- `title`
- `slug`
- `summary`
- `heroImage`
- `tripLength`
- `stops` relationship array
- `body`
- `relatedCities`
- `status`
- `seoTitle`
- `seoDescription`

### 5.8 `media`
Payload media collection.

### 5.9 `users`
For admin/editor access and later optional lightweight persistence.

---

# 6. Required Globals

The AI agent must create these globals.

### `siteSettings`
Fields should include:
- site name
- site tagline
- default SEO fields
- social links
- contact fields

### `homepage`
Fields should include:
- hero headline
- hero subheadline
- hero CTA
- featured cities
- featured categories
- editorial intro block
- utility teaser block
- planning CTA block

### `navigation`
Fields should include:
- header nav items
- footer nav groups

### `footer`
May be merged into navigation if implemented cleanly.

---

# 7. Workflow and Status Rules

## Listings statuses
Listings must support:
- `draft`
- `imported`
- `needsReview`
- `approved`
- `published`
- `archived`

## Guides, events, itineraries statuses
Must support:
- `draft`
- `review`
- `published`
- `archived`

## Publishing rules
The AI agent must implement logic that prevents publishing incomplete records.

At minimum, published listings require:
- title
- slug
- city
- at least one category
- summary
- description
- latitude
- longitude
- SEO fields

---

# 8. Page Requirements

The AI agent must build these route families.

## 8.1 Homepage
Must include:
- hero section with clear value proposition
- primary search or browse entry point
- featured towns
- category previews
- utility / planning teaser
- editorial trust / guide preview
- trip builder teaser
- strong CTA paths

## 8.2 City pages
Route pattern:
- `/cities/[slug]`

Must include:
- city hero
- intro
- why visit
- when to go
- featured listings
- top categories
- map section
- events preview
- FAQ
- nearby cities
- internal links to guides and categories

## 8.3 Category pages
Route pattern:
- `/categories/[slug]`

Must include:
- category intro
- category-specific editorial copy
- listing grid
- filters if simple
- related cities
- FAQ

## 8.4 Listing pages
Route pattern:
- `/listings/[slug]`

Must include:
- listing hero
- summary
- details and attributes
- map
- CTA
- related listings
- nearby city links

## 8.5 Region pages
Route pattern:
- `/regions/[slug]`

## 8.6 Guide pages
Route pattern:
- `/guides/[slug]`

## 8.7 Event pages
Route pattern:
- `/events/[slug]`

## 8.8 Itinerary pages
Route pattern:
- `/itineraries/[slug]`

## 8.9 Utilities pages
At minimum there should be:
- map page
- weather or tides utility page
- city comparison module or page

---

# 9. SEO Requirements

The AI agent must implement:
- clean slugs
- unique metadata generation
- canonical tags
- sitemap support
- robots handling
- JSON-LD where appropriate
- breadcrumb support
- internal linking modules

Priority SEO wedges:
1. city pages
2. category pages
3. listing pages
4. guides
5. event freshness
6. utility pages

---

# 10. Design Direction

The frontend should feel:
- coastal
- editorial
- rugged
- useful
- high-trust
- conversion-aware

It must not feel:
- like a generic AI SaaS template
- over-minimal to the point of emptiness
- like a travel booking clone
- like a plain blog theme

The homepage should support:
- destination discovery
- planning intent
- utility value
- structured browsing

---

# 11. Initial Seed Data Requirement

The AI agent should create a seed script for:
- 3 regions
- 5 cities
- 25 listings
- 2 guides
- 1 itinerary
- 5 to 10 events
- homepage global content
- navigation global content

Seed data should be plausible and structured.
It should not use lorem ipsum.
It should be obvious placeholder content when facts are uncertain.

---

# 12. Import Pipeline Constraints

An import pipeline may be built later, but the AI agent must follow these rules:
- imported data does not auto-publish
- imported listings must enter `imported` or `needsReview`
- duplicate detection is required
- incomplete records should be flagged
- source provenance should be stored

---

# 13. Trip Builder Scope

Trip builder is **not phase one**.

When built, MVP scope is:
- save favorites
- assemble itinerary stops
- reorder stops
- shareable itinerary URL

The AI agent must not build a large account system or advanced collaborative planner in the first implementation.

---

# 14. Explicit Non-Goals

The AI agent must not introduce these early unless specifically requested:
- WordPress
- WPGraphQL
- Algolia
- complex auth
- memberships
- user-generated reviews
- marketplaces
- advanced personalization
- expensive third-party APIs
- native apps
- massive scraping systems

---

# 15. Build Sequence

The AI agent must follow this order:
1. project setup
2. Payload collections and globals
3. workflow states and validation rules
4. seed scripts
5. shared types and API utilities
6. frontend shell
7. homepage
8. city pages
9. category pages
10. listing pages
11. guide, event, itinerary templates
12. utilities
13. import pipeline
14. trip builder MVP
15. performance and SEO hardening

The AI agent must not skip directly to “complete website build” without locking schema first.

---

# 16. Agent Behavior Rules

The AI agent must:
- ask or flag when assumptions are missing
- not invent undocumented collections
- not invent paid services unless necessary
- keep implementation modular
- output files in deterministic paths
- preserve schema consistency
- prefer simple architecture over clever architecture
- optimize for launchable output, not theoretical perfection

The AI agent should explicitly say when it is making placeholder assumptions.

---

# 17. Definition of Done for MVP Launch

The MVP is done when all of the following exist:
- homepage complete
- 5 city pages live
- 2 category pages live
- 25 listings approved and published
- 2 guides live
- 1 itinerary live
- map or utility feature live
- sitemap and metadata functioning
- analytics connected
- content manageable in Payload admin

---

# 18. Final Instruction to Agent

Do not redesign the product.
Do not swap the stack.
Do not overbuild phase one.
Build the system in the prescribed order.
When uncertain, preserve schema integrity and launch practicality over novelty.
