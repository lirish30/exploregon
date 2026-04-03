import type { CollectionConfig } from 'payload'

import { Cities } from './Cities.ts'
import { Events } from './Events.ts'
import { Guides } from './Guides.ts'
import { Itineraries } from './Itineraries.ts'
import { ListingCategories } from './ListingCategories.ts'
import { Listings } from './Listings.ts'
import { Media } from './Media.ts'
import { Regions } from './Regions.ts'
import { Users } from './Users.ts'

export const collections: CollectionConfig[] = [
  Regions,
  Cities,
  ListingCategories,
  Listings,
  Guides,
  Events,
  Itineraries,
  Media,
  Users
]
