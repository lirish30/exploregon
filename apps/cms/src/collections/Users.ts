import type { CollectionConfig } from 'payload'
import { withCollectionCSV } from '../utilities/collectionCSV.ts'

export const Users: CollectionConfig = withCollectionCSV({
  slug: 'users',
  auth: true,
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name'
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 80
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' }
      ]
    }
  ]
})
