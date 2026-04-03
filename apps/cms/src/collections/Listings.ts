import type { CollectionConfig } from 'payload'

import { enforceListingPublishRequirements } from '../hooks/enforceListingPublishRequirements'
import { createSlugField } from '../utilities/slug'
import { listingStatusField } from '../utilities/status'

const validateOptionalUrl = (value: unknown): true | string => {
  if (!value) {
    return true
  }

  if (typeof value !== 'string') {
    return 'URL must be a string.'
  }

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? true : 'URL must start with http:// or https://.'
  } catch {
    return 'Enter a valid URL.'
  }
}

export const Listings: CollectionConfig = {
  slug: 'listings',
  labels: {
    singular: 'Listing',
    plural: 'Listings'
  },
  admin: {
    useAsTitle: 'name'
  },
  timestamps: true,
  hooks: {
    beforeChange: [enforceListingPublishRequirements]
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 120
    },
    createSlugField('name'),
    {
      name: 'city',
      label: 'City',
      type: 'relationship',
      relationTo: 'cities',
      required: true
    },
    {
      name: 'region',
      label: 'Region',
      type: 'relationship',
      relationTo: 'regions',
      required: true
    },
    {
      name: 'categories',
      label: 'Categories',
      type: 'relationship',
      relationTo: 'listingCategories',
      hasMany: true,
      required: true,
      minRows: 1
    },
    {
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      required: true,
      minLength: 20,
      maxLength: 300
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      minLength: 40
    },
    {
      name: 'heroImage',
      label: 'Hero Image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'gallery',
      label: 'Gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: true,
      maxLength: 200
    },
    {
      name: 'latitude',
      label: 'Latitude',
      type: 'number',
      required: true,
      min: -90,
      max: 90
    },
    {
      name: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: true,
      min: -180,
      max: 180
    },
    {
      name: 'websiteUrl',
      label: 'Website URL',
      type: 'text',
      validate: validateOptionalUrl
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      maxLength: 30
    },
    {
      name: 'attributes',
      label: 'Attributes',
      type: 'array',
      fields: [
        {
          name: 'attribute',
          label: 'Attribute',
          type: 'text',
          required: true,
          maxLength: 80
        }
      ]
    },
    {
      name: 'amenities',
      label: 'Amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          label: 'Amenity',
          type: 'text',
          required: true,
          maxLength: 80
        }
      ]
    },
    {
      name: 'priceRange',
      label: 'Price Range',
      type: 'text',
      maxLength: 50
    },
    {
      name: 'seasonality',
      label: 'Seasonality',
      type: 'textarea',
      maxLength: 500
    },
    {
      name: 'editorNotes',
      label: 'Editor Notes',
      type: 'textarea'
    },
    {
      name: 'sourceType',
      label: 'Source Type',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Imported', value: 'imported' },
        { label: 'Partner', value: 'partner' }
      ]
    },
    listingStatusField(),
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
