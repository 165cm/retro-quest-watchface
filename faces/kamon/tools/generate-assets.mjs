// KAMON の文字盤の絵（PNG）をすべて作る。
//   npm run assets -- kamon
//
// - 絵・数字・文字はすべてこのファイルと tools/strokes.mjs の図形から作る（フォント・写真・生成AIの画像は使わない）
// - 紋は、よくある形（丸・菱・七宝・花菱）を組み合わせたこの文字盤のためのもの。実在の家の紋は写さない
// - 固定背景（紋・アイコン・区切り）は1枚の絵にまとめる。数字と曜日だけを時計で重ねる
// - 通知のマークは背景に描かない
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { CREST, DIGITS, LAYOUT, NOTIFICATION, SCREEN, WEEKDAY_W, timeWidth } from '../watchface/layout.js'
import { COLORS, LOW_BATTERY } from '../watchface/theme.js'
import { DIGIT_STROKES, LETTER_STROKES, WEEKDAYS, strokePaths } from './strokes.mjs'

const ROOT = process.cwd()
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')

const hex = (n) => `#${n.toString(16).padStart(6, '0').toUpperCase()}`
const C = Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, hex(v)]))

// ---------- 書き出し ----------

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, new Resvg(source).render().asPng())
}

const dataUri = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`

// ---------- 紋（丸に十二菱、中に七宝と花菱） ----------

// 菱（ひし形）。中心 (x, y)、たて横の半分の長さ、向き（度）
function diamond(x, y, rx, ry, angle, color) {
  return `<path d="M0 ${-ry} L${rx} 0 L0 ${ry} L${-rx} 0 Z" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle})" fill="${color}"/>`
}

export function crestBody(color = C.SUMI, { cx = CREST.cx, cy = CREST.cy, r = CREST.r } = {}) {
  const ring = 12
  let body = `<circle cx="${cx}" cy="${cy}" r="${r - ring / 2}" fill="none" stroke="${color}" stroke-width="${ring}"/>`
  // 十二菱：時計の文字盤の12の目盛りを、小さな菱で表す
  const rr = r - 26
  for (let i = 0; i < 12; i += 1) {
    const a = (i * 30 * Math.PI) / 180
    body += diamond(cx + rr * Math.sin(a), cy - rr * Math.cos(a), i % 3 === 0 ? 8 : 6, i % 3 === 0 ? 13 : 10, i * 30, color)
  }
  // 七宝：円の中に、4つの円の弧でできる四つ星
  const r0 = Math.round(r * 0.5)
  const sw = 9
  body += `<clipPath id="shippo"><circle cx="${cx}" cy="${cy}" r="${r0 + sw / 2}"/></clipPath>`
  body += `<circle cx="${cx}" cy="${cy}" r="${r0}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
  body += `<g clip-path="url(#shippo)">`
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    body += `<circle cx="${cx + dx * r0}" cy="${cy + dy * r0}" r="${r0}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
  }
  body += `</g>`
  // 花菱：まん中に4枚の菱の花びら
  for (let i = 0; i < 4; i += 1) {
    const a = (i * 90 * Math.PI) / 180
    body += diamond(cx + 11 * Math.sin(a), cy - 11 * Math.cos(a), 6, 9, i * 90, color)
  }
  return body
}

// ---------- アイコン（金） ----------

function icons(color = C.GOLD) {
  const L = LAYOUT
  let body = ''
  // 温度計
  {
    const { x, y, w, h } = L.tempIcon
    const cx = x + w / 2
    body += `<rect x="${cx - 3}" y="${y + 1}" width="6" height="${h - 9}" rx="3" fill="none" stroke="${color}" stroke-width="2"/>`
    body += `<circle cx="${cx}" cy="${y + h - 6}" r="5" fill="${color}"/>`
    body += `<rect x="${cx - 1}" y="${y + 8}" width="2" height="${h - 14}" fill="${color}"/>`
  }
  // 電池の枠（中の塗りは時計が残りに合わせて描く）
  {
    const { x, y, w, h } = L.batteryIcon
    body += `<rect x="${x + 1}" y="${y + 1}" width="${w - 5}" height="${h - 2}" fill="none" stroke="${color}" stroke-width="2"/>`
    body += `<rect x="${x + w - 3}" y="${y + h / 2 - 3}" width="3" height="6" fill="${color}"/>`
  }
  // 足あと（2つ）
  {
    const { x, y } = L.stepsIcon
    const foot = (fx, fy) =>
      `<ellipse cx="${fx}" cy="${fy}" rx="4" ry="6" fill="${color}"/><rect x="${fx - 3}" y="${fy + 7}" width="6" height="4" rx="2" fill="${color}"/>`
    body += foot(x + 5, y + 7) + foot(x + 15, y + 12)
  }
  // ハート
  {
    const { x, y, w, h } = L.heartIcon
    const s = (px, py) => `${(x + px * w).toFixed(1)} ${(y + py * h).toFixed(1)}`
    body += `<path d="M${s(0.5, 1)} C${s(0.1, 0.72)} ${s(0, 0.5)} ${s(0, 0.3)} C${s(0, 0.08)} ${s(0.2, 0)} ${s(0.3, 0)} C${s(0.42, 0)} ${s(0.5, 0.1)} ${s(0.5, 0.2)} C${s(0.5, 0.1)} ${s(0.58, 0)} ${s(0.7, 0)} C${s(0.8, 0)} ${s(1, 0.08)} ${s(1, 0.3)} C${s(1, 0.5)} ${s(0.9, 0.72)} ${s(0.5, 1)} Z" fill="${color}"/>`
  }
  const d = L.divider
  body += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="${color}"/>`
  return body
}

function backgroundSvg() {
  return svg(SCREEN.width, SCREEN.height, `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="${C.BLACK}"/>` + crestBody() + icons())
}

// ---------- 数字・文字の画像 ----------

function glyphSvg(strokes, spec, color, w = spec.w) {
  return svg(w, spec.h, strokePaths(strokes, { w, h: spec.h, stroke: spec.stroke, chamfer: spec.chamfer, color }))
}

// 「:」は線の太さの四角を2つ
function colonSvg(spec, color) {
  const s = spec.stroke
  const x = (spec.colonW - s) / 2
  return svg(spec.colonW, spec.h, [0.3, 0.7].map((v) => `<rect x="${x}" y="${(spec.h * v - s / 2).toFixed(2)}" width="${s}" height="${s}" fill="${color}"/>`).join(''))
}

function writeDigits(name, spec, color, { units = false } = {}) {
  const dir = path.join(IMAGES, 'digits', name)
  for (let d = 0; d <= 9; d += 1) write(path.join(dir, `${d}.png`), glyphSvg(DIGIT_STROKES[d], spec, color))
  if (spec.colonW) write(path.join(dir, 'colon.png'), colonSvg(spec, color))
  if (!units) return
  const s = spec.stroke
  const u = spec.unitW
  // 「-」：気温がマイナスの時
  write(path.join(dir, 'negative.png'), svg(u, spec.h, `<rect x="1" y="${spec.h / 2 - s / 2}" width="${u - 2}" height="${s}" fill="${color}"/>`))
  // 「°」：摂氏・華氏どちらでも同じ（単位は時計の設定に従う）。上に小さな四角の輪
  const d = u - 3
  write(path.join(dir, 'degree.png'), svg(u, spec.h, `<rect x="2" y="1" width="${d - 1}" height="${d - 1}" fill="none" stroke="${color}" stroke-width="2"/>`))
  // 「--」：心拍・天気のデータがまだ無い時
  const iw = 2 * spec.w + spec.gap
  const dash = (x) => `<rect x="${x + 2}" y="${spec.h / 2 - s / 2}" width="${spec.w - 4}" height="${s}" fill="${color}"/>`
  write(path.join(dir, 'invalid.png'), svg(iw, spec.h, dash(0) + dash(spec.w + spec.gap)))
}

function weekdaySvg(name, color) {
  const spec = DIGITS.letter
  const body = name
    .split('')
    .map((ch, i) => strokePaths(LETTER_STROKES[ch], { x: i * (spec.w + spec.gap), w: spec.w, h: spec.h, stroke: spec.stroke, chamfer: spec.chamfer, color }))
    .join('')
  return svg(WEEKDAY_W, spec.h, body)
}

// ---------- プレビュー（文字盤全体をまとめて描く） ----------

function spriteRow(text, dir, rect, spec, align = 'left') {
  const width = (ch) => (ch === ':' ? spec.colonW : ch === '-' || ch === '°' ? spec.unitW : spec.w)
  const file = (ch) => ({ ':': 'colon', '-': 'negative', '°': 'degree' })[ch] || ch
  const chars = text.split('')
  const total = chars.reduce((s, ch) => s + width(ch), 0) + spec.gap * (chars.length - 1)
  let x = align === 'center' ? rect.x + Math.round((rect.w - total) / 2) : rect.x
  let out = ''
  for (const ch of chars) {
    out += `<image href="${dataUri(path.join(IMAGES, 'digits', dir, `${file(ch)}.png`))}" x="${x}" y="${rect.y}" width="${width(ch)}" height="${spec.h}"/>`
    x += width(ch) + spec.gap
  }
  return out
}

function roundedMask() {
  const r = SCREEN.cornerRadius
  const { width: W, height: H } = SCREEN
  return `<path d="M0 0 H${W} V${H} H0 Z M${r} 0 H${W - r} A${r} ${r} 0 0 1 ${W} ${r} V${H - r} A${r} ${r} 0 0 1 ${W - r} ${H} H${r} A${r} ${r} 0 0 1 0 ${H - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z" fill="#000" fill-rule="evenodd"/>`
}

function notificationLayer() {
  const n = NOTIFICATION
  return (
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="none" stroke="${C.NOTIFICATION_CHECK}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<circle cx="195" cy="27" r="17" fill="#EEF2F4" stroke="${C.NOTIFICATION_CHECK}" stroke-width="4"/>`
  )
}

// 時計と同じ規則で時刻の文字をつくる（24時間は2桁、12時間は先頭の0なし）
const img = (file, rect) => `<image href="${dataUri(path.join(IMAGES, file))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}"/>`

function previewSvg({ time, weekday, day, temp, battery, steps, heart }, { notification = false } = {}) {
  const L = LAYOUT
  const small = DIGITS.small
  let body = img('background.png', { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height })
  const f = L.batteryFill
  const fw = Math.round((f.w * battery) / 100)
  if (fw > 0) body += `<rect x="${f.x}" y="${f.y}" width="${fw}" height="${f.h}" fill="${battery <= LOW_BATTERY ? C.LOW : C.GOLD}"/>`
  body += spriteRow(time, 'time', { x: 0, y: L.timeY, w: SCREEN.width }, DIGITS.time, 'center')
  body += img(`weekday/${weekday}.png`, L.weekday)
  body += spriteRow(String(day).padStart(2, '0'), 'small', L.day, small)
  body += temp === null ? img('digits/small/invalid.png', { ...L.temp, w: 2 * small.w + small.gap }) : spriteRow(`${temp}°`, 'small', L.temp, small)
  body += spriteRow(String(battery), 'small', L.battery, small)
  body += spriteRow(String(steps), 'small', L.steps, small)
  body += heart === null ? img('digits/small/invalid.png', { ...L.heart, w: 2 * small.w + small.gap }) : spriteRow(String(heart), 'small', L.heart, small)
  if (notification) body += notificationLayer()
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

function aodPreviewSvg({ time, weekday, day }) {
  const L = LAYOUT.aod
  let body = `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="#000"/>`
  body += spriteRow(time, 'aod', { x: 0, y: L.timeY, w: SCREEN.width }, DIGITS.aod, 'center')
  body += img(`weekday-aod/${weekday}.png`, L.weekday)
  body += spriteRow(String(day).padStart(2, '0'), 'aod-small', L.day, DIGITS.small)
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

// ---------- 実行 ----------

fs.rmSync(IMAGES, { recursive: true, force: true })

write(path.join(IMAGES, 'background.png'), backgroundSvg())
writeDigits('time', DIGITS.time, C.SHU)
writeDigits('aod', DIGITS.aod, C.AOD_TIME)
writeDigits('small', DIGITS.small, C.KINARI, { units: true })
writeDigits('aod-small', DIGITS.small, C.AOD_TEXT)
WEEKDAYS.forEach((name, i) => {
  write(path.join(IMAGES, 'weekday', `${i}.png`), weekdaySvg(name, C.KINARI))
  write(path.join(IMAGES, 'weekday-aod', `${i}.png`), weekdaySvg(name, C.AOD_TEXT))
})

// ストアの見本は 10:09（時計の広告の決まりごと）。weekday は 0＝日〜6＝土
const SAMPLE = { time: '10:09', weekday: 3, day: 30, temp: 23, battery: 86, steps: 6824, heart: 72 }
write(path.join(DOCS, 'preview-390x450.png'), previewSvg(SAMPLE))
write(path.join(DOCS, 'preview-worst-390x450.png'), previewSvg({ time: '23:58', weekday: 4, day: 31, temp: -12, battery: 100, steps: 99999, heart: 199 }))
write(path.join(DOCS, 'preview-low-390x450.png'), previewSvg({ time: '7:41', weekday: 6, day: 5, temp: null, battery: 9, steps: 0, heart: null }))
write(path.join(DOCS, 'preview-aod-390x450.png'), aodPreviewSvg(SAMPLE))
write(path.join(DOCS, 'check-notification.png'), previewSvg(SAMPLE, { notification: true }))
// 紋だけ（README・説明用）
write(path.join(DOCS, 'crest.png'), svg(300, 300, `<rect width="300" height="300" fill="${C.BLACK}"/>` + crestBody('#8A7A55', { cx: 150, cy: 150, r: 140 })))
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(SAMPLE))

console.log(`Generated kamon assets in assets/bip-6/images and docs/（時刻の幅 ${timeWidth()}px）`)
