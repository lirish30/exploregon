'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useRef } from 'react'

// Fix Leaflet's broken default icon paths when bundled with webpack/Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

export type MapCity = {
  id: string | number
  name: string
  slug: string
  latitude: number
  longitude: number
}

type CoastMapProps = {
  cities: MapCity[]
}

const OREGON_COAST_CENTER: [number, number] = [44.6, -124.05]
const DEFAULT_ZOOM = 8

export function CoastMap({ cities }: CoastMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return

    const map = L.map(mapRef.current, {
      center: OREGON_COAST_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map)

    for (const city of cities) {
      const marker = L.marker([city.latitude, city.longitude])
      marker
        .bindPopup(
          `<strong><a href="/cities/${city.slug}">${city.name}</a></strong>`
        )
        .addTo(map)
    }

    leafletRef.current = map

    return () => {
      map.remove()
      leafletRef.current = null
    }
  }, [cities])

  return (
    <div
      ref={mapRef}
      style={{ height: '520px', width: '100%', borderRadius: '4px' }}
      aria-label="Oregon Coast city map"
    />
  )
}
