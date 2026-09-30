import { formatClock, isMinuteOfDay, parseTime } from '../../../shared/clock.js'

// スマホの Settings Storage のキー
export const SETTINGS_KEYS = Object.freeze({
  breakTime: 'breakTime', // '15:00'
})

export const DEFAULT_BREAK_MIN = 15 * 60

// 休憩の時刻（0時からの分）。値が無い・読めない時は 15:00。
export function readBreakMinutes(getItem) {
  const minutes = parseTime(getItem(SETTINGS_KEYS.breakTime))
  return minutes === null ? DEFAULT_BREAK_MIN : minutes
}

export function normalizeBreakMinutes(value) {
  return isMinuteOfDay(value) ? value : DEFAULT_BREAK_MIN
}

export function formatBreak(minutes) {
  return formatClock(normalizeBreakMinutes(minutes))
}
