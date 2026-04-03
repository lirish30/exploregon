import type { CollectionConfig } from 'payload'

import { createEditorialPublishRequirements } from '../hooks/enforceEditorialPublishRequirements.ts'
import { createSlugField } from '../utilities/slug.ts'
import { editorialStatusField } from '../utilities/status.ts'

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: {
    singular: 'Guide',
    plural: 'Guides'
  },
  admin: {
    useAsTitle: 'title'
  },
  timestamps: true,
  hooks: {
    beforeChange: [createEditorialPublishRequirements('guide')]
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      minLength: 6,
      maxLength: 140
    },
    createSlugField('title'),
    {
      name: 'heroImage',
      label: 'Hero Image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'excerpt',
      label: 'Excerpt',
      type: 'textarea',
      required: true,
      minLength: 20,
      maxLength: 320
    },
    {
      name: 'body',
      label: 'Body',
      type: 'textarea',
      required: true,
      minLength: 80
    },
    {
      name: 'relatedCities',
      label: 'Related Cities',
      type: 'relationship',
      relationTo: 'cities',
      hasMany: true
    },
    {
      name: 'relatedCategories',
      label: 'Related Categories',
      type: 'relationship',
      relationTo: 'listingCategories',
      hasMany: true
    },
    {
      name: 'travelSeason',
      label: 'Travel Season',
      type: 'text',
      required: true,
      maxLength: 80
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
    },
    editorialStatusField()
  ]
}
