import type { CollectionConfig } from 'payload'

import { contentCollectionAccess } from '../access/contentAccess.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  access: contentCollectionAccess,
  labels: {
    singular: 'Media Item',
    plural: 'Media'
  },
  timestamps: true,
  upload: {
    imageSizes: [
      {
        name: 'hero-sm',
        width: 640,
        height: 360,
        fit: 'cover'
      },
      {
        name: 'hero-md',
        width: 1280,
        height: 720,
        fit: 'cover'
      },
      {
        name: 'hero-lg',
        width: 1920,
        height: 1080,
        fit: 'cover'
      },
      {
        name: 'card-sm',
        width: 480,
        height: 320,
        fit: 'cover'
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
      required: true,
      maxLength: 160
    }
  ]
}
