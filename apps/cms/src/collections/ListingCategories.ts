import type { CollectionConfig } from 'payload'

import { createSlugField } from '../utilities/slug.ts'

export const ListingCategories: CollectionConfig = {
  slug: 'listingCategories',
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
      type: 'text',
      required: true,
      maxLength: 60,
      admin: {
        description: 'Use a stable icon token, e.g., hotel, beach, hiking.'
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
