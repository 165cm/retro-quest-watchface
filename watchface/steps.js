export function normalizeSteps(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null
  }
  return Math.floor(value)
}

// 桁区切りは自前で入れる。端末のJSエンジンに依存しない書き方にしておく。
export function formatSteps(value) {
  const safe = normalizeSteps(value)
  if (safe === null) return '--'
  const digits = String(safe)
  let out = ''
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ','
    out += digits[i]
  }
  return out
}
