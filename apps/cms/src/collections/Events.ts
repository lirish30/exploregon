import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'
import { createEditorialPublishRequirements } from '../hooks/enforceEditorialPublishRequirements.ts'
import { withCollectionCSV } from '../utilities/collectionCSV.ts'
import { createSlugField } from '../utilities/slug.ts'
import { editorialStatusField } from '../utilities/status.ts'

const validateOptionalUrl = (value: unknown): true | string => {
  if (!value) {
    return true
  }

  if (typeof value !== 'string') {
    return 'URL must be a string.'
  }

  try {
    const parsed = new URL(value)
    return ['http:', 'https:'].includes(parsed.protocol) ? true : 'URL must start with http:// or https://.'
  } catch {
    return 'Enter a valid URL.'
  }
}

export const Events: CollectionConfig = withCollectionCSV({
  slug: 'events',
  access: contentCollectionAccess,
  labels: {
    singular: 'Event',
    plural: 'Events'
  },
  admin: {
    useAsTitle: 'title'
  },
  timestamps: true,
  hooks: {
    beforeChange: [createEditorialPublishRequirements('event')]
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      minLength: 4,
      maxLength: 140
    },
    createSlugField('title'),
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
      name: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: true
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'date'
    },
    {
      name: 'venue',
      label: 'Venue',
      type: 'text',
      required: true,
      maxLength: 120
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
      name: 'eventUrl',
      label: 'Event URL',
      type: 'text',
      validate: validateOptionalUrl
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
})
