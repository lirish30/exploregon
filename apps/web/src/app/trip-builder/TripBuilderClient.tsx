'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { NormalizedCity, NormalizedListing } from '../../lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type StopType = 'listing' | 'city'

type TripStop = {
  id: string
  type: StopType
  name: string
  slug: string
  cityLabel: string | null
  categoryLabel: string | null
}

type TripState = {
  title: string
  stops: TripStop[]
}

type SearchResult =
  | { kind: 'listing'; data: NormalizedListing }
  | { kind: 'city'; data: NormalizedCity }

// ─── URL encoding ─────────────────────────────────────────────────────────────

function encodeTrip(state: TripState): string {
  const compact = {
    t: state.title,
    s: state.stops.map((stop) => ({
      i: stop.id,
      k: stop.type === 'city' ? 'c' : 'l',
      n: stop.name,
      sl: stop.slug,
      cl: stop.cityLabel,
      ca: stop.categoryLabel
    }))
  }
  return btoa(encodeURIComponent(JSON.stringify(compact)))
}

function decodeTrip(encoded: string): TripState | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const compact = JSON.parse(json) as {
      t: string
      s: Array<{ i: string; k: string; n: string; sl: string; cl: string | null; ca: string | null }>
    }
    return {
      title: compact.t ?? 'My Oregon Coast Trip',
      stops: compact.s.map((s) => ({
        id: s.i,
        type: s.k === 'c' ? 'city' : 'listing',
        name: s.n,
        slug: s.sl,
        cityLabel: s.cl,
        categoryLabel: s.ca
      }))
    }
  } catch {
    return null
  }
}

const LS_KEY = 'exploregon_trip_v1'

function loadFromStorage(): TripState | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TripState
  } catch {
    return null
  }
}

function saveToStorage(state: TripState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  cities: NormalizedCity[]
  listings: NormalizedListing[]
}

export function TripBuilderClient({ cities, listings }: Props) {
  const [tripState, setTripState] = useState<TripState>({ title: 'My Oregon Coast Trip', stops: [] })
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'listings' | 'cities'>('all')
  const [copySuccess, setCopySuccess] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from URL param first, then localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tripParam = params.get('trip')
    if (tripParam) {
      const decoded = decodeTrip(tripParam)
      if (decoded) {
        setTripState(decoded)
        setIsHydrated(true)
        return
      }
    }
    const stored = loadFromStorage()
    if (stored) {
      setTripState(stored)
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (!isHydrated) return
    saveToStorage(tripState)
  }, [tripState, isHydrated])

  // ── Search results ─────────────────────────────────────────────────────────

  const results: SearchResult[] = (() => {
    const q = query.toLowerCase().trim()

    const matchedListings: SearchResult[] = (activeFilter === 'all' || activeFilter === 'listings')
      ? listings
          .filter((l) => !q || l.name.toLowerCase().includes(q) || (l.city?.label ?? '').toLowerCase().includes(q))
          .slice(0, 30)
          .map((l) => ({ kind: 'listing', data: l }))
      : []

    const matchedCities: SearchResult[] = (activeFilter === 'all' || activeFilter === 'cities')
      ? cities
          .filter((c) => !q || c.name.toLowerCase().includes(q))
          .slice(0, 20)
          .map((c) => ({ kind: 'city', data: c }))
      : []

    return activeFilter === 'cities'
      ? [...matchedCities, ...matchedListings]
      : [...matchedListings, ...matchedCities]
  })()

  // ── Stop management ────────────────────────────────────────────────────────

  const isInTrip = useCallback(
    (id: string) => tripState.stops.some((s) => s.id === String(id)),
    [tripState.stops]
  )

  const addStop = useCallback((result: SearchResult) => {
    const stop: TripStop =
      result.kind === 'listing'
        ? {
            id: String(result.data.id),
            type: 'listing',
            name: result.data.name,
            slug: result.data.slug,
            cityLabel: result.data.city?.label ?? null,
            categoryLabel: result.data.categories[0]?.label ?? null
          }
        : {
            id: String(result.data.id),
            type: 'city',
            name: result.data.name,
            slug: result.data.slug,
            cityLabel: null,
            categoryLabel: null
          }

    setTripState((prev) => {
      if (prev.stops.some((s) => s.id === stop.id)) return prev
      return { ...prev, stops: [...prev.stops, stop] }
    })
  }, [])

  const removeStop = useCallback((id: string) => {
    setTripState((prev) => ({ ...prev, stops: prev.stops.filter((s) => s.id !== id) }))
  }, [])

  const moveStop = useCallback((fromIndex: number, toIndex: number) => {
    setTripState((prev) => {
      const stops = [...prev.stops]
      const [moved] = stops.splice(fromIndex, 1)
      stops.splice(toIndex, 0, moved)
      return { ...prev, stops }
    })
  }, [])

  const clearTrip = useCallback(() => {
    setTripState({ title: 'My Oregon Coast Trip', stops: [] })
  }, [])

  // ── Share URL ──────────────────────────────────────────────────────────────

  const handleShare = useCallback(() => {
    const encoded = encodeTrip(tripState)
    const url = `${window.location.origin}/trip-builder?trip=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2200)
    })
  }, [tripState])

  // ── Drag reorder ───────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
      moveStop(dragIndexRef.current, toIndex)
    }
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  const hasStops = tripState.stops.length > 0
  const catalogEmpty = results.length === 0

  return (
    <>
      {/* ── Hero ── */}
      <div className="trip-builder-hero">
        <div className="container">
          <div className="trip-builder-hero-inner">
            <p className="trip-builder-hero-kicker">Trip Builder</p>
            <h1 className="trip-builder-hero-title">Build Your Oregon Coast Weekend</h1>
            <p className="trip-builder-hero-desc">
              Save stops, reorder your route, and share a link with anyone. No account needed.
            </p>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="container">
        <div className="trip-builder-layout">

          {/* ── Left: Catalog ── */}
          <section className="trip-builder-catalog" aria-label="Browse stops">
            <div className="trip-builder-search-bar">
              <input
                className="trip-builder-search-input"
                type="search"
                placeholder="Search listings, beaches, towns…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search catalog"
              />
              <div className="trip-builder-filters" role="group" aria-label="Filter by type">
                {(['all', 'listings', 'cities'] as const).map((f) => (
                  <button
                    key={f}
                    className={`trip-builder-filter-btn${activeFilter === f ? ' is-active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                    aria-pressed={activeFilter === f}
                  >
                    {f === 'all' ? 'All' : f === 'listings' ? 'Listings' : 'Cities'}
                  </button>
                ))}
              </div>
            </div>

            {catalogEmpty ? (
              <div className="trip-builder-empty-catalog">
                <p>No results{query ? ` for "${query}"` : ''}.</p>
                {cities.length === 0 && listings.length === 0 && (
                  <p className="trip-builder-empty-hint">
                    The catalog loads from the CMS. You can still assemble a trip manually once data is published.
                  </p>
                )}
              </div>
            ) : (
              <ul className="trip-builder-results" aria-label="Catalog results">
                {results.map((result) => {
                  const id = String(result.kind === 'listing' ? result.data.id : result.data.id)
                  const added = isInTrip(id)

                  if (result.kind === 'listing') {
                    const l = result.data
                    return (
                      <li key={`listing-${l.id}`} className="trip-builder-result-item">
                        <div className="trip-builder-result-meta">
                          <span className="trip-builder-result-type">Listing</span>
                          {l.city && <span className="trip-builder-result-city">{l.city.label}</span>}
                        </div>
                        <p className="trip-builder-result-name">{l.name}</p>
                        {l.categories[0] && (
                          <p className="trip-builder-result-category">{l.categories[0].label}</p>
                        )}
                        <div className="trip-builder-result-actions">
                          <Link href={`/listings/${l.slug}`} className="trip-builder-result-link" target="_blank" rel="noopener">
                            View
                          </Link>
                          <button
                            className={`trip-builder-add-btn${added ? ' is-added' : ''}`}
                            onClick={() => added ? removeStop(id) : addStop(result)}
                            aria-label={added ? `Remove ${l.name} from trip` : `Add ${l.name} to trip`}
                          >
                            {added ? '✓ Added' : '+ Add'}
                          </button>
                        </div>
                      </li>
                    )
                  }

                  const c = result.data
                  return (
                    <li key={`city-${c.id}`} className="trip-builder-result-item">
                      <div className="trip-builder-result-meta">
                        <span className="trip-builder-result-type trip-builder-result-type--city">City</span>
                        {c.region && <span className="trip-builder-result-city">{c.region.label}</span>}
                      </div>
                      <p className="trip-builder-result-name">{c.name}</p>
                      {c.summary && <p className="trip-builder-result-category">{c.summary.slice(0, 80)}{c.summary.length > 80 ? '…' : ''}</p>}
                      <div className="trip-builder-result-actions">
                        <Link href={`/cities/${c.slug}`} className="trip-builder-result-link" target="_blank" rel="noopener">
                          View
                        </Link>
                        <button
                          className={`trip-builder-add-btn${added ? ' is-added' : ''}`}
                          onClick={() => added ? removeStop(id) : addStop(result)}
                          aria-label={added ? `Remove ${c.name} from trip` : `Add ${c.name} to trip`}
                        >
                          {added ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* ── Right: Itinerary ── */}
          <section className="trip-builder-itinerary" aria-label="Your trip itinerary">
            <div className="trip-builder-itinerary-header">
              <div className="trip-builder-title-row">
                <input
                  className="trip-builder-title-input"
                  type="text"
                  value={tripState.title}
                  onChange={(e) => setTripState((prev) => ({ ...prev, title: e.target.value }))}
                  aria-label="Trip title"
                  maxLength={80}
                />
              </div>
              <p className="trip-builder-stop-count">
                {hasStops ? `${tripState.stops.length} stop${tripState.stops.length === 1 ? '' : 's'}` : 'No stops yet'}
              </p>
            </div>

            {!hasStops ? (
              <div className="trip-builder-drop-hint">
                <p>Add stops from the catalog to build your itinerary.</p>
                <p className="trip-builder-drop-sub">Drag to reorder once you&rsquo;ve added a few.</p>
              </div>
            ) : (
              <ol className="trip-builder-stop-list" aria-label="Itinerary stops">
                {tripState.stops.map((stop, index) => (
                  <li
                    key={stop.id}
                    className={`trip-builder-stop-item${dragOverIndex === index ? ' is-drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    aria-label={`Stop ${index + 1}: ${stop.name}`}
                  >
                    <span className="trip-builder-stop-drag" aria-hidden="true">⠿</span>
                    <div className="trip-builder-stop-body">
                      <span className="trip-builder-stop-index">Stop {index + 1}</span>
                      <p className="trip-builder-stop-name">{stop.name}</p>
                      {stop.cityLabel && (
                        <p className="trip-builder-stop-meta">{stop.cityLabel}{stop.categoryLabel ? ` · ${stop.categoryLabel}` : ''}</p>
                      )}
                    </div>
                    <div className="trip-builder-stop-controls">
                      {index > 0 && (
                        <button
                          className="trip-builder-move-btn"
                          onClick={() => moveStop(index, index - 1)}
                          aria-label={`Move ${stop.name} up`}
                        >
                          ↑
                        </button>
                      )}
                      {index < tripState.stops.length - 1 && (
                        <button
                          className="trip-builder-move-btn"
                          onClick={() => moveStop(index, index + 1)}
                          aria-label={`Move ${stop.name} down`}
                        >
                          ↓
                        </button>
                      )}
                      <button
                        className="trip-builder-remove-btn"
                        onClick={() => removeStop(stop.id)}
                        aria-label={`Remove ${stop.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="trip-builder-actions">
              <button
                className="button-primary trip-builder-share-btn"
                onClick={handleShare}
                disabled={!hasStops}
                aria-label="Copy shareable link"
              >
                {copySuccess ? '✓ Link copied!' : 'Share itinerary'}
              </button>
              {hasStops && (
                <button className="trip-builder-clear-btn" onClick={clearTrip}>
                  Clear trip
                </button>
              )}
            </div>

            {hasStops && (
              <div className="trip-builder-stop-links">
                <p className="trip-builder-stop-links-label">Jump to a stop</p>
                {tripState.stops.map((stop) => (
                  <Link
                    key={stop.id}
                    href={stop.type === 'city' ? `/cities/${stop.slug}` : `/listings/${stop.slug}`}
                    className="home-inline-link trip-builder-jump-link"
                    target="_blank"
                    rel="noopener"
                  >
                    {stop.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
