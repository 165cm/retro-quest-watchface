import test from 'node:test'
import assert from 'node:assert/strict'
import { COPY_PRESETS, getCopyPreset, normalizePresetIndex } from '../watchface/copy.js'

test('copy presets retain the requested defaults and safe bounds', () => {
  assert.deepEqual(getCopyPreset(undefined), {
    label: 'TACTIC',
    text: 'SAFETY FIRST',
  })
  assert.equal(COPY_PRESETS.length, 6)
  assert.equal(normalizePresetIndex(5), 5)
  assert.equal(normalizePresetIndex(6), 0)
})
