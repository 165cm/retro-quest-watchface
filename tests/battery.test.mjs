import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatBatteryPercent,
  getBatteryColorKey,
  getFilledSegments,
  normalizeBattery,
} from '../watchface/battery.js'

test('battery values are clamped and invalid values are preserved as null', () => {
  assert.equal(normalizeBattery(-4), 0)
  assert.equal(normalizeBattery(101), 100)
  assert.equal(normalizeBattery(null), null)
  assert.equal(normalizeBattery(Number.NaN), null)
})

test('battery segment boundaries match the product specification', () => {
  const cases = new Map([
    [100, 10],
    [99, 10],
    [68, 7],
    [61, 7],
    [60, 6],
    [1, 1],
    [0, 0],
  ])
  for (const [value, expected] of cases) {
    assert.equal(getFilledSegments(value), expected, `${value}%`)
  }
})

test('battery labels and status colors include non-color fallback text', () => {
  assert.equal(getBatteryColorKey(20), 'red')
  assert.equal(getBatteryColorKey(21), 'yellow')
  assert.equal(getBatteryColorKey(50), 'yellow')
  assert.equal(getBatteryColorKey(51), 'green')
  assert.equal(formatBatteryPercent(null), '--%')
  assert.equal(formatBatteryPercent(68), '68%')
})
