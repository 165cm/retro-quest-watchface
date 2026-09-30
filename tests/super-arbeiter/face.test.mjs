import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_BREAK_MIN,
  formatBreak,
  normalizeBreakMinutes,
  readBreakMinutes,
} from '../../faces/super-arbeiter/setting/keys.js'
import { QUOTES, nextQuoteIndex } from '../../faces/super-arbeiter/watchface/quotes.js'
import { BAKED_TEXT, DIGITS, LAYOUT, NOTIFICATION, SCREEN, timeWidth } from '../../faces/super-arbeiter/watchface/layout.js'

test('the break time comes from the phone settings, 15:00 by default', () => {
  const from = (values) => (key) => values[key]
  assert.equal(readBreakMinutes(from({})), DEFAULT_BREAK_MIN)
  assert.equal(readBreakMinutes(from({ breakTime: '14:58' })), 898)
  assert.equal(readBreakMinutes(from({ breakTime: 'だめ' })), DEFAULT_BREAK_MIN)
  assert.equal(normalizeBreakMinutes(-5), DEFAULT_BREAK_MIN)
  assert.equal(formatBreak(898), '14:58')
})

// 画面の外形（四隅の半径105px）から、さらに端12pxだけ内側に縮めた形の中にあるか
function insideSafeArea(x, y, S = SCREEN.safe) {
  const { width: W, height: H, cornerRadius: R } = SCREEN
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
  for (const key of ['hp', 'steps', 'date', 'weekday', 'quote', 'breakTime']) {
    assertSafe(key, LAYOUT[key])
  }
  // BREAK の赤い箱は飾りなので、端12pxの余白には少しかかってよい。ただし画面の丸みで欠けないこと
  for (const [x, y] of corners(LAYOUT.breakBox)) assert.ok(insideSafeArea(x, y, 0), `breakBox (${x}, ${y}) is cut by the corner`)
  assertSafe('aod date', LAYOUT.aod.date)
  assertSafe('aod hp', LAYOUT.aod.hp)
  // 背景の絵に入っている文字（暖簾・提灯・ラベル）
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assertSafe(`${key} text`, rect)
})

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

test('nothing with words sits under the notification icon at the top center', () => {
  const zone = NOTIFICATION
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assert.ok(!overlaps(rect, zone), `${key} text is under the notification icon`)
  for (const key of ['hp', 'date', 'weekday', 'quote', 'steps', 'breakTime']) {
    assert.ok(!overlaps(LAYOUT[key], zone), `${key} is under the notification icon`)
  }
  const w = timeWidth()
  assert.ok(!overlaps({ x: (SCREEN.width - w) / 2, y: LAYOUT.time.y, w, h: DIGITS.time.h }, zone))
})

test('there are 7 quotes in a fixed order', () => {
  assert.equal(QUOTES.length, 7)
  assert.equal(QUOTES[0].text, 'だめそうだったらさーリタイアすればいいよね')
  assert.equal(QUOTES[6].text, '仕事の後の一杯が楽しみだなッ!!')
  QUOTES.forEach((q, i) => {
    assert.equal(q.image, `images/quotes/${i + 1}.png`)
    assert.ok(fs.existsSync(new URL(`../../faces/super-arbeiter/assets/bip-6/${q.image}`, import.meta.url)), q.image)
  })
})

test('each time the screen turns on, the next quote comes, and it goes around all 7', () => {
  const seen = []
  let i = 0
  for (let k = 0; k < 7; k += 1) {
    seen.push(i)
    i = nextQuoteIndex(i)
  }
  assert.deepEqual(seen, [0, 1, 2, 3, 4, 5, 6])
  assert.equal(i, 0)
  for (const bad of [null, undefined, -1, 7, 1.5, NaN]) assert.equal(nextQuoteIndex(bad), 0)
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
