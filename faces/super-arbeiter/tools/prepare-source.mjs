// 受け取った最終採用案の素材（super-arbeiter-final-pack）から、この文字盤で使う形に整えて source/ に保存する。
// 元の素材はリポジトリには入れない。一度だけ実行すればよい。
//
//   node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ> --chika <chika-Regular.ttf> --time <MPLUSRounded1c-Black.ttf>
//
// - 固定背景（assets/background-390x450.png）：吹き出しの内側を、セリフの札と同じ平らなクリーム色で塗る
//   （札との色の境目を出さないため）。時刻の左のカレンダーと日付の下線、下の段のくつ・区切り・電池の枠は、
//   まわりの黄色い地の模様で消す（下の段は generate-assets.mjs が並べ直す）
// - 下の段のアイコン（カレンダー・くつ・電池の枠）：素材の背景から切り出し、黄色い地を透明にして source/icons/ に保存する
// - セリフの札（assets/quote-01〜07.png、174×116）：クリームの下地を透明にする。吹き出しの黒い枠を札で隠さないため
//   （文字のふちの画素は、クリームと文字の色が混ざったまま残すので、クリームの上では元の札と同じに見える）
// - 小さい文字（日付・歩数・電池の数字と、日本語の曜日）の字形：フォントで描いて source/glyphs/ に保存する
//   ちかフォントを渡した時はそれを使い、ない字は補助の書体（IPA ゴシック）で描く
// - 時刻の字形（0〜9 と「:」）：太い丸ゴシック（M PLUS Rounded 1c Black、SIL Open Font License）で描いて source/glyphs/time-*.png に保存する
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { Resvg } from '@resvg/resvg-js'
import { COLORS } from '../watchface/theme.js'
import { LAYOUT } from '../watchface/layout.js'
import { GLYPH_TEXT } from '../watchface/glyphs.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, '..', 'source')
const input = process.argv[2]
const option = (name) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : undefined
}
const mainFont = option('--chika')
const timeFont = option('--time')
const FALLBACK_FONT = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
if (!input || !fs.existsSync(path.join(input, 'assets', 'background-390x450.png')) || !timeFont) {
  console.error('使い方: node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ> --chika <chika-Regular.ttf> --time <MPLUSRounded1c-Black.ttf>')
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

// 別の場所の黄色い地の模様を写して、範囲を消す（ふちはぼかしてなじませる）
function patchFrom(png, src, dst, feather = 4) {
  for (let y = 0; y < dst.h; y += 1) {
    for (let x = 0; x < dst.w; x += 1) {
      const edge = Math.min(x, y, dst.w - 1 - x, dst.h - 1 - y)
      const a = Math.min(1, (edge + 1) / feather)
      const s = at(png, src.x + (x % src.w), src.y + (y % src.h))
      const d = at(png, dst.x + x, dst.y + y)
      for (let c = 0; c < 3; c += 1) png.data[d + c] = Math.round(png.data[d + c] * (1 - a) + png.data[s + c] * a)
    }
  }
}

// アイコンを切り出し、黄色い地を透明にする（黒・白・クリームの所は残す）
function cutIcon(png, r) {
  const out = crop(png, r.x, r.y, r.x + r.w - 1, r.y + r.h - 1)
  for (let i = 0; i < out.data.length; i += 4) {
    const [red, green, blue] = [out.data[i], out.data[i + 1], out.data[i + 2]]
    if (red > 170 && green > 140 && blue < 150) out.data[i + 3] = 0
  }
  return out
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
const SMALL = { files: mainFont ? [mainFont, FALLBACK_FONT] : [FALLBACK_FONT] }
SMALL.families = SMALL.files.map(fontFamily)
// 原寸（高さ20px前後）でも読めるよう、同じ色の線で少し太らせる。補助の書体はもともと細いので、さらに太く
SMALL.bold = mainFont ? 0.06 : 0.07
const TIME = { files: [timeFont], families: [fontFamily(timeFont)], bold: 0 }
const SIZE = 160

function renderText(text, font = SMALL) {
  const FONT_FILES = font.files
  const FAMILIES = font.families
  const BOLD = SIZE * font.bold
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
  // 左右は、はっきり見える画素（不透明度50%以上）の範囲で切る（字の左右の余白をそろえるため）。上下は薄い画素まで
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const a = png.data[at(png, x, y) + 3]
      if (a > 20) {
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
      if (a >= 128) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
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
fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true })

// 固定背景
const bg = read(path.join(input, 'assets', 'background-390x450.png'))
const bubble = LAYOUT.quote
const filled = flattenBubble(bg, bubble.x + bubble.w / 2, bubble.y + bubble.h / 2)
// 下の段のアイコンを、消す前に切り出す（素材の画素で測った範囲）
const ICONS = {
  calendar: { x: 25, y: 125, w: 31, h: 29 },
  shoe: { x: 69, y: 392, w: 50, h: 34 },
  battery: { x: 221, y: 397, w: 45, h: 26 },
}
for (const [name, r] of Object.entries(ICONS)) fs.writeFileSync(path.join(OUT, 'icons', `${name}.png`), PNG.sync.write(cutIcon(bg, r)))
// 何も描かれていない黄色い地（くつと区切りの間）の模様で、時刻の左（カレンダー・日付の下線）と下の段を消す
const PLAIN = { x: 122, y: 392, w: 82, h: 42 }
patchFrom(bg, PLAIN, { x: 12, y: 118, w: 68, h: 100 }, 2)
patchFrom(bg, PLAIN, { x: 60, y: 388, w: 280, h: 44 })
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
// 時刻：0〜9 と「:」。同じく縦は数字に共通の範囲で切る
const timeGlyphs = [...'0123456789:'].map((ch) => ({ ch, ...renderText(ch, TIME) }))
const timeTop = Math.min(...timeGlyphs.filter((d) => d.ch !== ':').map((d) => d.y0))
const timeBottom = Math.max(...timeGlyphs.filter((d) => d.ch !== ':').map((d) => d.y1))
for (const d of timeGlyphs) {
  const name = d.ch === ':' ? 'colon' : d.ch
  fs.writeFileSync(path.join(OUT, 'glyphs', `time-${name}.png`), PNG.sync.write(crop(d.png, d.x0, timeTop, d.x1, timeBottom)))
}
const fonts = `小さい数字：${SMALL.families.join(' + ')}\n時刻：${TIME.families.join(' + ')}\n`
console.log(fonts.trim())
fs.writeFileSync(path.join(OUT, 'glyphs', 'font.txt'), fonts)
