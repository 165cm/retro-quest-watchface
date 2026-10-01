import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { charWidth, DIGITS, LAYOUT, SCREEN } from '../../faces/super-arbeiter/watchface/layout.js'

// 書き出した数字の画像を読み、はっきり見える画素（不透明度50%以上）の範囲を調べる
const DIGIT_DIR = new URL('../../faces/super-arbeiter/assets/bip-6/images/digits/', import.meta.url)
const SOLID = 128

function readInk(dir, name) {
  const png = PNG.sync.read(fs.readFileSync(new URL(`${dir}/${name}.png`, DIGIT_DIR)))
  let x0 = Infinity
  let x1 = -Infinity
  let edge = false
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.data[((png.width * y + x) << 2) + 3] >= SOLID) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        if (x === 0 || y === 0 || x === png.width - 1 || y === png.height - 1) edge = true
      }
    }
  }
  return { x0, x1, edge, width: png.width, png }
}

const NAMES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const glyphName = (ch) => (ch === ':' ? 'colon' : ch === '/' ? 'slash' : ch)

test('no digit image is cut off at its edges', () => {
  for (const [dir, spec] of Object.entries(DIGITS)) {
    const names = [...NAMES, 'negative']
    if (spec.colonW) names.push('colon')
    if (spec.slashW) names.push('slash')
    for (const name of names) {
      assert.equal(readInk(dir, name).edge, false, `digits/${dir}/${name}.png has ink on its edge (cut off)`)
    }
  }
})

// shared/time-sprites.js と同じ並べ方で、各文字の見える範囲（画面の x）を出す
function timeInk(dir, hourText, minuteText) {
  const spec = DIGITS[dir]
  const chars = [...hourText, ':', ...minuteText]
  const widthOf = (ch) => charWidth(spec, ch)
  const total = chars.reduce((sum, ch) => sum + widthOf(ch), 0) + spec.gap * (chars.length - 1)
  // 時刻は LAYOUT.time の範囲の中央、AOD は画面の中央（shared/time-sprites.js と同じ）
  let x = dir === 'aod' ? Math.round((SCREEN.width - total) / 2) : LAYOUT.time.x + Math.round((LAYOUT.time.w - total) / 2)
  return chars.map((ch) => {
    const ink = readInkCached(dir, glyphName(ch))
    const item = { ch, left: x + ink.x0, right: x + ink.x1 }
    x += widthOf(ch) + spec.gap
    return item
  })
}

const cache = new Map()
function readInkCached(dir, name) {
  const key = `${dir}/${name}`
  if (!cache.has(key)) cache.set(key, readInk(dir, name))
  return cache.get(key)
}

function hourTexts() {
  const h24 = Array.from({ length: 24 }, (_, h) => String(h))
  const h12 = Array.from({ length: 12 }, (_, h) => String(h + 1))
  return [...new Set([...h24, ...h12])]
}

test('neighbouring characters of the time never touch, at every minute', () => {
  for (const dir of ['time', 'aod']) {
    for (const hour of hourTexts()) {
      for (let m = 0; m < 60; m += 1) {
        const items = timeInk(dir, hour, String(m).padStart(2, '0'))
        for (let i = 1; i < items.length; i += 1) {
          const gap = items[i].left - items[i - 1].right - 1
          assert.ok(gap >= 1, `${dir} ${hour}:${String(m).padStart(2, '0')} "${items[i - 1].ch}${items[i].ch}" gap ${gap}px`)
        }
      }
    }
  }
})

test('the date never touches the time', () => {
  // 時刻のいちばん左（2桁の時のどれか）
  let timeLeft = Infinity
  for (const hour of hourTexts().filter((h) => h.length === 2)) {
    for (let m = 0; m < 60; m += 1) timeLeft = Math.min(timeLeft, timeInk('time', hour, String(m).padStart(2, '0'))[0].left)
  }
  // 日付：中央ぞろえ。すべての月日で、いちばん右の文字の見える位置を調べる
  const date = DIGITS.date
  const widthOf = (ch) => charWidth(date, ch)
  let dateRight = -Infinity
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const text = `${month}/${day}`
      const total = text.split('').reduce((sum, ch) => sum + widthOf(ch), 0) + date.gap * (text.length - 1)
      const x = LAYOUT.date.x + Math.round((LAYOUT.date.w - total) / 2)
      dateRight = Math.max(dateRight, x + total - widthOf(text.at(-1)) + readInkCached('date', glyphName(text.at(-1))).x1)
    }
  }
  assert.ok(timeLeft - dateRight - 1 >= 2, `the date is ${timeLeft - dateRight - 1}px from the time`)
})

test('the small numbers never touch each other', () => {
  // 画像を並べる数字（日付）と、時計のデータを出す数字（歩数・電池）の、どの2文字の組み合わせでも
  const sets = {
    date: [...NAMES, '/'],
    steps: NAMES,
    battery: NAMES,
  }
  for (const [dir, chars] of Object.entries(sets)) {
    const spec = DIGITS[dir]
    const widthOf = (ch) => charWidth(spec, ch)
    for (const a of chars) {
      for (const b of chars) {
        if (!NAMES.includes(a) && !NAMES.includes(b)) continue // 「//」は出ない
        const left = readInkCached(dir, glyphName(a))
        const right = readInkCached(dir, glyphName(b))
        const gap = widthOf(a) + spec.gap + right.x0 - left.x1 - 1
        assert.ok(gap >= 1, `${dir} "${a}${b}" gap ${gap}px`)
      }
    }
  }
})

// 背景の絵のカレンダーのアイコン（黒い画素）の左右の中央
function calendarCenter() {
  const bg = PNG.sync.read(fs.readFileSync(new URL('../../faces/super-arbeiter/source/background.png', import.meta.url)))
  let x0 = Infinity
  let x1 = -Infinity
  for (let y = 120; y <= 155; y += 1) {
    for (let x = 12; x <= 75; x += 1) {
      const i = (bg.width * y + x) << 2
      if (bg.data[i] + bg.data[i + 1] + bg.data[i + 2] < 200) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
      }
    }
  }
  return (x0 + x1 + 1) / 2
}

// 画像の不透明度で重みをつけた、字の左右の中央（画像の左端から）
function inkCenter(png) {
  let sum = 0
  let weight = 0
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const a = png.data[((png.width * y + x) << 2) + 3]
      sum += a * (x + 0.5)
      weight += a
    }
  }
  return sum / weight
}

test('the date and the weekday are centered under the calendar icon', () => {
  const center = calendarCenter()
  // 日付：すべての月日で、見える字の左端と右端のまん中が、アイコンの中央から 0.5px 以内
  const date = DIGITS.date
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const text = `${month}/${day}`
      const chars = text.split('')
      const total = chars.reduce((sum, ch) => sum + charWidth(date, ch), 0) + date.gap * (chars.length - 1)
      // shared/image-text.js と同じ並べ方
      let x = LAYOUT.date.x + Math.round((LAYOUT.date.w - total) / 2)
      let left = Infinity
      let right = -Infinity
      chars.forEach((ch, i) => {
        const ink = readInkCached('date', glyphName(ch))
        if (i === 0) left = x + ink.x0
        if (i === chars.length - 1) right = x + ink.x1 + 1
        x += charWidth(date, ch) + date.gap
      })
      const off = (left + right) / 2 - center
      assert.ok(Math.abs(off) <= 0.5, `${text} is ${off.toFixed(2)}px off the calendar icon`)
    }
  }
  // 曜日：字の重心が、アイコンの中央から 0.5px 以内
  for (let day = 0; day < 7; day += 1) {
    const png = PNG.sync.read(fs.readFileSync(new URL(`../../faces/super-arbeiter/assets/bip-6/images/weekday/${day}.png`, import.meta.url)))
    const off = LAYOUT.weekday.x + inkCenter(png) - center
    assert.ok(Math.abs(off) <= 0.5, `weekday ${day} is ${off.toFixed(2)}px off the calendar icon`)
  }
})
