// 受け取った最終採用案の素材（super-arbeiter-final-pack）から、この文字盤で使う形に整えて source/ に保存する。
// 元の素材はリポジトリには入れない。一度だけ実行すればよい。
//
//   node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ> [ちかフォント.ttf]
//
// - 固定背景（assets/background-390x450.png）：吹き出しの内側を、セリフの札と同じ平らなクリーム色で塗る
//   （札との色の境目を出さないため）
// - セリフの札（assets/quote-01〜07.png、174×116）：クリームの下地を透明にする。吹き出しの黒い枠を札で隠さないため
//   （文字のふちの画素は、クリームと文字の色が混ざったまま残すので、クリームの上では元の札と同じに見える）
// - 小さい文字（日付・歩数・電池の数字と、日本語の曜日）の字形：フォントで描いて source/glyphs/ に保存する
//   ちかフォントを渡した時はそれを使い、ない字（曜日の漢字など）は補助の書体（IPA ゴシック）で描く
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { Resvg } from '@resvg/resvg-js'
import { COLORS } from '../watchface/theme.js'
import { LAYOUT } from '../watchface/layout.js'
import { GLYPH_TEXT, WEEKDAYS_JA } from '../watchface/glyphs.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, '..', 'source')
const input = process.argv[2]
const mainFont = process.argv[3]
const FALLBACK_FONT = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
if (!input || !fs.existsSync(path.join(input, 'assets', 'background-390x450.png'))) {
  console.error('使い方: node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ> [ちかフォント.ttf]')
  process.exit(1)
}
if (!fs.existsSync(FALLBACK_FONT)) {
  console.error(`補助の書体がありません: ${FALLBACK_FONT}（Ubuntu なら fonts-ipafont-gothic）`)
  process.exit(1)
}

const CREAM = [(COLORS.CREAM >> 16) & 255, (COLORS.CREAM >> 8) & 255, COLORS.CREAM & 255]
const read = (file) => PNG.sync.read(fs.readFileSync(file))
const at = (png, x, y) => (png.width * y + x) << 2

// 吹き出しの内側（クリーム色の所）を、真ん中から塗りつぶしで広げて、平らなクリームにする
function flattenBubble(png, seedX, seedY) {
  const isCream = (i) => png.data[i] > 200 && png.data[i + 1] > 190 && png.data[i + 2] > 150
  const seen = new Uint8Array(png.width * png.height)
  const stack = [[Math.round(seedX), Math.round(seedY)]]
  let count = 0
  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue
    const k = png.width * y + x
    if (seen[k]) continue
    seen[k] = 1
    const i = k << 2
    if (!isCream(i)) continue
    png.data[i] = CREAM[0]
    png.data[i + 1] = CREAM[1]
    png.data[i + 2] = CREAM[2]
    count += 1
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  return count
}

// 札のクリームの下地だけを透明にする
function clearCream(png) {
  for (let i = 0; i < png.data.length; i += 4) {
    const d = Math.abs(png.data[i] - CREAM[0]) + Math.abs(png.data[i + 1] - CREAM[1]) + Math.abs(png.data[i + 2] - CREAM[2])
    if (d <= 12) png.data[i + 3] = 0
  }
  return png
}

// TrueType の name 表から、書体の名前（family）を読む
function fontFamily(file) {
  const buf = fs.readFileSync(file)
  const tables = buf.readUInt16BE(4)
  for (let t = 0; t < tables; t += 1) {
    const rec = 12 + t * 16
    if (buf.toString('latin1', rec, rec + 4) !== 'name') continue
    const base = buf.readUInt32BE(rec + 8)
    const count = buf.readUInt16BE(base + 2)
    const strings = base + buf.readUInt16BE(base + 4)
    for (let n = 0; n < count; n += 1) {
      const r = base + 6 + n * 12
      const [platform, , , nameId, length, offset] = [0, 2, 4, 6, 8, 10].map((o) => buf.readUInt16BE(r + o))
      if (nameId !== 1) continue
      const raw = buf.subarray(strings + offset, strings + offset + length)
      if (platform === 3 || platform === 0) {
        let s = ''
        for (let k = 0; k + 1 < raw.length; k += 2) s += String.fromCharCode(raw.readUInt16BE(k))
        return s
      }
      return raw.toString('latin1')
    }
  }
  throw new Error(`書体の名前が読めません: ${file}`)
}

// 1つの文字列を、大きく（font-size 160）黒で描き、見える範囲を返す
const FONT_FILES = mainFont ? [mainFont, FALLBACK_FONT] : [FALLBACK_FONT]
const FAMILIES = FONT_FILES.map(fontFamily)
const SIZE = 160
// 補助の書体は細いので、同じ色の線で少し太らせる（ちかフォントはそのまま）
const BOLD = mainFont ? 0 : SIZE * 0.07

function renderText(text) {
  const W = SIZE * 5
  const H = SIZE * 2
  const family = FAMILIES.map((f) => `'${f}'`).join(', ')
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
    `<text x="${W / 2}" y="${SIZE * 1.3}" font-size="${SIZE}" font-family="${family}" text-anchor="middle" fill="#000"` +
    ` stroke="#000" stroke-width="${BOLD}" stroke-linejoin="round">${esc}</text></svg>`
  const png = PNG.sync.read(
    new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: FAMILIES[0] } }).render().asPng(),
  )
  let x0 = W
  let y0 = H
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (png.data[at(png, x, y) + 3] > 20) {
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x)
        y1 = Math.max(y1, y)
      }
    }
  }
  if (x1 < 0) throw new Error(`「${text}」が描けませんでした`)
  return { png, x0, y0, x1, y1 }
}

function crop(png, x0, y0, x1, y1) {
  const out = new PNG({ width: x1 - x0 + 1, height: y1 - y0 + 1 })
  PNG.bitblt(png, out, x0, y0, out.width, out.height, 0, 0)
  return out
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'quotes'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'glyphs'), { recursive: true })

// 固定背景
const bg = read(path.join(input, 'assets', 'background-390x450.png'))
const bubble = LAYOUT.quote
const filled = flattenBubble(bg, bubble.x + bubble.w / 2, bubble.y + bubble.h / 2)
fs.writeFileSync(path.join(OUT, 'background.png'), PNG.sync.write(bg))
console.log(`背景 ${bg.width}×${bg.height}（吹き出しの内側 ${filled} 画素をクリームに）`)

// セリフの札
const quotes = fs.readdirSync(path.join(input, 'assets')).filter((f) => /^quote-\d+\.png$/.test(f)).sort()
for (const file of quotes) {
  const png = clearCream(read(path.join(input, 'assets', file)))
  fs.writeFileSync(path.join(OUT, 'quotes', file), PNG.sync.write(png))
  console.log(`${file}: ${png.width}×${png.height}`)
}

// 数字と「/」：縦は全部の数字に共通の範囲で切り、横はそれぞれの見える範囲で切る（大きさをそろえるため）
const digits = GLYPH_TEXT.map((ch) => ({ ch, ...renderText(ch) }))
const top = Math.min(...digits.filter((d) => /\d/.test(d.ch)).map((d) => d.y0))
const bottom = Math.max(...digits.filter((d) => /\d/.test(d.ch)).map((d) => d.y1))
for (const d of digits) {
  const name = d.ch === '/' ? 'slash' : d.ch
  fs.writeFileSync(path.join(OUT, 'glyphs', `${name}.png`), PNG.sync.write(crop(d.png, d.x0, top, d.x1, bottom)))
}
// 曜日：（日）〜（土）を1枚ずつ、見える範囲で切る
WEEKDAYS_JA.forEach((name, i) => {
  const r = renderText(`(${name})`)
  fs.writeFileSync(path.join(OUT, 'glyphs', `weekday-${i}.png`), PNG.sync.write(crop(r.png, r.x0, r.y0, r.x1, r.y1)))
})
console.log(`字形：${FAMILIES.join(' ＋ ')}${mainFont ? '' : '（ちかフォントなし。補助の書体だけで描いた）'}`)
fs.writeFileSync(path.join(OUT, 'glyphs', 'font.txt'), `${FAMILIES.join(' + ')}\n`)
