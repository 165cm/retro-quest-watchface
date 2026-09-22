import { WEATHER_THEME } from './weather.js'

export const DEBUG_OFF = 'off'
export const DEBUG_CYCLE = 'cycle'

// 巡回対象。背景・天候アイコンのファイル名と一致する。
export const CYCLE_THEMES = Object.freeze(Object.values(WEATHER_THEME))

// 0 = 通常（天候連動）、1 = 全テーマ巡回、2以降 = テーマ固定。
// 端末ローカル保存とBLE受け渡しを既存のMessage presetと揃えるため、値は添字で扱う。
export const DEBUG_MODES = Object.freeze([DEBUG_OFF, DEBUG_CYCLE, ...CYCLE_THEMES])

// 巡回間隔。全10テーマを30秒で一周する。
export const CYCLE_INTERVAL_MS = 3000

export function normalizeDebugIndex(value) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 && parsed < DEBUG_MODES.length ? parsed : 0
}

export function getDebugMode(value) {
  return DEBUG_MODES[normalizeDebugIndex(value)]
}

export function isCycleMode(value) {
  return getDebugMode(value) === DEBUG_CYCLE
}

// 表示すべきテーマを決める。通常はセンサー由来の値をそのまま返す。
export function resolveDisplayTheme(debugIndex, weatherTheme, tick = 0) {
  const mode = getDebugMode(debugIndex)
  if (mode === DEBUG_OFF) return weatherTheme
  if (mode === DEBUG_CYCLE) {
    const length = CYCLE_THEMES.length
    const steps = Number.isFinite(tick) ? Math.trunc(tick) : 0
    return CYCLE_THEMES[((steps % length) + length) % length]
  }
  return mode
}
