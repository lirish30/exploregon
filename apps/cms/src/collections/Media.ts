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
  upload: true,
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
