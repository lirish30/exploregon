import type { CollectionBeforeChangeHook } from 'payload'

type RequiredField = {
  key: string
  label: string
}

type PublishGuardConfig = {
  contentLabel: string
  publishFromStatus: string
  publishFromStatusLabel: string
  requiredFields: RequiredField[]
}

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  return false
}

const getMergedDocumentData = (data: Record<string, unknown> | undefined, originalDoc: Record<string, unknown> | undefined): Record<string, unknown> => {
  return {
    ...(originalDoc || {}),
    ...(data || {})
  }
}

export const createPublishGuard = ({
  contentLabel,
  publishFromStatus,
  publishFromStatusLabel,
  requiredFields
}: PublishGuardConfig): CollectionBeforeChangeHook => {
  return async ({ data, originalDoc }) => {
    if (!data) {
      return data
    }

    const mergedData = getMergedDocumentData(
      data as Record<string, unknown>,
      (originalDoc || undefined) as Record<string, unknown> | undefined
    )

    const nextStatus = mergedData.status

    if (nextStatus !== 'published') {
      return data
    }

    const previousStatus = (originalDoc as Record<string, unknown> | undefined)?.status

    if (previousStatus !== publishFromStatus) {
      throw new Error(
        `Cannot publish ${contentLabel}. Move it to ${publishFromStatusLabel} before publishing.`
      )
    }

    const missing: string[] = []

    for (const field of requiredFields) {
      const value = mergedData[field.key]

      if (field.key === 'categories') {
        if (!Array.isArray(value) || value.length === 0) {
          missing.push(field.label)
        }
        continue
      }

      if (isEmptyValue(value)) {
        missing.push(field.label)
      }
    }

    if (missing.length > 0) {
      throw new Error(`Cannot publish ${contentLabel}. Missing required fields: ${missing.join(', ')}`)
    }

    return data
  }
}
