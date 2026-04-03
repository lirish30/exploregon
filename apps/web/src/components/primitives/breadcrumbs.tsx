import Link from 'next/link'

import { buildBreadcrumbJsonLd } from '../../lib/seo'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  if (!items.length) {
    return null
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    items.map((item) => ({
      label: item.label,
      href: item.href ?? '/'
    }))
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li key={`${item.label}-${index}`}>
                {index > 0 ? <span className="breadcrumbs-separator">/</span> : null}
                {item.href && !isLast ? (
                  <Link href={item.href} className="breadcrumbs-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumbs-current" aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
