// 受け取った素材（SUPER ARBEITER の制作指示書に同梱の PNG）から、この文字盤で使う部分だけを
// 切り出し・縮小して source/ に保存する。元の素材は大きい（合計 10MB ほど）ので、リポジトリには入れない。
// 一度だけ実行すればよい。source/ ができていれば、ふだんは `npm run assets -- super-arbeiter` だけでよい。
//
//   node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ> [飾りの素材.png]
//
// - 暖簾・提灯・丼・FINAL は、透明な余白を切り落として縮小する
// - HP・STEPS・BREAK・STATUS の文字、電池・くつ・カレンダー・時計のアイコン、赤い筆の線、
//   カウンターの飾りは、参考画像（watchface_reference.png）から切り出し、黄色い地を透明にする
// - 飾りの素材（湯気2種・赤い勢い線2種・筆の下線2種を1枚にまとめた透過 PNG）を渡すと、6つに切り分ける
// - 保存するのは、時計に入れる大きさの2倍（あとで縮小する時にきれいにするため）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { Resvg } from '@resvg/resvg-js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, '..', 'source')
const input = process.argv[2]
if (!input || !fs.existsSync(path.join(input, 'watchface_reference.png'))) {
  console.error('使い方: node faces/super-arbeiter/tools/prepare-source.mjs <素材のフォルダ>')
  process.exit(1)
}

// 参考画像（1254×1254）から時計（390 幅）への縮尺。source はその2倍で保存する
const REFERENCE_SCALE = 0.31 * 2

// 参考画像から切り出す範囲 [x0, y0, x1, y1]（参考画像の座標）
const CROPS = {
  battery: [80, 390, 215, 470],
  'label-hp': [90, 475, 185, 525],
  shoe: [88, 670, 285, 789],
  'label-steps': [132, 790, 320, 840],
  calendar: [1060, 380, 1155, 470],
  clock: [970, 680, 1080, 755],
  'label-break': [935, 768, 1130, 815],
  status: [360, 630, 920, 708],
  counter: [40, 972, 1215, 1086],
}

// 切り出したあとで消す範囲（となりの飾りが入り込む所）。参考画像の座標
const ERASE = {
  shoe: [[88, 670, 130, 747]], // 靴の左上の赤い勢い線
}

// 飾りの素材（1254×1254）から切り出す範囲と、保存する幅（2倍）
const DECO_CROPS = {
  'steam-a': [[90, 110, 600, 430], 96],
  'steam-b': [[690, 110, 1200, 450], 96],
  'burst-3': [[150, 510, 545, 870], 80],
  'burst-2': [[790, 570, 1130, 870], 64],
  'brush-long': [[55, 995, 680, 1150], 520],
  'brush-short': [[750, 1030, 1210, 1125], 220],
}

// 別の素材ファイル：[ファイル名, 保存名, 保存する幅（2倍）]
const PARTS = [
  ['noren_super_arbeiter.png', 'noren', 460],
  ['lantern_open.png', 'lantern-open', 96],
  ['lantern_yoshi.png', 'lantern-yoshi', 96],
  ['ramen_bowl.png', 'ramen-bowl', 200],
  ['footer_final.png', 'footer-final', 580],
]

function read(file) {
  return PNG.sync.read(fs.readFileSync(file))
}

function crop(png, [x0, y0, x1, y1]) {
  const out = new PNG({ width: x1 - x0, height: y1 - y0 })
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const s = (png.width * y + x) << 2
      const d = (out.width * (y - y0) + (x - x0)) << 2
      for (let c = 0; c < 4; c += 1) out.data[d + c] = png.data[s + c]
      if (png.data.length === png.width * png.height * 3) out.data[d + 3] = 255
    }
  }
  return out
}

// 黄色い地を透明にする。地の色に近いほど透明。まわりに少し黄色が残るが、黄色い背景に置くので目立たない
function keyOutYellow(png, background) {
  const [R, G, B] = background
  for (let i = 0; i < png.data.length; i += 4) {
    const dr = png.data[i] - R
    const dg = png.data[i + 1] - G
    const db = png.data[i + 2] - B
    const distance = Math.sqrt(dr * dr + dg * dg + db * db)
    const alpha = Math.max(0, Math.min(1, (distance - 45) / (110 - 45)))
    png.data[i + 3] = Math.round(png.data[i + 3] * alpha)
  }
  return png
}

// 透明な余白を切り落とす
function trim(png) {
  let x0 = png.width
  let y0 = png.height
  let x1 = 0
  let y1 = 0
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (png.data[((png.width * y + x) << 2) + 3] > 8) {
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x + 1)
        y1 = Math.max(y1, y + 1)
      }
    }
  }
  return crop(png, [x0, y0, x1, y1])
}

function resizeTo(png, width) {
  const height = Math.round((png.height * width) / png.width)
  const href = `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${href}" width="${width}" height="${height}" preserveAspectRatio="none"/></svg>`
  return new Resvg(svg).render().asPng()
}

// 参考画像の地の黄色（時刻の下の何もない所の平均）
function sampleBackground(png) {
  const sum = [0, 0, 0]
  let n = 0
  for (let y = 520; y < 560; y += 1) {
    for (let x = 1000; x < 1030; x += 1) {
      const i = (png.width * y + x) << 2
      sum[0] += png.data[i]
      sum[1] += png.data[i + 1]
      sum[2] += png.data[i + 2]
      n += 1
    }
  }
  return sum.map((v) => Math.round(v / n))
}

fs.mkdirSync(OUT, { recursive: true })
const reference = read(path.join(input, 'watchface_reference.png'))
const background = sampleBackground(reference)
console.log(`参考画像の地の色: rgb(${background.join(', ')})`)

function erase(png, box, boxes) {
  for (const [x0, y0, x1, y1] of boxes) {
    for (let y = y0 - box[1]; y < y1 - box[1]; y += 1) {
      for (let x = x0 - box[0]; x < x1 - box[0]; x += 1) {
        if (x >= 0 && y >= 0 && x < png.width && y < png.height) png.data[((png.width * y + x) << 2) + 3] = 0
      }
    }
  }
  return png
}

for (const [name, box] of Object.entries(CROPS)) {
  const piece = trim(erase(keyOutYellow(crop(reference, box), background), box, ERASE[name] || []))
  const width = Math.max(4, Math.round(piece.width * REFERENCE_SCALE))
  fs.writeFileSync(path.join(OUT, `${name}.png`), resizeTo(piece, width))
}
for (const [file, name, width] of PARTS) {
  const piece = trim(read(path.join(input, file)))
  fs.writeFileSync(path.join(OUT, `${name}.png`), resizeTo(piece, width))
}
const decoFile = process.argv[3]
if (decoFile) {
  const deco = read(decoFile)
  for (const [name, [box, width]] of Object.entries(DECO_CROPS)) {
    fs.writeFileSync(path.join(OUT, `${name}.png`), resizeTo(trim(crop(deco, box)), width))
  }
  console.log(`飾りを ${Object.keys(DECO_CROPS).length} 枚に切り分けました`)
}
console.log(`source/ に ${Object.keys(CROPS).length + PARTS.length} 枚を保存しました`)
