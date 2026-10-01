import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { QUOTES, nextQuoteIndex } from '../../faces/super-arbeiter/watchface/quotes.js'
import { BAKED_TEXT, DIGITS, LAYOUT, NOTIFICATION, SCREEN, textWidth } from '../../faces/super-arbeiter/watchface/layout.js'
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

// すべての時刻（24時間・12時間）
function allTimes() {
  const hours = [...new Set([...Array.from({ length: 24 }, (_, h) => String(h)), ...Array.from({ length: 12 }, (_, h) => String(h + 1))])]
  return hours.flatMap((h) => Array.from({ length: 60 }, (_, m) => `${h}:${String(m).padStart(2, '0')}`))
}
const widest = (spec, texts) => texts.reduce((best, t) => (textWidth(spec, t) > textWidth(spec, best) ? t : best))

// 時刻の並びの枠（いちばん広い時刻を、枠の中央に置いた時）
function timeRect(spec = DIGITS.time, box = LAYOUT.time) {
  const w = textWidth(spec, widest(spec, allTimes()))
  return { x: box.x + Math.round((box.w - w) / 2), y: box.y, w, h: spec.h }
}

const BOTTOM = ['calendarIcon', 'date', 'divider1', 'shoeIcon', 'steps', 'divider2', 'batteryIcon', 'battery', 'batteryFill']

test('numbers and words stay inside the rounded screen, 12px away from the edge', () => {
  assertSafe('time', timeRect())
  assertSafe('aod time', timeRect(DIGITS.aod, LAYOUT.aod.time))
  for (const key of ['quote', ...BOTTOM]) assertSafe(key, LAYOUT[key])
  assertSafe('aod date', LAYOUT.aod.date)
  assertSafe('aod hp', LAYOUT.aod.hp)
  // 背景の絵に入っている文字（暖簾・提灯）
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assertSafe(`${key} text`, rect)
})

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

test('nothing with words sits under the notification icon at the top center', () => {
  const zone = NOTIFICATION
  for (const [key, rect] of Object.entries(BAKED_TEXT)) assert.ok(!overlaps(rect, zone), `${key} text is under the notification icon`)
  for (const key of ['quote', ...BOTTOM]) assert.ok(!overlaps(LAYOUT[key], zone), `${key} is under the notification icon`)
  assert.ok(!overlaps(timeRect(), zone))
})

test('the bottom row is in order: calendar date | shoe steps | battery charge, without overlaps', () => {
  const order = BOTTOM.filter((k) => k !== 'batteryFill')
  for (let i = 1; i < order.length; i += 1) {
    const a = LAYOUT[order[i - 1]]
    const b = LAYOUT[order[i]]
    assert.ok(a.x + a.w + 2 <= b.x, `${order[i - 1]} runs into ${order[i]}`)
  }
  // 並び全体は画面の左右のまん中
  const left = LAYOUT.calendarIcon.x
  const right = LAYOUT.battery.x + LAYOUT.battery.w
  assert.ok(Math.abs((left + right) / 2 - SCREEN.width / 2) <= 0.5, `the bottom row is centered at ${(left + right) / 2}`)
  // 電池の塗りは電池のアイコンの内側
  const f = LAYOUT.batteryFill
  const icon = LAYOUT.batteryIcon
  assert.ok(f.x > icon.x && f.x + f.w < icon.x + icon.w && f.y > icon.y && f.y + f.h < icon.y + icon.h)
})

test('the time sits below the noren and above the speech bubble', () => {
  assert.ok(LAYOUT.time.y >= BAKED_TEXT.title.y + BAKED_TEXT.title.h + 4)
  assert.ok(LAYOUT.time.y + LAYOUT.time.h <= LAYOUT.quote.y)
  assert.ok(LAYOUT.quote.y + LAYOUT.quote.h <= LAYOUT.calendarIcon.y)
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
  const fits = (spec, box, text) => assert.ok(textWidth(spec, text) <= box.w, `${text} does not fit (${textWidth(spec, text)} > ${box.w})`)
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) fits(DIGITS.date, LAYOUT.date, `${month}/${day}`)
  }
  fits(DIGITS.steps, LAYOUT.steps, '999999')
  fits(DIGITS.battery, LAYOUT.battery, '100')
  for (const t of allTimes()) {
    fits(DIGITS.time, LAYOUT.time, t)
    fits(DIGITS.aod, LAYOUT.aod.time, t)
  }
  assert.ok(DIGITS.time.h > DIGITS.battery.h * 3, 'the time must stay the biggest')
})
