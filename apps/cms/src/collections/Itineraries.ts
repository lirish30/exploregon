import type { CollectionConfig } from 'payload'

import { createEditorialPublishRequirements } from '../hooks/enforceEditorialPublishRequirements'
import { createSlugField } from '../utilities/slug'
import { editorialStatusField } from '../utilities/status'

export const Itineraries: CollectionConfig = {
  slug: 'itineraries',
  labels: {
    singular: 'Itinerary',
    plural: 'Itineraries'
  },
  admin: {
    useAsTitle: 'title'
  },
  timestamps: true,
  hooks: {
    beforeChange: [createEditorialPublishRequirements('itinerary')]
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
      name: 'tripLength',
      label: 'Trip Length',
      type: 'text',
      required: true,
      maxLength: 80
    },
    {
      name: 'stops',
      label: 'Stops',
      type: 'relationship',
      relationTo: 'listings',
      hasMany: true,
      required: true,
      minRows: 1
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
    editorialStatusField(),
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
