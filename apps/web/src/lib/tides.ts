// NOAA CO-OPS Tides and Currents API — no API key required
// Docs: https://api.tidesandcurrents.noaa.gov/api/prod/

export type TideStation = {
  id: string
  name: string
  city: string
  region: string
}

export type TidePrediction = {
  time: string
  heightFt: number
  type: 'H' | 'L'
}

export type TideResult =
  | { ok: true; station: TideStation; predictions: TidePrediction[]; dateLabel: string }
  | { ok: false; station: TideStation; error: string; dateLabel: string }

type NoaaPrediction = {
  t: string
  v: string
  type: 'H' | 'L'
}

type NoaaResponse = {
  predictions?: NoaaPrediction[]
  error?: { message: string }
}

// Oregon Coast NOAA stations
export const TIDE_STATIONS: TideStation[] = [
  { id: '9439040', name: 'Astoria (Tongue Point)', city: 'Astoria', region: 'North Coast' },
  { id: '9435380', name: 'South Beach', city: 'Newport', region: 'Central Coast' },
  { id: '9432780', name: 'Coos Bay', city: 'Coos Bay', region: 'South Coast' }
]

const formatDateForNoaa = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

const formatDateLabel = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  }).format(date)

export const fetchTidePredictions = async (
  station: TideStation,
  date: Date = new Date()
): Promise<TideResult> => {
  const dateStr = formatDateForNoaa(date)
  const dateLabel = formatDateLabel(date)

  const url = new URL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter')
  url.searchParams.set('begin_date', dateStr)
  url.searchParams.set('end_date', dateStr)
  url.searchParams.set('station', station.id)
  url.searchParams.set('product', 'predictions')
  url.searchParams.set('datum', 'MLLW')
  url.searchParams.set('time_zone', 'lst_ldt')
  url.searchParams.set('interval', 'hilo')
  url.searchParams.set('units', 'english')
  url.searchParams.set('application', 'exploregoncoast')
  url.searchParams.set('format', 'json')

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 900 } // 15-minute cache
    })

    if (!response.ok) {
      return { ok: false, station, error: `NOAA API returned ${response.status}`, dateLabel }
    }

    const json = (await response.json()) as NoaaResponse

    if (json.error) {
      return { ok: false, station, error: json.error.message, dateLabel }
    }

    const predictions: TidePrediction[] = (json.predictions ?? []).map((p) => ({
      time: p.t,
      heightFt: Math.round(parseFloat(p.v) * 10) / 10,
      type: p.type
    }))

    return { ok: true, station, predictions, dateLabel }
  } catch {
    return {
      ok: false,
      station,
      error: 'Network error — NOAA tide service unavailable',
      dateLabel
    }
  }
}

export const fetchTidesForStations = async (
  stations: TideStation[] = TIDE_STATIONS
): Promise<TideResult[]> => Promise.all(stations.map((s) => fetchTidePredictions(s)))

export const formatTideTime = (timeStr: string): string => {
  // NOAA returns "YYYY-MM-DD HH:MM"
  const parts = timeStr.split(' ')
  if (parts.length < 2) return timeStr
  const [, time] = parts
  const [hourStr, minStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const min = minStr
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${min} ${suffix}`
}
