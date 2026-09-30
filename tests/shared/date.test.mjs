import test from 'node:test'
import assert from 'node:assert/strict'
import { formatWeekday, weekdayIndex } from '../../shared/date.js'

const JA = ['日', '月', '火', '水', '木', '金', '土']

test('Sunday is found whether getDay() returns 0 or 7', () => {
  assert.equal(formatWeekday(0, JA), '日')
  assert.equal(formatWeekday(7, JA), '日')
  assert.equal(formatWeekday(1, JA), '月')
  assert.equal(formatWeekday(6, JA), '土')
})

test('missing or invalid values are not mistaken for Sunday', () => {
  assert.equal(weekdayIndex(null), null)
  assert.equal(weekdayIndex(undefined), null)
  assert.equal(weekdayIndex(''), null)
  assert.equal(weekdayIndex(8), null)
  assert.equal(weekdayIndex(1.5), null)
  assert.equal(formatWeekday(null, JA), '---')
})
