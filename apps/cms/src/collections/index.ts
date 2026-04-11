import type { CollectionConfig } from 'payload'

import { Categories } from './Categories'
import { Cities } from './Cities'
import { Events } from './Events'
import { Guides } from './Guides'
import { Itineraries } from './Itineraries'
import { ListingCategories } from './ListingCategories'
import { Listings } from './Listings'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Regions } from './Regions'
import { Users } from './Users'

export const collections: CollectionConfig[] = [
  // Template-first collections
  Pages,
  Posts,
  Categories,
  Media,
  Users,
  // Legacy collections retained temporarily to support migration runner
  Regions,
  Cities,
  ListingCategories,
  Listings,
  Guides,
  Events,
  Itineraries
]
