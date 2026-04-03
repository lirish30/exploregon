import type { CollectionConfig } from 'payload'

import { Cities } from './Cities'
import { Events } from './Events'
import { Guides } from './Guides'
import { Itineraries } from './Itineraries'
import { ListingCategories } from './ListingCategories'
import { Listings } from './Listings'
import { Media } from './Media'
import { Regions } from './Regions'
import { Users } from './Users'

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
