import { DEFAULT_SHIFT, normalizeShift, parseTime } from '../watchface/shift.js'

// スマホの Settings Storage のキー
export const SETTINGS_KEYS = Object.freeze({
  enabled: 'shiftEnabled', // 'true' / 'false'
  start: 'shiftStart', // '11:15'
  end: 'shiftEnd', // '17:00'
})

// getItem は Settings Storage から値を読む関数。値が無い・読めない時は既定値。
export function readShiftSettings(getItem) {
  const enabledRaw = getItem(SETTINGS_KEYS.enabled)
  const startMin = parseTime(getItem(SETTINGS_KEYS.start))
  const endMin = parseTime(getItem(SETTINGS_KEYS.end))
  return normalizeShift({
    enabled:
      enabledRaw === undefined || enabledRaw === null || enabledRaw === ''
        ? DEFAULT_SHIFT.enabled
        : enabledRaw === true || enabledRaw === 'true',
    startMin: startMin === null ? undefined : startMin,
    endMin: endMin === null ? undefined : endMin,
  })
}
