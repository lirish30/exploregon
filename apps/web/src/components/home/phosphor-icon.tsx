'use client'

import * as PhosphorIcons from '@phosphor-icons/react'
import type { ElementType } from 'react'

type PhosphorIconProps = {
  name: string
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
}

export const PhosphorIcon = ({ name, size = 28, weight = 'regular' }: PhosphorIconProps) => {
  const componentName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  const IconComponent = (PhosphorIcons as Record<string, ElementType>)[componentName]
  if (!IconComponent) return null
  return <IconComponent size={size} weight={weight} aria-hidden="true" />
}
