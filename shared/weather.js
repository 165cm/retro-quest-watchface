export const WEATHER_THEME = Object.freeze({
  CLEAR_DAY: 'clear_day',
  PARTLY_CLOUDY_DAY: 'partly_cloudy_day',
  CLOUDY_DAY: 'cloudy_day',
  RAIN: 'rain',
  THUNDER: 'thunder',
  SNOW: 'snow',
  FOG: 'fog',
  CLEAR_NIGHT: 'clear_night',
  CLOUDY_NIGHT: 'cloudy_night',
  UNKNOWN: 'unknown',
})

const RAIN_CODES = new Set([1, 5, 7, 10, 12, 18, 19, 21, 24, 27])
const SNOW_CODES = new Set([2, 6, 8, 9, 16])
const FOG_CODES = new Set([11, 13, 14, 17, 22, 23])
const THUNDER_CODES = new Set([15, 20])

export function isNightAt(hour, minute = 0, sunrise, sunset) {
  const current = hour * 60 + minute
  if (
    sunrise &&
    sunset &&
    Number.isFinite(sunrise.hour) &&
    Number.isFinite(sunrise.minute) &&
    Number.isFinite(sunset.hour) &&
    Number.isFinite(sunset.minute)
  ) {
    const rise = sunrise.hour * 60 + sunrise.minute
    const set = sunset.hour * 60 + sunset.minute
    if (rise < set) return current < rise || current >= set
  }
  return hour < 6 || hour >= 18
}

export function resolveWeatherTheme(weatherCode, isNight) {
  const code = Number(weatherCode)
  if (!Number.isInteger(code) || code < 0 || code > 28 || code === 25) {
    return WEATHER_THEME.UNKNOWN
  }
  if (code === 28) return WEATHER_THEME.CLEAR_NIGHT
  if (code === 26) return WEATHER_THEME.CLOUDY_NIGHT
  if (THUNDER_CODES.has(code)) return WEATHER_THEME.THUNDER
  if (SNOW_CODES.has(code)) return WEATHER_THEME.SNOW
  if (RAIN_CODES.has(code)) return WEATHER_THEME.RAIN
  if (FOG_CODES.has(code)) return WEATHER_THEME.FOG
  if (code === 3) return isNight ? WEATHER_THEME.CLEAR_NIGHT : WEATHER_THEME.CLEAR_DAY
  if (code === 0) return isNight ? WEATHER_THEME.CLOUDY_NIGHT : WEATHER_THEME.PARTLY_CLOUDY_DAY
  if (code === 4) return isNight ? WEATHER_THEME.CLOUDY_NIGHT : WEATHER_THEME.CLOUDY_DAY
  return WEATHER_THEME.UNKNOWN
}

export function getTodayWeather(weatherSensor) {
  try {
    const result = weatherSensor.getForecastWeather()
    const forecast = result && result.forecastData
    const tide = result && result.tideData
    const today = forecast && forecast.count > 0 ? forecast.data[0] : null
    const todayTide = tide && tide.count > 0 ? tide.data[0] : null
    return {
      code: today && Number.isFinite(today.index) ? today.index : null,
      low: today && Number.isFinite(today.low) ? today.low : null,
      high: today && Number.isFinite(today.high) ? today.high : null,
      sunrise: todayTide ? todayTide.sunrise : null,
      sunset: todayTide ? todayTide.sunset : null,
    }
  } catch (error) {
    return { code: null, low: null, high: null, sunrise: null, sunset: null }
  }
}
