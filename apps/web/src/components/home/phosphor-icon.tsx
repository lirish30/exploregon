import type { IconProps } from '@phosphor-icons/react'
import {
  Bed,
  Binoculars,
  BuildingApartment,
  Circle,
  ForkKnife,
  House,
  Mountains,
  Tent,
  UsersThree,
  Van,
  WaveSine,
  Waves
} from '@phosphor-icons/react/dist/ssr'
import type { ComponentType } from 'react'

type PhosphorIconProps = {
  name: string
  size?: number
}

type IconKey = 'bed' | 'hotel' | 'campground' | 'rv' | 'home' | 'restaurant' | 'beach' | 'whale' | 'hiking' | 'tidepool' | 'family' | 'circle'

const iconComponentByKey: Record<IconKey, ComponentType<IconProps>> = {
  bed: Bed,
  hotel: BuildingApartment,
  campground: Tent,
  rv: Van,
  home: House,
  restaurant: ForkKnife,
  beach: WaveSine,
  whale: Binoculars,
  hiking: Mountains,
  tidepool: Waves,
  family: UsersThree,
  circle: Circle
}

const iconKeyByToken: Record<string, IconKey> = {
  bed: 'bed',
  hotel: 'hotel',
  hotels: 'hotel',
  buildingapartment: 'hotel',
  'building-apartment': 'hotel',
  campground: 'campground',
  campgrounds: 'campground',
  tent: 'campground',
  rv: 'rv',
  rvs: 'rv',
  van: 'rv',
  home: 'home',
  homes: 'home',
  house: 'home',
  restaurant: 'restaurant',
  restaurants: 'restaurant',
  food: 'restaurant',
  dining: 'restaurant',
  forkknife: 'restaurant',
  'fork-knife': 'restaurant',
  beach: 'beach',
  beaches: 'beach',
  shoreline: 'beach',
  wavesine: 'beach',
  'wave-sine': 'beach',
  whale: 'whale',
  whales: 'whale',
  'whale-watching': 'whale',
  binoculars: 'whale',
  hiking: 'hiking',
  hike: 'hiking',
  hikes: 'hiking',
  trail: 'hiking',
  trails: 'hiking',
  mountains: 'hiking',
  tidepool: 'tidepool',
  tidepools: 'tidepool',
  tide: 'tidepool',
  waves: 'tidepool',
  family: 'family',
  families: 'family',
  kids: 'family',
  usersthree: 'family',
  'users-three': 'family'
}

const keywordIconMap: Array<[keyword: string, key: IconKey]> = [
  ['bed', 'bed'],
  ['hotel', 'hotel'],
  ['inn', 'hotel'],
  ['lodg', 'hotel'],
  ['camp', 'campground'],
  ['rv', 'rv'],
  ['van', 'rv'],
  ['home', 'home'],
  ['house', 'home'],
  ['restaurant', 'restaurant'],
  ['food', 'restaurant'],
  ['dining', 'restaurant'],
  ['beach', 'beach'],
  ['shore', 'beach'],
  ['whale', 'whale'],
  ['hike', 'hiking'],
  ['trail', 'hiking'],
  ['mount', 'hiking'],
  ['tide', 'tidepool'],
  ['pool', 'tidepool'],
  ['family', 'family'],
  ['kids', 'family']
]

const normalizeToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, '')
    .replace(/[_\s]+/g, '-')

const toPascalCase = (value: string): string =>
  value
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

export const resolvePhosphorIconKey = (name: string): IconKey => {
  const token = normalizeToken(name)
  const pascal = normalizeToken(toPascalCase(name))
  const direct = normalizeToken(name.trim().toLowerCase())
  const trimmedToken = token
    .replace(/-?icon$/, '')
    .replace(/-?outline$/, '')
    .replace(/-?duotone$/, '')
  const singularToken = trimmedToken.endsWith('s') ? trimmedToken.slice(0, -1) : trimmedToken
  const candidates = [token, direct, pascal, trimmedToken, singularToken]

  for (const candidate of candidates) {
    const resolved = iconKeyByToken[candidate]
    if (resolved) {
      return resolved
    }
  }

  for (const [keyword, key] of keywordIconMap) {
    if (candidates.some((candidate) => candidate.includes(keyword))) {
      return key
    }
  }

  return 'circle'
}

export const PhosphorIcon = ({ name, size = 24 }: PhosphorIconProps) => {
  const iconKey = resolvePhosphorIconKey(name)
  const Icon = iconComponentByKey[iconKey]

  return <Icon aria-hidden="true" size={size} weight="duotone" />
}
