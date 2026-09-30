// バイトのシフトと、ゆげおばけの表情を決める計算。時計・スマホの設定画面・Side Service で共通に使う。
// 時刻は「0時からの分」（例：11:15 → 675）で扱う。

export const DAY_MINUTES = 24 * 60
export const BEFORE_WINDOW = 180 // シフト開始の3時間前から「しごとまで」を出す
export const AFTER_WINDOW = 120 // シフト終了から2時間は「おつかれさま」を出す

export const DEFAULT_SHIFT = Object.freeze({
  enabled: true,
  startMin: 11 * 60 + 15,
  endMin: 17 * 60,
})

// "11:15"・"1115"・"11：15"（全角）・" 9:05 " を分に直す。読めなければ null。
export function parseTime(text) {
  if (typeof text !== 'string') return null
  const normalized = text
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[：]/g, ':')
  const match = normalized.match(/^(\d{1,2}):?(\d{2})$/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return hour * 60 + minute
}

// 分を "11:15" に直す。
export function formatClock(minutes) {
  const safe = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

// 残り時間を "2:05" に直す（時間はゼロ埋めしない）。
export function formatDuration(minutes) {
  const safe = Math.max(0, Math.floor(minutes))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function isMinute(value) {
  return Number.isInteger(value) && value >= 0 && value < DAY_MINUTES
}

// 設定の値を安全な形にそろえる。変な値は既定値に戻す。
export function normalizeShift(shift) {
  const source = shift || {}
  const startMin = isMinute(source.startMin) ? source.startMin : DEFAULT_SHIFT.startMin
  const endMin = isMinute(source.endMin) ? source.endMin : DEFAULT_SHIFT.endMin
  const enabled = typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_SHIFT.enabled
  return { enabled, startMin, endMin }
}

// いまがシフトのどこにいるか。
//   during … シフト中。remaining はシフト終わりまでの分
//   before … 開始3時間前から開始まで。remaining は開始までの分
//   after  … 終了から2時間
//   off    … それ以外、またはシフト表示オフ
// 終わりが始まりより前（例：22:00〜2:00）は、日をまたぐシフトとして扱う。
export function getShiftStatus(nowMin, shift) {
  const { enabled, startMin, endMin } = normalizeShift(shift)
  if (!enabled || startMin === endMin || !isMinute(nowMin)) {
    return { phase: 'off', remaining: 0 }
  }
  const duration = (endMin - startMin + DAY_MINUTES) % DAY_MINUTES
  const sinceStart = (nowMin - startMin + DAY_MINUTES) % DAY_MINUTES
  if (sinceStart < duration) {
    return { phase: 'during', remaining: duration - sinceStart }
  }
  const untilStart = (startMin - nowMin + DAY_MINUTES) % DAY_MINUTES
  if (untilStart > 0 && untilStart <= BEFORE_WINDOW) {
    return { phase: 'before', remaining: untilStart }
  }
  if (sinceStart - duration < AFTER_WINDOW) {
    return { phase: 'after', remaining: 0 }
  }
  return { phase: 'off', remaining: 0 }
}

// 吹き出しの文。label が空なら1行で出す。
export function getShiftMessage(status, hour) {
  if (status.phase === 'during') return { label: 'おわりまで', main: `あと ${formatDuration(status.remaining)}` }
  if (status.phase === 'before') return { label: 'しごとまで', main: `あと ${formatDuration(status.remaining)}` }
  if (status.phase === 'after') return { label: '', main: 'おつかれさま!' }
  if (hour >= 5 && hour < 10) return { label: '', main: 'おはよう' }
  if (hour >= 10 && hour < 17) return { label: '', main: 'いい ゆげ びより' }
  if (hour >= 17 && hour < 22) return { label: '', main: 'こんばんは' }
  return { label: '', main: 'おやすみ…' }
}

// ゆげおばけの表情。電池が少ない時がいちばん優先。
export function getMood(status, batteryPercent, hour) {
  if (typeof batteryPercent === 'number' && batteryPercent <= 20) return 'tired'
  if (status.phase === 'during') return 'work'
  if (status.phase === 'after') return 'happy'
  if (status.phase === 'off' && (hour >= 22 || hour < 5)) return 'sleep'
  return 'normal'
}

export const MOODS = Object.freeze(['normal', 'work', 'happy', 'tired', 'sleep'])
