import type { Field } from 'payload'

type StatusOption = {
  label: string
  value: string
}

const listingStatusOptions: StatusOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Imported', value: 'imported' },
  { label: 'Needs Review', value: 'needsReview' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
]

const editorialStatusOptions: StatusOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
]

const cityStatusOptions: StatusOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
]

const createStatusField = (
  options: StatusOption[],
  defaultValue: string,
  description: string
): Field => ({
  name: 'status',
  label: 'Status',
  type: 'select',
  required: true,
  defaultValue,
  options,
  admin: {
    position: 'sidebar',
    description
  }
})

export const listingStatusField = (): Field =>
  createStatusField(
    listingStatusOptions,
    'draft',
    'Workflow: Draft -> Imported/Needs Review -> Approved -> Published (or Archived).'
  )

export const editorialStatusField = (): Field =>
  createStatusField(
    editorialStatusOptions,
    'draft',
    'Workflow: Draft -> Review -> Published (or Archived).'
  )

export const cityStatusField = (): Field =>
  createStatusField(cityStatusOptions, 'draft', 'Workflow: Draft -> Published (or Archived).')
