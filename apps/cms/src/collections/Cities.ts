import type { CollectionConfig } from 'payload'

import { createSlugField } from '../utilities/slug'
import { cityStatusField } from '../utilities/status'

export const Cities: CollectionConfig = {
  slug: 'cities',
  labels: {
    singular: 'City',
    plural: 'Cities'
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
      name: 'region',
      label: 'Region',
      type: 'relationship',
      relationTo: 'regions',
      required: true
    },
    {
      name: 'heroImage',
      label: 'Hero Image',
      type: 'upload',
      relationTo: 'media',
      required: true
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
      name: 'intro',
      label: 'Intro',
      type: 'textarea',
      required: true
    },
    {
      name: 'whyVisit',
      label: 'Why Visit',
      type: 'textarea',
      required: true
    },
    {
      name: 'whenToGo',
      label: 'When To Go',
      type: 'textarea',
      required: true
    },
    {
      name: 'featuredHighlights',
      label: 'Featured Highlights',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'highlight',
          label: 'Highlight',
          type: 'text',
          required: true,
          maxLength: 140
        }
      ]
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
      name: 'faq',
      label: 'FAQ',
      type: 'array',
      fields: [
        {
          name: 'question',
          label: 'Question',
          type: 'text',
          required: true
        },
        {
          name: 'answer',
          label: 'Answer',
          type: 'textarea',
          required: true
        }
      ]
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
    cityStatusField()
  ]
}
