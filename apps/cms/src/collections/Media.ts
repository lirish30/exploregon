import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
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
