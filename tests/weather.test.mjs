import test from 'node:test'
import assert from 'node:assert/strict'
import {
  WEATHER_THEME,
  isNightAt,
  resolveWeatherTheme,
} from '../watchface/weather.js'

test('sunrise and sunset take priority over the fixed fallback hours', () => {
  const sunrise = { hour: 7, minute: 10 }
  const sunset = { hour: 16, minute: 45 }
  assert.equal(isNightAt(6, 59, sunrise, sunset), true)
  assert.equal(isNightAt(7, 10, sunrise, sunset), false)
  assert.equal(isNightAt(16, 45, sunrise, sunset), true)
})

test('fallback considers 06:00 through 17:59 daytime', () => {
  assert.equal(isNightAt(5, 59), true)
  assert.equal(isNightAt(6, 0), false)
  assert.equal(isNightAt(17, 59), false)
  assert.equal(isNightAt(18, 0), true)
})

test('official weather indices map to the expected original themes', () => {
  assert.equal(resolveWeatherTheme(3, false), WEATHER_THEME.CLEAR_DAY)
  assert.equal(resolveWeatherTheme(3, true), WEATHER_THEME.CLEAR_NIGHT)
  assert.equal(resolveWeatherTheme(0, false), WEATHER_THEME.PARTLY_CLOUDY_DAY)
  assert.equal(resolveWeatherTheme(4, true), WEATHER_THEME.CLOUDY_NIGHT)
  assert.equal(resolveWeatherTheme(10, false), WEATHER_THEME.RAIN)
  assert.equal(resolveWeatherTheme(15, false), WEATHER_THEME.THUNDER)
  assert.equal(resolveWeatherTheme(16, false), WEATHER_THEME.SNOW)
  assert.equal(resolveWeatherTheme(13, false), WEATHER_THEME.FOG)
  assert.equal(resolveWeatherTheme(25, false), WEATHER_THEME.UNKNOWN)
  assert.equal(resolveWeatherTheme(999, false), WEATHER_THEME.UNKNOWN)
})
