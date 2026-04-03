import type { Field, FieldHook } from 'payload'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const formatSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

export const createSlugHook = (fallbackField: string): FieldHook => {
  return ({ value, data, siblingData }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return formatSlug(value)
    }

    const candidate =
      siblingData?.[fallbackField] ??
      (data && typeof data === 'object' ? (data as Record<string, unknown>)[fallbackField] : null)

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return formatSlug(candidate)
    }

    return value
  }
}

export const createSlugField = (fallbackField: string): Field => ({
  name: 'slug',
  label: 'Slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from the title/name if left blank.'
  },
  hooks: {
    beforeValidate: [createSlugHook(fallbackField)]
  },
  validate: (value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return 'Slug is required.'
    }

    if (!slugPattern.test(value)) {
      return 'Use lowercase letters, numbers, and hyphens only.'
    }

    return true
  }
})
