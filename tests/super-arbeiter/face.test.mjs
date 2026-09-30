import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_BREAK_MIN,
  formatBreak,
  normalizeBreakMinutes,
  readBreakMinutes,
} from '../../faces/super-arbeiter/setting/keys.js'
import { getStatus, STATUS_PRESETS } from '../../faces/super-arbeiter/watchface/status.js'
import { DIGITS, LAYOUT, SCREEN, TEXT_IN_ART, timeWidth } from '../../faces/super-arbeiter/watchface/layout.js'

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

// 画面の外形（四隅の半径105px）から、さらに端12pxだけ内側に縮めた形の中にあるか
function insideSafeArea(x, y) {
  const { width: W, height: H, cornerRadius: R, safe: S } = SCREEN
  if (x < S || x > W - S || y < S || y > H - S) return false
  const cx = Math.min(Math.max(x, R), W - R)
  const cy = Math.min(Math.max(y, R), H - R)
  return (x - cx) ** 2 + (y - cy) ** 2 <= (R - S) ** 2
}

function corners(rect) {
  return [
    [rect.x, rect.y],
    [rect.x + rect.w, rect.y],
    [rect.x, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h],
  ]
}

function assertSafe(name, rect) {
  for (const [x, y] of corners(rect)) {
    assert.ok(insideSafeArea(x, y), `${name} (${x}, ${y}) is outside the safe area`)
  }
}

test('numbers and words stay inside the rounded screen, 12px away from the edge', () => {
  // 時刻：いちばん広い「2桁の時」の幅を DIGITS から求める
  const w = timeWidth()
  assertSafe('time', { x: Math.round((SCREEN.width - w) / 2), y: LAYOUT.time.y, w, h: DIGITS.time.h })
  const aodW = timeWidth(DIGITS.aod)
  assertSafe('aod time', { x: Math.round((SCREEN.width - aodW) / 2), y: LAYOUT.aod.timeY, w: aodW, h: DIGITS.aod.h })
  for (const key of ['status', 'hp', 'hpLabel', 'steps', 'stepsLabel', 'date', 'weekday', 'breakLabel', 'breakTime']) {
    assertSafe(key, LAYOUT[key])
  }
  assertSafe('aod date', LAYOUT.aod.date)
  assertSafe('aod hp', LAYOUT.aod.hp)
  // 暖簾・提灯・FINAL の絵の中の文字
  for (const [key, part] of Object.entries(TEXT_IN_ART)) {
    const r = LAYOUT[key]
    assertSafe(`${key} text`, { x: r.x + r.w * part.x, y: r.y + r.h * part.y, w: r.w * part.w, h: r.h * part.h })
  }
})

test('the widest values fit in their boxes', () => {
  const fits = (text, spec, box) => {
    const width = text.split('').reduce((sum, ch) => sum + (ch === ':' ? spec.colonW : ch === '/' ? spec.slashW : spec.w), 0)
    return width + spec.gap * (text.length - 1) <= box.w
  }
  assert.ok(fits('100', DIGITS.hp, LAYOUT.hp))
  assert.ok(fits('99999', DIGITS.steps, LAYOUT.steps))
  assert.ok(fits('12/31', DIGITS.date, LAYOUT.date))
  assert.ok(fits('23:59', DIGITS.break, LAYOUT.breakTime))
  assert.ok(DIGITS.time.h > DIGITS.hp.h * 2, 'the time must stay the biggest')
})
