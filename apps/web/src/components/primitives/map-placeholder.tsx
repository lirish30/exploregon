type MapPlaceholderProps = {
  title?: string
  note?: string
}

export const MapPlaceholder = ({
  title = 'Interactive Coast Map',
  note = 'Leaflet + OpenStreetMap module for city and listing pins.'
}: MapPlaceholderProps) => {
  return (
    <section className="map-placeholder" aria-label="Map module">
      <div className="map-placeholder-inner">
        <p className="map-placeholder-label">Map Module</p>
        <h3 className="map-placeholder-title">{title}</h3>
        <p className="map-placeholder-note">{note}</p>
      </div>
    </section>
  )
}
