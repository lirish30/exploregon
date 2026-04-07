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

