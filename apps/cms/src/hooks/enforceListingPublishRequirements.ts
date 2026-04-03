import { createPublishGuard } from './workflowGuards.ts'

export const enforceListingPublishRequirements = createPublishGuard({
  contentLabel: 'listing',
  publishFromStatus: 'approved',
  publishFromStatusLabel: 'Approved',
  requiredFields: [
    { key: 'name', label: 'title' },
    { key: 'slug', label: 'slug' },
    { key: 'city', label: 'city' },
    { key: 'categories', label: 'at least one category' },
    { key: 'summary', label: 'summary' },
    { key: 'description', label: 'description' },
    { key: 'latitude', label: 'latitude' },
    { key: 'longitude', label: 'longitude' },
    { key: 'seoTitle', label: 'SEO title' },
    { key: 'seoDescription', label: 'SEO description' }
  ]
})
