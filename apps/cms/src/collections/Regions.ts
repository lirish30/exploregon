import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'
import { createSlugField } from '../utilities/slug.ts'

export const Regions: CollectionConfig = {
  slug: 'regions',
  access: contentCollectionAccess,
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
      name: 'sectionHeadings',
      label: 'Region Section Headings',
      type: 'group',
      fields: [
        {
          name: 'intro',
          label: 'Intro Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Region Intro',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Planning context',
              maxLength: 120
            }
          ]
        },
        {
          name: 'cities',
          label: 'Cities Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Cities',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Core city pages in this region',
              maxLength: 120
            }
          ]
        },
        {
          name: 'listings',
          label: 'Listings Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Listings',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Featured listings in this region',
              maxLength: 120
            }
          ]
        },
        {
          name: 'map',
          label: 'Map Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Map',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Map module',
              maxLength: 120
            }
          ]
        },
        {
          name: 'events',
          label: 'Events Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Events',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Upcoming events',
              maxLength: 120
            }
          ]
        },
        {
          name: 'guides',
          label: 'Guides Section',
          type: 'group',
          fields: [
            {
              name: 'kicker',
              label: 'Kicker',
              type: 'text',
              required: false,
              defaultValue: 'Guides',
              maxLength: 50
            },
            {
              name: 'headline',
              label: 'Headline',
              type: 'text',
              required: false,
              defaultValue: 'Related editorial guides',
              maxLength: 120
            }
          ]
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
    }
  ]
}
