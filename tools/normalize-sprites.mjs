// モンスター字形・中ボスを実機サイズへ縮小して assets/ へ配置する。
//
// 元画像は実機表示の2倍で作ってある（字形 104×144 → 52×72、中ボス 260×220 → 130×110）。
// ちょうど2:1なので、2×2の平均だけで劣化なく縮小できる。
//
//   node tools/normalize-sprites.mjs
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const ROOT = process.cwd()
const ASSET_ROOT = path.join(ROOT, 'assets', 'bip-6', 'images')

// ドット絵はPNGの適応行フィルタと相性が悪い。generate-assets と同じ設定を使う。
const PNG_WRITE_OPTIONS = {
  colorType: 6,
  deflateLevel: 9,
  deflateStrategy: 0,
  filterType: 0,
}

const JOBS = [
  {
    label: 'モンスター字形',
    from: path.join(ROOT, 'art', 'monster-digits-src'),
    to: path.join(ASSET_ROOT, 'digits', 'monster'),
    names: Array.from({ length: 10 }, (_, i) => `${i}.png`),
    size: [52, 72],
  },
  {
    label: '中ボス',
    from: path.join(ROOT, 'art', 'boss-src'),
    to: path.join(ASSET_ROOT, 'boss'),
    names: Array.from({ length: 13 }, (_, i) => `${String(i).padStart(2, '0')}.png`),
    size: [130, 110],
  },
]

// アルファを考慮した平均。透明画素の色を混ぜると輪郭が濁るため、
// 色は不透明度で重みづけして合成する。
function shrink(src, width, height) {
  const out = new PNG({ width, height })
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const x0 = Math.floor((x / width) * src.width)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) / width) * src.width))
      const y0 = Math.floor((y / height) * src.height)
      const y1 = Math.max(y0 + 1, Math.floor(((y + 1) / height) * src.height))
      let r = 0
      let g = 0
      let b = 0
      let alphaSum = 0
      let count = 0
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (src.width * sy + sx) << 2
          const a = src.data[i + 3]
          r += src.data[i] * a
          g += src.data[i + 1] * a
          b += src.data[i + 2] * a
          alphaSum += a
          count += 1
        }
      }
      const o = (width * y + x) << 2
      if (alphaSum === 0) {
        out.data[o] = 0
        out.data[o + 1] = 0
        out.data[o + 2] = 0
        out.data[o + 3] = 0
        continue
      }
      out.data[o] = Math.round(r / alphaSum)
      out.data[o + 1] = Math.round(g / alphaSum)
      out.data[o + 2] = Math.round(b / alphaSum)
      out.data[o + 3] = Math.round(alphaSum / count)
    }
  }
  return out
}

let total = 0
for (const job of JOBS) {
  if (!fs.existsSync(job.from)) {
    console.error(`エラー: ${path.relative(ROOT, job.from)} が見つかりません`)
    process.exit(1)
  }
  const [w, h] = job.size
  fs.mkdirSync(job.to, { recursive: true })
  let bytes = 0
  for (const name of job.names) {
    const file = path.join(job.from, name)
    if (!fs.existsSync(file)) {
      console.error(`エラー: ${path.relative(ROOT, file)} がありません`)
      process.exit(1)
    }
    const src = PNG.sync.read(fs.readFileSync(file))
    const out = shrink(src, w, h)
    const target = path.join(job.to, name)
    fs.writeFileSync(target, PNG.sync.write(out, { ...PNG_WRITE_OPTIONS }))
    bytes += fs.statSync(target).size
  }
  total += job.names.length
  console.log(
    `${job.label}: ${job.names.length}枚 → ${w}x${h} / ` +
      `${path.relative(ROOT, job.to)} (${Math.round(bytes / 1024)}KB)`,
  )
  // 端末ではTGAへ展開されるので、画素数から実容量を見積もっておく。
  console.log(`  TGA換算 約${((w * h * 4 * job.names.length) / 1024 / 1024).toFixed(2)}MB`)
}

console.log(`\n${total}枚を配置しました。`)
