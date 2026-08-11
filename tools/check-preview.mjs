// ストア提出用プレビュー画像が審査要件を満たしているか検査する。
//
// 2026-08にZeppの審査で "The four corners need to be removed" として
// 却下された。提出した画像が266x307の縮小サムネイルで、四隅が不透明な
// 直角のままだったのが原因。以後、アップロード前にこの検査を通す。
//
// 審査要件（tools/generate-assets.mjs のプレビュー生成と対で管理する）:
//   1. 画面解像度と同じ寸法（390x450）
//   2. 端末の角丸に合わせて四隅が透過している
//   3. 時刻が 10:09
//
// 3番目は画像から機械的に判定できないため、目視確認の項目として表示する。
//
//   node tools/check-preview.mjs [ファイル ...] [--radius 105]
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import { SCREEN } from '../watchface/layout.js'

const DEFAULT_TARGETS = [
  'docs/store-preview-390x450.png',
  'assets/bip-6/images/preview.png',
]

function parseRadius(argv) {
  const index = argv.indexOf('--radius')
  if (index === -1) return SCREEN.cornerRadius
  const value = Number(argv[index + 1])
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('--radius には0以上の数値を指定してください')
  }
  return value
}

function parseTargets(argv) {
  const files = argv.filter((arg, index) => {
    if (arg.startsWith('--')) return false
    if (argv[index - 1] === '--radius') return false
    return true
  })
  return files.length > 0 ? files : DEFAULT_TARGETS
}

// 角丸の境界からの符号つき距離。正なら外側。
function cornerDistance(x, y, w, h, radius) {
  const cx = x < radius ? radius : x > w - radius ? w - radius : x
  const cy = y < radius ? radius : y > h - radius ? h - radius : y
  if (cx === x && cy === y) return -radius
  return Math.hypot(x - cx, y - cy) - radius
}

// 生成側は境界を1画素ぶんの距離場でぼかしている（拡大表示で階段状に
// ならないようにするため）。この帯の半透明画素は正常なので許容し、
// 「完全に不透明な画素」と「帯より外まではみ出した画素」だけを弾く。
const FEATHER = 1

function inspect(file, radius) {
  const problems = []
  const png = PNG.sync.read(fs.readFileSync(file))
  const alpha = (x, y) => png.data[((png.width * y + x) << 2) + 3]

  if (png.width !== SCREEN.width || png.height !== SCREEN.height) {
    problems.push(
      `寸法が ${png.width}x${png.height}。画面解像度と同じ ${SCREEN.width}x${SCREEN.height} が必要`,
    )
  }
  if (png.colorType !== 6) {
    problems.push(
      `カラータイプが ${png.colorType}。透過を持てるRGBA(6)で書き出す必要がある`,
    )
  }

  // 四隅の1画素。ここが不透明なら審査で確実に弾かれる。
  const corners = [
    ['左上', 0, 0],
    ['右上', png.width - 1, 0],
    ['左下', 0, png.height - 1],
    ['右下', png.width - 1, png.height - 1],
  ]
  const opaqueCorners = corners.filter(([, x, y]) => alpha(x, y) !== 0)
  if (opaqueCorners.length > 0) {
    problems.push(
      `四隅が不透明: ${opaqueCorners.map(([name]) => name).join('、')}（角の切り抜きが未適用）`,
    )
  }

  // 角の外側に残った画素を数える。切り抜き半径が小さすぎる場合に効く。
  let opaque = 0
  let beyondFeather = 0
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const d = cornerDistance(x + 0.5, y + 0.5, png.width, png.height, radius)
      if (d <= 0 || alpha(x, y) === 0) continue
      if (alpha(x, y) === 255) opaque += 1
      if (d > FEATHER) beyondFeather += 1
    }
  }
  if (opaque > 0) {
    problems.push(`角丸の外側に完全不透明な画素が ${opaque} 個ある（半径 ${radius}px で判定）`)
  }
  if (beyondFeather > 0) {
    problems.push(
      `角丸の外側 ${FEATHER}px を超えて色が残っている画素が ${beyondFeather} 個ある（切り抜き半径が小さい）`,
    )
  }

  // 中央が透過していたら、切り抜きすぎか生成の失敗。
  if (alpha(png.width >> 1, png.height >> 1) !== 255) {
    problems.push('画像の中央が透過している。切り抜き半径が大きすぎる可能性がある')
  }

  return problems
}

const radius = parseRadius(process.argv.slice(2))
const targets = parseTargets(process.argv.slice(2))

console.log(`角丸半径 ${radius}px を想定して提出用プレビューを検査します\n`)

let failed = 0
for (const target of targets) {
  const file = path.resolve(process.cwd(), target)
  if (!fs.existsSync(file)) {
    console.log(`✗ ${target}\n    ファイルがありません。先に npm run assets を実行してください\n`)
    failed += 1
    continue
  }
  const problems = inspect(file, radius)
  if (problems.length === 0) {
    console.log(`✓ ${target}`)
  } else {
    failed += 1
    console.log(`✗ ${target}`)
    problems.forEach((problem) => console.log(`    - ${problem}`))
  }
  console.log('')
}

if (failed > 0) {
  console.error(`${failed} 件の問題があります。修正するまで提出しないでください。`)
  process.exit(1)
}

console.log('自動判定できる要件はすべて満たしています。')
console.log('提出前に目視で確認する項目:')
console.log('  - 時刻が 10:09 になっているか')
console.log('  - 実機の見た目と一致しているか（古いデザインの画像を出していないか）')
