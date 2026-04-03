// Open-Meteo weather fetcher — no API key required
// Docs: https://open-meteo.com/en/docs

export type WeatherStation = {
  name: string
  slug: string
  latitude: number
  longitude: number
  region: string
}

export type CurrentWeather = {
  station: WeatherStation
  temperatureF: number
  windSpeedMph: number
  humidity: number
  conditionCode: number
  condition: string
  fetchedAt: string
}

export type WeatherResult =
  | { ok: true; data: CurrentWeather }
  | { ok: false; error: string; station: WeatherStation }

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Light showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
  99: 'Severe thunderstorm'
}

export const describeWeatherCode = (code: number): string =>
  WMO_DESCRIPTIONS[code] ?? 'Coastal conditions'

type OpenMeteoResponse = {
  current: {
    temperature_2m: number
    wind_speed_10m: number
    relative_humidity_2m: number
    weather_code: number
  }
}

export const WEATHER_STATIONS: WeatherStation[] = [
  { name: 'Cannon Beach', slug: 'cannon-beach', latitude: 45.892, longitude: -123.961, region: 'North Coast' },
  { name: 'Newport', slug: 'newport', latitude: 44.637, longitude: -124.053, region: 'Central Coast' },
  { name: 'Bandon', slug: 'bandon', latitude: 43.119, longitude: -124.408, region: 'South Coast' }
]

export const fetchCurrentWeather = async (station: WeatherStation): Promise<WeatherResult> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(station.latitude))
  url.searchParams.set('longitude', String(station.longitude))
  url.searchParams.set('current', 'temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('forecast_days', '1')

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 1800 } // 30-minute cache
    })

    if (!response.ok) {
      return { ok: false, error: `API returned ${response.status}`, station }
    }

    const json = (await response.json()) as OpenMeteoResponse
    const c = json.current

    return {
      ok: true,
      data: {
        station,
        temperatureF: Math.round(c.temperature_2m),
        windSpeedMph: Math.round(c.wind_speed_10m),
        humidity: Math.round(c.relative_humidity_2m),
        conditionCode: c.weather_code,
        condition: describeWeatherCode(c.weather_code),
        fetchedAt: new Date().toISOString()
      }
    }
  } catch {
    return { ok: false, error: 'Network error — weather service unavailable', station }
  }
}

export const fetchWeatherForStations = async (
  stations: WeatherStation[] = WEATHER_STATIONS
): Promise<WeatherResult[]> => Promise.all(stations.map(fetchCurrentWeather))
