// 受け取った改修用の素材（super-arbeiter-redesign-pack）から、この文字盤で使う形に整えて source/ に保存する。
// 元の素材は大きい（合計 11MB ほど）ので、リポジトリには入れない。一度だけ実行すればよい。
//
//   node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ>
//
// - 固定背景（background/static-background.png）を、時計の大きさの2倍（780×900）に縮小する
//   - 吹き出しの内側を、セリフの札と同じ平らなクリーム色で塗る（札との境目を出さないため）
//   - BREAK の赤い箱は右下の丸い角にかかるので、まわりの黄色い地の模様で消す（箱は generate-assets.mjs で内側に描き直す）
// - セリフの札（quotes/quote-01〜07.png）は、文字のまわりの余白を切り落とし、下地の色をそろえる
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { Resvg } from '@resvg/resvg-js'
import { COLORS } from '../watchface/theme.js'
import { LAYOUT } from '../watchface/layout.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, '..', 'source')
const input = process.argv[2]
if (!input || !fs.existsSync(path.join(input, 'background', 'static-background.png'))) {
  console.error('使い方: node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ>')
  process.exit(1)
}

const SCALE = 2 // source は時計の2倍の大きさで保存する
const CREAM = [(COLORS.CREAM >> 16) & 255, (COLORS.CREAM >> 8) & 255, COLORS.CREAM & 255]

function read(file) {
  return PNG.sync.read(fs.readFileSync(file))
}

function resize(png, width, height) {
  const href = `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${href}" width="${width}" height="${height}" preserveAspectRatio="none"/></svg>`
  return PNG.sync.read(new Resvg(svg).render().asPng())
}

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
function patchFrom(png, src, dst, feather = 8) {
  for (let y = 0; y < dst.h; y += 1) {
    for (let x = 0; x < dst.w; x += 1) {
      if (dst.x + x >= png.width || dst.y + y >= png.height) continue
      const edge = Math.min(x, y, dst.w - 1 - x, dst.h - 1 - y)
      const a = Math.min(1, edge / feather)
      const s = at(png, src.x + (x % src.w), src.y + (y % src.h))
      const d = at(png, dst.x + x, dst.y + y)
      for (let c = 0; c < 3; c += 1) png.data[d + c] = Math.round(png.data[d + c] * (1 - a) + png.data[s + c] * a)
    }
  }
}

// セリフの札：下地の色を測り、文字のまわりの余白を切り落とし、下地をクリームにそろえる
function prepareQuote(png) {
  // 下地の色＝四辺の画素の中央値
  const border = []
  for (let x = 0; x < png.width; x += 4) border.push(at(png, x, 2), at(png, x, png.height - 3))
  for (let y = 0; y < png.height; y += 4) border.push(at(png, 2, y), at(png, png.width - 3, y))
  const median = (c) => border.map((i) => png.data[i + c]).sort((a, b) => a - b)[border.length >> 1]
  const bg = [median(0), median(1), median(2)]
  // 文字の範囲（下地から色が離れている画素）
  let x0 = png.width
  let y0 = png.height
  let x1 = 0
  let y1 = 0
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = at(png, x, y)
      const d = Math.abs(png.data[i] - bg[0]) + Math.abs(png.data[i + 1] - bg[1]) + Math.abs(png.data[i + 2] - bg[2])
      if (d > 90) {
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x)
        y1 = Math.max(y1, y)
      }
    }
  }
  const margin = 24
  x0 = Math.max(0, x0 - margin)
  y0 = Math.max(0, y0 - margin)
  x1 = Math.min(png.width - 1, x1 + margin)
  y1 = Math.min(png.height - 1, y1 + margin)
  const out = new PNG({ width: x1 - x0 + 1, height: y1 - y0 + 1 })
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const s = at(png, x, y)
      const d = at(out, x - x0, y - y0)
      // 下地の色がクリームになるように、全体の色を同じだけずらす（文字の色はほとんど変わらない）
      for (let c = 0; c < 3; c += 1) out.data[d + c] = Math.max(0, Math.min(255, png.data[s + c] + CREAM[c] - bg[c]))
      out.data[d + 3] = 255
    }
  }
  return { png: out, bg }
}

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'quotes'), { recursive: true })

// 固定背景
const W = 390 * SCALE
const H = 450 * SCALE
const bg = resize(read(path.join(input, 'background', 'static-background.png')), W, H)
const bubble = LAYOUT.quote
const filled = flattenBubble(bg, (bubble.x + bubble.w / 2) * SCALE, (bubble.y + bubble.h / 2) * SCALE)
const erase = LAYOUT.breakBoxErase
patchFrom(
  bg,
  { x: erase.from.x * SCALE, y: erase.from.y * SCALE, w: erase.from.w * SCALE, h: erase.from.h * SCALE },
  { x: erase.x * SCALE, y: erase.y * SCALE, w: erase.w * SCALE, h: erase.h * SCALE },
)
fs.writeFileSync(path.join(OUT, 'background.png'), PNG.sync.write(bg))
console.log(`背景を ${W}×${H} にしました（吹き出しの内側 ${filled} 画素をクリームに）`)

// セリフの札
const quotes = fs.readdirSync(path.join(input, 'quotes')).filter((f) => /^quote-\d+\.png$/.test(f)).sort()
for (const file of quotes) {
  const { png: trimmed, bg: color } = prepareQuote(read(path.join(input, 'quotes', file)))
  // 吹き出しの枠の2倍に収まる大きさへ、縦横比を保って縮小する
  const fit = Math.min((bubble.w * SCALE) / trimmed.width, (bubble.h * SCALE) / trimmed.height)
  const png = resize(trimmed, Math.round(trimmed.width * fit), Math.round(trimmed.height * fit))
  fs.writeFileSync(path.join(OUT, 'quotes', file), PNG.sync.write(png))
  console.log(`${file}: 文字の範囲 ${trimmed.width}×${trimmed.height} → ${png.width}×${png.height}、下地 rgb(${color.join(', ')})`)
}
