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
    adminThumbnail: 'card-sm',
    formatOptions: {
      format: 'webp',
      options: {
        quality: 82,
        effort: 4
      }
    },
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: 'inside',
      withoutEnlargement: true
    },
    withMetadata: false,
    imageSizes: [
      {
        name: 'hero-sm',
        width: 640,
        height: 360,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 78,
            effort: 4
          }
        }
      },
      {
        name: 'hero-md',
        width: 1280,
        height: 720,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
            effort: 4
          }
        }
      },
      {
        name: 'hero-lg',
        width: 1920,
        height: 1080,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 82,
            effort: 4
          }
        }
      },
      {
        name: 'card-sm',
        width: 480,
        height: 320,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 76,
            effort: 4
          }
        }
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
