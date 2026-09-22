import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, formatWeekday } from '../watchface/date.js'

// getDay() が JS互換（0=日曜）を返す端末でも全曜日が引けること。
// 旧実装はここで日曜が '---' になっていた。
test('weekdays resolve under the JS convention (0 = Sunday)', () => {
  assert.equal(formatWeekday(0), 'SUN')
  assert.equal(formatWeekday(1), 'MON')
  assert.equal(formatWeekday(2), 'TUE')
  assert.equal(formatWeekday(3), 'WED')
  assert.equal(formatWeekday(4), 'THU')
  assert.equal(formatWeekday(5), 'FRI')
  assert.equal(formatWeekday(6), 'SAT')
})

// getDay() が 1=月曜〜7=日曜 を返す端末でも同じ結果になること。
test('weekdays resolve under the 1-based convention (7 = Sunday)', () => {
  assert.equal(formatWeekday(1), 'MON')
  assert.equal(formatWeekday(2), 'TUE')
  assert.equal(formatWeekday(3), 'WED')
  assert.equal(formatWeekday(4), 'THU')
  assert.equal(formatWeekday(5), 'FRI')
  assert.equal(formatWeekday(6), 'SAT')
  assert.equal(formatWeekday(7), 'SUN')
})

// 両方の流儀で一致するのは月〜土だけ。日曜は 0 と 7 の両方が SUN になる。
test('both conventions agree on every weekday', () => {
  assert.equal(formatWeekday(0), formatWeekday(7))
  for (let day = 1; day <= 6; day += 1) {
    assert.equal(formatWeekday(day), formatWeekday(day % 7))
  }
})

test('out-of-range and non-integer days fall back to a placeholder', () => {
  assert.equal(formatWeekday(8), '---')
  assert.equal(formatWeekday(-1), '---')
  assert.equal(formatWeekday(null), '---')
  assert.equal(formatWeekday(undefined), '---')
  assert.equal(formatWeekday(2.5), '---')
  assert.equal(formatWeekday('TUE'), '---')
})

test('date strings match the screenshot format', () => {
  // 実機スクリーンショット: 2026-08-11 火曜
  assert.equal(formatDate(8, 11, 2), '8/11 TUE')
  // 日曜。旧実装では '12/7 ---' になっていたケース。
  assert.equal(formatDate(12, 7, 0), '12/7 SUN')
  assert.equal(formatDate(12, 7, 7), '12/7 SUN')
})
