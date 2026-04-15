import type { IconProps } from '@phosphor-icons/react'
import {
  Anchor,
  BeerStein,
  Bicycle,
  Boat,
  Bed,
  Binoculars,
  Bread,
  BuildingApartment,
  BuildingOffice,
  Coffee,
  Car,
  Circle,
  Fish,
  ForkKnife,
  House,
  HouseLine,
  Lighthouse,
  MapPinArea,
  Mountains,
  MusicNotes,
  Palette,
  PawPrint,
  Sailboat,
  ShoppingBag,
  SunHorizon,
  Tent,
  Ticket,
  Tree,
  TreeEvergreen,
  UsersThree,
  Van,
  WaveSawtooth,
  WaveSine,
  Waves,
  Wine
} from '@phosphor-icons/react/dist/ssr'
import type { ComponentType } from 'react'

type PhosphorIconProps = {
  name: string
  size?: number
}

type IconKey =
  | 'bed'
  | 'hotel'
  | 'campground'
  | 'rv'
  | 'home'
  | 'restaurant'
  | 'beach'
  | 'whale'
  | 'hiking'
  | 'tidepool'
  | 'family'
  | 'aquarium'
  | 'art'
  | 'bakery'
  | 'boat'
  | 'coffee'
  | 'shopping'
  | 'brewery'
  | 'museum'
  | 'bike'
  | 'music'
  | 'lighthouse'
  | 'kayak'
  | 'attractions'
  | 'pets'
  | 'crabbing'
  | 'dunes'
  | 'fishing'
  | 'freeparking'
  | 'park'
  | 'rentalhome'
  | 'stateparks'
  | 'surfing'
  | 'vacationrental'
  | 'viewpoint'
  | 'winery'
  | 'circle'

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
  aquarium: Fish,
  art: Palette,
  bakery: Bread,
  boat: Boat,
  coffee: Coffee,
  shopping: ShoppingBag,
  brewery: BeerStein,
  museum: BuildingOffice,
  bike: Bicycle,
  music: MusicNotes,
  lighthouse: Lighthouse,
  kayak: Sailboat,
  attractions: Ticket,
  pets: PawPrint,
  crabbing: Anchor,
  dunes: SunHorizon,
  fishing: Fish,
  freeparking: Car,
  park: Tree,
  rentalhome: HouseLine,
  stateparks: TreeEvergreen,
  surfing: WaveSawtooth,
  vacationrental: House,
  viewpoint: MapPinArea,
  winery: Wine,
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
  'users-three': 'family',
  aquarium: 'aquarium',
  art: 'art',
  arts: 'art',
  gallery: 'art',
  galleries: 'art',
  palette: 'art',
  bakery: 'bakery',
  bakeries: 'bakery',
  bread: 'bakery',
  pastry: 'bakery',
  'boat-tour': 'boat',
  boattour: 'boat',
  boat: 'boat',
  boats: 'boat',
  sailing: 'boat',
  coffee: 'coffee',
  cafe: 'coffee',
  'coffee-shop': 'coffee',
  shopping: 'shopping',
  shop: 'shopping',
  shops: 'shopping',
  boutique: 'shopping',
  boutiques: 'shopping',
  brewery: 'brewery',
  breweries: 'brewery',
  beer: 'brewery',
  museum: 'museum',
  museums: 'museum',
  history: 'museum',
  bike: 'bike',
  bikes: 'bike',
  biking: 'bike',
  bicycle: 'bike',
  music: 'music',
  concert: 'music',
  concerts: 'music',
  lighthouse: 'lighthouse',
  lighthouses: 'lighthouse',
  kayak: 'kayak',
  kayaking: 'kayak',
  sailboat: 'kayak',
  attraction: 'attractions',
  attractions: 'attractions',
  ticket: 'attractions',
  tickets: 'attractions',
  pet: 'pets',
  pets: 'pets',
  'pet-friendly': 'pets',
  paw: 'pets',
  crabbing: 'crabbing',
  crab: 'crabbing',
  crabs: 'crabbing',
  dunes: 'dunes',
  dune: 'dunes',
  fishing: 'fishing',
  fish: 'fishing',
  'free-parking': 'freeparking',
  freeparking: 'freeparking',
  parking: 'freeparking',
  'free parking': 'freeparking',
  park: 'park',
  parks: 'park',
  'rental-home': 'rentalhome',
  rentalhome: 'rentalhome',
  'vacation-rental': 'vacationrental',
  vacationrental: 'vacationrental',
  'vacation-rentals': 'vacationrental',
  'state-park': 'stateparks',
  'state-parks': 'stateparks',
  statepark: 'stateparks',
  stateparks: 'stateparks',
  surfing: 'surfing',
  surf: 'surfing',
  viewpoint: 'viewpoint',
  viewpoints: 'viewpoint',
  overlook: 'viewpoint',
  winery: 'winery',
  wineries: 'winery',
  wine: 'winery'
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
  ['kids', 'family'],
  ['aquarium', 'aquarium'],
  ['fish', 'aquarium'],
  ['art', 'art'],
  ['gallery', 'art'],
  ['baker', 'bakery'],
  ['bread', 'bakery'],
  ['pastry', 'bakery'],
  ['boat', 'boat'],
  ['cruise', 'boat'],
  ['coffee', 'coffee'],
  ['cafe', 'coffee'],
  ['shop', 'shopping'],
  ['boutique', 'shopping'],
  ['brew', 'brewery'],
  ['beer', 'brewery'],
  ['museum', 'museum'],
  ['history', 'museum'],
  ['bike', 'bike'],
  ['bicy', 'bike'],
  ['music', 'music'],
  ['concert', 'music'],
  ['lighthouse', 'lighthouse'],
  ['kayak', 'kayak'],
  ['paddle', 'kayak'],
  ['attraction', 'attractions'],
  ['ticket', 'attractions'],
  ['pet', 'pets'],
  ['paw', 'pets'],
  ['crab', 'crabbing'],
  ['dune', 'dunes'],
  ['fishing', 'fishing'],
  ['parking', 'freeparking'],
  ['park', 'park'],
  ['rental-home', 'rentalhome'],
  ['state-park', 'stateparks'],
  ['surf', 'surfing'],
  ['vacation-rental', 'vacationrental'],
  ['viewpoint', 'viewpoint'],
  ['overlook', 'viewpoint'],
  ['winery', 'winery'],
  ['wine', 'winery']
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
