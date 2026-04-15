import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { withCollectionCSV } from '@/utilities/collectionCSV'
import { createSlugField } from '@/utilities/slug'

export const Categories: CollectionConfig = withCollectionCSV({
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated
  },
  admin: {
    useAsTitle: 'title'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'icon',
      label: 'Icon token',
      type: 'text',
      admin: {
        description: 'Optional stable icon token for frontend category icon mapping.'
      }
    },
    createSlugField('title')
  ]
})
