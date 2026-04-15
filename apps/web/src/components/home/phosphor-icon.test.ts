import test from 'node:test'
import assert from 'node:assert/strict'

import { resolvePhosphorIconKey } from './phosphor-icon'

const cases: Array<{ input: string; expected: string }> = [
  { input: 'bed', expected: 'bed' },
  { input: 'hotel', expected: 'hotel' },
  { input: 'hotels', expected: 'hotel' },
  { input: 'campground', expected: 'campground' },
  { input: 'campgrounds', expected: 'campground' },
  { input: 'rv', expected: 'rv' },
  { input: 'home', expected: 'home' },
  { input: 'restaurant', expected: 'restaurant' },
  { input: 'restaurants', expected: 'restaurant' },
  { input: 'beach', expected: 'beach' },
  { input: 'beaches', expected: 'beach' },
  { input: 'whale', expected: 'whale' },
  { input: 'whale-watching', expected: 'whale' },
  { input: 'hiking', expected: 'hiking' },
  { input: 'hike', expected: 'hiking' },
  { input: 'tidepool', expected: 'tidepool' },
  { input: 'tidepools', expected: 'tidepool' },
  { input: 'family', expected: 'family' },
  { input: 'aquarium', expected: 'aquarium' },
  { input: 'art', expected: 'art' },
  { input: 'bakery', expected: 'bakery' },
  { input: 'boat-tour', expected: 'boat' },
  { input: 'coffee', expected: 'coffee' },
  { input: 'shopping', expected: 'shopping' },
  { input: 'brewery', expected: 'brewery' },
  { input: 'museum', expected: 'museum' },
  { input: 'bike', expected: 'bike' },
  { input: 'music', expected: 'music' },
  { input: 'lighthouse', expected: 'lighthouse' },
  { input: 'kayaking', expected: 'kayak' },
  { input: 'attractions', expected: 'attractions' },
  { input: 'pet-friendly', expected: 'pets' },
  { input: 'crabbing', expected: 'crabbing' },
  { input: 'dunes', expected: 'dunes' },
  { input: 'fishing', expected: 'fishing' },
  { input: 'free-parking', expected: 'freeparking' },
  { input: 'park', expected: 'park' },
  { input: 'rental-home', expected: 'rentalhome' },
  { input: 'state-parks', expected: 'stateparks' },
  { input: 'surfing', expected: 'surfing' },
  { input: 'vacation-rental', expected: 'vacationrental' },
  { input: 'viewpoint', expected: 'viewpoint' },
  { input: 'winery', expected: 'winery' },
  { input: 'Boat Tour', expected: 'boat' },
  { input: 'galleries', expected: 'art' },
  { input: 'HotelIcon', expected: 'hotel' },
  { input: 'restaurant_outline', expected: 'restaurant' },
  { input: 'WHALE WATCHING', expected: 'whale' }
]

test('resolvePhosphorIconKey maps category icon tokens and variants', () => {
  for (const { input, expected } of cases) {
    assert.equal(resolvePhosphorIconKey(input), expected, `expected "${input}" to resolve to "${expected}"`)
  }
})

test('resolvePhosphorIconKey returns circle for unknown token', () => {
  assert.equal(resolvePhosphorIconKey('some-unknown-token'), 'circle')
})
