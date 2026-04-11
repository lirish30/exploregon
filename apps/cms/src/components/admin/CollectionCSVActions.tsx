'use client'

import type { BeforeListClientProps } from 'payload'
import type { CSSProperties } from 'react'
import { useRef, useState } from 'react'

type ImportResponse = {
  created?: number
  failed?: number
  partiallyImported?: number
  totalRows?: number
  updated?: number
  warnings?: Array<{ ignoredFields?: string[]; row?: number }>
}

const buttonStyle: CSSProperties = {
  alignItems: 'center',
  background: '#111827',
  border: '1px solid #111827',
  borderRadius: 6,
  color: '#ffffff',
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: 13,
  fontWeight: 600,
  height: 34,
  justifyContent: 'center',
  minWidth: 118,
  padding: '0 12px'
}

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  cursor: 'not-allowed',
  opacity: 0.6
}

export function CollectionCSVActions({ collectionSlug }: BeforeListClientProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<string>('')

  const exportUrl = `/api/${collectionSlug}/csv/export`
  const importUrl = `/api/${collectionSlug}/csv/import`

  const onClickExport = () => {
    setMessage('')
    setIsExporting(true)
    window.location.assign(exportUrl)

    // Keep the loading state brief for UI feedback.
    window.setTimeout(() => {
      setIsExporting(false)
    }, 800)
  }

  const onClickImport = () => {
    setMessage('')
    inputRef.current?.click()
  }

  const onImportFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setIsImporting(true)
    setMessage('Importing CSV...')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(importUrl, {
        body: formData,
        credentials: 'same-origin',
        method: 'POST'
      })

      const payload = (await response.json().catch(() => ({}))) as ImportResponse & { error?: string }

      if (!response.ok && response.status !== 207) {
        setMessage(payload.error ?? 'CSV import failed.')
        return
      }

      const total = payload.totalRows ?? 0
      const created = payload.created ?? 0
      const updated = payload.updated ?? 0
      const failed = payload.failed ?? 0
      const partiallyImported = payload.partiallyImported ?? 0
      const partialSuffix =
        partiallyImported > 0 ? ` ${partiallyImported} row(s) were partially imported (invalid fields were ignored).` : ''

      setMessage(`Import complete: ${created} created, ${updated} updated, ${failed} failed (${total} rows).${partialSuffix}`)
      window.location.reload()
    } catch {
      setMessage('CSV import failed due to a network error.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <button
          onClick={onClickExport}
          style={isExporting || isImporting ? disabledButtonStyle : buttonStyle}
          type="button"
          disabled={isExporting || isImporting}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>

        <button
          onClick={onClickImport}
          style={isImporting ? disabledButtonStyle : buttonStyle}
          type="button"
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      <input
        accept=".csv,text/csv"
        onChange={onImportFileSelected}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />

      <p style={{ color: '#4b5563', fontSize: 12, margin: 0 }}>
        {message || 'Use exported CSVs as templates for bulk updates and uploads.'}
      </p>
    </div>
  )
}
