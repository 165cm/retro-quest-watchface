// モンスター字形・中ボスのスプライトを検査する。
// 透過・寸法・アンチエイリアス・余白は、実機に載せてからでは直しにくい。
//
//   node tools/check-sprites.mjs art/monster-digits-src --expect 104x144 --names 0-9
//   node tools/check-sprites.mjs art/boss-src --expect 260x220 --names 00-12
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

function parseArgs(argv) {
  const options = { dir: null, expect: null, names: null }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--expect') {
      const match = /^(\d+)x(\d+)$/.exec(argv[i + 1] || '')
      if (!match) throw new Error('--expect は 104x144 の形式で指定してください')
      options.expect = [Number(match[1]), Number(match[2])]
      i += 1
    } else if (argv[i] === '--names') {
      const match = /^(\d+)-(\d+)$/.exec(argv[i + 1] || '')
      if (!match) throw new Error('--names は 0-9 の形式で指定してください')
      const width = match[1].length
      const from = Number(match[1])
      const to = Number(match[2])
      options.names = []
      for (let n = from; n <= to; n += 1) {
        options.names.push(`${String(n).padStart(width, '0')}.png`)
      }
      i += 1
    } else if (!options.dir) {
      options.dir = argv[i]
    }
  }
  if (!options.dir) throw new Error('検査するディレクトリを指定してください')
  return options
}

function analyse(png) {
  const { width, height, data } = png
  let opaque = 0
  let semi = 0
  let transparent = 0
  const colors = new Set()
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  let darkInk = 0

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2
      const a = data[i + 3]
      if (a === 0) {
        transparent += 1
        continue
      }
      if (a < 255) semi += 1
      else opaque += 1
      colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`)
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (luma < 40) darkInk += 1
    }
  }
  const inked = opaque + semi
  return {
    width,
    height,
    transparentRatio: transparent / (width * height),
    semiRatio: inked === 0 ? 0 : semi / inked,
    colors: colors.size,
    box: maxX < 0 ? null : { minX, minY, maxX, maxY },
    darkRatio: inked === 0 ? 0 : darkInk / inked,
  }
}

const options = parseArgs(process.argv.slice(2))
const dir = path.resolve(options.dir)
if (!fs.existsSync(dir)) {
  console.error(`エラー: ${options.dir} が見つかりません`)
  process.exit(1)
}

const present = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png')).sort()
const expected = options.names || present

console.log(`${options.dir} を検査します（${expected.length}枚を想定）\n`)

let problems = 0
const boxes = []

for (const name of expected) {
  const file = path.join(dir, name)
  if (!fs.existsSync(file)) {
    console.log(`✗ ${name} — ファイルがありません`)
    problems += 1
    continue
  }
  const png = PNG.sync.read(fs.readFileSync(file))
  const info = analyse(png)
  const issues = []

  if (options.expect) {
    const [w, h] = options.expect
    if (info.width !== w || info.height !== h) {
      issues.push(`寸法 ${info.width}x${info.height}（想定 ${w}x${h}）`)
    }
  }
  // 背景が焼き込まれていると透過率が極端に低くなる。
  if (info.transparentRatio < 0.05) {
    issues.push(`背景が透過していない（透明 ${(info.transparentRatio * 100).toFixed(0)}%）`)
  }
  // 半透明の画素が多い＝アンチエイリアスがかかっている。
  if (info.semiRatio > 0.06) {
    issues.push(`にじみが多い（半透明 ${(info.semiRatio * 100).toFixed(1)}%）`)
  }
  if (info.box) {
    const touches = []
    if (info.box.minX === 0) touches.push('左')
    if (info.box.minY === 0) touches.push('上')
    if (info.box.maxX === info.width - 1) touches.push('右')
    if (info.box.maxY === info.height - 1) touches.push('下')
    if (touches.length > 0) issues.push(`絵が端に接している（${touches.join('・')}）`)
    boxes.push({ name, ...info.box, width: info.width, height: info.height })
  } else {
    issues.push('中身が空です')
  }
  // 背景へ乗せたとき輪郭が消えないよう、黒縁が必要。
  if (info.darkRatio < 0.08) {
    issues.push(`黒縁が薄い（暗部 ${(info.darkRatio * 100).toFixed(0)}%）`)
  }

  if (issues.length === 0) {
    const b = info.box
    console.log(
      `✓ ${name.padEnd(8)} ${info.width}x${info.height} 色数${String(info.colors).padStart(3)} ` +
        `絵の範囲 ${b.maxX - b.minX + 1}x${b.maxY - b.minY + 1}`,
    )
  } else {
    problems += 1
    console.log(`✗ ${name.padEnd(8)} ${issues.join(' / ')}`)
  }
}

// 字形は大きさが揃っていないと、並べたとき凸凹して見える。
if (boxes.length > 1) {
  const heights = boxes.map((b) => b.maxY - b.minY + 1)
  const widths = boxes.map((b) => b.maxX - b.minX + 1)
  const spread = (values) => Math.max(...values) - Math.min(...values)
  console.log(
    `\n絵の高さ ${Math.min(...heights)}〜${Math.max(...heights)}（ばらつき ${spread(heights)}px） / ` +
      `幅 ${Math.min(...widths)}〜${Math.max(...widths)}（ばらつき ${spread(widths)}px）`,
  )
  const tallest = boxes[0].height
  if (spread(heights) > tallest * 0.12) {
    console.log('  ⚠ 高さのばらつきが大きく、並べたとき凸凹して見えます')
  }
}

console.log(`\n問題のあった枚数: ${problems} / ${expected.length}`)
process.exit(problems > 0 ? 1 : 0)
