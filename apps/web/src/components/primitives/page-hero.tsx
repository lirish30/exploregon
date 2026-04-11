import Link from 'next/link'

import { Container } from './container'

type HeroAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  openInNewTab?: boolean
}

type PageHeroProps = {
  kicker?: string
  title: string
  description: string
  actions?: HeroAction[]
}

export const PageHero = ({ kicker, title, description, actions = [] }: PageHeroProps) => {
  return (
    <section className="page-hero">
      <Container>
        <div className="page-hero-inner">
          {kicker ? <p className="page-hero-kicker">{kicker}</p> : null}
          <h1 className="page-hero-title">{title}</h1>
          <p className="page-hero-description">{description}</p>
          {actions.length ? (
            <div className="page-hero-actions">
              {actions.map((action) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={action.variant === 'secondary' ? 'button-secondary' : 'button-primary'}
                  target={action.openInNewTab ? '_blank' : undefined}
                  rel={action.openInNewTab ? 'noopener noreferrer' : undefined}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
