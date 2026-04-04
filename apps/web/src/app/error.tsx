'use client'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '4rem 1.5rem'
      }}
      aria-live="polite"
    >
      <p style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        Something went wrong
      </p>
      <h1 style={{ marginBottom: '0.75rem' }}>We hit an unexpected frontend error.</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Try refreshing this page. If the issue continues, check local service URLs and environment variables.
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
    </section>
  )
}
