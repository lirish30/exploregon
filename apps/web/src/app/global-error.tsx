'use client'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Instrument Sans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <main style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem' }} aria-live="assertive">
          <p style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Application error
          </p>
          <h1 style={{ marginBottom: '0.75rem' }}>The app failed to render this route.</h1>
          <p style={{ marginBottom: '1.5rem' }}>
            Retry loading this page. If it keeps failing, verify that your local CMS and environment variables are
            valid.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: '1px solid currentColor',
              background: 'transparent',
              padding: '0.6rem 1rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
          {process.env.NODE_ENV === 'development' && error?.message ? (
            <pre
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                border: '1px solid rgba(0,0,0,0.2)',
                overflowX: 'auto'
              }}
            >
              {error.message}
            </pre>
          ) : null}
        </main>
      </body>
    </html>
  )
}
