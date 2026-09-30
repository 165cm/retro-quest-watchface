import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_BREAK_MIN,
  formatBreak,
  normalizeBreakMinutes,
  readBreakMinutes,
} from '../../faces/super-arbeiter/setting/keys.js'
import { getStatus, STATUS_PRESETS } from '../../faces/super-arbeiter/watchface/status.js'
import { LAYOUT, SCREEN } from '../../faces/super-arbeiter/watchface/layout.js'

test('the break time comes from the phone settings, 15:00 by default', () => {
  const from = (values) => (key) => values[key]
  assert.equal(readBreakMinutes(from({})), DEFAULT_BREAK_MIN)
  assert.equal(readBreakMinutes(from({ breakTime: '14:58' })), 898)
  assert.equal(readBreakMinutes(from({ breakTime: 'だめ' })), DEFAULT_BREAK_MIN)
  assert.equal(normalizeBreakMinutes(-5), DEFAULT_BREAK_MIN)
  assert.equal(formatBreak(898), '14:58')
})

test('the status starts with まだいける and ignores unknown numbers', () => {
  assert.equal(STATUS_PRESETS[0].text, 'まだいける')
  assert.equal(getStatus(0).text, 'まだいける')
  assert.equal(getStatus(99).text, 'まだいける')
})

// 角丸（半径105px）の内側かどうか
function inside(x, y) {
  const r = SCREEN.cornerRadius
  const cx = x < r ? r : x > SCREEN.width - r ? SCREEN.width - r : x
  const cy = y < r ? r : y > SCREEN.height - r ? SCREEN.height - r : y
  return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2
}

test('the information stays inside the rounded screen and away from the edges', () => {
  // 飾り（暖簾・提灯・カウンター・FINAL の筆）は端にかかってよい。数字と文字は内側に収める
  const important = ['time', 'status', 'hp', 'hpLabel', 'steps', 'stepsLabel', 'date', 'weekday', 'breakLabel', 'breakTime']
  for (const key of important) {
    const r = LAYOUT[key]
    const rect = key === 'time' ? { x: 50, y: r.y, w: 290, h: 94 } : r
    for (const [x, y] of [
      [rect.x, rect.y],
      [rect.x + rect.w, rect.y],
      [rect.x, rect.y + rect.h],
      [rect.x + rect.w, rect.y + rect.h],
    ]) {
      assert.ok(inside(x, y), `${key} (${x}, ${y}) is cut off by the rounded corner`)
      assert.ok(x >= SCREEN.safe && x <= SCREEN.width - SCREEN.safe, `${key} x=${x} is too close to the edge`)
    }
  }
})
