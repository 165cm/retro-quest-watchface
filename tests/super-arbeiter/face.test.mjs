import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { QUOTES, nextQuoteIndex } from '../../faces/super-arbeiter/watchface/quotes.js'
import { BAKED_TEXT, charWidth, DIGITS, LAYOUT, NOTIFICATION, SCREEN, timeWidth } from '../../faces/super-arbeiter/watchface/layout.js'
import { COLORS } from '../../faces/super-arbeiter/watchface/theme.js'

const FACE = new URL('../../faces/super-arbeiter/', import.meta.url)
const readPng = (file) => PNG.sync.read(fs.readFileSync(new URL(file, FACE)))

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

// 時刻：2桁の時のいちばん広い幅を、時刻の範囲の中央に置いた時の枠
function timeRect() {
  const w = timeWidth()
  return { x: LAYOUT.time.x + Math.round((LAYOUT.time.w - w) / 2), y: LAYOUT.time.y, w, h: DIGITS.time.h }
}

test('numbers and words stay inside the rounded screen, 12px away from the edge', () => {
  assertSafe('time', timeRect())
  const aodW = timeWidth(DIGITS.aod)
  assertSafe('aod time', { x: Math.round((SCREEN.width - aodW) / 2), y: LAYOUT.aod.timeY, w: aodW, h: DIGITS.aod.h })
  for (const key of ['date', 'weekday', 'quote', 'steps', 'battery', 'batteryFill']) {
    assertSafe(key, LAYOUT[key])
  }
  assertSafe('aod date', LAYOUT.aod.date)
  assertSafe('aod hp', LAYOUT.aod.hp)
  // 背景の絵に入っている文字（暖簾・提灯）
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assertSafe(`${key} text`, rect)
})

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

test('nothing with words sits under the notification icon at the top center', () => {
  const zone = NOTIFICATION
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assert.ok(!overlaps(rect, zone), `${key} text is under the notification icon`)
  for (const key of ['date', 'weekday', 'quote', 'steps', 'battery']) {
    assert.ok(!overlaps(LAYOUT[key], zone), `${key} is under the notification icon`)
  }
  assert.ok(!overlaps(timeRect(), zone))
})

test('the bottom numbers stay between the icons and the divider', () => {
  // 背景の絵で測った範囲：くつ x=40〜116、区切り x=209〜225、電池の枠 x=223〜263
  assert.ok(LAYOUT.steps.x >= 118, 'steps start right of the shoe')
  assert.ok(LAYOUT.steps.x + LAYOUT.steps.w <= 207, 'steps end left of the divider')
  assert.ok(LAYOUT.battery.x >= 266, 'battery number starts right of the battery icon')
  const f = LAYOUT.batteryFill
  assert.ok(f.x >= 227 && f.x + f.w <= 256 && f.y >= 402 && f.y + f.h <= 417, 'battery fill stays inside the battery frame')
})

test('the date and the time do not overlap', () => {
  assert.ok(LAYOUT.date.x + LAYOUT.date.w <= timeRect().x, 'date box runs into the time')
  assert.ok(LAYOUT.weekday.x + LAYOUT.weekday.w <= timeRect().x, 'weekday box runs into the time')
})

test('the quote cards only draw on the cream inside of the speech bubble (the black frame stays visible)', () => {
  const bg = readPng('source/background.png')
  const cream = [(COLORS.CREAM >> 16) & 255, (COLORS.CREAM >> 8) & 255, COLORS.CREAM & 255]
  const { x: qx, y: qy } = LAYOUT.quote
  QUOTES.forEach((q, n) => {
    const card = readPng(`assets/bip-6/${q.image}`)
    assert.equal(card.width, LAYOUT.quote.w)
    assert.equal(card.height, LAYOUT.quote.h)
    let ink = 0
    for (let y = 0; y < card.height; y += 1) {
      for (let x = 0; x < card.width; x += 1) {
        if (card.data[((card.width * y + x) << 2) + 3] === 0) continue
        ink += 1
        const i = (bg.width * (qy + y) + qx + x) << 2
        const under = [bg.data[i], bg.data[i + 1], bg.data[i + 2]]
        assert.deepEqual(under, cream, `quote ${n + 1} covers (${qx + x}, ${qy + y}), which is not the inside of the bubble`)
      }
    }
    assert.ok(ink > 500, `quote ${n + 1} has its words`)
  })
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
    const width = text.split('').reduce((sum, ch) => sum + charWidth(spec, ch), 0)
    return width + spec.gap * (text.length - 1) <= box.w
  }
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) assert.ok(fits(`${month}/${day}`, DIGITS.date, LAYOUT.date), `${month}/${day}`)
  }
  assert.ok(fits('999999', DIGITS.steps, LAYOUT.steps), 'steps up to 6 digits')
  assert.ok(fits('100', DIGITS.battery, LAYOUT.battery))
  assert.ok(timeWidth() <= LAYOUT.time.w)
  assert.ok(DIGITS.time.h > DIGITS.battery.h * 2, 'the time must stay the biggest')
})
