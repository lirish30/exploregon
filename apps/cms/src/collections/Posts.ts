import type { CollectionConfig } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { createSlugField } from '@/utilities/slug'
import { populateAuthors } from './Posts/hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './Posts/hooks/revalidatePost'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated
  },
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    postType: true,
    meta: {
      image: true,
      description: true
    }
  },
  admin: {
    defaultColumns: ['title', 'postType', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          slug: data?.slug || '',
          collection: 'posts'
        }) || ''
    },
    preview: (data) =>
      generatePreviewPath({
        slug: (data?.slug as string) || '',
        collection: 'posts'
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
      name: 'postType',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Guide', value: 'guide' },
        { label: 'Event', value: 'event' },
        { label: 'Itinerary', value: 'itinerary' },
        { label: 'Article', value: 'article' }
      ]
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media'
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature()
                ]
              }),
              label: false,
              required: true
            }
          ]
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar'
              },
              filterOptions: ({ id }) => ({
                id: {
                  not_in: [id]
                }
              }),
              hasMany: true,
              relationTo: 'posts'
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar'
              },
              hasMany: true,
              relationTo: 'categories'
            }
          ]
        },
        {
          label: 'Travel',
          fields: [
            {
              name: 'guideDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.postType === 'guide'
              },
              fields: [
                { name: 'excerpt', type: 'textarea' },
                { name: 'body', type: 'textarea' },
                { name: 'travelSeason', type: 'text' },
                {
                  name: 'relatedCities',
                  type: 'relationship',
                  relationTo: 'pages',
                  hasMany: true,
                  filterOptions: {
                    pageType: { equals: 'city' }
                  }
                }
              ]
            },
            {
              name: 'eventDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.postType === 'event'
              },
              fields: [
                { name: 'venue', type: 'text' },
                { name: 'startDate', type: 'date' },
                { name: 'endDate', type: 'date' },
                { name: 'eventUrl', type: 'text' },
                {
                  name: 'city',
                  type: 'relationship',
                  relationTo: 'pages',
                  filterOptions: {
                    pageType: { equals: 'city' }
                  }
                },
                {
                  name: 'region',
                  type: 'relationship',
                  relationTo: 'pages',
                  filterOptions: {
                    pageType: { equals: 'region' }
                  }
                },
                { name: 'summary', type: 'textarea' },
                { name: 'description', type: 'textarea' }
              ]
            },
            {
              name: 'itineraryDetails',
              type: 'group',
              admin: {
                condition: (_data, siblingData) => siblingData?.postType === 'itinerary'
              },
              fields: [
                { name: 'summary', type: 'textarea' },
                { name: 'tripLength', type: 'text' },
                { name: 'body', type: 'textarea' },
                {
                  name: 'stops',
                  type: 'relationship',
                  relationTo: 'pages',
                  hasMany: true,
                  filterOptions: {
                    pageType: { equals: 'listing' }
                  }
                },
                {
                  name: 'relatedCities',
                  type: 'relationship',
                  relationTo: 'pages',
                  hasMany: true,
                  filterOptions: {
                    pageType: { equals: 'city' }
                  }
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
        date: {
          pickerAppearance: 'dayAndTime'
        },
        position: 'sidebar'
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          }
        ]
      }
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar'
      },
      hasMany: true,
      relationTo: 'users'
    },
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false
      },
      admin: {
        disabled: true,
        readOnly: true
      },
      fields: [
        { name: 'id', type: 'text' },
        { name: 'name', type: 'text' }
      ]
    },
    createSlugField('title')
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
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
