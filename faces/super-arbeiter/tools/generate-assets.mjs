// SUPER ARBEITER の文字盤の絵（PNG）をすべて作る。
//   npm run assets -- super-arbeiter
//
// - 固定背景（暖簾・提灯・カレンダー・丼・吹き出し・雷紋・くつ・区切り・電池の枠）は source/background.png をそのまま使う
//   （受け取った最終採用案の素材。由来は README の「素材と権利」。source/ は tools/prepare-source.mjs で作る）
// - セリフの札（7枚、下地は透明）は source/quotes/ をそのまま使う（縦横を別の倍率で伸ばさない）
// - 時刻と AOD の数字は tools/brush-digits.mjs で1字ずつ作った筆の字形
// - 日付・歩数・電池の数字と、日本語の曜日は source/glyphs/ のフォントの字形を、色を付けて枠に置く
// - キャラクター・公式ロゴは使わない。通知のマークは背景に描かない
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { PNG } from 'pngjs'
import { DIGITS, LAYOUT, NOTIFICATION, SCREEN } from '../watchface/layout.js'
import { COLORS, DIGIT_STYLE, GLYPH_PAD, TYPE } from '../watchface/theme.js'
import { GLYPH_TEXT, WEEKDAYS_JA } from '../watchface/glyphs.js'
import { QUOTES } from '../watchface/quotes.js'
import { colonBody, digitBody, exportViews, minusBody, viewBoxText } from './brush-digits.mjs'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'source')
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')

const hex = (n) => `#${n.toString(16).padStart(6, '0').toUpperCase()}`
const C = {
  red: hex(COLORS.RED),
  black: hex(COLORS.BLACK),
  cream: hex(COLORS.CREAM),
  aod: hex(COLORS.AOD_TEXT),
  notification: hex(COLORS.NOTIFICATION_CHECK),
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

// ---------- 数字（筆の数字） ----------
// 書き出す枠は brush-digits.mjs の exportViews で、太さ・傾きを入れたあとの輪郭が切れないように決める

function writeBrushDigits(name, spec, color, style) {
  const dir = path.join(IMAGES, 'digits', name)
  const views = exportViews(spec, style)
  for (let digit = 0; digit <= 9; digit += 1) {
    write(path.join(dir, `${digit}.png`), svg(spec.w, spec.h, digitBody(digit, color, { ...style, id: `${name}${digit}` }), viewBoxText(views.digit)))
  }
  // 「-」（時計のデータがマイナスの時用。電池・歩数では出ない）
  write(path.join(dir, 'negative.png'), svg(Math.round(spec.w * 0.7), spec.h, minusBody(color, style), viewBoxText(views.minus)))
  if (spec.colonW) write(path.join(dir, 'colon.png'), svg(spec.colonW, spec.h, colonBody(color, style), viewBoxText(views.colon)))
}

// ---------- フォントの字形（日付・歩数・電池の数字、曜日） ----------

// 黒で描いた字形の画像を、形（不透明度）はそのままに、指定の色にする
function tinted(file, color) {
  const png = PNG.sync.read(fs.readFileSync(file))
  const rgb = [1, 3, 5].map((k) => parseInt(color.slice(k, k + 2), 16))
  for (let i = 0; i < png.data.length; i += 4) [png.data[i], png.data[i + 1], png.data[i + 2]] = rgb
  return { href: `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`, w: png.width, h: png.height }
}

const glyphFile = (name) => path.join(SOURCE, 'glyphs', `${name}.png`)

// 数字は全部同じ高さで描く（大きさをそろえる）。字は枠の中央に、ふちに GLYPH_PAD の余白を残す
function writeFontDigits(name, spec, color) {
  const dir = path.join(IMAGES, 'digits', name)
  const glyphs = Object.fromEntries(GLYPH_TEXT.map((ch) => [ch, tinted(glyphFile(ch === '/' ? 'slash' : ch), color)]))
  const numbers = GLYPH_TEXT.filter((ch) => /\d/.test(ch)).map((ch) => glyphs[ch])
  // 高さは全部の数字で同じ。枠より幅の広い字（0・4 など）だけ、横を少し細くして収める
  const scale = (spec.h - 2 * GLYPH_PAD) / numbers[0].h
  const place = (g, cellW) => {
    const w = Math.min(g.w * scale, cellW - 2 * GLYPH_PAD)
    const h = g.h * scale
    return `<image href="${g.href}" x="${((cellW - w) / 2).toFixed(2)}" y="${((spec.h - h) / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" preserveAspectRatio="none"/>`
  }
  for (let digit = 0; digit <= 9; digit += 1) write(path.join(dir, `${digit}.png`), svg(spec.w, spec.h, place(glyphs[String(digit)], spec.w)))
  // 「-」（時計のデータがマイナスの時用。電池・歩数では出ない）
  const mw = Math.round(spec.w * 0.7)
  write(path.join(dir, 'negative.png'), svg(mw, spec.h, `<rect x="${GLYPH_PAD + 1}" y="${spec.h / 2 - 1.5}" width="${mw - 2 * GLYPH_PAD - 2}" height="3" fill="${color}"/>`))
  if (spec.slashW) write(path.join(dir, 'slash.png'), svg(spec.slashW, spec.h, place(glyphs['/'], spec.slashW)))
}

// 曜日（日）〜（土）：縦横比を保って枠の中央に置く
function weekdaySvg(index) {
  const { w, h } = LAYOUT.weekday
  const g = tinted(glyphFile(`weekday-${index}`), C.black)
  const s = Math.min((w - 2 * GLYPH_PAD) / g.w, (h - 2 * GLYPH_PAD) / g.h)
  const dw = g.w * s
  const dh = g.h * s
  return svg(w, h, `<image href="${g.href}" x="${((w - dw) / 2).toFixed(2)}" y="${((h - dh) / 2).toFixed(2)}" width="${dw.toFixed(2)}" height="${dh.toFixed(2)}" preserveAspectRatio="none"/>`)
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

// 確認図だけに重ねる：実機で測った通知のマーク（x=178〜212・y=10〜44 の丸）と、文字を置かない範囲
function notificationLayer() {
  const n = NOTIFICATION
  return (
    `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="none" stroke="${C.notification}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<circle cx="195" cy="27" r="17" fill="#EEF2F4" stroke="${C.notification}" stroke-width="4"/>` +
    `<path d="M195 27 L205 19" stroke="#555" stroke-width="2" stroke-linecap="round"/>`
  )
}

function previewSvg({ time, battery, steps, date, weekday, quote }, { notification = false } = {}) {
  const L = LAYOUT
  const img = (file, rect) => `<image href="${dataUri(path.join(IMAGES, file))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}"/>`
  let body = img('background.png', { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height })
  body += img(`quotes/${quote}.png`, L.quote)
  body += spriteRow(time, 'time', { x: L.time.x, y: L.time.y, w: L.time.w, h: DIGITS.time.h }, DIGITS.time, 'center')
  body += spriteRow(date, 'date', L.date, DIGITS.date, 'center')
  body += img(`weekday/${weekday}.png`, L.weekday)
  body += spriteRow(String(steps), 'steps', L.steps, DIGITS.steps)
  body += spriteRow(String(battery), 'battery', L.battery, DIGITS.battery)
  const f = L.batteryFill
  const fw = Math.round((f.w * battery) / 100)
  if (fw > 0) body += `<rect x="${f.x}" y="${f.y}" width="${fw}" height="${f.h}" fill="${C.red}"/>`
  if (notification) body += notificationLayer()
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

function aodPreviewSvg({ time, date, weekday, battery }) {
  const L = LAYOUT.aod
  const text = (value, rect) =>
    `<text x="${rect.x + rect.w / 2}" y="${rect.y + rect.h / 2 + TYPE.aodDate * 0.35}" font-size="${TYPE.aodDate}" fill="${C.aod}" text-anchor="middle" font-family="IPAGothic, sans-serif">${value}</text>`
  let body = `<rect width="${SCREEN.width}" height="${SCREEN.height}" fill="#000"/>`
  body += spriteRow(time, 'aod', { x: 0, y: L.timeY, w: SCREEN.width, h: DIGITS.aod.h }, DIGITS.aod, 'center')
  body += text(`${date}(${WEEKDAYS_JA[weekday]})`, L.date) + text(`HP ${battery}`, L.hp)
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

// ---------- 実行 ----------

if (!fs.existsSync(path.join(SOURCE, 'glyphs', '0.png'))) {
  console.error('source/ がありません。先に tools/prepare-source.mjs を実行してください（README の「素材と権利」）')
  process.exit(1)
}
fs.rmSync(IMAGES, { recursive: true, force: true })

writeBrushDigits('time', DIGITS.time, C.black, DIGIT_STYLE.time)
writeBrushDigits('aod', DIGITS.aod, C.aod, DIGIT_STYLE.aod)
writeFontDigits('date', DIGITS.date, C.black)
writeFontDigits('steps', DIGITS.steps, C.black)
writeFontDigits('battery', DIGITS.battery, C.red)
WEEKDAYS_JA.forEach((_, index) => write(path.join(IMAGES, 'weekday', `${index}.png`), weekdaySvg(index)))

// セリフの札：QUOTES の番号（1〜7）と source/quotes/quote-0N.png を対応させる（そのままの大きさ）
QUOTES.forEach((quote, index) => {
  const file = path.join(SOURCE, 'quotes', `quote-${String(index + 1).padStart(2, '0')}.png`)
  const dest = path.join(IMAGES, quote.image.replace(/^images\//, ''))
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(file, dest)
})

fs.copyFileSync(path.join(SOURCE, 'background.png'), path.join(IMAGES, 'background.png'))

// 完成見本：通常（セリフ7種）・電池少なめ・AOD・通知のマークを重ねた確認図。weekday は 0＝日〜6＝土
const SAMPLE = { time: '18:42', battery: 79, steps: 4449, date: '9/30', weekday: 3, quote: 2 }
write(path.join(DOCS, 'preview-390x450.png'), previewSvg(SAMPLE))
QUOTES.forEach((_, i) => {
  write(path.join(DOCS, `preview-quote-${i + 1}.png`), previewSvg({ ...SAMPLE, quote: i + 1 }))
})
write(path.join(DOCS, 'preview-low-390x450.png'), previewSvg({ time: '21:07', battery: 9, steps: 21408, date: '12/31', weekday: 4, quote: 6 }))
write(path.join(DOCS, 'preview-aod-390x450.png'), aodPreviewSvg(SAMPLE))
write(path.join(DOCS, 'check-notification.png'), previewSvg(SAMPLE, { notification: true }))
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(SAMPLE))

// 確認用：極端な値のプレビューを別のフォルダに書く（リポジトリには入れない）
//   SA_CHECK_DIR=/tmp/check npm run assets -- super-arbeiter
if (process.env.SA_CHECK_DIR) {
  const cases = [
    { time: '9:08', battery: 0, steps: 0, date: '1/1', weekday: 1, quote: 1 },
    { time: '0:00', battery: 100, steps: 999999, date: '12/31', weekday: 0, quote: 3 },
    { time: '11:11', battery: 10, steps: 10000, date: '11/11', weekday: 2, quote: 5 },
    { time: '20:04', battery: 99, steps: 9999, date: '8/28', weekday: 5, quote: 7 },
    { time: '23:59', battery: 9, steps: 88888, date: '10/10', weekday: 6, quote: 4 },
    { time: '12:44', battery: 100, steps: 100000, date: '2/22', weekday: 3, quote: 6 },
  ]
  cases.forEach((state, i) => write(path.join(process.env.SA_CHECK_DIR, `check-${i}.png`), previewSvg(state)))
}

console.log(`Generated super-arbeiter assets in assets/bip-6/images and docs/（字形：${fs.readFileSync(path.join(SOURCE, 'glyphs', 'font.txt'), 'utf8').trim()}）`)
