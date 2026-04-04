'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ExplOregon Global Error]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '4rem 2rem', fontFamily: 'system-ui, sans-serif', background: '#f4fafe', color: '#161d1f' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b7077' }}>
          Application error
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 400, margin: '0.5rem 0 1rem' }}>
          ExplOregon Coast couldn&apos;t load.
        </h1>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{ fontSize: '0.8rem', background: '#e8f0f3', padding: '1rem', borderRadius: '0.35rem', overflowX: 'auto' }}>
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', background: '#0b4957', color: '#fff', border: 'none', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
        >
          Reload
        </button>
      </body>
    </html>
  )
}
