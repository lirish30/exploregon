'use client'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h1>Fatal CMS Error</h1>
        <p>{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} type="button">
          Reload
        </button>
      </body>
    </html>
  )
}
