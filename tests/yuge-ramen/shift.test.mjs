import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatClock,
  formatDuration,
  getShiftMessage,
  getShiftStatus,
  normalizeShift,
  parseTime,
} from '../../faces/yuge-ramen/watchface/shift.js'

const at = (h, m = 0) => h * 60 + m
const SHIFT = { enabled: true, startMin: at(11, 15), endMin: at(17) }

test('times typed in the settings page are understood', () => {
  assert.equal(parseTime('11:15'), 675)
  assert.equal(parseTime('9:05'), 545)
  assert.equal(parseTime(' 1700 '), 1020)
  assert.equal(parseTime('１１：１５'), 675)
  assert.equal(parseTime('24:00'), null)
  assert.equal(parseTime('11:60'), null)
  assert.equal(parseTime('abc'), null)
  assert.equal(parseTime(undefined), null)
  assert.equal(formatClock(675), '11:15')
  assert.equal(formatDuration(125), '2:05')
})

test('the shift phases follow the clock', () => {
  assert.deepEqual(getShiftStatus(at(8, 14), SHIFT), { phase: 'off', remaining: 0 })
  assert.deepEqual(getShiftStatus(at(8, 15), SHIFT), { phase: 'before', remaining: 180 })
  assert.deepEqual(getShiftStatus(at(11, 14), SHIFT), { phase: 'before', remaining: 1 })
  assert.deepEqual(getShiftStatus(at(11, 15), SHIFT), { phase: 'during', remaining: 345 })
  assert.deepEqual(getShiftStatus(at(16, 59), SHIFT), { phase: 'during', remaining: 1 })
  assert.deepEqual(getShiftStatus(at(17), SHIFT), { phase: 'after', remaining: 0 })
  assert.deepEqual(getShiftStatus(at(18, 59), SHIFT), { phase: 'after', remaining: 0 })
  assert.deepEqual(getShiftStatus(at(19), SHIFT), { phase: 'off', remaining: 0 })
})

test('a shift that crosses midnight still counts down', () => {
  const night = { enabled: true, startMin: at(22), endMin: at(2) }
  assert.deepEqual(getShiftStatus(at(23, 30), night), { phase: 'during', remaining: 150 })
  assert.deepEqual(getShiftStatus(at(1), night), { phase: 'during', remaining: 60 })
  assert.deepEqual(getShiftStatus(at(2, 30), night), { phase: 'after', remaining: 0 })
})

test('turning the shift off or broken settings never crash', () => {
  assert.equal(getShiftStatus(at(12), { ...SHIFT, enabled: false }).phase, 'off')
  assert.equal(getShiftStatus(at(12), { ...SHIFT, endMin: SHIFT.startMin }).phase, 'off')
  assert.deepEqual(normalizeShift({ startMin: -1, endMin: 'x' }), {
    enabled: true,
    startMin: 675,
    endMin: 1020,
  })
})

test('card messages match the situation', () => {
  assert.deepEqual(getShiftMessage({ phase: 'during', remaining: 135 }, 14), { label: 'おわりまで', main: 'あと 2:15' })
  assert.deepEqual(getShiftMessage({ phase: 'before', remaining: 80 }, 9), { label: 'しごとまで', main: 'あと 1:20' })
  assert.deepEqual(getShiftMessage({ phase: 'after', remaining: 0 }, 17), { label: '', main: 'おつかれさま!' })
  assert.deepEqual(getShiftMessage({ phase: 'off', remaining: 0 }, 23), { label: '', main: 'おやすみ…' })
})

test('settings saved on the phone are read safely', async () => {
  const { readShiftSettings } = await import('../../faces/yuge-ramen/setting/keys.js')
  const from = (values) => (key) => values[key]
  assert.deepEqual(readShiftSettings(from({})), { enabled: true, startMin: 675, endMin: 1020 })
  assert.deepEqual(
    readShiftSettings(from({ shiftEnabled: 'false', shiftStart: '11:15', shiftEnd: '16:30' })),
    { enabled: false, startMin: 675, endMin: 990 },
  )
  assert.deepEqual(
    readShiftSettings(from({ shiftEnabled: true, shiftStart: 'だめ', shiftEnd: '' })),
    { enabled: true, startMin: 675, endMin: 1020 },
  )
})
