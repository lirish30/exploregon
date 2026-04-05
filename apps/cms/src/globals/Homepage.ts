import type { GlobalConfig } from 'payload'

import { contentGlobalAccess } from '../access/contentAccess.ts'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: contentGlobalAccess,
  label: 'Homepage',
  fields: [
    {
      name: 'heroImage',
      label: 'Hero Background Image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Background image for the homepage hero section. If set, this overrides the image pulled from featured cities.'
      }
    },
    {
      name: 'heroHeadline',
      label: 'Hero Headline',
      type: 'text',
      required: true,
      maxLength: 140
    },
    {
      name: 'heroSubheadline',
      label: 'Hero Subheadline',
      type: 'textarea',
      required: true,
      maxLength: 280
    },
    {
      name: 'heroCta',
      label: 'Hero CTA',
      type: 'group',
      fields: [
        {
          name: 'label',
          label: 'Button Label',
          type: 'text',
          required: true,
          maxLength: 40
        },
        {
          name: 'url',
          label: 'Button URL',
          type: 'text',
          required: true
        }
      ]
    },
    {
      name: 'featuredCities',
      label: 'Featured Cities',
      type: 'relationship',
      relationTo: 'cities',
      hasMany: true
    },
    {
      name: 'featuredCategories',
      label: 'Featured Categories',
      type: 'relationship',
      relationTo: 'listingCategories',
      hasMany: true
    },
    {
      name: 'editorialIntroBlock',
      label: 'Editorial Intro Block',
      type: 'group',
      fields: [
        {
          name: 'headline',
          label: 'Headline',
          type: 'text',
          required: true,
          maxLength: 120
        },
        {
          name: 'body',
          label: 'Body',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      name: 'utilityTeaserBlock',
      label: 'Utility Teaser Block',
      type: 'group',
      fields: [
        {
          name: 'headline',
          label: 'Headline',
          type: 'text',
          required: true,
          maxLength: 120
        },
        {
          name: 'body',
          label: 'Body',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      name: 'planningCtaBlock',
      label: 'Planning CTA Block',
      type: 'group',
      fields: [
        {
          name: 'headline',
          label: 'Headline',
          type: 'text',
          required: true,
          maxLength: 120
        },
        {
          name: 'body',
          label: 'Body',
          type: 'textarea',
          required: true
        },
        {
          name: 'buttonLabel',
          label: 'Button Label',
          type: 'text',
          required: true,
          maxLength: 40
        },
        {
          name: 'buttonUrl',
          label: 'Button URL',
          type: 'text',
          required: true
        }
      ]
    }
  ]
}
