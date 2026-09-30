import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { DIGITS, LAYOUT, SCREEN } from '../../faces/super-arbeiter/watchface/layout.js'

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
  return { x0, x1, edge, width: png.width }
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
  const widthOf = (ch) => (ch === ':' ? spec.colonW : spec.w)
  const total = chars.reduce((sum, ch) => sum + widthOf(ch), 0) + spec.gap * (chars.length - 1)
  let x = Math.round((SCREEN.width - total) / 2)
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

test('HP and the date never touch the time', () => {
  // 時刻の左右のいちばん外側（2桁の時のどれか）
  let timeLeft = Infinity
  let timeRight = -Infinity
  for (const hour of hourTexts().filter((h) => h.length === 2)) {
    for (let m = 0; m < 60; m += 1) {
      const items = timeInk('time', hour, String(m).padStart(2, '0'))
      timeLeft = Math.min(timeLeft, items[0].left)
      timeRight = Math.max(timeRight, items[items.length - 1].right)
    }
  }
  // HP：左寄せ。いちばん長い 100
  const hp = DIGITS.hp
  let hpRight = -Infinity
  '100'.split('').forEach((ch, i) => {
    hpRight = Math.max(hpRight, LAYOUT.hp.x + i * (hp.w + hp.gap) + readInkCached('hp', ch).x1)
  })
  assert.ok(timeLeft - hpRight - 1 >= 2, `HP 100 is ${timeLeft - hpRight - 1}px from the time`)
  // 日付：右寄せ。すべての月日で、いちばん左の文字の見える位置を調べる
  const date = DIGITS.date
  const widthOf = (ch) => (ch === '/' ? date.slashW : date.w)
  let dateLeft = Infinity
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const text = `${month}/${day}`
      const total = text.split('').reduce((sum, ch) => sum + widthOf(ch), 0) + date.gap * (text.length - 1)
      const x = LAYOUT.date.x + LAYOUT.date.w - total
      dateLeft = Math.min(dateLeft, x + readInkCached('date', glyphName(text[0])).x0)
    }
  }
  assert.ok(dateLeft - timeRight - 1 >= 2, `the date is ${dateLeft - timeRight - 1}px from the time`)
})

test('the small numbers never touch each other', () => {
  // 画像を並べる数字（日付・BREAK）と、時計のデータを出す数字（HP・STEPS）の、どの2文字の組み合わせでも
  const sets = {
    hp: NAMES,
    steps: NAMES,
    date: [...NAMES, '/'],
    break: [...NAMES, ':'],
  }
  for (const [dir, chars] of Object.entries(sets)) {
    const spec = DIGITS[dir]
    const widthOf = (ch) => (ch === ':' ? spec.colonW : ch === '/' ? spec.slashW : spec.w)
    for (const a of chars) {
      for (const b of chars) {
        if (!NAMES.includes(a) && !NAMES.includes(b)) continue // 「//」「::」は出ない
        const left = readInkCached(dir, glyphName(a))
        const right = readInkCached(dir, glyphName(b))
        const gap = widthOf(a) + spec.gap + right.x0 - left.x1 - 1
        assert.ok(gap >= 1, `${dir} "${a}${b}" gap ${gap}px`)
      }
    }
  }
})
