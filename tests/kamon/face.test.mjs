import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { CORNER_INSET, CREST, DATA_FIELDS, DIGITS, EDGE_MARGIN, LAYOUT, NOTIFICATION, SCREEN, TITLE, smallWidth, timeWidth } from '../../faces/kamon/watchface/layout.js'
import { dateText, hourText } from '../../faces/kamon/watchface/format.js'

const FACE = new URL('../../faces/kamon/', import.meta.url)
const IMAGES = 'assets/bip-6/images/'
const readPng = (file) => PNG.sync.read(fs.readFileSync(new URL(file, FACE)))

// 画面の形（CORNER_INSET の丸い四隅）の中に、端から EDGE_MARGIN 以上離れて入っているか
function insideScreen(x, y) {
  const { width: W, height: H } = SCREEN
  if (y < EDGE_MARGIN || y > H - EDGE_MARGIN) return false
  const fromEdge = Math.min(Math.floor(y), Math.floor(H - 1 - y))
  const inset = (CORNER_INSET[fromEdge] ?? 0) + EDGE_MARGIN
  return x >= inset && x <= W - inset
}

function assertInside(name, r) {
  for (const [x, y] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) {
    assert.ok(insideScreen(x, y), `${name} (${x}, ${y}) is outside the screen`)
  }
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

const timeRect = (spec = DIGITS.time, y = LAYOUT.timeY) => {
  const w = timeWidth(spec)
  return { x: Math.round((SCREEN.width - w) / 2), y, w, h: spec.h }
}

const ROW = ['tempIcon', 'temp', 'stepsIcon', 'steps', 'heartIcon', 'heart', 'batteryIcon', 'battery']

// 絵の中で、色のついた所（黒でない所）の範囲
function inkBox(png, test = (r, g, b, a) => a > 127 && r + g + b > 60) {
  let box = null
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (png.width * y + x) << 2
      if (!test(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3])) continue
      box = box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) } : { x0: x, y0: y, x1: x, y1: y }
    }
  }
  return box
}

test('everything stays inside the rounded screen', () => {
  assertInside('time', timeRect())
  assertInside('aod time', timeRect(DIGITS.aod, LAYOUT.aod.timeY))
  for (const key of ROW) assertInside(key, LAYOUT[key])
  LAYOUT.dividers.forEach((d, i) => assertInside(`divider ${i}`, d))
  assertInside('date', LAYOUT.date)
  TITLE.rules.forEach((r, i) => assertInside(`title rule ${i}`, r))
})

test('nothing is drawn under the notification icon at the top center', () => {
  for (const key of ROW) assert.ok(!overlaps(LAYOUT[key], NOTIFICATION), key)
  assert.ok(TITLE.y >= NOTIFICATION.y + NOTIFICATION.h, 'title is under the notification icon')
  const bg = readPng(`${IMAGES}background.png`)
  for (let y = NOTIFICATION.y; y < NOTIFICATION.y + NOTIFICATION.h; y += 1) {
    for (let x = NOTIFICATION.x; x < NOTIFICATION.x + NOTIFICATION.w; x += 1) {
      const i = (bg.width * y + x) << 2
      assert.equal(bg.data[i] + bg.data[i + 1] + bg.data[i + 2], 0, `background is drawn at (${x}, ${y})`)
    }
  }
})

test('the worst-case values fit their boxes (-12°, 99999 steps, 199 bpm, 100%)', () => {
  for (const [key, value] of Object.entries(DATA_FIELDS)) {
    assert.ok(smallWidth(value) <= LAYOUT[key].w, `${key} "${value}" is ${smallWidth(value)}px, box is ${LAYOUT[key].w}px`)
  }
  for (const key of ['temp', 'heart']) assert.ok(smallWidth('00') <= LAYOUT[key].w, `${key} "--"`)
})

test('the bottom row keeps its order and nothing touches a divider', () => {
  const [d1, d2, d3] = LAYOUT.dividers
  const groups = [['tempIcon', 'temp'], ['stepsIcon', 'steps'], ['heartIcon', 'heart'], ['batteryIcon', 'battery']]
  const bounds = [[0, d1.x], [d1.x + d1.w, d2.x], [d2.x + d2.w, d3.x], [d3.x + d3.w, SCREEN.width]]
  groups.forEach((keys, i) => {
    for (const key of keys) {
      const r = LAYOUT[key]
      assert.ok(r.x > bounds[i][0] && r.x + r.w < bounds[i][1], `${key} touches a divider`)
    }
    assert.ok(!overlaps(LAYOUT[keys[0]], LAYOUT[keys[1]]), `${keys[0]} overlaps ${keys[1]}`)
  })
  const f = LAYOUT.batteryFill
  const b = LAYOUT.batteryIcon
  assert.ok(f.x > b.x && f.x + f.w < b.x + b.w && f.y > b.y && f.y + f.h < b.y + b.h, 'battery fill stays inside the battery frame')
})

test('the time, the date and the bottom row do not overlap', () => {
  const t = timeRect()
  assert.ok(!overlaps(t, LAYOUT.date))
  for (const key of ROW) assert.ok(!overlaps(t, LAYOUT[key]) && !overlaps(LAYOUT.date, LAYOUT[key]), key)
  assert.ok(!overlaps(timeRect(DIGITS.aod, LAYOUT.aod.timeY), LAYOUT.aod.date))
})

test('the time digits sit where the original design had them (52x76 figures, 70px apart, y=185..261)', () => {
  const t = timeRect()
  assert.ok(Math.abs(t.x - 42) <= 1, `left ${t.x}`)
  const zero = inkBox(readPng(`${IMAGES}digits/time/0.png`))
  assert.ok(Math.abs(LAYOUT.timeY + zero.y0 - 185) <= 2, `top ${LAYOUT.timeY + zero.y0}`)
  assert.ok(Math.abs(LAYOUT.timeY + zero.y1 - 261) <= 2, `bottom ${LAYOUT.timeY + zero.y1}`)
  assert.ok(Math.abs(zero.x1 - zero.x0 + 1 - 52) <= 3, `width ${zero.x1 - zero.x0 + 1}`)
})

test('every digit image in a set has the same size, and no digit touches the edge', () => {
  for (const name of ['time', 'aod', 'small']) {
    const spec = DIGITS[name]
    for (let d = 0; d <= 9; d += 1) {
      const png = readPng(`${IMAGES}digits/${name}/${d}.png`)
      assert.equal(png.width, spec.w, `${name}/${d} width`)
      assert.equal(png.height, spec.h, `${name}/${d} height`)
      // ふちの薄いにじみ（不透明度 1/4 未満）は数えない
      const box = inkBox(png, (r, g, b, a) => a > 64)
      assert.ok(box.x0 > 0 && box.y0 > 0 && box.x1 < spec.w - 1 && box.y1 < spec.h - 1, `${name}/${d} is cut at the edge`)
    }
  }
  for (const file of ['negative', 'degree', 'invalid']) assert.ok(fs.existsSync(new URL(`${IMAGES}digits/small/${file}.png`, FACE)), file)
})

test('the crest stays a quiet charcoal layer behind the time', () => {
  const bg = readPng(`${IMAGES}background.png`)
  const i = (bg.width * CREST.cy + (CREST.cx - CREST.r + CREST.ring / 2)) << 2
  const [r, g, b] = [bg.data[i], bg.data[i + 1], bg.data[i + 2]]
  assert.ok(r === g && g === b && r > 20 && r < 60, `ring color ${r},${g},${b}`)
})

test('AOD lights less than 10% of the screen', () => {
  const png = readPng('docs/preview-aod-390x450.png')
  let lit = 0
  for (let i = 0; i < png.data.length; i += 4) if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 30) lit += 1
  const ratio = lit / (png.width * png.height)
  assert.ok(ratio < 0.1, `AOD lights ${(ratio * 100).toFixed(1)}%`)
})

test('hours: 24h is two digits, 12h has no leading zero', () => {
  assert.equal(hourText(9, false, 9), '09')
  assert.equal(hourText(0, false, 12), '00')
  assert.equal(hourText(21, true, 9), '9')
  assert.equal(hourText(12, true, 12), '12')
})

test('the date reads like the original design: WED 30 SEP', () => {
  assert.equal(dateText(3, 30, 9), 'WED 30 SEP')
  assert.equal(dateText(0, 1, 1), 'SUN 1 JAN')
  assert.equal(dateText(6, 31, 12), 'SAT 31 DEC')
  assert.equal(dateText(null, 5, 5), '5 MAY')
})
