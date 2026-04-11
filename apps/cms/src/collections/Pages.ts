import type { CollectionConfig } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { createSlugField } from '@/utilities/slug'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './Pages/hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated
  },
  defaultPopulate: {
    title: true,
    slug: true
  },
  admin: {
    defaultColumns: ['title', 'pageType', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          slug: data?.slug || '',
          collection: 'pages'
        }) || ''
    },
    preview: (data) =>
      generatePreviewPath({
        slug: (data?.slug as string) || '',
        collection: 'pages'
      }) || '',
    useAsTitle: 'title'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'pageType',
      type: 'select',
      required: true,
      defaultValue: 'generic',
      options: [
        { label: 'Homepage', value: 'home' },
        { label: 'City Page', value: 'city' },
        { label: 'Region Page', value: 'region' },
        { label: 'Listing Page', value: 'listing' },
        { label: 'Generic Page', value: 'generic' }
      ]
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [hero]
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true
              }
            }
          ]
        },
        {
          label: 'Travel',
          fields: [
            {
              name: 'route',
              type: 'group',
              fields: [
                {
                  name: 'legacyType',
                  type: 'select',
                  options: [
                    { label: 'Home', value: 'home' },
                    { label: 'City', value: 'city' },
                    { label: 'Region', value: 'region' },
                    { label: 'Listing', value: 'listing' },
                    { label: 'Generic', value: 'generic' }
                  ]
                },
                {
                  name: 'pathPattern',
                  type: 'text'
                }
              ]
            },
            {
              name: 'location',
              type: 'group',
              fields: [
                {
                  name: 'region',
                  type: 'relationship',
                  relationTo: 'pages',
                  filterOptions: {
                    pageType: {
                      equals: 'region'
                    }
                  }
                },
                {
                  name: 'city',
                  type: 'relationship',
                  relationTo: 'pages',
                  filterOptions: {
                    pageType: {
                      equals: 'city'
                    }
                  }
                },
                {
                  name: 'latitude',
                  type: 'number',
                  min: -90,
                  max: 90
                },
                {
                  name: 'longitude',
                  type: 'number',
                  min: -180,
                  max: 180
                }
              ]
            },
            {
              name: 'cityDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.pageType === 'city'
              },
              fields: [
                { name: 'summary', type: 'textarea' },
                { name: 'intro', type: 'textarea' },
                { name: 'whyVisit', type: 'textarea' },
                { name: 'whenToGo', type: 'textarea' },
                {
                  name: 'featuredHighlights',
                  type: 'array',
                  fields: [{ name: 'highlight', type: 'text', required: true }]
                },
                {
                  name: 'faq',
                  type: 'array',
                  fields: [
                    { name: 'question', type: 'text', required: true },
                    { name: 'answer', type: 'textarea', required: true }
                  ]
                }
              ]
            },
            {
              name: 'regionDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.pageType === 'region'
              },
              fields: [
                { name: 'summary', type: 'textarea' },
                { name: 'intro', type: 'textarea' }
              ]
            },
            {
              name: 'listingDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.pageType === 'listing'
              },
              fields: [
                { name: 'summary', type: 'textarea' },
                { name: 'description', type: 'textarea' },
                { name: 'address', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'websiteUrl', type: 'text' },
                { name: 'priceRange', type: 'text' },
                { name: 'seasonality', type: 'textarea' },
                {
                  name: 'attributes',
                  type: 'array',
                  fields: [{ name: 'attribute', type: 'text', required: true }]
                },
                {
                  name: 'amenities',
                  type: 'array',
                  fields: [{ name: 'amenity', type: 'text', required: true }]
                },
                {
                  name: 'gallery',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true
                },
                {
                  name: 'categories',
                  type: 'relationship',
                  relationTo: 'categories',
                  hasMany: true
                },
                {
                  name: 'sourceType',
                  type: 'select',
                  defaultValue: 'manual',
                  options: [
                    { label: 'Manual', value: 'manual' },
                    { label: 'Imported', value: 'imported' },
                    { label: 'Partner', value: 'partner' }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image'
            }),
            MetaTitleField({
              hasGenerateFn: true
            }),
            MetaImageField({
              relationTo: 'media'
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description'
            })
          ]
        }
      ]
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar'
      }
    },
    createSlugField('title')
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete]
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100
      },
      schedulePublish: true
    },
    maxPerDoc: 50
  }
}
