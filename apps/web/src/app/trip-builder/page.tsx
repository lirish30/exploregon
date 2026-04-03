import type { Metadata } from 'next'
import { getCities, getListings } from '../../lib/api'
import type { NormalizedCity, NormalizedListing } from '../../lib/types'
import { TripBuilderClient } from './TripBuilderClient'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Trip Builder — ExplOregon Coast',
  description: 'Build your Oregon Coast itinerary. Save favorite stops, reorder your route, and share a link with your travel crew.'
}

export default async function TripBuilderPage() {
  let cities: NormalizedCity[] = []
  let listings: NormalizedListing[] = []

  try {
    ;[cities, listings] = await Promise.all([
      getCities({ limit: 50 }),
      getListings({ limit: 100 })
    ])
  } catch {
    // CMS unavailable — client renders with empty catalog, still functional
  }

  return <TripBuilderClient cities={cities} listings={listings} />
}
