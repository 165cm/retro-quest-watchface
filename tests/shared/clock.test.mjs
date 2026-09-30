import test from 'node:test'
import assert from 'node:assert/strict'
import { formatClock, isMinuteOfDay, parseTime } from '../../shared/clock.js'

test('times typed in a settings page are understood', () => {
  assert.equal(parseTime('11:15'), 675)
  assert.equal(parseTime('9:05'), 545)
  assert.equal(parseTime(' 1700 '), 1020)
  assert.equal(parseTime('１５：００'), 900)
  assert.equal(parseTime('24:00'), null)
  assert.equal(parseTime('11:60'), null)
  assert.equal(parseTime('abc'), null)
  assert.equal(parseTime(undefined), null)
})

test('minutes are shown as a clock time', () => {
  assert.equal(formatClock(675), '11:15')
  assert.equal(formatClock(0), '0:00')
  assert.equal(formatClock(1440 + 60), '1:00')
  assert.equal(isMinuteOfDay(1439), true)
  assert.equal(isMinuteOfDay(1440), false)
  assert.equal(isMinuteOfDay('10'), false)
})
