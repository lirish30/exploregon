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

  for (const rawField of fields) {
    if (!rawField || typeof rawField !== 'object') {
      continue
    }

    const field = rawField as { hasMany?: unknown; name?: unknown; type?: unknown }
    if (typeof field.name !== 'string') {
      continue
    }

    definitions.set(field.name, {
      name: field.name,
      type: normalizeFieldType(field),
      hasMany: Boolean(field.hasMany)
    })
  }

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
    return undefined
  }

  if (!fieldDefinition) {
    return trimmed
  }

  switch (fieldDefinition.type) {
    case 'array':
    case 'blocks':
    case 'group':
    case 'json':
      return tryParseJSONCell(trimmed)
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
  let created = 0
  let updated = 0

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
      if (rawId) {
        const id = parseNumericCell(rawId)
        await payload.update({
          collection: collectionSlug,
          data,
          id: id as number | string
        })

        updated += 1
        continue
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
          await payload.update({
            collection: collectionSlug,
            data,
            id: existing.docs[0]?.id as number | string
          })

          updated += 1
          continue
        }
      }

      await payload.create({
        collection: collectionSlug,
        data
      })
      created += 1
    } catch (error) {
      failures.push({
        row: rowIndex + 2,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return Response.json(
    {
      collection: collectionSlug,
      created,
      failed: failures.length,
      failures,
      totalRows: dataRows.length,
      updated
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
