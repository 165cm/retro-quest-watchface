export const TOTAL_SEGMENTS = 10

export function normalizeBattery(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function getFilledSegments(value, totalSegments = TOTAL_SEGMENTS) {
  const safe = normalizeBattery(value)
  if (safe === null || safe === 0) {
    return 0
  }
  return Math.ceil((safe / 100) * totalSegments)
}

export function getBatteryColorKey(value) {
  const safe = normalizeBattery(value)
  if (safe === null) return 'empty'
  if (safe <= 20) return 'red'
  if (safe <= 50) return 'yellow'
  return 'green'
}

export function formatBatteryPercent(value) {
  const safe = normalizeBattery(value)
  return safe === null ? '--%' : `${safe}%`
}
