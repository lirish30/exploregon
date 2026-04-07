import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'
import { createSlugField } from '../utilities/slug.ts'

export const ListingCategories: CollectionConfig = {
  slug: 'listingCategories',
  access: contentCollectionAccess,
  labels: {
    singular: 'Listing Category',
    plural: 'Listing Categories'
  },
  admin: {
    useAsTitle: 'name'
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 80
    },
    createSlugField('name'),
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      minLength: 20
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'select',
      required: true,
      defaultValue: 'hotel',
      options: [
        { label: 'Hotel', value: 'hotel' },
        { label: 'Bed', value: 'bed' },
        { label: 'Campground', value: 'campground' },
        { label: 'RV', value: 'rv' },
        { label: 'Home', value: 'home' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Beach', value: 'beach' },
        { label: 'Whale Watching', value: 'whale' },
        { label: 'Hiking', value: 'hiking' },
        { label: 'Tidepool', value: 'tidepool' },
        { label: 'Family', value: 'family' }
      ],
      admin: {
        description: 'Choose a stable icon token used by the web app icon renderer.'
      }
    },
    {
      name: 'seoTitle',
      label: 'SEO Title',
      type: 'text',
      required: true,
      maxLength: 70
    },
    {
      name: 'seoDescription',
      label: 'SEO Description',
      type: 'textarea',
      required: true,
      maxLength: 160
    }
  ]
}
