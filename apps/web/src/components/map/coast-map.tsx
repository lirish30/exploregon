'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

export type MapPin = {
  latitude: number
  longitude: number
  label: string
  slug: string
  type: 'city' | 'listing'
  region?: string
}

type CoastMapProps = {
  pins: MapPin[]
  center?: [number, number]
  zoom?: number
  height?: number
}

export function CoastMap({ pins, center = [44.5, -124.0], zoom = 7, height = 480 }: CoastMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<{ remove: () => void } | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let active = true

    const init = async () => {
      const L = (await import('leaflet')).default
      if (!active || !containerRef.current) return

      // Fix broken default icons when bundled
      const iconPrototype = L.Icon.Default.prototype as unknown as Record<string, unknown>
      delete iconPrototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      })

      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map)

      for (const pin of pins) {
        const href =
          pin.type === 'city' ? `/cities/${pin.slug}` : `/listings/${pin.slug}`
        const regionLine = pin.region
          ? `<br/><span style="color:#4b6066;font-size:0.82em">${pin.region}</span>`
          : ''
        L.marker([pin.latitude, pin.longitude])
          .bindPopup(
            `<b style="font-family:Georgia,serif">${pin.label}</b>${regionLine}<br/><a href="${href}" style="color:#0b4957;font-size:0.88em">View →</a>`
          )
          .addTo(map)
      }

      mapRef.current = map
    }

    init()

    return () => {
      active = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center, pins, zoom])

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: '100%', borderRadius: 'var(--radius-md)' }}
      aria-label="Interactive Oregon Coast map"
    />
  )
}
