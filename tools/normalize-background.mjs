// 背景画像をBip 6向けに正規化する。
// Image Gen出力はアンチエイリアスと色数過多を含むため、寸法を揃え、
// ピクセルグリッドに整列させ、減色してから assets/ へ配置する。
// 仕様は docs/background-image-gen-brief.md を参照。
//
//   node tools/normalize-background.mjs in.png out.png [--grid 1] [--colors 64]
//   node tools/normalize-background.mjs                 # art/backgrounds-src/*.png を一括変換
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const ROOT = process.cwd()
const SRC_ROOT = path.join(ROOT, 'art', 'backgrounds-src')
const DEST_ROOT = path.join(ROOT, 'assets', 'bip-6', 'images', 'backgrounds')

const WIDTH = 366
const HEIGHT = 430

// 時刻数字が覆いなしで直接乗る領域。ここが明るいと白文字が読めない。
const TIME_BAND = Object.freeze({ x0: 75, x1: 291, y0: 214, y1: 279, maxLuma: 200 })

function parseArgs(argv) {
  const positional = []
  const options = { grid: 1, colors: 64 }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--grid' || arg === '--colors') {
      const value = Number(argv[i + 1])
      if (!Number.isInteger(value) || value < 1) {
        throw new Error(`${arg} には1以上の整数を指定してください`)
      }
      options[arg === '--grid' ? 'grid' : 'colors'] = value
      i += 1
    } else {
      positional.push(arg)
    }
  }
  if (WIDTH % options.grid !== 0 || HEIGHT % options.grid !== 0) {
    throw new Error(`--grid ${options.grid} は366×430を割り切れません（1, 2 のいずれかを使用）`)
  }
  return { positional, options }
}

// 元画像を grid 単位のブロックへボックス平均する。
function downsample(src, grid) {
  const blockW = WIDTH / grid
  const blockH = HEIGHT / grid
  const blocks = []
  for (let by = 0; by < blockH; by += 1) {
    for (let bx = 0; bx < blockW; bx += 1) {
      const x0 = Math.floor((bx / blockW) * src.width)
      const x1 = Math.max(x0 + 1, Math.floor(((bx + 1) / blockW) * src.width))
      const y0 = Math.floor((by / blockH) * src.height)
      const y1 = Math.max(y0 + 1, Math.floor(((by + 1) / blockH) * src.height))
      let r = 0
      let g = 0
      let b = 0
      let count = 0
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const index = (src.width * y + x) << 2
          r += src.data[index]
          g += src.data[index + 1]
          b += src.data[index + 2]
          count += 1
        }
      }
      blocks.push([Math.round(r / count), Math.round(g / count), Math.round(b / count)])
    }
  }
  return { blocks, blockW, blockH }
}

// 出現頻度上位の色を代表色として取り出す。
function buildPalette(blocks, maxColors) {
  const histogram = new Map()
  for (const [r, g, b] of blocks) {
    const key = `${r >> 3},${g >> 3},${b >> 3}`
    const entry = histogram.get(key)
    if (entry) {
      entry.count += 1
      entry.r += r
      entry.g += g
      entry.b += b
    } else {
      histogram.set(key, { count: 1, r, g, b })
    }
  }
  return [...histogram.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map((entry) => [
      Math.round(entry.r / entry.count),
      Math.round(entry.g / entry.count),
      Math.round(entry.b / entry.count),
    ])
}

function nearestColor(palette, [r, g, b]) {
  let best = palette[0]
  let bestDistance = Infinity
  for (const candidate of palette) {
    const dr = r - candidate[0]
    const dg = g - candidate[1]
    const db = b - candidate[2]
    const distance = dr * dr + dg * dg + db * db
    if (distance < bestDistance) {
      bestDistance = distance
      best = candidate
    }
  }
  return best
}

function normalize(inputFile, outputFile, { grid, colors }) {
  const src = PNG.sync.read(fs.readFileSync(inputFile))
  const { blocks, blockW } = downsample(src, grid)
  const palette = buildPalette(blocks, colors)
  const out = new PNG({ width: WIDTH, height: HEIGHT })

  blocks.forEach((raw, index) => {
    const [r, g, b] = nearestColor(palette, raw)
    const bx = index % blockW
    const by = Math.floor(index / blockW)
    for (let dy = 0; dy < grid; dy += 1) {
      for (let dx = 0; dx < grid; dx += 1) {
        const offset = (WIDTH * (by * grid + dy) + (bx * grid + dx)) << 2
        out.data[offset] = r
        out.data[offset + 1] = g
        out.data[offset + 2] = b
        out.data[offset + 3] = 255
      }
    }
  })

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, PNG.sync.write(out, { colorType: 6 }))
  return { out, sourceSize: [src.width, src.height] }
}

function report(label, out, grid) {
  const seen = new Set()
  let maxLuma = 0
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const index = (WIDTH * y + x) << 2
      seen.add(`${out.data[index]},${out.data[index + 1]},${out.data[index + 2]}`)
      if (y >= TIME_BAND.y0 && y < TIME_BAND.y1 && x >= TIME_BAND.x0 && x < TIME_BAND.x1) {
        const luma =
          0.299 * out.data[index] + 0.587 * out.data[index + 1] + 0.114 * out.data[index + 2]
        if (luma > maxLuma) maxLuma = luma
      }
    }
  }
  console.log(
    `${label}: ${WIDTH}x${HEIGHT}, grid ${grid}, 色数 ${seen.size}, 時刻バンド最大輝度 ${Math.round(maxLuma)}`,
  )
  let ok = true
  if (maxLuma > TIME_BAND.maxLuma) {
    console.warn('  ⚠ 時刻バンドが明るすぎ → 白文字が読めない恐れ')
    ok = false
  }
  return ok
}

function main() {
  const { positional, options } = parseArgs(process.argv.slice(2))
  if (positional.length === 1) {
    throw new Error('出力先を指定してください: node tools/normalize-background.mjs in.png out.png')
  }

  let warnings = 0

  if (positional.length >= 2) {
    const [input, output] = positional
    if (!fs.existsSync(input)) throw new Error(`入力が見つかりません: ${input}`)
    const { out, sourceSize } = normalize(input, output, options)
    if (sourceSize[0] !== WIDTH || sourceSize[1] !== HEIGHT) {
      console.log(`  元画像 ${sourceSize[0]}x${sourceSize[1]} → ${WIDTH}x${HEIGHT} へリサンプル`)
    }
    if (!report(path.basename(output), out, options.grid)) warnings += 1
  } else {
    if (!fs.existsSync(SRC_ROOT)) {
      throw new Error(
        `${path.relative(ROOT, SRC_ROOT)} が見つかりません。Image Gen由来の元画像をそこへ置いてから再実行してください。`,
      )
    }
    const files = fs.readdirSync(SRC_ROOT).filter((file) => file.toLowerCase().endsWith('.png'))
    if (files.length === 0) {
      throw new Error(`${path.relative(ROOT, SRC_ROOT)} にPNGがありません。`)
    }
    for (const file of files.sort()) {
      const { out } = normalize(path.join(SRC_ROOT, file), path.join(DEST_ROOT, file), options)
      if (!report(file, out, options.grid)) warnings += 1
    }
    console.log(`\n${files.length}枚を ${path.relative(ROOT, DEST_ROOT)} へ出力しました。`)
  }

  if (warnings > 0) {
    console.warn(
      `\n${warnings}枚に警告があります。docs/background-image-gen-brief.md の§6を確認してください。`,
    )
  }
}

try {
  main()
} catch (error) {
  console.error(`エラー: ${error.message}`)
  process.exit(1)
}
