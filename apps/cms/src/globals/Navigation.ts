import type { GlobalConfig } from 'payload'

import { contentGlobalAccess } from '../access/contentAccess.ts'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: contentGlobalAccess,
  label: 'Navigation',
  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'headerNavItems',
      label: 'Header Navigation Items',
      type: 'array',
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true
        },
        {
          name: 'openInNewTab',
          label: 'Open In New Tab',
          type: 'checkbox',
          defaultValue: false
        }
      ]
    },
    {
      name: 'headerActionButtons',
      label: 'Header Action Buttons',
      type: 'array',
      minRows: 2,
      maxRows: 2,
      fields: [
        {
          name: 'label',
          label: 'Label',
          type: 'text',
          required: true,
          maxLength: 50
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true
        },
        {
          name: 'openInNewTab',
          label: 'Open In New Tab',
          type: 'checkbox',
          defaultValue: false
        }
      ]
    },
    {
      name: 'footerNavGroups',
      label: 'Footer Navigation Groups',
      type: 'array',
      fields: [
        {
          name: 'groupLabel',
          label: 'Group Label',
          type: 'text',
          required: true,
          maxLength: 80
        },
        {
          name: 'links',
          label: 'Links',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'label',
              label: 'Label',
              type: 'text',
              required: true,
              maxLength: 50
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true
            },
            {
              name: 'openInNewTab',
              label: 'Open In New Tab',
              type: 'checkbox',
              defaultValue: false
            }
          ]
        }
      ]
    }
  ]
}
