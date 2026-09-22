import test from 'node:test'
import assert from 'node:assert/strict'
import { formatSteps, normalizeSteps } from '../watchface/steps.js'

test('step counts are floored and negatives rejected', () => {
  assert.equal(normalizeSteps(0), 0)
  assert.equal(normalizeSteps(3548), 3548)
  assert.equal(normalizeSteps(3548.9), 3548)
  assert.equal(normalizeSteps(-1), null)
})

test('missing or malformed sensor values fall back to a placeholder', () => {
  assert.equal(normalizeSteps(undefined), null)
  assert.equal(normalizeSteps(null), null)
  assert.equal(normalizeSteps('3548'), null)
  assert.equal(normalizeSteps(Number.NaN), null)
  assert.equal(normalizeSteps(Infinity), null)
  assert.equal(formatSteps(undefined), '--')
  assert.equal(formatSteps(Number.NaN), '--')
})

test('thousands separators are inserted without relying on locale APIs', () => {
  assert.equal(formatSteps(0), '0')
  assert.equal(formatSteps(7), '7')
  assert.equal(formatSteps(999), '999')
  assert.equal(formatSteps(1000), '1,000')
  assert.equal(formatSteps(3548), '3,548')
  assert.equal(formatSteps(12345), '12,345')
  assert.equal(formatSteps(999999), '999,999')
  assert.equal(formatSteps(1234567), '1,234,567')
})
