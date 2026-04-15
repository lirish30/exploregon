'use client'

import type { BeforeListClientProps } from 'payload'
import { Button } from '@payloadcms/ui'
import { useMemo, useRef, useState } from 'react'

import './CollectionCSVActions.scss'

type ImportResponse = {
  created?: number
  failures?: Array<{ error?: string; row?: number }>
  failed?: number
  partiallyImported?: number
  totalRows?: number
  updated?: number
  warnings?: Array<{ ignoredFields?: string[]; row?: number }>
}

export function CollectionCSVActions({ collectionSlug }: BeforeListClientProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'error' | 'info' | 'success'>('info')

  const exportUrl = `/api/${collectionSlug}/csv/export`
  const importUrl = `/api/${collectionSlug}/csv/import`
  const isBusy = isExporting || isImporting
  const statusClassName = useMemo(() => {
    if (messageType === 'error') return 'collection-csv-actions__status--error'
    if (messageType === 'success') return 'collection-csv-actions__status--success'
    return 'collection-csv-actions__status--info'
  }, [messageType])

  const onClickExport = () => {
    setMessage('')
    setMessageType('info')
    setIsExporting(true)
    window.location.assign(exportUrl)

    // Keep the loading state brief for UI feedback.
    window.setTimeout(() => {
      setIsExporting(false)
    }, 800)
  }

  const onClickImport = () => {
    setMessage('')
    setMessageType('info')
    inputRef.current?.click()
  }

  const onImportFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setIsImporting(true)
    setMessageType('info')
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
        setMessageType('error')
        setMessage(payload.error ?? 'CSV import failed.')
        return
      }

      const total = payload.totalRows ?? 0
      const created = payload.created ?? 0
      const updated = payload.updated ?? 0
      const failed = payload.failed ?? 0
      const partiallyImported = payload.partiallyImported ?? 0
      const firstFailure = payload.failures?.find((failure) => typeof failure?.error === 'string')
      const partialSuffix =
        partiallyImported > 0 ? ` ${partiallyImported} row(s) were partially imported (invalid fields were ignored).` : ''
      const failureSuffix =
        failed > 0 && firstFailure?.error
          ? ` First failure: row ${firstFailure.row ?? '?'} - ${firstFailure.error}.`
          : ''

      setMessageType(failed > 0 ? 'error' : 'success')
      setMessage(
        `Import complete: ${created} created, ${updated} updated, ${failed} failed (${total} rows).${partialSuffix}${failureSuffix}`
      )
      window.location.reload()
    } catch {
      setMessageType('error')
      setMessage('CSV import failed due to a network error.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div className="collection-csv-actions">
      <div className="collection-csv-actions__row">
        <Button
          onClick={onClickExport}
          buttonStyle="secondary"
          size="small"
          type="button"
          disabled={isBusy}
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>

        <Button
          onClick={onClickImport}
          buttonStyle="primary"
          size="small"
          type="button"
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import CSV'}
        </Button>
      </div>

      <input
        accept=".csv,text/csv"
        onChange={onImportFileSelected}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />

      <p className={`collection-csv-actions__status ${statusClassName}`}>
        {message || 'Use exported CSVs as templates for bulk updates and uploads.'}
      </p>
    </div>
  )
}
