import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { CREST, DATA_FIELDS, DIGITS, LAYOUT, NOTIFICATION, SCREEN, smallWidth, timeWidth } from '../../faces/kamon/watchface/layout.js'
import { dayText, hourText } from '../../faces/kamon/watchface/format.js'
import { DIGIT_STROKES, LETTER_STROKES, WEEKDAYS } from '../../faces/kamon/tools/strokes.mjs'

const FACE = new URL('../../faces/kamon/', import.meta.url)
const IMAGES = 'assets/bip-6/images/'
const readPng = (file) => PNG.sync.read(fs.readFileSync(new URL(file, FACE)))

// 画面の外形（四隅の半径105px）から、さらに端12pxだけ内側に縮めた形の中にあるか
function insideSafeArea(x, y, S = SCREEN.safe) {
  const { width: W, height: H, cornerRadius: R } = SCREEN
  if (x < S || x > W - S || y < S || y > H - S) return false
  const cx = Math.min(Math.max(x, R), W - R)
  const cy = Math.min(Math.max(y, R), H - R)
  return (x - cx) ** 2 + (y - cy) ** 2 <= (R - S) ** 2
}

function assertSafe(name, r) {
  for (const [x, y] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) {
    assert.ok(insideSafeArea(x, y), `${name} (${x}, ${y}) is outside the safe area`)
  }
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

const timeRect = (spec = DIGITS.time, y = LAYOUT.timeY) => {
  const w = timeWidth(spec)
  return { x: Math.round((SCREEN.width - w) / 2), y, w, h: spec.h }
}

const NORMAL_RECTS = ['tempIcon', 'temp', 'batteryIcon', 'battery', 'stepsIcon', 'steps', 'divider', 'heartIcon', 'heart', 'weekday', 'day']

test('everything stays inside the rounded screen, 12px away from the edge', () => {
  assertSafe('time', timeRect())
  assertSafe('aod time', timeRect(DIGITS.aod, LAYOUT.aod.timeY))
  for (const key of NORMAL_RECTS) assertSafe(key, LAYOUT[key])
  assertSafe('aod weekday', LAYOUT.aod.weekday)
  assertSafe('aod day', LAYOUT.aod.day)
  assertSafe('crest', { x: CREST.cx - CREST.r, y: CREST.cy - CREST.r, w: 2 * CREST.r, h: 2 * CREST.r })
})

test('nothing sits under the notification icon at the top center', () => {
  for (const key of NORMAL_RECTS) assert.ok(!overlaps(LAYOUT[key], NOTIFICATION), `${key} is under the notification icon`)
  assert.ok(CREST.cy - CREST.r >= NOTIFICATION.y + NOTIFICATION.h, 'crest reaches the notification area')
  // 背景の絵にも、通知の所には何も描いていない（真っ黒）
  const bg = readPng(`${IMAGES}background.png`)
  for (let y = NOTIFICATION.y; y < NOTIFICATION.y + NOTIFICATION.h; y += 1) {
    for (let x = NOTIFICATION.x; x < NOTIFICATION.x + NOTIFICATION.w; x += 1) {
      const i = (bg.width * y + x) << 2
      assert.equal(bg.data[i] + bg.data[i + 1] + bg.data[i + 2], 0, `background is drawn at (${x}, ${y})`)
    }
  }
})

test('the worst-case values fit their boxes (-12°, 100, 99999 steps, 199 bpm)', () => {
  for (const [key, text] of Object.entries(DATA_FIELDS)) {
    assert.ok(smallWidth(text) <= LAYOUT[key].w, `${key} "${text}" is ${smallWidth(text)}px, box is ${LAYOUT[key].w}px`)
  }
  // データが無い時の「--」も入る
  for (const key of ['temp', 'heart']) assert.ok(smallWidth('00') <= LAYOUT[key].w)
})

test('no two parts overlap, and the time does not touch the other numbers', () => {
  const rects = [...NORMAL_RECTS.map((key) => [key, LAYOUT[key]]), ['time', timeRect()]]
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      assert.ok(!overlaps(rects[i][1], rects[j][1]), `${rects[i][0]} overlaps ${rects[j][0]}`)
    }
  }
  const f = LAYOUT.batteryFill
  const b = LAYOUT.batteryIcon
  assert.ok(f.x > b.x && f.x + f.w < b.x + b.w && f.y > b.y && f.y + f.h < b.y + b.h, 'battery fill stays inside the battery frame')
  assert.ok(!overlaps(LAYOUT.aod.weekday, timeRect(DIGITS.aod, LAYOUT.aod.timeY)))
})

test('the weekday and the day are centered as one group', () => {
  for (const set of [LAYOUT, LAYOUT.aod]) {
    const left = set.weekday.x
    const right = set.day.x + set.day.w
    assert.ok(Math.abs((left + right) / 2 - SCREEN.width / 2) <= 1)
  }
})

test('every digit image in a set has the same size', () => {
  const sets = { time: DIGITS.time, aod: DIGITS.aod, small: DIGITS.small, 'aod-small': DIGITS.small }
  for (const [name, spec] of Object.entries(sets)) {
    for (let d = 0; d <= 9; d += 1) {
      const png = readPng(`${IMAGES}digits/${name}/${d}.png`)
      assert.equal(png.width, spec.w, `${name}/${d} width`)
      assert.equal(png.height, spec.h, `${name}/${d} height`)
    }
    if (spec.colonW) assert.equal(readPng(`${IMAGES}digits/${name}/colon.png`).width, spec.colonW)
  }
  for (const file of ['negative', 'degree', 'invalid']) assert.ok(fs.existsSync(new URL(`${IMAGES}digits/small/${file}.png`, FACE)), file)
})

test('all ten digits look different from each other (1 and 7 too)', () => {
  const shapes = new Set()
  for (let d = 0; d <= 9; d += 1) {
    const png = readPng(`${IMAGES}digits/time/${d}.png`)
    let mask = ''
    for (let i = 3; i < png.data.length; i += 4) mask += png.data[i] > 127 ? '1' : '0'
    shapes.add(mask)
  }
  assert.equal(shapes.size, 10)
})

test('the weekday letters exist for SUN..SAT', () => {
  assert.deepEqual(WEEKDAYS, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])
  for (const name of WEEKDAYS) for (const ch of name) assert.ok(LETTER_STROKES[ch], `letter ${ch}`)
  assert.equal(Object.keys(DIGIT_STROKES).length, 10)
  WEEKDAYS.forEach((_, i) => {
    assert.ok(fs.existsSync(new URL(`${IMAGES}weekday/${i}.png`, FACE)))
    assert.ok(fs.existsSync(new URL(`${IMAGES}weekday-aod/${i}.png`, FACE)))
  })
})

test('AOD lights less than 10% of the screen', () => {
  const png = readPng('docs/preview-aod-390x450.png')
  let lit = 0
  for (let i = 0; i < png.data.length; i += 4) if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 30) lit += 1
  const ratio = lit / (png.width * png.height)
  assert.ok(ratio < 0.1, `AOD lights ${(ratio * 100).toFixed(1)}%`)
})

test('hours: 24h is two digits, 12h has no leading zero; the day is two digits', () => {
  assert.equal(hourText(9, false, 9), '09')
  assert.equal(hourText(0, false, 12), '00')
  assert.equal(hourText(21, true, 9), '9')
  assert.equal(hourText(12, true, 12), '12')
  assert.equal(dayText(5), '05')
  assert.equal(dayText(31), '31')
})
