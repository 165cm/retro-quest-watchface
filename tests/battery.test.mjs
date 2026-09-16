import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatBatteryPercent,
  getBarWidth,
  getBatteryColorKey,
  normalizeBattery,
} from '../watchface/battery.js'

test('battery values are clamped and invalid values are preserved as null', () => {
  assert.equal(normalizeBattery(-4), 0)
  assert.equal(normalizeBattery(101), 100)
  assert.equal(normalizeBattery(null), null)
  assert.equal(normalizeBattery(Number.NaN), null)
})

test('the HP bar never renders a sliver too narrow to keep its rounded ends', () => {
  assert.equal(getBarWidth(100, 200, 12), 200)
  assert.equal(getBarWidth(50, 200, 12), 100)
  assert.equal(getBarWidth(1, 200, 12), 12)
  assert.equal(getBarWidth(0, 200, 12), 0)
  assert.equal(getBarWidth(null, 200, 12), 0)
})

test('the HP bar stays inside its track even when the value is out of range', () => {
  assert.equal(getBarWidth(140, 200, 12), 200)
  assert.equal(getBarWidth(-20, 200, 12), 0)
})

test('battery labels and status colors include non-color fallback text', () => {
  assert.equal(getBatteryColorKey(20), 'red')
  assert.equal(getBatteryColorKey(21), 'yellow')
  assert.equal(getBatteryColorKey(50), 'yellow')
  assert.equal(getBatteryColorKey(51), 'green')
  assert.equal(formatBatteryPercent(null), '--%')
  assert.equal(formatBatteryPercent(68), '68%')
})
