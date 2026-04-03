import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: 'User',
    plural: 'Users'
  },
  admin: {
    useAsTitle: 'email'
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
}
