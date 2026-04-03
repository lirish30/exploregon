import type { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
}

export const Container = ({ children }: ContainerProps) => {
  return <div className="container">{children}</div>
}
