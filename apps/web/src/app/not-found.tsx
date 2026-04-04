import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="not-found-page">
      <p className="not-found-kicker">404 — Page not found</p>
      <h1 className="not-found-title">That page doesn&apos;t exist on the Oregon Coast.</h1>
      <p className="not-found-copy">The page you&apos;re looking for may have moved or may never have existed.</p>
      <Link href="/" className="button-primary">
        Back to home
      </Link>
    </section>
  )
}
