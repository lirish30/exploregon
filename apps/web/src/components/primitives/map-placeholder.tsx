type MapPlaceholderProps = {
  title?: string
  note?: string
}

export const MapPlaceholder = ({
  title = 'Interactive Coast Map',
  note = 'Leaflet + OpenStreetMap module placeholder. Connect city and listing pins in the route template step.'
}: MapPlaceholderProps) => {
  return (
    <section className="map-placeholder" aria-label="Map placeholder">
      <div className="map-placeholder-inner">
        <p className="map-placeholder-label">Map Module</p>
        <h3 className="map-placeholder-title">{title}</h3>
        <p className="map-placeholder-note">{note}</p>
      </div>
    </section>
  )
}
