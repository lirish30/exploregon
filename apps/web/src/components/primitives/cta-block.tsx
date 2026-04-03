import Link from 'next/link'
import type { ReactNode } from 'react'

type CtaBlockProps = {
  title: string
  body: string
  buttonLabel: string
  buttonHref: string
  secondaryButtonLabel?: string
  secondaryButtonHref?: string
  aside?: ReactNode
}

export const CtaBlock = ({
  title,
  body,
  buttonLabel,
  buttonHref,
  secondaryButtonLabel,
  secondaryButtonHref,
  aside
}: CtaBlockProps) => {
  return (
    <section className="cta-block">
      <div className="cta-block-inner">
        <h2 className="cta-block-title">{title}</h2>
        <p className="cta-block-body">{body}</p>
        <div className="page-hero-actions">
          <Link href={buttonHref} className="button-primary">
            {buttonLabel}
          </Link>
          {secondaryButtonLabel && secondaryButtonHref ? (
            <Link href={secondaryButtonHref} className="button-secondary">
              {secondaryButtonLabel}
            </Link>
          ) : null}
        </div>
        {aside}
      </div>
    </section>
  )
}
