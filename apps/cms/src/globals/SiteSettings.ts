import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Site Settings',
  fields: [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'text',
      required: true,
      maxLength: 80
    },
    {
      name: 'siteTagline',
      label: 'Site Tagline',
      type: 'text',
      required: true,
      maxLength: 140
    },
    {
      name: 'defaultSeo',
      label: 'Default SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Default SEO Title',
          type: 'text',
          required: true,
          maxLength: 70
        },
        {
          name: 'description',
          label: 'Default SEO Description',
          type: 'textarea',
          required: true,
          maxLength: 160
        }
      ]
    },
    {
      name: 'socialLinks',
      label: 'Social Links',
      type: 'array',
      fields: [
        {
          name: 'platform',
          label: 'Platform',
          type: 'text',
          required: true,
          maxLength: 40
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true
        }
      ]
    },
    {
      name: 'contact',
      label: 'Contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'text',
          maxLength: 30
        }
      ]
    }
  ]
}
