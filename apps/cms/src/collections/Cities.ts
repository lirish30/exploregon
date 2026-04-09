import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'
import { withCollectionCSV } from '../utilities/collectionCSV.ts'
import { createSlugField } from '../utilities/slug.ts'
import { cityStatusField } from '../utilities/status.ts'

export const Cities: CollectionConfig = withCollectionCSV({
  slug: 'cities',
  access: contentCollectionAccess,
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
      name: 'listingSections',
      label: 'City Listing Sections',
      type: 'group',
      fields: [
        {
          name: 'hotels',
          label: 'Hotels Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: true,
              defaultValue: 'Hotels',
              maxLength: 50
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
              defaultValue: 'Where to stay',
              maxLength: 120
            },
            {
              name: 'lede',
              label: 'Lede',
              type: 'textarea',
              required: true,
              defaultValue: 'Curated places to stay connected to this city in Payload.'
            },
            {
              name: 'categories',
              label: 'Related Categories',
              type: 'relationship',
              relationTo: 'listingCategories',
              hasMany: true
            }
          ]
        },
        {
          name: 'dining',
          label: 'Dining Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: true,
              defaultValue: 'Dining',
              maxLength: 50
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
              defaultValue: 'Where to eat',
              maxLength: 120
            },
            {
              name: 'lede',
              label: 'Lede',
              type: 'textarea',
              required: true,
              defaultValue: 'Curated dining spots connected to this city in Payload.'
            },
            {
              name: 'categories',
              label: 'Related Categories',
              type: 'relationship',
              relationTo: 'listingCategories',
              hasMany: true
            }
          ]
        },
        {
          name: 'attractions',
          label: 'Attractions Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: true,
              defaultValue: 'Attractions',
              maxLength: 50
            },
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
              defaultValue: 'Where to explore',
              maxLength: 120
            },
            {
              name: 'lede',
              label: 'Lede',
              type: 'textarea',
              required: true,
              defaultValue: 'Curated attractions and experiences connected to this city in Payload.'
            },
            {
              name: 'categories',
              label: 'Related Categories',
              type: 'relationship',
              relationTo: 'listingCategories',
              hasMany: true
            }
          ]
        }
      ]
    },
    {
      name: 'topCategories',
      label: 'Top Categories Section',
      type: 'group',
      fields: [
        {
          name: 'kicker',
          label: 'Kicker',
          type: 'text',
          required: true,
          defaultValue: 'Top Categories',
          maxLength: 50
        },
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          defaultValue: 'Most useful category paths',
          maxLength: 120
        },
        {
          name: 'lede',
          label: 'Lede',
          type: 'textarea',
          required: true,
          defaultValue: 'These categories are inferred from currently published city listings.'
        },
        {
          name: 'categories',
          label: 'Selected Categories',
          type: 'relationship',
          relationTo: 'listingCategories',
          hasMany: true
        }
      ]
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
})
