import type { ReactNode } from 'react'

import { Container } from './container'

type SectionProps = {
  children: ReactNode
  surface?: 'default' | 'muted'
}

export const Section = ({ children, surface = 'default' }: SectionProps) => {
  return (
    <section className={surface === 'muted' ? 'section section-surface' : 'section'}>
      <Container>{children}</Container>
    </section>
  )
}
