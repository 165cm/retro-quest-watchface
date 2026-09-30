// SUPER ARBEITER の文字盤の絵（PNG）をすべて作る。
//   npm run assets -- super-arbeiter
//
// - 暖簾・提灯・丼・FINAL・ラベル・アイコン・カウンターの飾りは source/ の素材を使う
//   （素材の由来は README の「素材と権利」。source/ は tools/prepare-source.mjs で作る）
// - 地の黄色・区切りの線・赤い勢い線・BREAK の赤い箱・数字・曜日の文字は、ここでコードから描く
// - キャラクター・公式ロゴ・公式フォントは使わない
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { DIGITS, LAYOUT, SCREEN, WEEKDAY } from '../watchface/layout.js'
import { STATUS_PRESETS } from '../watchface/status.js'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'source')
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')

const C = {
  yellow: '#FFE033',
  red: '#E10606',
  black: '#000000',
  cream: '#FFF5D6',
  aod: '#8C8676',
  divider: '#6B4A1E',
}

// ---------- 書き出し ----------

function svg(width, height, body, viewBox = `0 0 ${width} ${height}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="none">${body}</svg>`
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, new Resvg(source).render().asPng())
}

function dataUri(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`
}

function sourceImage(name, rect) {
  return `<image href="${dataUri(path.join(SOURCE, `${name}.png`))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" preserveAspectRatio="xMidYMid meet"/>`
}

// ---------- 数字と文字（太い筆のような丸い線） ----------
// 40×64 の枠に、線（stroke）で描く。はしを丸くして、太めにする。

const GLYPHS = {
  0: '<ellipse cx="20" cy="32" rx="13" ry="23"/>',
  1: '<path d="M11 17 L22 8 V56"/>',
  2: '<path d="M8 19 C8 5 33 4 33 19 C33 31 14 41 7 56 H34"/>',
  3: '<path d="M8 13 C13 4 33 4 32 18 C31 27 23 30 18 30 C27 30 34 35 33 45 C32 60 12 60 7 51"/>',
  4: '<path d="M27 56 V8 L6 42 H35"/>',
  5: '<path d="M32 8 H12 L9 29 C15 24 33 24 33 41 C33 58 12 60 7 51"/>',
  6: '<path d="M30 10 C18 5 7 19 7 38 C7 52 13 58 21 58 C29 58 33 51 33 43 C33 35 28 29 20 29 C13 29 8 34 7 40"/>',
  7: '<path d="M7 8 H33 C24 22 18 38 16 56"/>',
  8: '<ellipse cx="20" cy="19" rx="11" ry="11"/><ellipse cx="20" cy="43" rx="13" ry="14"/>',
  9: '<path transform="rotate(180 20 32)" d="M30 10 C18 5 7 19 7 38 C7 52 13 58 21 58 C29 58 33 51 33 43 C33 35 28 29 20 29 C13 29 8 34 7 40"/>',
  negative: '<path d="M8 32 H32"/>',
  slash: '<path d="M30 6 L10 58"/>',
  // 曜日の英字
  S: '<path d="M32 14 C27 5 8 5 8 18 C8 30 32 30 32 44 C32 59 10 60 6 50"/>',
  U: '<path d="M8 8 V42 C8 60 32 60 32 42 V8"/>',
  N: '<path d="M8 56 V8 L32 56 V8"/>',
  M: '<path d="M5 56 V8 L20 38 L35 8 V56"/>',
  O: '<ellipse cx="20" cy="32" rx="14" ry="24"/>',
  T: '<path d="M5 8 H35 M20 8 V56"/>',
  E: '<path d="M32 8 H9 V56 H32 M9 32 H28"/>',
  W: '<path d="M3 8 L11 56 L20 24 L29 56 L37 8"/>',
  D: '<path d="M9 8 V56 H17 C38 56 38 8 17 8 Z"/>',
  H: '<path d="M8 8 V56 M32 8 V56 M8 32 H32"/>',
  F: '<path d="M32 8 H9 V56 M9 32 H28"/>',
  R: '<path d="M9 56 V8 H21 C36 8 36 32 21 32 H9 M20 32 L33 56"/>',
  I: '<path d="M12 8 H28 M20 8 V56 M12 56 H28"/>',
  A: '<path d="M5 56 L20 8 L35 56 M11 39 H29"/>',
}

const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function strokes(shape, color, width) {
  return `<g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`
}

function glyphSvg(shape, w, h, { color, width }) {
  return svg(w, h, strokes(shape, color, width), '-6 -6 52 76')
}

function colonSvg(w, h, color) {
  const r = Math.max(2, w * 0.24)
  return svg(w, h, `<circle cx="${w / 2}" cy="${h * 0.34}" r="${r}" fill="${color}"/><circle cx="${w / 2}" cy="${h * 0.7}" r="${r}" fill="${color}"/>`)
}

function writeDigits(name, spec, style) {
  const dir = path.join(IMAGES, 'digits', name)
  for (let digit = 0; digit <= 9; digit += 1) {
    write(path.join(dir, `${digit}.png`), glyphSvg(GLYPHS[digit], spec.w, spec.h, style))
  }
  write(path.join(dir, 'negative.png'), glyphSvg(GLYPHS.negative, Math.round(spec.w * 0.7), spec.h, style))
  if (spec.colonW) write(path.join(dir, 'colon.png'), colonSvg(spec.colonW, spec.h, style.color))
  if (spec.slashW) write(path.join(dir, 'slash.png'), glyphSvg(GLYPHS.slash, spec.slashW, spec.h, style))
}

function weekdaySvg(name, { color, width }) {
  const letterW = Math.floor(WEEKDAY.w / 3)
  const body = name
    .split('')
    .map((ch, i) => `<svg x="${i * letterW}" y="0" width="${letterW}" height="${WEEKDAY.h}" viewBox="-6 -6 52 76" preserveAspectRatio="none">${strokes(GLYPHS[ch], color, width)}</svg>`)
    .join('')
  return svg(WEEKDAY.w, WEEKDAY.h, body)
}

// ---------- 背景（390×450、動かない物をすべて1枚に） ----------

// 赤い勢い線（時刻の左右）
function bursts() {
  const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`
  return (
    line(20, 150, 36, 158) + line(18, 170, 38, 170) + line(20, 190, 36, 182) +
    line(370, 150, 354, 158) + line(372, 170, 352, 170) + line(370, 190, 354, 182)
  )
}

function backgroundSvg() {
  const { width: W, height: H } = SCREEN
  const L = LAYOUT
  let body = `<rect width="${W}" height="${H}" fill="${C.yellow}"/>`
  // 暖簾の奥の木の梁
  body += `<rect x="0" y="4" width="${W}" height="9" fill="#7A4E1E"/>`
  body += sourceImage('noren', L.noren)
  body += sourceImage('lantern-open', L.lanternLeft)
  body += sourceImage('lantern-yoshi', L.lanternRight)
  body += bursts()
  body += sourceImage('underline-time', L.underline)
  // 左下
  body += sourceImage('battery', L.batteryIcon)
  body += sourceImage('label-hp', L.hpLabel)
  body += sourceImage('shoe', L.shoeIcon)
  body += sourceImage('label-steps', L.stepsLabel)
  // 中央下
  const divider = (d) => `<path d="M${d.x} ${d.y} V${d.y + d.h}" stroke="${C.divider}" stroke-width="2" stroke-linecap="round"/>`
  body += divider(L.dividerLeft) + divider(L.dividerRight)
  body += sourceImage('ramen-bowl', L.bowl)
  // 右下
  body += sourceImage('calendar', L.calendarIcon)
  body += sourceImage('clock', L.clockIcon)
  body += sourceImage('label-break', L.breakLabel)
  const box = L.breakBox
  body += `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="5" fill="${C.red}"/>`
  // 下
  body += sourceImage('counter', L.counter)
  body += sourceImage('footer-final', L.footer)
  return svg(W, H, body)
}

// ---------- プレビュー（文字盤全体をまとめて描く） ----------

function spriteRow(text, dir, rect, spec, align = 'left') {
  const width = (ch) => (ch === ':' ? spec.colonW : ch === '/' ? spec.slashW : spec.w)
  const chars = text.split('')
  const total = chars.reduce((s, ch) => s + width(ch), 0) + (spec.gap || 0) * (chars.length - 1)
  let x = align === 'center' ? rect.x + Math.round((rect.w - total) / 2) : align === 'right' ? rect.x + rect.w - total : rect.x
  let out = ''
  for (const ch of chars) {
    const name = ch === ':' ? 'colon' : ch === '/' ? 'slash' : ch
    out += `<image href="${dataUri(path.join(IMAGES, 'digits', dir, `${name}.png`))}" x="${x}" y="${rect.y}" width="${width(ch)}" height="${rect.h}"/>`
    x += width(ch) + (spec.gap || 0)
  }
  return out
}

function roundedMask() {
  const r = SCREEN.cornerRadius
  const { width: W, height: H } = SCREEN
  return `<path d="M0 0 H${W} V${H} H0 Z M${r} 0 H${W - r} A${r} ${r} 0 0 1 ${W} ${r} V${H - r} A${r} ${r} 0 0 1 ${W - r} ${H} H${r} A${r} ${r} 0 0 1 0 ${H - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z" fill="#000" fill-rule="evenodd"/>`
}

function previewSvg({ time, hp, steps, date, weekday, breakTime }) {
  const L = LAYOUT
  const img = (file, rect) => `<image href="${dataUri(path.join(IMAGES, file))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}"/>`
  let body = img('background.png', { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height })
  body += img('status/0.png', L.status)
  body += spriteRow(time, 'time', { x: 0, y: L.time.y, w: SCREEN.width, h: DIGITS.time.h }, DIGITS.time, 'center')
  body += spriteRow(String(hp), 'hp', L.hp, DIGITS.hp)
  body += spriteRow(String(steps), 'steps', L.steps, DIGITS.steps)
  body += spriteRow(date, 'date', L.date, DIGITS.date)
  body += img(`weekday/${WEEKDAY_NAMES.indexOf(weekday)}.png`, L.weekday)
  body += spriteRow(breakTime, 'break', L.breakTime, DIGITS.break, 'center')
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

function aodPreviewSvg({ time, date, weekday, hp }) {
  const L = LAYOUT.aod
  const text = (value, rect) =>
    `<text x="${rect.x + rect.w / 2}" y="${rect.y + rect.h / 2 + 9}" font-size="26" fill="${C.aod}" text-anchor="middle" font-family="sans-serif">${value}</text>`
  let body = `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="#000"/>`
  body += spriteRow(time, 'aod', { x: 0, y: L.timeY, w: SCREEN.width, h: DIGITS.aod.h }, DIGITS.aod, 'center')
  body += text(`${date} ${weekday}`, L.date) + text(`HP ${hp}`, L.hp)
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

// ---------- 実行 ----------

if (!fs.existsSync(path.join(SOURCE, 'noren.png'))) {
  console.error('source/ がありません。先に tools/prepare-source.mjs を実行してください（README の「素材と権利」）')
  process.exit(1)
}
fs.rmSync(IMAGES, { recursive: true, force: true })

writeDigits('time', DIGITS.time, { color: C.black, width: 15 })
writeDigits('hp', DIGITS.hp, { color: C.red, width: 12 })
writeDigits('steps', DIGITS.steps, { color: C.black, width: 11 })
writeDigits('date', DIGITS.date, { color: C.black, width: 11 })
writeDigits('break', DIGITS.break, { color: C.cream, width: 11 })
writeDigits('aod', DIGITS.aod, { color: C.aod, width: 6 })
WEEKDAY_NAMES.forEach((name, index) => {
  write(path.join(IMAGES, 'weekday', `${index}.png`), weekdaySvg(name, { color: C.black, width: 11 }))
})

// STATUS（プリセットごとに1枚。いまは source/status.png の「STATUS : まだいける」だけ）
STATUS_PRESETS.forEach((preset, index) => {
  const r = LAYOUT.status
  write(path.join(IMAGES, 'status', `${index}.png`), svg(r.w, r.h, sourceImage('status', { x: 0, y: 0, w: r.w, h: r.h })))
})

write(path.join(IMAGES, 'background.png'), backgroundSvg())

const SAMPLE = { time: '18:42', hp: 73, steps: 9150, date: '9/30', weekday: 'TUE', breakTime: '14:58' }
write(path.join(DOCS, 'preview-390x450.png'), previewSvg(SAMPLE))
write(path.join(DOCS, 'preview-low-390x450.png'), previewSvg({ time: '21:07', hp: 12, steps: 21408, date: '12/31', weekday: 'SUN', breakTime: '15:00' }))
write(path.join(DOCS, 'preview-aod-390x450.png'), aodPreviewSvg(SAMPLE))
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(SAMPLE))

console.log('Generated super-arbeiter assets in assets/bip-6/images and docs/')
