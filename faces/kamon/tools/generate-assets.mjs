// KAMONT の文字盤の絵（PNG）をすべて作る。
//   npm run assets -- kamon
//
// 元のデザイン（ユーザーのドラマ風の時計）の配置・色・大きさをそのまま使い、問題のあった所だけを置き換えている：
// - 題字「VIVANT」→ 紋ごとの英単語（同じ字間・同じ位置。images/titles/）
// - ドラマのマーク（輪の中の六角形）→ 家紋（同じ太い輪・同じ墨色。9種類。images/crests/）
// - 出どころのわからない数字の字形 → Liberation Sans Bold（SIL Open Font License 1.1。source/fonts/）
// - いつも「晴れ」の太陽のアイコン → 温度計
// - いつも3本の電池の目盛り → 残りに合わせて時計が塗る（背景には枠だけ）
// 生成AIの画像・写真は使わない。紋は昔からある形（丸・七宝・菱）を組み合わせたこの文字盤のためのもの
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { CREST, DIGITS, LAYOUT, NOTIFICATION, SCREEN, TITLE, CORNER_INSET } from '../watchface/layout.js'
import { CRESTS } from '../watchface/crests.js'
import { CREST_SHAPES } from './crest-shapes.mjs'
import { COLORS } from '../watchface/theme.js'
import { dateText } from '../watchface/format.js'

const ROOT = process.cwd()
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')
const FONTS = path.join(ROOT, 'source', 'fonts')
const FONT = 'Liberation Sans'
// Liberation Sans の数字・大文字の高さ（フォントの大きさに対する割合）
const CAP = 0.716

const hex = (n) => `#${n.toString(16).padStart(6, '0').toUpperCase()}`
const C = Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, hex(v)]))

// ---------- 書き出し ----------

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const resvg = new Resvg(source, {
    font: {
      fontFiles: ['LiberationSans-Bold.ttf', 'LiberationSans-Regular.ttf'].map((f) => path.join(FONTS, f)),
      loadSystemFonts: false,
      defaultFontFamily: FONT,
    },
  })
  fs.writeFileSync(file, resvg.render().asPng())
}

const dataUri = (file) => `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`

// 文字（中央ぞろえ）。top は大文字・数字の上端
function text(value, { x, top, size, color, weight = 'bold', spacing = 0, anchor = 'middle' }) {
  const baseline = top + size * CAP
  return `<text x="${x}" y="${baseline.toFixed(2)}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" fill="${color}" text-anchor="${anchor}">${value}</text>`
}

// ---------- 紋 ----------
// 太い輪は背景に。輪の中の紋は、紋ごとの透明な画像（CREST.image の大きさ）に描く

function ringBody(color = C.SUMI, { cx = CREST.cx, cy = CREST.cy, r = CREST.r, ring = CREST.ring } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r - ring / 2}" fill="none" stroke="${color}" stroke-width="${ring}"/>`
}

const crestColor = (crest) => (crest.rare ? C.GOLD_DIM : C.SUMI)

function crestImageSvg(crest) {
  const { w, h } = CREST.image
  return svg(w, h, CREST_SHAPES[crest.id](w / 2, h / 2, CREST.motif, crestColor(crest)))
}

// ---------- 題字・アイコン ----------

function rulesBody() {
  return TITLE.rules.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${C.RULE}"/>`).join('')
}

// タイトル：1文字ずつ同じ間隔で、画像の中央に（元のデザインの題字と同じ字間）
function titleImageSvg(crest) {
  const { w, h } = TITLE.image
  const chars = crest.title.split('')
  const start = w / 2 - ((chars.length - 1) * TITLE.pitch) / 2
  const top = TITLE.y - TITLE.image.y
  const body = chars
    .map((ch, i) => text(ch, { x: start + i * TITLE.pitch, top, size: TITLE.h / CAP, color: crest.rare ? C.GOLD : C.CREAM, weight: 'normal' }))
    .join('')
  return svg(w, h, body)
}

function iconsBody() {
  const L = LAYOUT
  let body = ''
  // 温度計（元のデザインの太陽の代わり。天気で絵が変わらないので、気温だとわかる形にした）
  {
    const { x, y, w, h } = L.tempIcon
    const cx = x + w / 2
    body += `<rect x="${cx - 3}" y="${y + 1}" width="6" height="${h - 8}" rx="3" fill="none" stroke="${C.CREAM}" stroke-width="2"/>`
    body += `<circle cx="${cx}" cy="${y + h - 5}" r="5" fill="${C.CREAM}"/>`
    body += `<rect x="${cx - 1}" y="${y + 7}" width="2" height="${h - 12}" fill="${C.CREAM}"/>`
  }
  // 足あと
  {
    const { x, y } = L.stepsIcon
    const foot = (fx, fy) =>
      `<ellipse cx="${fx}" cy="${fy}" rx="3.5" ry="5.5" fill="${C.CREAM}"/><rect x="${fx - 3}" y="${fy + 6}" width="6" height="4" rx="2" fill="${C.CREAM}"/>`
    body += foot(x + 5, y + 6) + foot(x + 14, y + 10)
  }
  // ハート（赤）
  {
    const { x, y, w, h } = L.heartIcon
    const s = (px, py) => `${(x + px * w).toFixed(1)} ${(y + py * h).toFixed(1)}`
    body += `<path d="M${s(0.5, 1)} C${s(0.1, 0.72)} ${s(0, 0.5)} ${s(0, 0.3)} C${s(0, 0.08)} ${s(0.2, 0)} ${s(0.3, 0)} C${s(0.42, 0)} ${s(0.5, 0.1)} ${s(0.5, 0.2)} C${s(0.5, 0.1)} ${s(0.58, 0)} ${s(0.7, 0)} C${s(0.8, 0)} ${s(1, 0.08)} ${s(1, 0.3)} C${s(1, 0.5)} ${s(0.9, 0.72)} ${s(0.5, 1)} Z" fill="${C.RED}"/>`
  }
  // 電池の枠（中の塗りは時計が残りに合わせて描く）
  {
    const { x, y, w, h } = L.batteryIcon
    body += `<rect x="${x + 1}" y="${y + 1}" width="${w - 5}" height="${h - 2}" rx="2" fill="none" stroke="${C.CREAM}" stroke-width="2"/>`
    body += `<rect x="${x + w - 3}" y="${y + h / 2 - 3}" width="3" height="6" fill="${C.CREAM}"/>`
  }
  for (const d of L.dividers) body += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="${C.RULE}"/>`
  return body
}

function backgroundSvg() {
  return svg(SCREEN.width, SCREEN.height, `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="${C.BLACK}"/>` + ringBody() + rulesBody() + iconsBody())
}

// ---------- 数字の画像 ----------

function digitSvg(ch, spec, color) {
  return svg(spec.w, spec.h, text(ch, { x: spec.w / 2, top: (spec.h - spec.size * CAP) / 2, size: spec.size, color }))
}

function colonSvg(spec, color) {
  const b = spec.colonBar
  const x = (spec.colonW - b.w) / 2
  return svg(spec.colonW, spec.h, [b.top, b.bottom].map((y) => `<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" fill="${color}"/>`).join(''))
}

function writeDigits(name, spec, color, { units = false } = {}) {
  const dir = path.join(IMAGES, 'digits', name)
  for (let d = 0; d <= 9; d += 1) write(path.join(dir, `${d}.png`), digitSvg(String(d), spec, color))
  if (spec.colonBar) write(path.join(dir, 'colon.png'), colonSvg(spec, color))
  if (!units) return
  const u = spec.unitW
  const bar = Math.max(2, Math.round(spec.size * 0.12))
  // 「-」：気温がマイナスの時
  write(path.join(dir, 'negative.png'), svg(u, spec.h, `<rect x="1" y="${(spec.h - bar) / 2}" width="${u - 2}" height="${bar}" fill="${color}"/>`))
  // 「°」：摂氏・華氏どちらでも同じ（単位は時計の設定に従う）
  const top = (spec.h - spec.size * CAP) / 2
  write(path.join(dir, 'degree.png'), svg(u, spec.h, `<circle cx="${u / 2}" cy="${top + 2.5}" r="2.2" fill="none" stroke="${color}" stroke-width="1.6"/>`))
  // 「--」：心拍・天気のデータがまだ無い時
  const iw = 2 * spec.w + spec.gap
  const dash = (x) => `<rect x="${x + 2}" y="${(spec.h - bar) / 2}" width="${spec.w - 4}" height="${bar}" fill="${color}"/>`
  write(path.join(dir, 'invalid.png'), svg(iw, spec.h, dash(0) + dash(spec.w + spec.gap)))
}

// ---------- プレビュー（文字盤全体をまとめて描く） ----------

function spriteRow(value, dir, rect, spec, align = 'left') {
  const width = (ch) => (ch === ':' ? spec.colonW : ch === '-' || ch === '°' ? spec.unitW : spec.w)
  const file = (ch) => ({ ':': 'colon', '-': 'negative', '°': 'degree' })[ch] || ch
  const chars = value.split('')
  const total = chars.reduce((s, ch) => s + width(ch), 0) + spec.gap * (chars.length - 1)
  let x = align === 'center' ? rect.x + Math.round((rect.w - total) / 2) : rect.x
  let out = ''
  for (const ch of chars) {
    out += `<image href="${dataUri(path.join(IMAGES, 'digits', dir, `${file(ch)}.png`))}" x="${x}" y="${rect.y}" width="${width(ch)}" height="${spec.h}"/>`
    x += width(ch) + spec.gap
  }
  return out
}

// 画面の形（CORNER_INSET）の外を黒で隠す
function screenMask() {
  const { width: W, height: H } = SCREEN
  const n = CORNER_INSET.length
  const left = CORNER_INSET.map((inset, y) => `${inset} ${y}`)
  const top = `M0 0 H${W} V${H} H0 Z M${CORNER_INSET[0]} 0 H${W - CORNER_INSET[0]} ` +
    CORNER_INSET.map((inset, y) => `L${W - inset} ${y}`).join(' ') + ` L${W} ${n} V${H - n} ` +
    CORNER_INSET.map((_, i) => `L${W - CORNER_INSET[n - 1 - i]} ${H - n + i}`).join(' ') + ` L${W - CORNER_INSET[0]} ${H} H${CORNER_INSET[0]} ` +
    CORNER_INSET.map((_, i) => `L${CORNER_INSET[i]} ${H - i}`).join(' ') + ` L0 ${H - n} V${n} ` +
    left.reverse().map((p) => `L${p}`).join(' ') + ' Z'
  return `<path d="${top}" fill="#000" fill-rule="evenodd"/>`
}

function notificationLayer() {
  const n = NOTIFICATION
  return (
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="none" stroke="${C.NOTIFICATION_CHECK}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<circle cx="195" cy="27" r="17" fill="#EEF2F4" stroke="${C.NOTIFICATION_CHECK}" stroke-width="4"/>`
  )
}

const img = (file, rect) => `<image href="${dataUri(path.join(IMAGES, file))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}"/>`

// 日付は時計のシステムの文字で出す。プレビューでは Liberation Sans で近い見た目にする
function dateLine(value, rect, color) {
  return text(value, { x: rect.x + rect.w / 2, top: rect.y + (rect.h - rect.size * CAP) / 2, size: rect.size, color, weight: 'normal' })
}

function previewSvg({ time, weekday, day, month, temp, battery, steps, heart, crest = 0 }, { notification = false } = {}) {
  const L = LAYOUT
  const small = DIGITS.small
  let body = img('background.png', { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height })
  body += img(`crests/${crest}.png`, CREST.image) + img(`titles/${crest}.png`, TITLE.image)
  const f = L.batteryFill
  const fw = Math.round((f.w * battery) / 100)
  if (fw > 0) body += `<rect x="${f.x}" y="${f.y}" width="${fw}" height="${f.h}" fill="${C.RED}"/>`
  body += spriteRow(time, 'time', { x: 0, y: L.timeY, w: SCREEN.width }, DIGITS.time, 'center')
  body += dateLine(dateText(weekday, day, month), L.date, C.CREAM)
  const invalid = (rect) => img('digits/small/invalid.png', { ...rect, w: 2 * small.w + small.gap })
  body += temp === null ? invalid(L.temp) : spriteRow(`${temp}°`, 'small', L.temp, small)
  body += spriteRow(String(steps), 'small', L.steps, small)
  body += heart === null ? invalid(L.heart) : spriteRow(String(heart), 'small', L.heart, small)
  body += spriteRow(String(battery), 'small', L.battery, small)
  if (notification) body += notificationLayer()
  return svg(SCREEN.width, SCREEN.height, body + screenMask())
}

function aodPreviewSvg({ time, weekday, day, month }) {
  const L = LAYOUT.aod
  let body = `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="#000"/>`
  body += spriteRow(time, 'aod', { x: 0, y: L.timeY, w: SCREEN.width }, DIGITS.aod, 'center')
  body += dateLine(dateText(weekday, day, month), L.date, C.AOD_TEXT)
  return svg(SCREEN.width, SCREEN.height, body + screenMask())
}

// ---------- 実行 ----------

fs.rmSync(IMAGES, { recursive: true, force: true })

write(path.join(IMAGES, 'background.png'), backgroundSvg())
CRESTS.forEach((crest, i) => {
  write(path.join(IMAGES, 'crests', `${i}.png`), crestImageSvg(crest))
  write(path.join(IMAGES, 'titles', `${i}.png`), titleImageSvg(crest))
})
writeDigits('time', DIGITS.time, C.RED)
writeDigits('aod', DIGITS.aod, C.AOD_TIME)
writeDigits('small', DIGITS.small, C.RED, { units: true })

// weekday は 0＝日〜6＝土。ストアの見本は 10:09（時計の広告の決まりごと）
const SAMPLE = { time: '10:09', weekday: 3, day: 30, month: 9, temp: 21, battery: 76, steps: 5478, heart: 85 }
write(path.join(DOCS, 'preview-390x450.png'), previewSvg(SAMPLE))
write(path.join(DOCS, 'preview-worst-390x450.png'), previewSvg({ time: '23:58', weekday: 4, day: 31, month: 12, temp: -12, battery: 100, steps: 99999, heart: 199, crest: 5 }))
write(path.join(DOCS, 'preview-low-390x450.png'), previewSvg({ time: '7:41', weekday: 6, day: 5, month: 5, temp: null, battery: 9, steps: 0, heart: null, crest: 3 }))
write(path.join(DOCS, 'preview-rare-390x450.png'), previewSvg({ ...SAMPLE, crest: CRESTS.findIndex((c) => c.rare) }))
// 紋の一覧（README・ストアの説明用）：3×3 に、紋とタイトル
{
  const cell = 200
  let sheet = `<rect width="${cell * 3}" height="${cell * 3}" fill="#000"/>`
  CRESTS.forEach((crest, i) => {
    const x = (i % 3) * cell
    const y = Math.floor(i / 3) * cell
    const color = crest.rare ? C.GOLD : '#8A7A6A'
    sheet += ringBody(color, { cx: x + cell / 2, cy: y + 88, r: 80, ring: 14 })
    sheet += CREST_SHAPES[crest.id](x + cell / 2, y + 88, 58, color).replace(/id="([a-z]+)/g, `id="$1${i}`).replace(/url\(#([a-z]+)/g, `url(#$1${i}`)
    sheet += text(crest.title, { x: x + cell / 2, top: y + 178, size: 14, color: crest.rare ? C.GOLD : C.CREAM, weight: 'normal', spacing: 3 })
  })
  write(path.join(DOCS, 'crests.png'), svg(cell * 3, cell * 3, sheet))
}
write(path.join(DOCS, 'preview-aod-390x450.png'), aodPreviewSvg(SAMPLE))
write(path.join(DOCS, 'check-notification.png'), previewSvg(SAMPLE, { notification: true }))
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(SAMPLE))

console.log(`Generated KAMONT assets in assets/bip-6/images and docs/（紋 ${CRESTS.length} 種類）`)
