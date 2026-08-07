export function normalizeBattery(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }
  return Math.max(0, Math.min(100, Math.round(value)))
}

// 角丸の棒なので、残量が少しでもあるときは半径ぶんの幅を割らないようにする。
// 幅が高さを下回ると角丸が潰れ、「残っている」ことが形として読めなくなる。
export function getBarWidth(value, trackWidth, minWidth) {
  const safe = normalizeBattery(value)
  if (safe === null || safe === 0) return 0
  const raw = Math.round((safe / 100) * trackWidth)
  return Math.min(trackWidth, Math.max(minWidth, raw))
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
