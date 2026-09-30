// 時刻の文字（"11:15" など）と「0時からの分」を行き来する。設定画面で入れた時刻を読む時に使う。
export const DAY_MINUTES = 24 * 60

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

// 分を "11:15" に直す（時はゼロ埋めしない）。
export function formatClock(minutes) {
  const safe = ((Math.floor(minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

export function isMinuteOfDay(value) {
  return Number.isInteger(value) && value >= 0 && value < DAY_MINUTES
}
