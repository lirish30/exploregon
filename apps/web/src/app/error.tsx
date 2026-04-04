'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ExplOregon Error]', error)
  }, [error])

  return (
    <section style={{ padding: '4rem 2rem', fontFamily: 'inherit', maxWidth: '40rem', margin: '0 auto' }}>
      <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5b7077', marginBottom: '1rem' }}>
        Something went wrong
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '2rem', fontWeight: 400, color: '#161d1f', margin: '0 0 1rem' }}>
        This page couldn&apos;t load.
      </h2>
      {process.env.NODE_ENV === 'development' && (
        <pre style={{ fontSize: '0.8rem', background: '#f0f4f6', padding: '1rem', borderRadius: '0.35rem', overflowX: 'auto', color: '#2a3e44' }}>
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ''}
        </pre>
      )}
      <button
        onClick={reset}
        style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', background: '#0b4957', color: '#fff', border: 'none', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
      >
        Try again
      </button>
    </section>
  )
}
