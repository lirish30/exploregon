import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true,
    update: () => true
  },
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
        },
        {
          name: 'primaryButtonLabel',
          label: 'Primary CTA Label',
          type: 'text',
          required: false,
          defaultValue: 'Browse by city',
          maxLength: 40
        },
        {
          name: 'primaryButtonUrl',
          label: 'Primary CTA URL',
          type: 'text',
          required: false,
          defaultValue: '/cities'
        },
        {
          name: 'secondaryButtonLabel',
          label: 'Secondary CTA Label',
          type: 'text',
          required: false,
          defaultValue: 'Compare categories',
          maxLength: 40
        },
        {
          name: 'secondaryButtonUrl',
          label: 'Secondary CTA URL',
          type: 'text',
          required: false,
          defaultValue: '/categories'
        },
        {
          name: 'resultsButtonLabel',
          label: 'Explore Results CTA Label',
          type: 'text',
          required: false,
          defaultValue: 'Explore results',
          maxLength: 40
        },
        {
          name: 'resultsBaseUrl',
          label: 'Explore Results Base URL',
          type: 'text',
          required: false,
          defaultValue: '/listings',
          admin: {
            description: 'Used as the form action. City and category query params are appended automatically.'
          }
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
