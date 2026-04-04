'use client'

import { useEffect } from 'react'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>CMS Error</h1>
      <p>Something went wrong while loading this page.</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </main>
  )
}
