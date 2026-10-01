import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { PNG } from 'pngjs'
import { charWidth, DIGITS, LAYOUT, SCREEN, textWidth } from '../../faces/super-arbeiter/watchface/layout.js'
import { GLYPH_WIDTHS } from '../../faces/super-arbeiter/watchface/glyph-widths.js'

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
  return { x0, x1, edge, width: png.width, height: png.height }
}

const cache = new Map()
function readInkCached(dir, name) {
  const key = `${dir}/${name}`
  if (!cache.has(key)) cache.set(key, readInk(dir, name))
  return cache.get(key)
}

const NAMES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const glyphName = (ch) => (ch === ':' ? 'colon' : ch === '/' ? 'slash' : ch)

function hourTexts() {
  const h24 = Array.from({ length: 24 }, (_, h) => String(h))
  const h12 = Array.from({ length: 12 }, (_, h) => String(h + 1))
  return [...new Set([...h24, ...h12])]
}
const allTimes = () => hourTexts().flatMap((h) => Array.from({ length: 60 }, (_, m) => `${h}:${String(m).padStart(2, '0')}`))

test('no digit image is cut off at its edges', () => {
  for (const dir of Object.keys(DIGITS)) {
    for (const file of fs.readdirSync(new URL(`${dir}/`, DIGIT_DIR))) {
      assert.equal(readInk(dir, file.replace('.png', '')).edge, false, `digits/${dir}/${file} has ink on its edge (cut off)`)
    }
  }
})

test('the glyph width table matches the digit images', () => {
  for (const [dir, table] of Object.entries(GLYPH_WIDTHS)) {
    for (const [ch, w] of Object.entries(table)) {
      const ink = readInkCached(dir, glyphName(ch))
      assert.equal(ink.width, w, `digits/${dir}/${glyphName(ch)}.png is ${ink.width}px wide, the table says ${w}`)
      assert.equal(ink.height, DIGITS[dir].h)
    }
  }
  for (const dir of ['steps', 'battery']) {
    for (const n of NAMES) assert.equal(readInkCached(dir, n).width, DIGITS[dir].w)
  }
})

// shared/image-text.js と同じ並べ方で、各文字の見える範囲（画面の x）を出す
function inkRow(dir, text, rect, align) {
  const spec = DIGITS[dir]
  const chars = text.split('')
  const total = textWidth(spec, text)
  let x = rect.x
  if (align === 'center') x = rect.x + Math.round((rect.w - total) / 2)
  return chars.map((ch) => {
    const ink = readInkCached(dir, glyphName(ch))
    const item = { ch, left: x + ink.x0, right: x + ink.x1 + 1 }
    x += charWidth(spec, ch) + spec.gap
    return item
  })
}

test('neighbouring characters of the time never touch, at every minute', () => {
  for (const [dir, rect] of [['time', LAYOUT.time], ['aod', LAYOUT.aod.time]]) {
    for (const t of allTimes()) {
      const items = inkRow(dir, t, rect, 'center')
      for (let i = 1; i < items.length; i += 1) {
        const gap = items[i].left - items[i - 1].right
        assert.ok(gap >= 2, `${dir} ${t} "${items[i - 1].ch}${items[i].ch}" gap ${gap}px`)
      }
    }
  }
})

test('the time is centered left to right, at every minute', () => {
  for (const [dir, rect] of [['time', LAYOUT.time], ['aod', LAYOUT.aod.time]]) {
    for (const t of allTimes()) {
      const items = inkRow(dir, t, rect, 'center')
      const off = (items[0].left + items.at(-1).right) / 2 - SCREEN.width / 2
      assert.ok(Math.abs(off) <= 0.5, `${dir} ${t} is ${off.toFixed(2)}px off the center`)
    }
  }
})

test('the bottom numbers never reach the next divider', () => {
  // 日付：すべての月日。歩数：6桁。電池：100
  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= 31; day += 1) {
      const right = inkRow('date', `${month}/${day}`, LAYOUT.date, 'left').at(-1).right
      assert.ok(right + 3 <= LAYOUT.divider1.x, `${month}/${day} reaches the divider`)
    }
  }
  assert.ok(inkRow('steps', '999999', LAYOUT.steps, 'left').at(-1).right + 3 <= LAYOUT.divider2.x)
  assert.ok(inkRow('battery', '100', LAYOUT.battery, 'left').at(-1).right <= LAYOUT.battery.x + LAYOUT.battery.w)
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
    for (const a of chars) {
      for (const b of chars) {
        if (!NAMES.includes(a) && !NAMES.includes(b)) continue // 「//」は出ない
        const left = readInkCached(dir, glyphName(a))
        const right = readInkCached(dir, glyphName(b))
        const gap = charWidth(spec, a) + spec.gap + right.x0 - left.x1 - 1
        assert.ok(gap >= 1, `${dir} "${a}${b}" gap ${gap}px`)
      }
    }
  }
})
