import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { getPayload } from 'payload'

import payloadConfig from '../payload.config.ts'

type SluggedDoc = {
  id: number | string
  slug?: string
  status?: string
}

type RegionSeed = {
  name: string
  slug: string
  summary: string
  intro: string
  seoTitle: string
  seoDescription: string
}

type CitySeed = {
  name: string
  slug: string
  regionSlug: string
  summary: string
  intro: string
  whyVisit: string
  whenToGo: string
  featuredHighlights: string[]
  latitude: number
  longitude: number
  faq: Array<{ question: string; answer: string }>
  seoTitle: string
  seoDescription: string
}

type CategorySeed = {
  name: string
  slug: string
  description: string
  icon: string
  seoTitle: string
  seoDescription: string
}

type ListingSeed = {
  name: string
  slug: string
  citySlug: string
  regionSlug: string
  categorySlugs: string[]
  summary: string
  description: string
  address: string
  latitude: number
  longitude: number
  websiteUrl?: string
  phone?: string
  attributes: string[]
  amenities: string[]
  priceRange: string
  seasonality: string
  editorNotes: string
  sourceType: 'manual' | 'imported' | 'partner'
  seoTitle: string
  seoDescription: string
}

type GuideSeed = {
  title: string
  slug: string
  excerpt: string
  body: string
  relatedCitySlugs: string[]
  relatedCategorySlugs: string[]
  travelSeason: string
  seoTitle: string
  seoDescription: string
}

type EventSeed = {
  title: string
  slug: string
  citySlug: string
  regionSlug: string
  startDate: string
  endDate?: string
  venue: string
  summary: string
  description: string
  eventUrl?: string
  seoTitle: string
  seoDescription: string
}

type ItinerarySeed = {
  title: string
  slug: string
  summary: string
  tripLength: string
  stopSlugs: string[]
  body: string
  relatedCitySlugs: string[]
  seoTitle: string
  seoDescription: string
}

const regions: RegionSeed[] = [
  {
    name: 'North Coast',
    slug: 'north-coast',
    summary:
      'From Astoria through Cannon Beach and south toward Lincoln City, this stretch blends iconic sea stacks, historic river towns, and quick Portland access.',
    intro:
      'Editorial seed content placeholder: the North Coast is framed for first-time visitors, weekend travelers, and shoulder-season storm watchers. This copy is seeded for launch testing and should be refined with final editorial tone and local verification.',
    seoTitle: 'Oregon North Coast Guide: Astoria to Lincoln City',
    seoDescription: 'Plan the North Oregon Coast with city highlights, where to stay, and top things to do.'
  },
  {
    name: 'Central Coast',
    slug: 'central-coast',
    summary:
      'The Central Coast corridor features Newport bayfront energy, whale migration lookouts, tide pools, and practical family-friendly stops.',
    intro:
      'Editorial seed content placeholder: this region block is seeded to support launch IA and route testing. Replace with locally sourced details during content QA before wider indexation.',
    seoTitle: 'Oregon Central Coast Guide: Depoe Bay to Florence',
    seoDescription: 'Explore Central Coast towns, whale watching, beaches, and trip planning essentials.'
  },
  {
    name: 'South Coast',
    slug: 'south-coast',
    summary:
      'A rugged, lower-density coast known for dramatic viewpoints, dunes access, and road-trip pacing beyond the highest-traffic northern towns.',
    intro:
      'Editorial seed content placeholder: South Coast content exists in this dataset for schema completeness and navigation continuity. City-level expansion is intentionally deferred to later phases.',
    seoTitle: 'Oregon South Coast Guide: Coos Bay to Brookings',
    seoDescription: 'Discover the South Oregon Coast with scenic stops, route ideas, and practical planning tips.'
  }
]

const cities: CitySeed[] = [
  {
    name: 'Cannon Beach',
    slug: 'cannon-beach',
    regionSlug: 'north-coast',
    summary:
      'A postcard-worthy coastal town anchored by Haystack Rock, walkable galleries, and oceanfront stays suited for quick getaways.',
    intro:
      'Editorial seed content placeholder: Cannon Beach is positioned as a high-intent discovery and booking town in launch scope. Replace generic seasonal statements with verified local event cadence during editorial QA.',
    whyVisit:
      'Visitors come for iconic shoreline views, compact downtown access, and easy pairing with Ecola viewpoints and nearby trails.',
    whenToGo:
      'Late spring through early fall offers easier beach walking; winter is seeded as a storm-watching season placeholder pending final weather narrative review.',
    featuredHighlights: ['Haystack Rock viewpoints', 'Gallery-lined downtown core', 'Fast weekend access from Portland'],
    latitude: 45.8918,
    longitude: -123.9615,
    faq: [
      {
        question: 'Is Cannon Beach good for a weekend trip?',
        answer:
          'Yes. The launch seed positions Cannon Beach as a two- to three-day stop with walkable dining, beach time, and short trail add-ons.'
      },
      {
        question: 'What is the best season to visit Cannon Beach?',
        answer:
          'This seed dataset marks late spring through early fall as peak comfort windows, with winter framed for storm-focused visits.'
      }
    ],
    seoTitle: 'Cannon Beach, Oregon: Things to Do and Where to Stay',
    seoDescription: 'Plan Cannon Beach with top activities, beach highlights, and launch-ready travel notes.'
  },
  {
    name: 'Seaside',
    slug: 'seaside',
    regionSlug: 'north-coast',
    summary:
      'A classic promenade town with broad beach access, family attractions, and a high-volume base for first Oregon Coast visits.',
    intro:
      'Editorial seed content placeholder: Seaside copy is tuned for broad intent terms and family planning pathways. Replace demand assumptions with analytics-backed copy after launch.',
    whyVisit:
      'Seaside offers easy beach logistics, kid-friendly attractions, and straightforward access to nearby North Coast day trips.',
    whenToGo:
      'Summer and shoulder seasons are seeded as top windows for boardwalk activity; winter positioning remains editorial placeholder content.',
    featuredHighlights: ['Promenade beach walks', 'Family-oriented attractions', 'North Coast day-trip convenience'],
    latitude: 45.9932,
    longitude: -123.9226,
    faq: [
      {
        question: 'Is Seaside better for families or couples?',
        answer:
          'The launch seed frames Seaside as family-forward, while still useful for couples who want easy beach access and casual dining.'
      },
      {
        question: 'Can Seaside be paired with Astoria in one trip?',
        answer:
          'Yes. The seed itinerary structure supports a combined North Coast loop that includes both towns.'
      }
    ],
    seoTitle: 'Seaside, Oregon: Promenade, Beaches, and Planning Tips',
    seoDescription: 'Use this Seaside seed guide for family activities, beach access, and nearby trip planning.'
  },
  {
    name: 'Astoria',
    slug: 'astoria',
    regionSlug: 'north-coast',
    summary:
      'A historic river-coast gateway with museums, film history references, and brewery-heavy neighborhoods above the Columbia estuary.',
    intro:
      'Editorial seed content placeholder: Astoria is modeled as a culture-and-history anchor in the North Coast funnel. Venue and museum details should be verified before broad promotion.',
    whyVisit:
      'Astoria blends waterfront walkability, local food, and heritage experiences that complement nearby beach-focused towns.',
    whenToGo:
      'Seeded as year-round with variable weather; summer is currently treated as the easiest first-time window for broad audiences.',
    featuredHighlights: ['Historic waterfront districts', 'Astoria Column overlook access', 'Brewery and seafood mix'],
    latitude: 46.1879,
    longitude: -123.8313,
    faq: [
      {
        question: 'Is Astoria a beach town?',
        answer:
          'Astoria is seeded as a river-coast city with easy beach access by short drive rather than as a direct beach resort town.'
      },
      {
        question: 'How long should visitors stay in Astoria?',
        answer:
          'The launch planning model treats Astoria as a one- to two-night base that pairs well with Seaside and Cannon Beach.'
      }
    ],
    seoTitle: 'Astoria, Oregon: History, Food, and Coastal Trip Ideas',
    seoDescription: 'Explore Astoria with launch-ready notes on history, dining, viewpoints, and planning context.'
  },
  {
    name: 'Newport',
    slug: 'newport',
    regionSlug: 'central-coast',
    summary:
      'A Central Coast anchor with bayfront activity, aquarium demand, nearby tide-pool sites, and strong multi-day itinerary potential.',
    intro:
      'Editorial seed content placeholder: Newport is set as a practical planning hub for families and nature-focused travelers. Replace placeholders with verified partner and hours data post-QA.',
    whyVisit:
      'Newport combines family attractions, marine viewing opportunities, and easy links to whale-watching and coastal park stops.',
    whenToGo:
      'Late spring to early fall is currently seeded as the broadest-fit travel period; shoulder seasons are kept active for value-focused itineraries.',
    featuredHighlights: ['Historic Bayfront corridor', 'Oregon Coast Aquarium draw', 'Yaquina Head and tide-pool access'],
    latitude: 44.6368,
    longitude: -124.0535,
    faq: [
      {
        question: 'Is Newport a good base for the Central Coast?',
        answer:
          'Yes. The launch seed positions Newport as a central base with listing density and utility-page relevance.'
      },
      {
        question: 'What activities are strongest in Newport?',
        answer:
          'This seed emphasizes aquarium visits, bayfront dining, and nearby wildlife and tide-pool viewing.'
      }
    ],
    seoTitle: 'Newport, Oregon: Bayfront, Aquarium, and Coastal Planning',
    seoDescription: 'Plan Newport with launch-focused highlights for attractions, dining, and nearby nature stops.'
  },
  {
    name: 'Lincoln City',
    slug: 'lincoln-city',
    regionSlug: 'central-coast',
    summary:
      'A flexible coastal base with beach miles, lodging variety, nearby trails, and strong shoulder-season value potential.',
    intro:
      'Editorial seed content placeholder: Lincoln City copy is intended for conversion-focused stay + do intent clusters. Fine-tune with verified local business updates before publication expansion.',
    whyVisit:
      'Lincoln City offers broad lodging inventory, practical road-trip positioning, and easy access to beaches and trailheads.',
    whenToGo:
      'Summer is seeded for first-time confidence; fall and winter are positioned for fewer crowds and weather-variable experiences.',
    featuredHighlights: ['Long beach access zones', 'Lodging mix from value to resort', 'Central launch point for map and utility pages'],
    latitude: 44.9582,
    longitude: -124.0179,
    faq: [
      {
        question: 'Is Lincoln City walkable for visitors?',
        answer:
          'The seed assumes mixed walkability by neighborhood and recommends car-based planning for multi-stop trips.'
      },
      {
        question: 'Can Lincoln City work as a weekend destination?',
        answer:
          'Yes. The launch itinerary sample uses Lincoln City as a practical two-night segment in a three-day route.'
      }
    ],
    seoTitle: 'Lincoln City, Oregon: Beaches, Stays, and Local Trip Planning',
    seoDescription: 'Use this Lincoln City launch seed for coastal lodging choices, activities, and planning context.'
  }
]

const categories: CategorySeed[] = [
  {
    name: 'Hotels',
    slug: 'hotels',
    description: 'Oceanfront resorts, boutique inns, and practical hotel options across launch-priority coastal towns.',
    icon: 'hotel',
    seoTitle: 'Oregon Coast Hotels: Launch Listings and Travel Picks',
    seoDescription: 'Browse seed hotel listings for key Oregon Coast launch cities.'
  },
  {
    name: 'Campgrounds',
    slug: 'campgrounds',
    description: 'Public and private campground options used for launch planning and itinerary testing.',
    icon: 'campground',
    seoTitle: 'Oregon Coast Campgrounds: Seeded Launch Directory',
    seoDescription: 'Find campground listings used in the launch-ready Oregon Coast dataset.'
  },
  {
    name: 'RV Parks',
    slug: 'rv-parks',
    description: 'RV-focused locations and camp-style properties with utility hookups and travel-stop convenience.',
    icon: 'rv',
    seoTitle: 'Oregon Coast RV Parks: Launch Planning Listings',
    seoDescription: 'Explore RV park seed entries tied to launch city routes and stays.'
  },
  {
    name: 'Vacation Rentals',
    slug: 'vacation-rentals',
    description: 'Whole-home and multi-night rental options used for family and group trip scenarios.',
    icon: 'home',
    seoTitle: 'Oregon Coast Vacation Rentals: Seed Data for Launch',
    seoDescription: 'Review vacation rental listing examples for launch itinerary testing.'
  },
  {
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Seafood, casual dining, and local favorites included for conversion and internal linking coverage.',
    icon: 'restaurant',
    seoTitle: 'Oregon Coast Restaurants: Launch Directory Picks',
    seoDescription: 'Browse seeded restaurant listings for major Oregon Coast launch towns.'
  },
  {
    name: 'Beaches',
    slug: 'beaches',
    description: 'Beach access points and shoreline stops used across city pages, map pages, and planning modules.',
    icon: 'beach',
    seoTitle: 'Best Oregon Coast Beaches: Launch Listing Set',
    seoDescription: 'Discover launch-seeded beach listings for trip planning and map exploration.'
  },
  {
    name: 'Whale Watching',
    slug: 'whale-watching',
    description: 'Shore and interpretive viewing locations used in launch editorial and utility teaser content.',
    icon: 'whale',
    seoTitle: 'Oregon Coast Whale Watching: Launch Planning Listings',
    seoDescription: 'Find seed whale-watching locations for launch guides and city pages.'
  },
  {
    name: 'Hiking',
    slug: 'hiking',
    description: 'Trailheads and short-to-moderate hike entries for launch destination and comparison content.',
    icon: 'hiking',
    seoTitle: 'Oregon Coast Hiking Trails: Launch Directory Entries',
    seoDescription: 'Browse launch-seeded hiking spots near top Oregon Coast towns.'
  },
  {
    name: 'Tide Pools',
    slug: 'tide-pools',
    description: 'Intertidal exploration locations connected to tide and weather utility page intent.',
    icon: 'tidepool',
    seoTitle: 'Oregon Coast Tide Pools: Seeded Launch Spots',
    seoDescription: 'Explore tide-pool locations used in launch utilities and nature content.'
  },
  {
    name: 'Family Activities',
    slug: 'family-activities',
    description: 'Attractions and easy-stop experiences suitable for family trip planning in launch scope.',
    icon: 'family',
    seoTitle: 'Family Activities on the Oregon Coast: Launch Seed Picks',
    seoDescription: 'Find launch-friendly family activity listings for Oregon Coast planning.'
  }
]

const listings: ListingSeed[] = [
  {
    name: 'Hallmark Resort Cannon Beach',
    slug: 'hallmark-resort-cannon-beach',
    citySlug: 'cannon-beach',
    regionSlug: 'north-coast',
    categorySlugs: ['hotels'],
    summary: 'Oceanfront stay option near Haystack Rock with walkable access to downtown Cannon Beach dining.',
    description:
      'Editorial seed content placeholder: lodging details are structured for launch UX testing and may require final room-amenity verification directly from property channels.',
    address: '1400 S Hemlock St, Cannon Beach, OR 97110',
    latitude: 45.8859,
    longitude: -123.9638,
    websiteUrl: 'https://www.hallmarkinns.com',
    phone: '503-436-0366',
    attributes: ['Oceanfront', 'Walkable dining access'],
    amenities: ['Wi-Fi', 'Parking', 'Pet-friendly rooms'],
    priceRange: '$$$',
    seasonality: 'Seeded as year-round with peak summer and holiday demand windows.',
    editorNotes: 'Launch placeholder: confirm current renovation status and amenity inclusions.',
    sourceType: 'manual',
    seoTitle: 'Hallmark Resort Cannon Beach: Oceanfront Stay Guide',
    seoDescription: 'Seed listing for Hallmark Resort Cannon Beach with location, amenities, and planning notes.'
  },
  {
    name: 'Surfsand Resort Cannon Beach',
    slug: 'surfsand-resort-cannon-beach',
    citySlug: 'cannon-beach',
    regionSlug: 'north-coast',
    categorySlugs: ['hotels', 'family-activities'],
    summary: 'Family-oriented oceanfront resort option with direct beach access in Cannon Beach.',
    description:
      'Editorial seed content placeholder designed for launch conversion modules. Verify package offerings and exact family programming before broad publication.',
    address: '148 W Gower Ave, Cannon Beach, OR 97110',
    latitude: 45.8892,
    longitude: -123.9642,
    websiteUrl: 'https://www.surfsand.com',
    phone: '503-436-2274',
    attributes: ['Beachfront', 'Family travel fit'],
    amenities: ['On-site dining', 'Wi-Fi', 'Beach access'],
    priceRange: '$$$$',
    seasonality: 'Seeded as high-demand in summer with shoulder-season weekend traffic.',
    editorNotes: 'Placeholder editorial copy; validate resort fee and parking details.',
    sourceType: 'manual',
    seoTitle: 'Surfsand Resort Cannon Beach: Family Oceanfront Option',
    seoDescription: 'Launch seed profile for Surfsand Resort with practical planning details.'
  },
  {
    name: 'Cannon Beach Inn',
    slug: 'cannon-beach-inn',
    citySlug: 'cannon-beach',
    regionSlug: 'north-coast',
    categorySlugs: ['hotels'],
    summary: 'Smaller-scale inn positioning for travelers prioritizing beach time and quiet nights.',
    description:
      'Editorial seed content placeholder: this profile is included to diversify lodging price tiers and should be validated against live inventory and amenities.',
    address: '3215 S Hemlock St, Cannon Beach, OR 97110',
    latitude: 45.8787,
    longitude: -123.9614,
    websiteUrl: 'https://www.cannonbeachinn.com',
    phone: '503-436-9085',
    attributes: ['Budget-conscious tier', 'South Cannon Beach location'],
    amenities: ['Parking', 'Wi-Fi'],
    priceRange: '$$',
    seasonality: 'Seeded as shoulder-season value lodging with summer sellouts.',
    editorNotes: 'Placeholder: verify room mix and pet policy.',
    sourceType: 'manual',
    seoTitle: 'Cannon Beach Inn: Value-Friendly Stay Near the Shore',
    seoDescription: 'Seed listing for Cannon Beach Inn used in launch lodging comparisons.'
  },
  {
    name: 'Ecola State Park Trailheads',
    slug: 'ecola-state-park-trailheads',
    citySlug: 'cannon-beach',
    regionSlug: 'north-coast',
    categorySlugs: ['hiking', 'beaches'],
    summary: 'Scenic overlook and trailhead area with broad coastal viewpoints north of Cannon Beach.',
    description:
      'Editorial seed content placeholder for launch outdoor clusters. Access conditions and closures must be verified against state park updates.',
    address: 'Ecola State Park Rd, Cannon Beach, OR 97110',
    latitude: 45.9136,
    longitude: -123.9816,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Viewpoint access', 'Trail network'],
    amenities: ['Parking', 'Trail signage'],
    priceRange: '$',
    seasonality: 'Seeded as best in dry months with weather-variable shoulder access.',
    editorNotes: 'Launch placeholder: add current day-use fee info during QA.',
    sourceType: 'manual',
    seoTitle: 'Ecola State Park Trails Near Cannon Beach',
    seoDescription: 'Seed trail listing with scenic access notes for North Coast trip planning.'
  },
  {
    name: 'Moes Seaside',
    slug: 'moes-seaside',
    citySlug: 'seaside',
    regionSlug: 'north-coast',
    categorySlugs: ['restaurants', 'family-activities'],
    summary: 'Casual seafood-forward dining stop used in launch family itinerary scenarios.',
    description:
      'Editorial seed content placeholder: listing exists for dining category coverage and should be refined with verified menu and hours information.',
    address: '631 Broadway St, Seaside, OR 97138',
    latitude: 45.9937,
    longitude: -123.9221,
    websiteUrl: 'https://www.moesseafood.com',
    phone: '503-717-7777',
    attributes: ['Casual dining', 'Central Seaside location'],
    amenities: ['Takeout', 'Indoor seating'],
    priceRange: '$$',
    seasonality: 'Seeded as year-round with higher summer wait times.',
    editorNotes: 'Placeholder: validate off-season hours.',
    sourceType: 'manual',
    seoTitle: 'Moes Seaside: Casual Seafood Stop on the Promenade Route',
    seoDescription: 'Seed restaurant listing in Seaside for launch dining and family route planning.'
  },
  {
    name: 'Seaside Aquarium',
    slug: 'seaside-aquarium',
    citySlug: 'seaside',
    regionSlug: 'north-coast',
    categorySlugs: ['family-activities'],
    summary: 'Compact attraction suited for short family stops and weather-flexible itineraries.',
    description:
      'Editorial seed content placeholder for family-friendly trip planning. Confirm admission details and exhibit updates before final publication.',
    address: '200 N Prom, Seaside, OR 97138',
    latitude: 45.9964,
    longitude: -123.9289,
    websiteUrl: 'https://www.seasideaquarium.com',
    phone: '503-738-6211',
    attributes: ['Indoor activity', 'Kid-friendly stop'],
    amenities: ['Gift shop', 'Promenade access'],
    priceRange: '$',
    seasonality: 'Seeded as all-season with added demand on rainy weekends.',
    editorNotes: 'Placeholder editorial entry; verify operating hours and accessibility notes.',
    sourceType: 'manual',
    seoTitle: 'Seaside Aquarium: Family Activity Stop on the North Coast',
    seoDescription: 'Launch seed listing for Seaside Aquarium with practical planning context.'
  },
  {
    name: 'Seaside Cove Campground',
    slug: 'seaside-cove-campground',
    citySlug: 'seaside',
    regionSlug: 'north-coast',
    categorySlugs: ['campgrounds', 'rv-parks'],
    summary: 'Editorial seed campground record for route testing near Seaside and Astoria corridors.',
    description:
      'Placeholder editorial seed content: this entry is intentionally marked as synthetic launch data and should be replaced or verified against a real campground source before public indexing.',
    address: 'Placeholder Address, Seaside, OR 97138',
    latitude: 45.9891,
    longitude: -123.9052,
    attributes: ['Placeholder campground seed', 'RV-compatible staging'],
    amenities: ['Restrooms', 'Hookup placeholder'],
    priceRange: '$$',
    seasonality: 'Seed-only assumption: open spring through fall.',
    editorNotes: 'Placeholder seed listing created because exact facility details are uncertain.',
    sourceType: 'manual',
    seoTitle: 'Seaside Cove Campground (Editorial Seed Placeholder)',
    seoDescription: 'Placeholder campground seed for launch schema and route testing.'
  },
  {
    name: 'Astoria Riverwalk Inn',
    slug: 'astoria-riverwalk-inn',
    citySlug: 'astoria',
    regionSlug: 'north-coast',
    categorySlugs: ['hotels'],
    summary: 'Waterfront-adjacent lodging option supporting Astoria overnight itinerary coverage.',
    description:
      'Editorial seed content placeholder: this profile is intended for launch lodging distribution across top cities and should be finalized with current room details.',
    address: '400 Industry St, Astoria, OR 97103',
    latitude: 46.184,
    longitude: -123.8082,
    websiteUrl: 'https://www.astoriariverwalkinn.com',
    phone: '503-325-2013',
    attributes: ['Riverfront context', 'Astoria base stay'],
    amenities: ['Parking', 'Breakfast placeholder'],
    priceRange: '$$',
    seasonality: 'Seeded as year-round with summer festival demand.',
    editorNotes: 'Placeholder: verify waterfront room availability and pet policy.',
    sourceType: 'manual',
    seoTitle: 'Astoria Riverwalk Inn: Waterfront Base for North Coast Trips',
    seoDescription: 'Seed lodging profile for Astoria route planning and overnight stays.'
  },
  {
    name: 'Bowpicker Fish and Chips',
    slug: 'bowpicker-fish-chips',
    citySlug: 'astoria',
    regionSlug: 'north-coast',
    categorySlugs: ['restaurants'],
    summary: 'Popular quick-stop seafood listing used for local food discovery pathways.',
    description:
      'Editorial seed content placeholder for dining discovery modules. Confirm operating pattern and queue expectations with current sources.',
    address: '1634 Duane St, Astoria, OR 97103',
    latitude: 46.187,
    longitude: -123.8284,
    attributes: ['Quick-service seafood', 'High local visibility'],
    amenities: ['Takeout'],
    priceRange: '$$',
    seasonality: 'Seeded as high-demand in peak travel months.',
    editorNotes: 'Placeholder: hours and service format may change seasonally.',
    sourceType: 'manual',
    seoTitle: 'Bowpicker Fish and Chips: Astoria Seafood Stop',
    seoDescription: 'Launch seed restaurant listing for Astoria food-focused trip planning.'
  },
  {
    name: 'Astoria Column Trail',
    slug: 'astoria-column-trail',
    citySlug: 'astoria',
    regionSlug: 'north-coast',
    categorySlugs: ['hiking', 'family-activities'],
    summary: 'Short uphill route and viewpoint pairing suitable for half-day Astoria itineraries.',
    description:
      'Editorial seed content placeholder for hiking + family category overlap. Validate trail signage and seasonal access notes before publication.',
    address: '1 Coxcomb Dr, Astoria, OR 97103',
    latitude: 46.1822,
    longitude: -123.8146,
    websiteUrl: 'https://www.astoriacolumn.org',
    attributes: ['Viewpoint destination', 'Short hike option'],
    amenities: ['Parking', 'Interpretive area'],
    priceRange: '$',
    seasonality: 'Seeded as year-round with weather considerations in winter.',
    editorNotes: 'Placeholder: confirm exact access fees if any.',
    sourceType: 'manual',
    seoTitle: 'Astoria Column Trail: Viewpoint Hike and Family Stop',
    seoDescription: 'Seed trail listing for Astoria scenic planning and activity filtering.'
  },
  {
    name: 'Fort Stevens State Park Campground',
    slug: 'fort-stevens-state-park-campground',
    citySlug: 'astoria',
    regionSlug: 'north-coast',
    categorySlugs: ['campgrounds', 'rv-parks', 'beaches'],
    summary: 'Large state park camping area often used in longer North Coast road-trip plans.',
    description:
      'Editorial seed content placeholder: reservation policies and loop-specific details should be confirmed from official state park sources.',
    address: '100 Peter Iredale Rd, Hammond, OR 97121',
    latitude: 46.1982,
    longitude: -123.9626,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['State park camping', 'Beach access nearby'],
    amenities: ['Restrooms', 'Showers', 'RV sites'],
    priceRange: '$$',
    seasonality: 'Seeded as strongest in late spring through early fall.',
    editorNotes: 'Placeholder: add loop-level notes after source verification.',
    sourceType: 'manual',
    seoTitle: 'Fort Stevens State Park Campground: North Coast Camping Base',
    seoDescription: 'Seed campground listing near Astoria with beach and RV planning context.'
  },
  {
    name: 'Yaquina Head Outstanding Natural Area',
    slug: 'yaquina-head-outstanding-natural-area',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['beaches', 'tide-pools', 'whale-watching'],
    summary: 'High-interest Newport stop for lighthouse views, tide pools, and seasonal whale spotting.',
    description:
      'Editorial seed content placeholder supporting nature + utility route overlap. Verify ranger-program and pass requirements before publishing broadly.',
    address: '750 NW Lighthouse Dr, Newport, OR 97365',
    latitude: 44.6767,
    longitude: -124.0768,
    websiteUrl: 'https://www.blm.gov/yaquina-head',
    attributes: ['Lighthouse area', 'Tide-pool access', 'Whale spotting vantage'],
    amenities: ['Parking', 'Interpretive center'],
    priceRange: '$',
    seasonality: 'Seeded for year-round wildlife interest with strong spring migration traffic.',
    editorNotes: 'Placeholder: confirm current fee and hours.',
    sourceType: 'manual',
    seoTitle: 'Yaquina Head Newport: Tide Pools, Lighthouse, and Whale Views',
    seoDescription: 'Seed nature listing for Newport trip planning and utility page linking.'
  },
  {
    name: 'Oregon Coast Aquarium',
    slug: 'oregon-coast-aquarium',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['family-activities'],
    summary: 'Core family attraction in Newport used for city-page conversion and itinerary anchors.',
    description:
      'Editorial seed content placeholder: included as a reliable family trip anchor, pending final verification of exhibit schedules and ticketing links.',
    address: '2820 SE Ferry Slip Rd, Newport, OR 97365',
    latitude: 44.6142,
    longitude: -124.045,
    websiteUrl: 'https://www.aquarium.org',
    phone: '541-867-3474',
    attributes: ['Family attraction', 'Indoor and outdoor exhibits'],
    amenities: ['Parking', 'Gift shop', 'Cafe'],
    priceRange: '$$',
    seasonality: 'Seeded as all-season with summer and holiday demand spikes.',
    editorNotes: 'Placeholder: verify timed-entry and event calendar references.',
    sourceType: 'manual',
    seoTitle: 'Oregon Coast Aquarium Newport: Family Trip Essential',
    seoDescription: 'Launch seed attraction listing for Newport family planning flows.'
  },
  {
    name: 'Rogue Bayfront Public House',
    slug: 'rogue-bayfront-public-house',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['restaurants'],
    summary: 'Bayfront dining and brewery stop used for Newport food and waterfront route content.',
    description:
      'Editorial seed content placeholder for dining intent clusters. Confirm exact hours and seasonal menu shifts before final publication.',
    address: '748 SW Bay Blvd, Newport, OR 97365',
    latitude: 44.6263,
    longitude: -124.0563,
    websiteUrl: 'https://www.rogue.com',
    attributes: ['Bayfront dining', 'Brewery brand recognition'],
    amenities: ['Indoor seating', 'Outdoor seating'],
    priceRange: '$$',
    seasonality: 'Seeded as year-round with heavier summer foot traffic.',
    editorNotes: 'Placeholder: add reservation guidance if applicable.',
    sourceType: 'manual',
    seoTitle: 'Rogue Bayfront Public House Newport Dining Stop',
    seoDescription: 'Seed restaurant listing for Newport bayfront food planning.'
  },
  {
    name: 'Agate Beach State Recreation Site',
    slug: 'agate-beach-state-recreation-site',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['beaches'],
    summary: 'Open shoreline access point used for beach-focused Newport itineraries and sunset routes.',
    description:
      'Editorial seed content placeholder for beach category depth. Confirm seasonal parking and trail access details with official updates.',
    address: 'Agate Beach State Recreation Site, Newport, OR 97365',
    latitude: 44.6715,
    longitude: -124.0729,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Wide beach access', 'Sunset viewpoint potential'],
    amenities: ['Parking', 'Trail access'],
    priceRange: '$',
    seasonality: 'Seeded as year-round with best comfort in warmer months.',
    editorNotes: 'Placeholder: confirm access points and facilities.',
    sourceType: 'manual',
    seoTitle: 'Agate Beach Newport: Shoreline Access and Coastal Walks',
    seoDescription: 'Seed beach listing for Newport planning and category pages.'
  },
  {
    name: 'Beverly Beach State Park Campground',
    slug: 'beverly-beach-state-park',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['campgrounds', 'rv-parks', 'beaches'],
    summary: 'Launch-priority campground from sitemap examples, useful for stay and plan route clusters.',
    description:
      'Editorial seed content placeholder: included to match sitemap launch priorities. Validate reservation windows and loop-specific details before publishing externally.',
    address: '198 NE 123rd St, Newport, OR 97365',
    latitude: 44.7565,
    longitude: -124.0575,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['State park campground', 'Beach access trail'],
    amenities: ['Restrooms', 'Showers', 'RV sites'],
    priceRange: '$$',
    seasonality: 'Seeded for spring-through-fall demand with winter variability.',
    editorNotes: 'Placeholder: verify current closures and reservation policy.',
    sourceType: 'manual',
    seoTitle: 'Beverly Beach State Park Campground: Newport Area Guide',
    seoDescription: 'Seed listing for Beverly Beach campground aligned to launch sitemap priorities.'
  },
  {
    name: 'Depoe Bay Whale Watching Center',
    slug: 'depoe-bay-whale-watching-center',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    categorySlugs: ['whale-watching', 'family-activities'],
    summary: 'Interpretive stop and viewpoint area seeded for whale season planning pathways.',
    description:
      'Editorial seed content placeholder: this listing supports launch guide linking and utility teaser content. Confirm programming schedules and closures with official sources.',
    address: '119 SW US-101, Depoe Bay, OR 97341',
    latitude: 44.8087,
    longitude: -124.0585,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Whale-viewing hotspot', 'Interpretive center'],
    amenities: ['Parking', 'Restrooms'],
    priceRange: '$',
    seasonality: 'Seeded for strong interest during migration windows and spring weekends.',
    editorNotes: 'Placeholder: verify center hours and staffing.',
    sourceType: 'manual',
    seoTitle: 'Depoe Bay Whale Watching Center: Central Coast Viewing Stop',
    seoDescription: 'Seed whale-watching listing supporting launch guide and city routes.'
  },
  {
    name: 'Chinook Winds Resort',
    slug: 'chinook-winds-resort',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['hotels'],
    summary: 'Large lodging property in Lincoln City used for inventory and conversion path breadth.',
    description:
      'Editorial seed content placeholder for major-stay coverage. Confirm room inventory categories and package offerings before public promotion.',
    address: '1777 NW 44th St, Lincoln City, OR 97367',
    latitude: 45.0034,
    longitude: -124.0098,
    websiteUrl: 'https://www.chinookwindscasino.com',
    phone: '888-244-6665',
    attributes: ['High-capacity lodging', 'North Lincoln City access'],
    amenities: ['On-site dining', 'Parking', 'Wi-Fi'],
    priceRange: '$$$',
    seasonality: 'Seeded as all-season with event-driven occupancy peaks.',
    editorNotes: 'Placeholder: validate non-gaming family amenity framing.',
    sourceType: 'manual',
    seoTitle: 'Chinook Winds Resort Lincoln City Stay Profile',
    seoDescription: 'Seed hotel listing in Lincoln City for launch stay category coverage.'
  },
  {
    name: 'Devils Lake State Recreation Area',
    slug: 'devils-lake-state-recreation-area',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['campgrounds', 'family-activities'],
    summary: 'In-town camping access point useful for mixed lake and beach itinerary planning.',
    description:
      'Editorial seed content placeholder: entry supports campground and family category diversity. Confirm lake access updates and reservation guidance in QA.',
    address: '750 SE Devils Lake Rd, Lincoln City, OR 97367',
    latitude: 44.9683,
    longitude: -124.0067,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Lake access', 'In-town campground convenience'],
    amenities: ['Restrooms', 'Boat access placeholder'],
    priceRange: '$$',
    seasonality: 'Seeded for spring through early fall use.',
    editorNotes: 'Placeholder: verify current camping loop availability.',
    sourceType: 'manual',
    seoTitle: 'Devils Lake State Recreation Area: Lincoln City Camping',
    seoDescription: 'Seed campground listing for Lincoln City planning and family trip use cases.'
  },
  {
    name: 'Kyllos Seafood Grill',
    slug: 'kyllos-seafood-grill',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['restaurants'],
    summary: 'Ocean-view dining option included for Lincoln City restaurant discovery paths.',
    description:
      'Editorial seed content placeholder for category page and city page dining modules. Confirm reservation and seasonal menu information before final publish.',
    address: '1110 NW 1st Ct, Lincoln City, OR 97367',
    latitude: 44.9692,
    longitude: -124.0203,
    websiteUrl: 'https://www.kyllosseafoodandgrill.com',
    attributes: ['Ocean view dining', 'Seafood-focused menu'],
    amenities: ['Indoor seating', 'Outdoor seating'],
    priceRange: '$$$',
    seasonality: 'Seeded as year-round with stronger summer demand.',
    editorNotes: 'Placeholder: verify hours and reservation notes.',
    sourceType: 'manual',
    seoTitle: 'Kyllos Seafood Grill Lincoln City Dining Profile',
    seoDescription: 'Launch seed restaurant listing for Lincoln City food planning.'
  },
  {
    name: 'Roads End State Recreation Site',
    slug: 'roads-end-state-recreation-site',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['beaches'],
    summary: 'North Lincoln City beach access area with broad shoreline walking opportunities.',
    description:
      'Editorial seed content placeholder for beach category breadth. Confirm parking and trail conditions before external promotion.',
    address: 'Roads End State Recreation Site, Lincoln City, OR 97367',
    latitude: 45.0121,
    longitude: -124.0116,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Open beach access', 'North city trail linkages'],
    amenities: ['Parking', 'Path access'],
    priceRange: '$',
    seasonality: 'Seeded as year-round with weather-dependent comfort.',
    editorNotes: 'Placeholder: verify official access point details.',
    sourceType: 'manual',
    seoTitle: 'Roads End Lincoln City Beach Access Guide',
    seoDescription: 'Seed beach listing for Lincoln City route and category planning.'
  },
  {
    name: 'Cascade Head Trail North',
    slug: 'cascade-head-trail-north',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['hiking'],
    summary: 'Scenic trail corridor frequently referenced in Central Coast hiking intent searches.',
    description:
      'Editorial seed content placeholder for launch hiking filters. Verify active trailhead status and seasonal closures with land managers.',
    address: 'N Three Rocks Rd, Otis, OR 97368',
    latitude: 45.054,
    longitude: -124.0049,
    websiteUrl: 'https://www.nature.org',
    attributes: ['Viewpoint hiking', 'Moderate trail effort'],
    amenities: ['Trail signage', 'Parking placeholder'],
    priceRange: '$',
    seasonality: 'Seeded for best hiking conditions in late spring through early fall.',
    editorNotes: 'Placeholder: confirm current access and permit expectations.',
    sourceType: 'manual',
    seoTitle: 'Cascade Head Trail North: Lincoln City Area Hike',
    seoDescription: 'Seed hiking listing for Central Coast route planning and category pages.'
  },
  {
    name: 'Cape Lookout State Park',
    slug: 'cape-lookout-state-park',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['campgrounds', 'hiking', 'beaches'],
    summary: 'Sitemap-priority park listing included for launch stay + do crossover testing.',
    description:
      'Editorial seed content placeholder: this listing follows sitemap naming priorities. Exact nearby-city mapping is a launch placeholder and should be refined with final regional editorial logic.',
    address: '13000 Whiskey Creek Rd, Tillamook, OR 97141',
    latitude: 45.3399,
    longitude: -123.9712,
    websiteUrl: 'https://stateparks.oregon.gov',
    attributes: ['Sitemap-priority state park', 'Trail and beach overlap'],
    amenities: ['Campground', 'Trailheads', 'Day-use parking'],
    priceRange: '$$',
    seasonality: 'Seeded as spring-through-fall peak destination with year-round day use.',
    editorNotes: 'Placeholder: city assignment is for launch testing and may be re-mapped later.',
    sourceType: 'manual',
    seoTitle: 'Cape Lookout State Park: Camping and Trail Planning Seed',
    seoDescription: 'Sitemap-aligned launch seed listing for Cape Lookout state park content.'
  },
  {
    name: 'Drift Creek Falls Trail',
    slug: 'drift-creek-falls-trail',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['hiking', 'family-activities'],
    summary: 'Popular suspension-bridge trail concept used for family and hiking itinerary overlap.',
    description:
      'Editorial seed content placeholder for launch trail variety. Trail advisories and road conditions should be confirmed before final public-facing use.',
    address: 'NF-17, Lincoln City, OR 97367',
    latitude: 44.9944,
    longitude: -123.8592,
    attributes: ['Bridge viewpoint', 'Family-friendly hiking goal'],
    amenities: ['Trail signage', 'Parking placeholder'],
    priceRange: '$',
    seasonality: 'Seeded as strongest in dry seasons with winter caution notes.',
    editorNotes: 'Placeholder: verify route conditions and access updates.',
    sourceType: 'manual',
    seoTitle: 'Drift Creek Falls Trail: Family-Friendly Hike Near Lincoln City',
    seoDescription: 'Seed trail listing for Lincoln City hiking and itinerary planning modules.'
  },
  {
    name: 'Lincoln City Beachfront Vacation Rental',
    slug: 'lincoln-city-beachfront-vacation-rental',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    categorySlugs: ['vacation-rentals', 'family-activities'],
    summary: 'Editorial seed rental profile used for launch comparison content across lodging types.',
    description:
      'Placeholder editorial seed content: this is a synthetic launch listing included to validate vacation-rental schema behavior. Replace with verified inventory source data before public SEO use.',
    address: 'Placeholder Coastal Address, Lincoln City, OR 97367',
    latitude: 44.9542,
    longitude: -124.0184,
    attributes: ['Synthetic seed rental', 'Family trip formatting test'],
    amenities: ['Kitchen', 'Multiple bedrooms', 'Parking placeholder'],
    priceRange: '$$$',
    seasonality: 'Seed-only assumption: summer premium pricing with winter value periods.',
    editorNotes: 'Synthetic placeholder listing due to uncertain exact property facts.',
    sourceType: 'manual',
    seoTitle: 'Lincoln City Beachfront Vacation Rental (Editorial Seed)',
    seoDescription: 'Placeholder vacation rental seed for launch category and comparison testing.'
  }
]

const guides: GuideSeed[] = [
  {
    title: 'Oregon Coast Whale Watching Guide (Launch Seed 2026)',
    slug: 'oregon-coast-whale-watching-guide-2026',
    excerpt:
      'Launch-oriented editorial seed guide mapping major whale-watching viewpoints and practical planning notes by region.',
    body: `Editorial seed content placeholder: This guide is structured for launch testing, not final publication language.

What this draft covers:
- Migration windows noted in the sitemap direction.
- Core viewpoints around Newport and Depoe Bay.
- Shore-viewing basics and weather/tide utility references.

Needs verification before broad publication:
- Exact seasonal timing statements.
- Tour operator details and official program calendars.
- Safety notes tied to NOAA/NWS references.`,
    relatedCitySlugs: ['newport', 'lincoln-city', 'cannon-beach'],
    relatedCategorySlugs: ['whale-watching', 'beaches'],
    travelSeason: 'Winter to early summer (placeholder editorial framing)',
    seoTitle: 'Oregon Coast Whale Watching Guide 2026 (Launch Seed)',
    seoDescription: 'Seed guide for whale-watching planning across launch-priority Oregon Coast cities.'
  },
  {
    title: 'Oregon Coast Camping Guide (Launch Seed 2026)',
    slug: 'oregon-coast-camping-guide-2026',
    excerpt:
      'Launch-friendly camping overview comparing campground styles, RV fit, and seasonal booking pressure.',
    body: `Editorial seed content placeholder: This camping guide is intentionally concise and structured for launch IA validation.

Included for launch coverage:
- Campground vs RV park framing.
- North Coast and Central Coast anchor stops.
- Reservation timing guidance in general terms.

Verification required:
- Site-specific policy rules.
- Up-to-date reservation windows.
- Utility hookups and seasonal closures by facility.`,
    relatedCitySlugs: ['astoria', 'newport', 'lincoln-city'],
    relatedCategorySlugs: ['campgrounds', 'rv-parks'],
    travelSeason: 'Late spring through early fall (placeholder editorial framing)',
    seoTitle: 'Oregon Coast Camping Guide 2026 (Launch Seed)',
    seoDescription: 'Seed camping guide for launch categories, city links, and planning pathways.'
  }
]

const events: EventSeed[] = [
  {
    title: 'Cannon Beach Spring Art Walk Weekend (Seed Placeholder)',
    slug: 'cannon-beach-spring-art-walk-seed',
    citySlug: 'cannon-beach',
    regionSlug: 'north-coast',
    startDate: '2026-05-15T18:00:00.000Z',
    endDate: '2026-05-17T22:00:00.000Z',
    venue: 'Downtown Cannon Beach',
    summary:
      'Editorial seed schedule placeholder for route freshness testing; confirm official dates with city event channels.',
    description:
      'This event record is seeded for launch feed behavior and internal linking tests. Date/time details are placeholders pending real calendar confirmation.',
    seoTitle: 'Cannon Beach Spring Art Walk (Editorial Seed Event)',
    seoDescription: 'Placeholder event listing for launch event-feed and city-page freshness testing.'
  },
  {
    title: 'Seaside Summer Promenade Market (Seed Placeholder)',
    slug: 'seaside-summer-promenade-market-seed',
    citySlug: 'seaside',
    regionSlug: 'north-coast',
    startDate: '2026-07-11T17:00:00.000Z',
    endDate: '2026-07-11T22:00:00.000Z',
    venue: 'Seaside Promenade District',
    summary:
      'Editorial seed market event used for launch date-filter and seasonal homepage modules.',
    description:
      'Placeholder event seed content to test event rendering, sorted feeds, and city-level event previews.',
    seoTitle: 'Seaside Summer Promenade Market (Editorial Seed Event)',
    seoDescription: 'Placeholder Seaside event for launch event listing and homepage seasonal content testing.'
  },
  {
    title: 'Astoria Waterfront Music Night (Seed Placeholder)',
    slug: 'astoria-waterfront-music-night-seed',
    citySlug: 'astoria',
    regionSlug: 'north-coast',
    startDate: '2026-08-20T01:00:00.000Z',
    endDate: '2026-08-20T04:00:00.000Z',
    venue: 'Astoria Riverfront Venue',
    summary:
      'Editorial seed event placeholder for evening programming patterns in launch event UX.',
    description:
      'This is launch-only placeholder editorial data to validate event cards, date ordering, and link paths.',
    seoTitle: 'Astoria Waterfront Music Night (Editorial Seed Event)',
    seoDescription: 'Placeholder Astoria event record for launch event feed behavior testing.'
  },
  {
    title: 'Newport Bayfront Seafood Weekend (Seed Placeholder)',
    slug: 'newport-bayfront-seafood-weekend-seed',
    citySlug: 'newport',
    regionSlug: 'central-coast',
    startDate: '2026-09-18T18:00:00.000Z',
    endDate: '2026-09-20T23:00:00.000Z',
    venue: 'Historic Bayfront Newport',
    summary:
      'Editorial seed placeholder event for Central Coast demand and freshness coverage.',
    description:
      'Launch seed event data only. Verify real vendor lineup and permitting details if this is replaced with a factual listing.',
    seoTitle: 'Newport Bayfront Seafood Weekend (Editorial Seed Event)',
    seoDescription: 'Placeholder Newport event for launch testing of event feeds and city previews.'
  },
  {
    title: 'Lincoln City Coastal Kite Weekend (Seed Placeholder)',
    slug: 'lincoln-city-coastal-kite-weekend-seed',
    citySlug: 'lincoln-city',
    regionSlug: 'central-coast',
    startDate: '2026-10-03T17:00:00.000Z',
    endDate: '2026-10-04T23:00:00.000Z',
    venue: 'Lincoln City Beachfront',
    summary:
      'Editorial seed placeholder for shoulder-season event demand and weather-aware planning context.',
    description:
      'This placeholder entry exists to support launch event range testing and should be replaced with confirmed official event data.',
    seoTitle: 'Lincoln City Coastal Kite Weekend (Editorial Seed Event)',
    seoDescription: 'Placeholder Lincoln City event record for launch event filtering and city linking.'
  },
]

const itinerary: ItinerarySeed = {
  title: '3-Day Oregon Coast Weekend Itinerary (Launch Seed)',
  slug: '3-day-oregon-coast-weekend-itinerary',
  summary:
    'A launch-seed weekend itinerary aligned with sitemap naming, spanning North and Central Coast anchor stops.',
  tripLength: '3 days',
  stopSlugs: [
    'hallmark-resort-cannon-beach',
    'astoria-column-trail',
    'oregon-coast-aquarium',
    'depoe-bay-whale-watching-center',
    'roads-end-state-recreation-site'
  ],
  body: `Editorial seed content placeholder: this itinerary structure is for launch model validation and should be replaced with finalized editorial sequencing.

Day 1 (North Coast): Cannon Beach arrival, sunset walk, overnight stay.
Day 2 (North to Central transition): Astoria viewpoint stop, drive south, Newport bayfront evening.
Day 3 (Central Coast): Aquarium morning, whale-view stop, Lincoln City beach closeout.

Notes:
- Stop order and drive pacing are seed assumptions.
- Use this entry to test itinerary-to-listing relationship rendering and internal links.`,
  relatedCitySlugs: ['cannon-beach', 'astoria', 'newport', 'lincoln-city'],
  seoTitle: '3-Day Oregon Coast Weekend Itinerary (Launch Seed)',
  seoDescription: 'Seed weekend itinerary aligned to launch sitemap and listing relationship testing.'
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const cmsRoot = path.resolve(dirname, '../..')
const repoRoot = path.resolve(cmsRoot, '../..')

const loadEnv = (): void => {
  dotenv.config({ path: path.join(repoRoot, '.env') })
  dotenv.config({ path: path.join(cmsRoot, '.env') })
}

const resolveSeedImagePath = (): string => {
  const candidates = [
    path.join(repoRoot, 'files/screen.png'),
    path.join(cmsRoot, 'files/screen.png'),
    path.join(process.cwd(), 'files/screen.png')
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error('Seed image missing. Expected files/screen.png in repository.')
}

const findOneBySlug = async (payload: any, collection: string, slug: string): Promise<SluggedDoc | null> => {
  const existing = await payload.find({
    collection,
    where: {
      slug: {
        equals: slug
      }
    },
    limit: 1,
    depth: 0,
    overrideAccess: true
  })

  return existing.docs[0] || null
}

const upsertBySlug = async (payload: any, collection: string, slug: string, data: Record<string, unknown>): Promise<SluggedDoc> => {
  const existing = await findOneBySlug(payload, collection, slug)

  if (existing) {
    return payload.update({
      collection,
      id: existing.id,
      data,
      depth: 0,
      overrideAccess: true
    })
  }

  return payload.create({
    collection,
    data,
    depth: 0,
    overrideAccess: true
  })
}

const publishListing = async (payload: any, listingId: number | string): Promise<void> => {
  await payload.update({
    collection: 'listings',
    id: listingId,
    data: { status: 'published' },
    depth: 0,
    overrideAccess: true
  })
}

const publishEditorial = async (
  payload: any,
  collection: 'guides' | 'events' | 'itineraries',
  id: number | string
): Promise<void> => {
  await payload.update({
    collection,
    id,
    data: { status: 'published' },
    depth: 0,
    overrideAccess: true
  })
}

export async function seed(): Promise<void> {
  loadEnv()

  const payload = await getPayload({ config: payloadConfig })

  try {
    const heroImagePath = resolveSeedImagePath()

    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        alt: {
          equals: 'ExplOregon Coast launch seed hero placeholder image'
        }
      },
      limit: 1,
      depth: 0,
      overrideAccess: true
    })

    const heroImage =
      existingMedia.docs[0] ||
      (await payload.create({
        collection: 'media',
        data: {
          alt: 'ExplOregon Coast launch seed hero placeholder image'
        },
        filePath: heroImagePath,
        depth: 0,
        overrideAccess: true
      }))

    const regionBySlug = new Map<string, SluggedDoc>()
    const cityBySlug = new Map<string, SluggedDoc>()
    const categoryBySlug = new Map<string, SluggedDoc>()
    const listingBySlug = new Map<string, SluggedDoc>()
    const categorySlugsBySection = {
      hotels: ['hotels', 'campgrounds', 'rv-parks', 'vacation-rentals'],
      dining: ['restaurants'],
      attractions: ['beaches', 'family-activities', 'hiking', 'tide-pools', 'whale-watching']
    } as const

    const resolveCategoryIds = (sectionName: string, categorySlugs: readonly string[]) =>
      categorySlugs.map((categorySlug) => {
        const categoryDoc = categoryBySlug.get(categorySlug)
        if (!categoryDoc) {
          throw new Error(`Missing category ${categorySlug} for ${sectionName}`)
        }
        return categoryDoc.id
      })

    for (const region of regions) {
      const regionDoc = await upsertBySlug(payload, 'regions', region.slug, {
        ...region,
        heroImage: heroImage.id
      })
      regionBySlug.set(region.slug, regionDoc)
    }

    for (const category of categories) {
      const categoryDoc = await upsertBySlug(payload, 'listingCategories', category.slug, category)
      categoryBySlug.set(category.slug, categoryDoc)
    }

    for (const city of cities) {
      const regionDoc = regionBySlug.get(city.regionSlug)
      if (!regionDoc) {
        throw new Error(`Missing region for city ${city.slug}`)
      }

      const hotelCategoryIds = resolveCategoryIds(`city ${city.slug} hotels section`, categorySlugsBySection.hotels)
      const diningCategoryIds = resolveCategoryIds(`city ${city.slug} dining section`, categorySlugsBySection.dining)
      const attractionCategoryIds = resolveCategoryIds(
        `city ${city.slug} attractions section`,
        categorySlugsBySection.attractions
      )

      const cityDoc = await upsertBySlug(payload, 'cities', city.slug, {
        name: city.name,
        slug: city.slug,
        region: regionDoc.id,
        heroImage: heroImage.id,
        summary: city.summary,
        intro: city.intro,
        whyVisit: city.whyVisit,
        whenToGo: city.whenToGo,
        listingSections: {
          hotels: {
            kicker: 'Hotels',
            title: 'Where to stay',
            lede: `Find curated places to stay in and around ${city.name}.`,
            categories: hotelCategoryIds
          },
          dining: {
            kicker: 'Dining',
            title: 'Where to eat',
            lede: `Find curated dining options in and around ${city.name}.`,
            categories: diningCategoryIds
          },
          attractions: {
            kicker: 'Attractions',
            title: 'Where to explore',
            lede: `Find curated attractions and activities in and around ${city.name}.`,
            categories: attractionCategoryIds
          }
        },
        featuredHighlights: city.featuredHighlights.map((highlight) => ({ highlight })),
        latitude: city.latitude,
        longitude: city.longitude,
        faq: city.faq,
        seoTitle: city.seoTitle,
        seoDescription: city.seoDescription,
        status: 'published'
      })

      cityBySlug.set(city.slug, cityDoc)
    }

    for (const listing of listings) {
      const cityDoc = cityBySlug.get(listing.citySlug)
      const regionDoc = regionBySlug.get(listing.regionSlug)

      if (!cityDoc || !regionDoc) {
        throw new Error(`Missing city or region for listing ${listing.slug}`)
      }

      const categoryIds = listing.categorySlugs.map((categorySlug) => {
        const categoryDoc = categoryBySlug.get(categorySlug)
        if (!categoryDoc) {
          throw new Error(`Missing category ${categorySlug} for listing ${listing.slug}`)
        }
        return categoryDoc.id
      })

      const listingDoc = await upsertBySlug(payload, 'listings', listing.slug, {
        name: listing.name,
        slug: listing.slug,
        city: cityDoc.id,
        region: regionDoc.id,
        categories: categoryIds,
        summary: listing.summary,
        description: listing.description,
        heroImage: heroImage.id,
        gallery: [heroImage.id],
        address: listing.address,
        latitude: listing.latitude,
        longitude: listing.longitude,
        websiteUrl: listing.websiteUrl,
        phone: listing.phone,
        attributes: listing.attributes.map((attribute) => ({ attribute })),
        amenities: listing.amenities.map((amenity) => ({ amenity })),
        priceRange: listing.priceRange,
        seasonality: listing.seasonality,
        editorNotes: listing.editorNotes,
        sourceType: listing.sourceType,
        status: 'approved',
        seoTitle: listing.seoTitle,
        seoDescription: listing.seoDescription
      })

      await publishListing(payload, listingDoc.id)
      listingBySlug.set(listing.slug, listingDoc)
    }

    for (const guide of guides) {
      const relatedCities = guide.relatedCitySlugs
        .map((slug) => cityBySlug.get(slug)?.id)
        .filter((id): id is number | string => Boolean(id))
      const relatedCategories = guide.relatedCategorySlugs
        .map((slug) => categoryBySlug.get(slug)?.id)
        .filter((id): id is number | string => Boolean(id))

      const guideDoc = await upsertBySlug(payload, 'guides', guide.slug, {
        title: guide.title,
        slug: guide.slug,
        heroImage: heroImage.id,
        excerpt: guide.excerpt,
        body: guide.body,
        relatedCities,
        relatedCategories,
        travelSeason: guide.travelSeason,
        status: 'review',
        seoTitle: guide.seoTitle,
        seoDescription: guide.seoDescription
      })

      await publishEditorial(payload, 'guides', guideDoc.id)
    }

    for (const event of events) {
      const cityDoc = cityBySlug.get(event.citySlug)
      const regionDoc = regionBySlug.get(event.regionSlug)
      if (!cityDoc || !regionDoc) {
        throw new Error(`Missing city or region for event ${event.slug}`)
      }

      const eventDoc = await upsertBySlug(payload, 'events', event.slug, {
        title: event.title,
        slug: event.slug,
        city: cityDoc.id,
        region: regionDoc.id,
        startDate: event.startDate,
        endDate: event.endDate,
        venue: event.venue,
        summary: event.summary,
        description: event.description,
        heroImage: heroImage.id,
        eventUrl: event.eventUrl,
        status: 'review',
        seoTitle: event.seoTitle,
        seoDescription: event.seoDescription
      })

      await publishEditorial(payload, 'events', eventDoc.id)
    }

    const itineraryStops = itinerary.stopSlugs
      .map((slug) => listingBySlug.get(slug)?.id)
      .filter((id): id is number | string => Boolean(id))

    if (itineraryStops.length === 0) {
      throw new Error('Itinerary seed requires at least one listing stop.')
    }

    const itineraryCities = itinerary.relatedCitySlugs
      .map((slug) => cityBySlug.get(slug)?.id)
      .filter((id): id is number | string => Boolean(id))

    const itineraryDoc = await upsertBySlug(payload, 'itineraries', itinerary.slug, {
      title: itinerary.title,
      slug: itinerary.slug,
      summary: itinerary.summary,
      heroImage: heroImage.id,
      tripLength: itinerary.tripLength,
      stops: itineraryStops,
      body: itinerary.body,
      relatedCities: itineraryCities,
      status: 'review',
      seoTitle: itinerary.seoTitle,
      seoDescription: itinerary.seoDescription
    })

    await publishEditorial(payload, 'itineraries', itineraryDoc.id)

    const featuredCityIds = ['cannon-beach', 'seaside', 'astoria', 'newport', 'lincoln-city']
      .map((slug) => cityBySlug.get(slug)?.id)
      .filter((id): id is number | string => Boolean(id))

    const featuredCategoryIds = ['hotels', 'beaches', 'whale-watching', 'campgrounds', 'restaurants']
      .map((slug) => categoryBySlug.get(slug)?.id)
      .filter((id): id is number | string => Boolean(id))

    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        heroHeadline: 'Plan the Oregon Coast with trusted local structure, not guesswork.',
        heroSubheadline:
          'Launch seed copy placeholder: discover where to stay, what to do, and which coastal towns fit your trip style using curated directory data and practical planning tools.',
        heroCta: {
          label: 'Start with Cities',
          url: '/cities'
        },
        featuredCities: featuredCityIds,
        featuredCategories: featuredCategoryIds,
        editorialIntroBlock: {
          headline: 'Coastal Pulse and Editors Choice',
          body: 'Seed sections mapped to homepage design: comparison block (Cannon Beach vs Newport vs Lincoln City), editors choice listings (Hallmark Resort Cannon Beach, Yaquina Head, Roads End), coastal pulse content (seasonal whale migration and weekend event placeholders), and email signup block (Hidden Beaches Map lead magnet placeholder copy).'
        },
        utilityTeaserBlock: {
          headline: 'Real-Time Dashboard Teaser',
          body: 'Seed utility teaser references /map, /nature/weather, and /nature/tides for launch navigation and planning intent routing.'
        },
        planningCtaBlock: {
          headline: 'Trip Planning Teaser',
          body: 'Use the 3-day weekend itinerary seed and city/category pages to assemble a practical coast route.',
          buttonLabel: 'View Seed Itinerary',
          buttonUrl: '/itineraries/3-day-oregon-coast-weekend-itinerary'
        }
      },
      depth: 0,
      overrideAccess: true
    })

    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        headerNavItems: [
          { label: 'Stay', url: '/stay', openInNewTab: false },
          { label: 'Do', url: '/do', openInNewTab: false },
          { label: 'Cities', url: '/cities', openInNewTab: false },
          { label: 'Plan', url: '/plan', openInNewTab: false },
          { label: 'Events', url: '/events', openInNewTab: false },
          { label: 'Map', url: '/map', openInNewTab: false }
        ],
        headerActionButtons: [
          { label: 'Build a Trip', url: '/itineraries', openInNewTab: false }
        ],
        footerNavGroups: [
          {
            groupLabel: 'Explore',
            links: [
              { label: 'Cities', url: '/cities', openInNewTab: false },
              { label: 'Regions', url: '/regions/north-coast', openInNewTab: false },
              { label: 'Events', url: '/events', openInNewTab: false }
            ]
          },
          {
            groupLabel: 'Plan',
            links: [
              { label: 'Map', url: '/map', openInNewTab: false },
              { label: 'Weather', url: '/nature/weather', openInNewTab: false },
              { label: 'Tides', url: '/nature/tides', openInNewTab: false }
            ]
          },
          {
            groupLabel: 'About',
            links: [
              { label: 'About', url: '/about', openInNewTab: false },
              { label: 'Contact', url: '/contact', openInNewTab: false },
              { label: 'Trip Builder', url: '/trip-builder', openInNewTab: false }
            ]
          }
        ]
      },
      depth: 0,
      overrideAccess: true
    })

    await payload.updateGlobal({
      slug: 'siteSettings',
      data: {
        siteName: 'ExplOregon Coast',
        siteTagline: 'A practical Oregon Coast directory for planning where to stay, do, and go next.',
        defaultSeo: {
          title: 'ExplOregon Coast | Trusted Oregon Coast Trip Planning',
          description:
            'Launch seed settings for a structured Oregon Coast directory with city guides, listings, and planning utilities.'
        },
        socialLinks: [
          { platform: 'Instagram', url: 'https://example.com/exploregoncoast-instagram' },
          { platform: 'YouTube', url: 'https://example.com/exploregoncoast-youtube' },
          { platform: 'Facebook', url: 'https://example.com/exploregoncoast-facebook' }
        ],
        contact: {
          email: 'editorial-placeholder@exploregoncoast.com',
          phone: '503-555-0142'
        }
      },
      depth: 0,
      overrideAccess: true
    })

    await payload.updateGlobal({
      slug: 'footer',
      data: {
        footerNavGroups: [
          {
            groupLabel: 'Top Routes',
            links: [
              { label: 'Cannon Beach', url: '/cities/cannon-beach', openInNewTab: false },
              { label: 'Newport', url: '/cities/newport', openInNewTab: false },
              { label: 'Lincoln City', url: '/cities/lincoln-city', openInNewTab: false }
            ]
          },
          {
            groupLabel: 'Top Categories',
            links: [
              { label: 'Hotels', url: '/stay/hotels', openInNewTab: false },
              { label: 'Campgrounds', url: '/stay/campgrounds', openInNewTab: false },
              { label: 'Whale Watching', url: '/do/whale-watching', openInNewTab: false }
            ]
          },
          {
            groupLabel: 'Utilities',
            links: [
              { label: 'Coast Map', url: '/map', openInNewTab: false },
              { label: 'Weather', url: '/nature/weather', openInNewTab: false },
              { label: 'Tides', url: '/nature/tides', openInNewTab: false }
            ]
          },
          {
            groupLabel: 'Company',
            links: [
              { label: 'About', url: '/about', openInNewTab: false },
              { label: 'Contact', url: '/contact', openInNewTab: false }
            ]
          }
        ]
      },
      depth: 0,
      overrideAccess: true
    })

    console.log('Seed complete:')
    console.log(`- regions: ${regions.length}`)
    console.log(`- cities: ${cities.length}`)
    console.log(`- listingCategories: ${categories.length}`)
    console.log(`- listings: ${listings.length}`)
    console.log(`- guides: ${guides.length}`)
    console.log(`- itinerary: 1`)
    console.log(`- events: ${events.length}`)
    console.log('- globals: homepage, navigation, siteSettings, footer')
  } finally {
    await (payload as { destroy?: () => Promise<void> }).destroy?.()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('Seed script finished successfully.')
    })
    .catch((error) => {
      console.error('Seed script failed.', error)
      process.exit(1)
    })
}
