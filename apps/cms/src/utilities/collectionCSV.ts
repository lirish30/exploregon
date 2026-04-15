import type { CollectionConfig, Endpoint, Field, PayloadRequest } from 'payload'

type CSVFieldDefinition = {
  hasMany: boolean
  name: string
  type: string
}

type CSVImportFailure = {
  error: string
  row: number
}

type CSVImportWarning = {
  ignoredFields: string[]
  row: number
}

type FieldMutationProperty = 'minLength' | 'minRows' | 'required' | 'validate'

type FieldMutation = {
  field: Record<string, unknown>
  hadOwnProperty: boolean
  property: FieldMutationProperty
  value: unknown
}

type PayloadValidationError = {
  data?: {
    errors?: Array<{
      path?: string
    }>
  }
}

const CSV_ACTION_COMPONENT = './components/admin/CollectionCSVActions.tsx#CollectionCSVActions'
const CSV_EXPORT_PATH = '/csv/export'
const CSV_IMPORT_PATH = '/csv/import'
const RESERVED_COLUMNS = new Set(['id', 'createdAt', 'updatedAt'])

const escapeCSVCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized =
    typeof value === 'string'
      ? value
      : typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : JSON.stringify(value)

  const escaped = normalized.replace(/"/g, '""')
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped
}

const parseCSV = (input: string): string[][] => {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          currentCell += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        currentCell += character
      }

      continue
    }

    if (character === '"') {
      inQuotes = true
      continue
    }

    if (character === ',') {
      currentRow.push(currentCell)
      currentCell = ''
      continue
    }

    if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') {
        index += 1
      }

      currentRow.push(currentCell)
      currentCell = ''

      const hasContent = currentRow.some((cell) => cell.trim().length > 0)
      if (hasContent) {
        rows.push(currentRow)
      }

      currentRow = []
      continue
    }

    currentCell += character
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell)
    const hasContent = currentRow.some((cell) => cell.trim().length > 0)
    if (hasContent) {
      rows.push(currentRow)
    }
  }

  return rows
}

const stringifyCSV = (headers: string[], rows: Record<string, unknown>[]): string => {
  const headerLine = headers.map((header) => escapeCSVCell(header)).join(',')
  const bodyLines = rows.map((row) => headers.map((header) => escapeCSVCell(row[header])).join(','))

  return [headerLine, ...bodyLines].join('\n')
}

const normalizeFieldType = (field: unknown): string => {
  if (!field || typeof field !== 'object') {
    return 'text'
  }

  const value = (field as { type?: unknown }).type
  return typeof value === 'string' ? value : 'text'
}

const collectTopLevelFieldDefinitions = (fields: Field[]): Map<string, CSVFieldDefinition> => {
  const definitions = new Map<string, CSVFieldDefinition>()

  const walkFields = (rawFields: unknown): void => {
    if (!Array.isArray(rawFields)) {
      return
    }

    for (const rawField of rawFields) {
      if (!rawField || typeof rawField !== 'object') {
        continue
      }

      const field = rawField as { hasMany?: unknown; name?: unknown; tabs?: unknown; type?: unknown }
      if (typeof field.name === 'string') {
        definitions.set(field.name, {
          name: field.name,
          type: normalizeFieldType(field),
          hasMany: Boolean(field.hasMany)
        })
      }

      if (Array.isArray(field.tabs)) {
        for (const tab of field.tabs) {
          if (!tab || typeof tab !== 'object') {
            continue
          }

          walkFields((tab as { fields?: unknown }).fields)
        }
      }
    }
  }

  walkFields(fields)

  return definitions
}

const parseBooleanCell = (value: string): boolean => ['1', 'true', 'yes', 'y', 'on'].includes(value.toLowerCase())

const parseNumericCell = (value: string): number | string => {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
    return value
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
}

const tryParseJSONCell = (value: string): unknown => {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }

  return value
}

const parseStructuredCell = (value: string): unknown => {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return undefined
  }
}

const parseRelationshipCell = (value: string, hasMany: boolean): number | string | Array<number | string> | undefined => {
  const parsed = tryParseJSONCell(value)

  if (hasMany) {
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => (typeof entry === 'string' ? parseNumericCell(entry.trim()) : entry)) as Array<number | string>
    }

    if (typeof parsed === 'string') {
      const values = parsed
        .split(parsed.includes('|') ? '|' : ',')
        .map((entry) => entry.trim())
        .filter(Boolean)

      if (values.length === 0) {
        return undefined
      }

      return values.map((entry) => parseNumericCell(entry)) as Array<number | string>
    }

    return undefined
  }

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim()
    if (!trimmed) {
      return undefined
    }

    return parseNumericCell(trimmed)
  }

  if (typeof parsed === 'number') {
    return parsed
  }

  return undefined
}

const parseCellValue = (value: string, fieldDefinition?: CSVFieldDefinition): unknown => {
  const trimmed = value.trim()

  if (!trimmed) {
    if (!fieldDefinition) {
      return undefined
    }

    switch (fieldDefinition.type) {
      case 'array':
      case 'blocks':
      case 'group':
      case 'json':
        return null
      case 'checkbox':
        return false
      case 'number':
      case 'select':
      case 'upload':
        return null
      case 'relationship':
        return fieldDefinition.hasMany ? [] : null
      default:
        return null
    }
  }

  if (!fieldDefinition) {
    return trimmed
  }

  switch (fieldDefinition.type) {
    case 'array':
    case 'blocks':
    case 'group':
    case 'json':
      return parseStructuredCell(trimmed)
    case 'checkbox':
      return parseBooleanCell(trimmed)
    case 'number':
      return parseNumericCell(trimmed)
    case 'relationship':
    case 'upload':
      return parseRelationshipCell(trimmed, fieldDefinition.hasMany)
    default:
      return trimmed
  }
}

const normalizeErrorPathToField = (path: string): string => {
  const [topLevel] = path.replace(/\[\d+\]/g, '').split('.')
  return topLevel ?? path
}

const extractInvalidFieldNames = (error: unknown): string[] => {
  const validationError = error as PayloadValidationError
  const entries = validationError.data?.errors
  if (!Array.isArray(entries)) {
    return []
  }

  const uniqueFields = new Set<string>()
  for (const entry of entries) {
    if (!entry || typeof entry.path !== 'string') {
      continue
    }

    const fieldName = normalizeErrorPathToField(entry.path).trim()
    if (!fieldName || RESERVED_COLUMNS.has(fieldName)) {
      continue
    }

    uniqueFields.add(fieldName)
  }

  return [...uniqueFields]
}

const executeWithInvalidFieldFallback = async (
  originalData: Record<string, unknown>,
  execute: (data: Record<string, unknown>) => Promise<void>
): Promise<string[]> => {
  const workingData: Record<string, unknown> = { ...originalData }
  const ignoredFields = new Set<string>()

  while (true) {
    try {
      await execute(workingData)
      return [...ignoredFields]
    } catch (error) {
      const invalidFields = extractInvalidFieldNames(error).filter((field) => Object.hasOwn(workingData, field))
      if (invalidFields.length === 0) {
        throw error
      }

      for (const field of invalidFields) {
        delete workingData[field]
        ignoredFields.add(field)
      }
    }
  }
}

const isMissingDocumentError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('not found') || message.includes('no document') || message.includes('cannot find')) {
      return true
    }
  }

  const structuredError = error as {
    data?: { errors?: Array<{ message?: string }> }
    status?: number
    statusCode?: number
  }

  if (structuredError?.status === 404 || structuredError?.statusCode === 404) {
    return true
  }

  return Boolean(
    structuredError?.data?.errors?.some((entry) => typeof entry?.message === 'string' && entry.message.toLowerCase().includes('not found'))
  )
}

const findExistingDocumentForRow = async ({
  collectionSlug,
  payload,
  rawId,
  rawSlug
}: {
  collectionSlug: string
  payload: any
  rawId: string
  rawSlug: string
}): Promise<number | string | null> => {
  if (rawId) {
    try {
      const byId = await payload.findByID({
        collection: collectionSlug,
        depth: 0,
        disableErrors: true,
        id: parseNumericCell(rawId)
      })

      if (byId?.id !== undefined && byId?.id !== null) {
        return byId.id as number | string
      }
    } catch {
      // If the current ID does not resolve in this environment, fallback to slug/create.
    }
  }

  if (rawSlug) {
    const existing = await payload.find({
      collection: collectionSlug,
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: rawSlug
        }
      }
    })

    if (existing.docs.length > 0) {
      return existing.docs[0]?.id as number | string
    }
  }

  return null
}

const relaxCollectionFieldsForCSVImport = (fields: Field[]): (() => void) => {
  const mutations: FieldMutation[] = []

  const trackMutation = (field: Record<string, unknown>, property: FieldMutationProperty, nextValue: unknown): void => {
    mutations.push({
      field,
      property,
      hadOwnProperty: Object.hasOwn(field, property),
      value: field[property]
    })

    if (nextValue === undefined) {
      delete field[property]
      return
    }

    field[property] = nextValue
  }

  const walkField = (rawField: unknown): void => {
    if (!rawField || typeof rawField !== 'object') {
      return
    }

    const field = rawField as Record<string, unknown>

    if (Object.hasOwn(field, 'required')) {
      trackMutation(field, 'required', false)
    }

    if (Object.hasOwn(field, 'minLength')) {
      trackMutation(field, 'minLength', undefined)
    }

    if (Object.hasOwn(field, 'minRows')) {
      trackMutation(field, 'minRows', undefined)
    }

    if (Object.hasOwn(field, 'validate')) {
      trackMutation(field, 'validate', undefined)
    }

    const nestedFields = field.fields
    if (Array.isArray(nestedFields)) {
      for (const nestedField of nestedFields) {
        walkField(nestedField)
      }
    }

    const tabs = field.tabs
    if (Array.isArray(tabs)) {
      for (const tab of tabs) {
        if (!tab || typeof tab !== 'object') {
          continue
        }

        const tabFields = (tab as { fields?: unknown }).fields
        if (!Array.isArray(tabFields)) {
          continue
        }

        for (const tabField of tabFields) {
          walkField(tabField)
        }
      }
    }

    const blocks = field.blocks
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        if (!block || typeof block !== 'object') {
          continue
        }

        const blockFields = (block as { fields?: unknown }).fields
        if (!Array.isArray(blockFields)) {
          continue
        }

        for (const blockField of blockFields) {
          walkField(blockField)
        }
      }
    }
  }

  for (const field of fields) {
    walkField(field)
  }

  return () => {
    for (let index = mutations.length - 1; index >= 0; index -= 1) {
      const mutation = mutations[index]
      if (!mutation.hadOwnProperty) {
        delete mutation.field[mutation.property]
      } else {
        mutation.field[mutation.property] = mutation.value
      }
    }
  }
}

const collectionCSVExportHandler = async (req: PayloadRequest): Promise<Response> => {
  const payload = req.payload as any
  const collectionSlug = req.routeParams?.collection as string
  const collection = (payload.collections as Record<string, { config: { fields: Field[] } } | undefined>)[
    collectionSlug
  ]

  if (!collection) {
    return Response.json({ error: `Collection not found: ${collectionSlug}` }, { status: 404 })
  }

  const fieldDefinitions = collectTopLevelFieldDefinitions(collection.config.fields)
  const headers = ['id', ...fieldDefinitions.keys(), 'createdAt', 'updatedAt'].filter(
    (header, index, list) => list.indexOf(header) === index
  )

  const records: Record<string, unknown>[] = []
  let page = 1
  const limit = 200

  while (true) {
    const result = await payload.find({
      collection: collectionSlug,
      depth: 0,
      limit,
      page,
      sort: 'id'
    })

    for (const document of result.docs) {
      records.push(document as unknown as Record<string, unknown>)
    }

    if (page >= result.totalPages) {
      break
    }

    page += 1
  }

  const csvRows = records.map((record) => {
    const row: Record<string, unknown> = {}

    for (const header of headers) {
      row[header] = record[header]
    }

    return row
  })

  const csv = stringifyCSV(headers, csvRows)
  const filename = `${collectionSlug}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8'
    },
    status: 200
  })
}

const collectionCSVImportHandler = async (req: PayloadRequest): Promise<Response> => {
  const payload = req.payload as any
  const collectionSlug = req.routeParams?.collection as string
  const collection = (payload.collections as Record<string, { config: { fields: Field[] } } | undefined>)[
    collectionSlug
  ]

  if (!collection) {
    return Response.json({ error: `Collection not found: ${collectionSlug}` }, { status: 404 })
  }

  if (!req.formData) {
    return Response.json({ error: 'FormData payload is not supported for this request context.' }, { status: 400 })
  }

  const formData = await req.formData()
  const fileValue = formData.get('file')
  const textValue = formData.get('csv')

  let csvText = ''

  if (fileValue instanceof File) {
    csvText = await fileValue.text()
  } else if (typeof textValue === 'string') {
    csvText = textValue
  }

  if (!csvText.trim()) {
    return Response.json({ error: 'Provide a CSV file or CSV text payload.' }, { status: 400 })
  }

  const parsedRows = parseCSV(csvText)
  if (parsedRows.length < 2) {
    return Response.json({ error: 'CSV must contain a header row and at least one data row.' }, { status: 400 })
  }

  const [headerRow, ...dataRows] = parsedRows
  const headers = headerRow.map((header) => header.trim())
  const fieldDefinitions = collectTopLevelFieldDefinitions(collection.config.fields)

  const normalizedHeaders = headers.filter((header) => header.length > 0)
  if (normalizedHeaders.length === 0) {
    return Response.json({ error: 'CSV header row is empty.' }, { status: 400 })
  }

  const failures: CSVImportFailure[] = []
  const warnings: CSVImportWarning[] = []
  let created = 0
  let partiallyImported = 0
  let updated = 0

  const restoreCollectionFields = relaxCollectionFieldsForCSVImport(collection.config.fields)

  try {
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
      const rowValues = dataRows[rowIndex]

      const rowMap = new Map<string, string>()
      headers.forEach((header, index) => {
        rowMap.set(header, rowValues[index] ?? '')
      })

      const rawId = (rowMap.get('id') ?? '').trim()
      const rawSlug = (rowMap.get('slug') ?? '').trim()

      const data: Record<string, unknown> = {}

      for (const header of headers) {
        if (!header || RESERVED_COLUMNS.has(header)) {
          continue
        }

        const rawValue = rowMap.get(header)
        if (rawValue === undefined) {
          continue
        }

        const parsedValue = parseCellValue(rawValue, fieldDefinitions.get(header))
        if (parsedValue !== undefined) {
          data[header] = parsedValue
        }
      }

      try {
        const existingId = await findExistingDocumentForRow({
          collectionSlug,
          payload,
          rawId,
          rawSlug
        })

        if (existingId !== null) {
          const ignoredFields = await executeWithInvalidFieldFallback(data, async (nextData) => {
            await payload.update({
              collection: collectionSlug,
              data: nextData,
              id: existingId
            })
          })

          if (ignoredFields.length > 0) {
            warnings.push({
              row: rowIndex + 2,
              ignoredFields
            })
            partiallyImported += 1
          }

          updated += 1
          continue
        }

        const ignoredFields = await executeWithInvalidFieldFallback(data, async (nextData) => {
          await payload.create({
            collection: collectionSlug,
            data: nextData
          })
        })

        if (ignoredFields.length > 0) {
          warnings.push({
            row: rowIndex + 2,
            ignoredFields
          })
          partiallyImported += 1
        }

        created += 1
      } catch (error) {
        if (rawId && isMissingDocumentError(error)) {
          try {
            const ignoredFields = await executeWithInvalidFieldFallback(data, async (nextData) => {
              await payload.create({
                collection: collectionSlug,
                data: nextData
              })
            })

            if (ignoredFields.length > 0) {
              warnings.push({
                row: rowIndex + 2,
                ignoredFields
              })
              partiallyImported += 1
            }

            created += 1
            continue
          } catch (createFallbackError) {
            failures.push({
              row: rowIndex + 2,
              error: createFallbackError instanceof Error ? createFallbackError.message : 'Unknown error'
            })
            continue
          }
        }

        failures.push({
          row: rowIndex + 2,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  } finally {
    restoreCollectionFields()
  }

  return Response.json(
    {
      collection: collectionSlug,
      created,
      failed: failures.length,
      failures,
      partiallyImported,
      totalRows: dataRows.length,
      updated,
      warnings
    },
    { status: failures.length > 0 ? 207 : 200 }
  )
}

const buildCollectionCSVEndpoints = (): Endpoint[] => [
  {
    handler: collectionCSVExportHandler,
    method: 'get',
    path: CSV_EXPORT_PATH
  },
  {
    handler: collectionCSVImportHandler,
    method: 'post',
    path: CSV_IMPORT_PATH
  }
]

export const withCollectionCSV = <T extends CollectionConfig>(collection: T): T => {
  const existingEndpoints: Omit<Endpoint, 'root'>[] = Array.isArray(collection.endpoints) ? collection.endpoints : []
  const endpointPaths = new Set(existingEndpoints.map((endpoint) => `${endpoint.method}:${endpoint.path}`))

  const nextEndpoints = [...existingEndpoints]
  for (const endpoint of buildCollectionCSVEndpoints()) {
    const key = `${endpoint.method}:${endpoint.path}`
    if (!endpointPaths.has(key)) {
      endpointPaths.add(key)
      nextEndpoints.push(endpoint)
    }
  }

  const existingBeforeList = collection.admin?.components?.beforeList ?? []
  const hasCSVActionComponent = existingBeforeList.some((component) => {
    if (typeof component === 'string') {
      return component === CSV_ACTION_COMPONENT
    }

    return typeof component === 'object' && component?.path === './components/admin/CollectionCSVActions.tsx'
  })

  const nextBeforeList = hasCSVActionComponent ? existingBeforeList : [...existingBeforeList, CSV_ACTION_COMPONENT]

  return {
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        beforeList: nextBeforeList
      }
    },
    endpoints: nextEndpoints
  }
}
