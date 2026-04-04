export default function NotFoundPage() {
  return (
    <section
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '4rem 1.5rem'
      }}
    >
      <p style={{ letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Not found</p>
      <h1 style={{ marginBottom: '0.75rem' }}>This page does not exist.</h1>
      <p>Check the URL or return to the homepage.</p>
    </section>
  )
}
