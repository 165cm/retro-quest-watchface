import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  CYCLE_THEMES,
  DEBUG_MODES,
  getDebugMode,
  isCycleMode,
  normalizeDebugIndex,
  resolveDisplayTheme,
} from '../watchface/debug-theme.js'

test('debug modes cover off, cycle and every weather theme', () => {
  assert.equal(DEBUG_MODES[0], 'off')
  assert.equal(DEBUG_MODES[1], 'cycle')
  assert.equal(CYCLE_THEMES.length, 10)
  assert.equal(DEBUG_MODES.length, 12)
  assert.deepEqual(DEBUG_MODES.slice(2), [...CYCLE_THEMES])
})

test('out-of-range and malformed indices fall back to off', () => {
  assert.equal(normalizeDebugIndex(11), 11)
  assert.equal(normalizeDebugIndex(12), 0)
  assert.equal(normalizeDebugIndex(-1), 0)
  assert.equal(normalizeDebugIndex(1.5), 0)
  assert.equal(normalizeDebugIndex(undefined), 0)
  assert.equal(normalizeDebugIndex('not a number'), 0)
  assert.equal(getDebugMode(999), 'off')
})

test('off keeps the sensor-derived theme untouched', () => {
  assert.equal(resolveDisplayTheme(0, 'rain'), 'rain')
  assert.equal(resolveDisplayTheme(0, 'clear_night', 7), 'clear_night')
})

test('a pinned index overrides the sensor-derived theme', () => {
  const snowIndex = DEBUG_MODES.indexOf('snow')
  assert.ok(snowIndex > 1)
  assert.equal(resolveDisplayTheme(snowIndex, 'clear_day'), 'snow')
})

test('cycle walks every theme in order and wraps around', () => {
  const seen = CYCLE_THEMES.map((_, tick) => resolveDisplayTheme(1, 'clear_day', tick))
  assert.deepEqual(seen, [...CYCLE_THEMES])
  assert.equal(resolveDisplayTheme(1, 'clear_day', CYCLE_THEMES.length), CYCLE_THEMES[0])
  assert.equal(resolveDisplayTheme(1, 'clear_day', CYCLE_THEMES.length + 3), CYCLE_THEMES[3])
})

test('cycle tolerates negative and non-integer ticks', () => {
  assert.equal(resolveDisplayTheme(1, 'clear_day', -1), CYCLE_THEMES[CYCLE_THEMES.length - 1])
  assert.equal(resolveDisplayTheme(1, 'clear_day', 2.9), CYCLE_THEMES[2])
  assert.equal(resolveDisplayTheme(1, 'clear_day', Number.NaN), CYCLE_THEMES[0])
  assert.equal(resolveDisplayTheme(1, 'clear_day', Infinity), CYCLE_THEMES[0])
})

test('only the cycle index starts the timer', () => {
  assert.equal(isCycleMode(0), false)
  assert.equal(isCycleMode(1), true)
  assert.equal(isCycleMode(DEBUG_MODES.indexOf('fog')), false)
})

// デバッグで選べるテーマに実ファイルが無いと、端末では画像が出ないまま切り替わってしまう。
// 巡回・固定のどちらも全テーマを指定できるので、背景とアイコンの両方が揃っていることを確認する。
test('every selectable theme has a background and a weather icon on disk', () => {
  const root = path.join(import.meta.dirname, '..', 'assets', 'bip-6', 'images')
  for (const theme of CYCLE_THEMES) {
    const background = path.join(root, 'backgrounds', `${theme}.png`)
    const icon = path.join(root, 'weather', `${theme}.png`)
    assert.ok(fs.existsSync(background), `missing background: ${theme}.png`)
    assert.ok(fs.existsSync(icon), `missing weather icon: ${theme}.png`)
  }
})
