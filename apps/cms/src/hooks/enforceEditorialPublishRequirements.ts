import { createPublishGuard } from './workflowGuards'

const commonEditorialPublishFields = [
  { key: 'title', label: 'title' },
  { key: 'slug', label: 'slug' },
  { key: 'seoTitle', label: 'SEO title' },
  { key: 'seoDescription', label: 'SEO description' }
]

export const createEditorialPublishRequirements = (contentLabel: string) =>
  createPublishGuard({
    contentLabel,
    publishFromStatus: 'review',
    publishFromStatusLabel: 'Review',
    requiredFields: commonEditorialPublishFields
  })
