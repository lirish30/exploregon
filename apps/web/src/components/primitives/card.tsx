import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
}

type CardBodyProps = {
  children: ReactNode
}

type CardHeadingProps = {
  title: string
  kicker?: string
}

type CardTextProps = {
  children: ReactNode
}

export const Card = ({ children }: CardProps) => {
  return <article className="card">{children}</article>
}

export const CardBody = ({ children }: CardBodyProps) => {
  return <div className="card-body">{children}</div>
}

export const CardHeading = ({ title, kicker }: CardHeadingProps) => {
  return (
    <header>
      {kicker ? <p className="card-kicker">{kicker}</p> : null}
      <h3 className="card-title">{title}</h3>
    </header>
  )
}

export const CardText = ({ children }: CardTextProps) => {
  return <p className="card-text">{children}</p>
}
