import type { CollectionConfig } from 'payload'

import { createSlugField } from '../utilities/slug.ts'

export const Regions: CollectionConfig = {
  slug: 'regions',
  labels: {
    singular: 'Region',
    plural: 'Regions'
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
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      required: true,
      minLength: 20,
      maxLength: 300
    },
    {
      name: 'heroImage',
      label: 'Hero Image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'intro',
      label: 'Intro',
      type: 'textarea',
      required: true,
      minLength: 40
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
