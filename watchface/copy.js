export const COPY_PRESETS = Object.freeze([
  { label: 'TACTIC', text: 'SAFETY FIRST' },
  { label: 'MODE', text: 'TAKE IT EASY' },
  { label: 'FOCUS', text: 'ONE STEP AT A TIME' },
  { label: 'MODE', text: 'STAY SHARP' },
  { label: 'FOCUS', text: 'KEEP MOVING' },
  { label: 'TODAY', text: 'NO RUSH' },
])

export function normalizePresetIndex(value) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 && parsed < COPY_PRESETS.length ? parsed : 0
}

export function getCopyPreset(value) {
  return COPY_PRESETS[normalizePresetIndex(value)]
}
