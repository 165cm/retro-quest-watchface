// 角丸ディスプレイの隅にUIがはみ出していないか検査する。
//
// Bip 6は角丸なので、矩形の画面いっぱいに座標を置くと四隅で内容が欠ける。
// Zepp OSのgetDeviceInfo()はwidth/height/screenShapeしか返さず角丸半径を公開していないため、
// 半径は実測に基づく想定値を使う。既定は保守的に大きめを取っている。
//
//   node tools/check-safe-area.mjs [--radius 90]
import { LAYOUT, SCREEN } from '../watchface/layout.js'

const DEFAULT_RADIUS = 90

function parseRadius(argv) {
  const index = argv.indexOf('--radius')
  if (index === -1) return DEFAULT_RADIUS
  const value = Number(argv[index + 1])
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('--radius には0以上の数値を指定してください')
  }
  return value
}

// 角丸の内側かどうか。四隅では円弧、それ以外は矩形で判定する。
function isInside(x, y, radius) {
  if (x < 0 || y < 0 || x > SCREEN.width || y > SCREEN.height) return false
  const corners = [
    [radius, radius, x < radius && y < radius],
    [SCREEN.width - radius, radius, x > SCREEN.width - radius && y < radius],
    [radius, SCREEN.height - radius, x < radius && y > SCREEN.height - radius],
    [
      SCREEN.width - radius,
      SCREEN.height - radius,
      x > SCREEN.width - radius && y > SCREEN.height - radius,
    ],
  ]
  for (const [cx, cy, applies] of corners) {
    if (!applies) continue
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2
  }
  return true
}

// その高さで内容を置ける最小x／最大x。
function safeXRange(y, radius) {
  let cy = null
  if (y < radius) cy = radius
  else if (y > SCREEN.height - radius) cy = SCREEN.height - radius
  if (cy === null) return [0, SCREEN.width]
  const dy = Math.abs(y - cy)
  if (dy > radius) return [radius, SCREEN.width - radius]
  const dx = Math.sqrt(radius ** 2 - dy ** 2)
  return [Math.ceil(radius - dx), Math.floor(SCREEN.width - radius + dx)]
}

// LAYOUT を再帰的に辿り、x/y/w/h を持つオブジェクトを矩形として集める。
function collectRects(node, trail, out) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectRects(item, `${trail}[${index}]`, out))
    return
  }
  if (!node || typeof node !== 'object') return
  const { x, y, w, h } = node
  if ([x, y, w, h].every((value) => typeof value === 'number')) {
    out.push({ name: trail, x, y, w, h })
  }
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'object' && value !== null) {
      collectRects(value, trail ? `${trail}.${key}` : key, out)
    }
  }
}

const radius = parseRadius(process.argv.slice(2))
const rects = []
collectRects(LAYOUT, '', rects)

// 画面いっぱいに敷く装飾は、角が丸く欠けても情報が失われないため許容する。
// 検査したいのは文字やアイコンなど「欠けたら困る中身」の方。
const FULL_BLEED = new Set(['background', 'topBar', 'bottomBar', 'copyScrim'])

console.log(`角丸半径 ${radius}px を想定して ${SCREEN.width}x${SCREEN.height} を検査します\n`)

let violations = 0
const clippedDecoration = []
for (const rect of rects) {
  if (FULL_BLEED.has(rect.name)) {
    clippedDecoration.push(rect.name)
    continue
  }
  const corners = [
    ['左上', rect.x, rect.y],
    ['右上', rect.x + rect.w, rect.y],
    ['左下', rect.x, rect.y + rect.h],
    ['右下', rect.x + rect.w, rect.y + rect.h],
  ]
  const bad = corners.filter(([, x, y]) => !isInside(x, y, radius))
  if (bad.length === 0) continue
  violations += 1
  console.log(`✗ ${rect.name}  (x${rect.x} y${rect.y} ${rect.w}x${rect.h})`)
  for (const [label, x, y] of bad) {
    const [minX, maxX] = safeXRange(y, radius)
    console.log(`    ${label}(${x}, ${y}) が角の外 → この高さで置けるxは ${minX}〜${maxX}`)
  }
}

if (clippedDecoration.length > 0) {
  console.log(
    `（全面装飾のため検査対象外: ${clippedDecoration.join(', ')}）\n`,
  )
}
console.log(`検査した矩形: ${rects.length - clippedDecoration.length} / はみ出し: ${violations}`)

if (violations === 0) {
  console.log('✓ すべて角丸の内側に収まっています')
} else {
  console.log('\n高さごとの安全なx範囲（目安）:')
  for (const y of [12, 20, 30, 40, 50, 60, 70, 380, 400, 420, 438]) {
    const [minX, maxX] = safeXRange(y, radius)
    console.log(`  y=${String(y).padStart(3)} → x ${String(minX).padStart(3)} 〜 ${maxX}`)
  }
  process.exit(1)
}
