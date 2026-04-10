import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'
import { createEditorialPublishRequirements } from '../hooks/enforceEditorialPublishRequirements.ts'
import { createSlugField } from '../utilities/slug.ts'
import { editorialStatusField } from '../utilities/status.ts'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: contentCollectionAccess,
  labels: {
    singular: 'Page',
    plural: 'Pages'
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt']
  },
  timestamps: true,
  hooks: {
    beforeChange: [createEditorialPublishRequirements('page')]
  },
  fields: [
    {
      name: 'title',
      label: 'Page Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 140
    },
    createSlugField('title'),
    {
      name: 'body',
      label: 'Body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({
            enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4']
          }),
          UploadFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature()
        ]
      })
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
    editorialStatusField()
  ]
}
