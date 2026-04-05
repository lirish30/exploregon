import type { IconProps } from '@phosphor-icons/react'
import * as PhosphorIcons from '@phosphor-icons/react/dist/ssr'
import type { ComponentType } from 'react'

type PhosphorIconProps = {
  name: string
  size?: number
}

const iconByToken: Record<string, keyof typeof PhosphorIcons> = {
  hotel: 'BuildingApartment',
  hotels: 'BuildingApartment',
  campground: 'Tent',
  campgrounds: 'Tent',
  rv: 'Van',
  home: 'House',
  house: 'House',
  restaurant: 'ForkKnife',
  restaurants: 'ForkKnife',
  beach: 'WaveSine',
  beaches: 'WaveSine',
  whale: 'Binoculars',
  'whale-watching': 'Binoculars',
  hiking: 'Mountains',
  hike: 'Mountains',
  tidepool: 'Waves',
  tidepools: 'Waves',
  family: 'UsersThree'
}

const normalizeToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')

const toPascalCase = (value: string): string =>
  value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

const hasIcon = (name: string): name is keyof typeof PhosphorIcons => {
  return Object.prototype.hasOwnProperty.call(PhosphorIcons, name)
}

const resolveIconName = (name: string): keyof typeof PhosphorIcons => {
  const token = normalizeToken(name)
  const direct = name.trim()
  const pascal = toPascalCase(name)
  const candidates = [direct, `${direct}Icon`, pascal, `${pascal}Icon`]
  const directMatch = candidates.find((candidate) => hasIcon(candidate))

  if (directMatch) {
    return directMatch
  }

  const mapped = iconByToken[token]
  if (mapped && hasIcon(mapped)) {
    return mapped
  }

  return 'Circle'
}

export const PhosphorIcon = ({ name, size = 24 }: PhosphorIconProps) => {
  const iconName = resolveIconName(name)
  const Icon = (PhosphorIcons[iconName] ?? PhosphorIcons.Circle) as ComponentType<IconProps>

  return <Icon aria-hidden="true" size={size} weight="duotone" />
}
