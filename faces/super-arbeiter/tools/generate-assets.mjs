// SUPER ARBEITER の文字盤の絵（PNG）をすべて作る。
//   npm run assets -- super-arbeiter
//
// - 暖簾・提灯・丼・FINAL・ラベル・アイコン・カウンターの飾りは source/ の素材を使う
//   （素材の由来は README の「素材と権利」。source/ は tools/prepare-source.mjs で作る）
// - 湯気・赤い勢い線・筆の下線は、受け取った飾りの素材（source/steam-*・burst-*・brush-*）を使う
// - 地の黄色・区切りの線・BREAK の赤い箱・数字・曜日の文字は、ここでコードから描く
// - 数字は tools/brush-digits.mjs で1字ずつ作った筆の字形（入りが太く、終わりを払い、少し前に傾く）
// - キャラクター・公式ロゴ・公式フォントは使わない
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { DIGITS, LAYOUT, SCREEN, WEEKDAY } from '../watchface/layout.js'
import { COLORS, DIGIT_STYLE, STROKE, TEXTURE, TYPE } from '../watchface/theme.js'
import { STATUS_PRESETS } from '../watchface/status.js'
import { colonBody, digitBody, exportViews, minusBody, slashBody, viewBoxText } from './brush-digits.mjs'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'source')
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')

const hex = (n) => `#${n.toString(16).padStart(6, '0').toUpperCase()}`
const C = {
  yellow: hex(COLORS.YELLOW),
  red: hex(COLORS.RED),
  black: hex(COLORS.BLACK),
  cream: hex(COLORS.CREAM),
  aod: hex(COLORS.AOD_TEXT),
  divider: hex(COLORS.DIVIDER),
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

// fit: 'meet' は縦横比を保つ、'none' は枠いっぱいに伸ばす。flip で左右反転
function sourceImage(name, rect, { fit = 'meet', flip = false } = {}) {
  const ratio = fit === 'none' ? 'none' : 'xMidYMid meet'
  const transform = flip ? ` transform="translate(${2 * rect.x + rect.w} 0) scale(-1 1)"` : ''
  return `<image href="${dataUri(path.join(SOURCE, `${name}.png`))}" x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" preserveAspectRatio="${ratio}"${transform}/>`
}

// ---------- 数字（筆の数字）と曜日の英字 ----------
// 数字 0〜9 と「:」は tools/brush-digits.mjs で1字ずつ作った筆の字形。
// 大きい時刻だけ、画の終わりにかすれを入れる。小さい数字・AOD にはかすれを入れない。

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
  if (spec.slashW) write(path.join(dir, 'slash.png'), svg(spec.slashW, spec.h, slashBody(color, style), viewBoxText(views.slash)))
}

// 曜日の英字（40×64 の枠に、はしの丸い線で描く）
const LETTERS = {
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

function weekdaySvg(name, { color, width }) {
  const letterW = Math.floor(WEEKDAY.w / 3)
  const body = name
    .split('')
    .map(
      (ch, i) =>
        `<svg x="${i * letterW}" y="0" width="${letterW}" height="${WEEKDAY.h}" viewBox="-6 -6 52 76" preserveAspectRatio="none">` +
        `<g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${LETTERS[ch]}</g></svg>`,
    )
    .join('')
  return svg(WEEKDAY.w, WEEKDAY.h, body)
}

// ---------- 背景（390×450、動かない物をすべて1枚に） ----------

// 紙のまだら：固定の模様（seed 固定）。外周だけに入れ、内側（数字の後ろ）は平らにする
function paperTexture() {
  const { width: W, height: H } = SCREEN
  const inset = TEXTURE.paperInset
  return (
    `<defs><filter id="paper" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="3" seed="11"/>` +
    `<feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.35  0 0 0 0 0  0 0 0 1.6 -0.55"/></filter>` +
    `<filter id="soft"><feGaussianBlur stdDeviation="${inset / 2.5}"/></filter>` +
    `<mask id="edge" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="#fff"/>` +
    `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" rx="${inset}" fill="#000" filter="url(#soft)"/></mask></defs>` +
    `<rect width="${W}" height="${H}" filter="url(#paper)" mask="url(#edge)" opacity="${TEXTURE.paperOpacity * 6}"/>`
  )
}

// BREAK の箱：縁だけ筆のように少し荒らす（中は平らな赤で、数字が読みやすいまま）
function breakBox(box) {
  return (
    `<defs><filter id="boxEdge" x="-5%" y="-10%" width="110%" height="120%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="2" seed="5" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter></defs>` +
    `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${box.radius}" fill="${C.red}" filter="url(#boxEdge)"/>` +
    `<rect x="${box.x + 2}" y="${box.y + 2}" width="${box.w - 4}" height="${box.h - 4}" rx="${box.radius}" fill="none" stroke="#7A0000" stroke-width="2" opacity="${TEXTURE.boxEdgeOpacity}" filter="url(#boxEdge)"/>`
  )
}

function backgroundSvg() {
  const { width: W, height: H } = SCREEN
  const L = LAYOUT
  let body = `<rect width="${W}" height="${H}" fill="${C.yellow}"/>`
  body += paperTexture()
  // 暖簾の奥の木の梁
  body += `<rect x="0" y="4" width="${W}" height="9" fill="${C.divider}"/>`
  body += sourceImage('noren', L.noren)
  body += sourceImage('lantern-open', L.lanternLeft)
  body += sourceImage('lantern-yoshi', L.lanternRight)
  for (const d of L.decor) body += sourceImage(d.name, d, { fit: 'none', flip: d.flip })
  body += sourceImage('brush-long', L.underline, { fit: 'none' })
  // 真ん中の段：左に HP、右に日付
  body += sourceImage('battery', L.batteryIcon)
  body += sourceImage('label-hp', L.hpLabel)
  body += sourceImage('calendar', L.dateIcon)
  for (const line of L.columnLines) {
    body += `<path d="M${line.x1} ${line.y} H${line.x2}" stroke="${C.black}" stroke-width="${STROKE.divider}" stroke-linecap="round"/>`
  }
  // 下の段：左に STEPS
  body += sourceImage('shoe', L.shoeIcon)
  body += sourceImage('label-steps', L.stepsLabel)
  // 中央下
  const divider = (d) => `<path d="M${d.x} ${d.y} V${d.y + d.h}" stroke="${C.divider}" stroke-width="${STROKE.divider}" stroke-linecap="round"/>`
  body += divider(L.dividerLeft) + divider(L.dividerRight)
  body += sourceImage('ramen-bowl', L.bowl)
  // 右下：BREAK
  body += sourceImage('clock', L.clockIcon)
  body += sourceImage('label-break', L.breakLabel)
  body += breakBox(L.breakBox)
  // 下
  body += sourceImage('counter', L.counter, { fit: 'none' })
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
  body += spriteRow(date, 'date', L.date, DIGITS.date, 'right')
  body += img(`weekday/${WEEKDAY_NAMES.indexOf(weekday)}.png`, L.weekday)
  body += spriteRow(breakTime, 'break', L.breakTime, DIGITS.break, 'center')
  return svg(SCREEN.width, SCREEN.height, body + roundedMask())
}

function aodPreviewSvg({ time, date, weekday, hp }) {
  const L = LAYOUT.aod
  const text = (value, rect) =>
    `<text x="${rect.x + rect.w / 2}" y="${rect.y + rect.h / 2 + TYPE.aodDate * 0.35}" font-size="${TYPE.aodDate}" fill="${C.aod}" text-anchor="middle" font-family="sans-serif">${value}</text>`
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

writeBrushDigits('time', DIGITS.time, C.black, DIGIT_STYLE.time)
writeBrushDigits('hp', DIGITS.hp, C.red, DIGIT_STYLE.small)
writeBrushDigits('steps', DIGITS.steps, C.black, DIGIT_STYLE.small)
writeBrushDigits('date', DIGITS.date, C.black, DIGIT_STYLE.small)
writeBrushDigits('break', DIGITS.break, C.cream, DIGIT_STYLE.small)
writeBrushDigits('aod', DIGITS.aod, C.aod, DIGIT_STYLE.aod)
WEEKDAY_NAMES.forEach((name, index) => {
  write(path.join(IMAGES, 'weekday', `${index}.png`), weekdaySvg(name, { color: C.black, width: STROKE.small }))
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

// 確認用：極端な値のプレビューを別のフォルダに書く（リポジトリには入れない）
//   SA_CHECK_DIR=/tmp/check npm run assets -- super-arbeiter
if (process.env.SA_CHECK_DIR) {
  const cases = [
    { time: '9:08', hp: 0, steps: 0, date: '1/1', weekday: 'MON', breakTime: '0:00' },
    { time: '0:00', hp: 100, steps: 99999, date: '12/31', weekday: 'WED', breakTime: '23:59' },
    { time: '11:11', hp: 100, steps: 11111, date: '11/11', weekday: 'SAT', breakTime: '11:11' },
    { time: '23:59', hp: 8, steps: 88888, date: '8/28', weekday: 'THU', breakTime: '18:58' },
  ]
  cases.forEach((state, i) => write(path.join(process.env.SA_CHECK_DIR, `check-${i}.png`), previewSvg(state)))
}

console.log('Generated super-arbeiter assets in assets/bip-6/images and docs/')
