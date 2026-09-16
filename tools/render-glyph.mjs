// 字形のポリラインから、アンチエイリアスの効いた文字画像を起こす。
//
// 各画素で「最も近い線までの距離」を求め、そのしきい値で本体・縁取り・影を
// 塗り分ける。距離が連続値なので、出力サイズを変えても輪郭は滑らかなまま。
// ドット格子を拡大する方式と違い、拡大率がジャギーの粗さにならない。
import { PNG } from 'pngjs'
import { GLYPH_ASPECT, GLYPH_STROKES } from './glyph-paths.mjs'

// 距離場の解像度を上げても輪郭は既に滑らかなので、スーパーサンプルは1で足りる。
// 画素中心で評価するためのオフセット。
const PIXEL_CENTER = 0.5

// 数字の標準字幅（字面高さに対する比）。等幅で並べるので全数字で共通。
const DEFAULT_ASPECT = 0.72

function parseHex(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

// 点と線分の距離。線分が退化している（点）場合も同じ式で扱える。
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  let t = 0
  if (lengthSquared > 0) {
    t = ((px - ax) * dx + (py - ay) * dy) / lengthSquared
    if (t < 0) t = 0
    else if (t > 1) t = 1
  }
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function distanceToStrokes(strokes, px, py) {
  let best = Infinity
  for (const points of strokes) {
    if (points.length === 1) {
      const d = Math.hypot(px - points[0][0], py - points[0][1])
      if (d < best) best = d
      continue
    }
    for (let i = 0; i < points.length - 1; i += 1) {
      const d = distanceToSegment(
        px,
        py,
        points[i][0],
        points[i][1],
        points[i + 1][0],
        points[i + 1][1],
      )
      if (d < best) best = d
    }
  }
  return best
}

// 距離 d が半径 r の内側にどれだけ入っているかを 0..1 で返す。
// 1画素ぶんの幅で線形に落とすだけで、目で見て十分な滑らかさが出る。
function coverage(d, r) {
  const t = r - d + PIXEL_CENTER
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t
}

function overlay(target, index, rgb, alpha) {
  if (alpha <= 0) return
  const inverse = 1 - alpha
  target[index] = Math.round(rgb[0] * alpha + target[index] * inverse)
  target[index + 1] = Math.round(rgb[1] * alpha + target[index + 1] * inverse)
  target[index + 2] = Math.round(rgb[2] * alpha + target[index + 2] * inverse)
  target[index + 3] = Math.round(255 * alpha + target[index + 3] * inverse)
}

function mixHex(from, to, t) {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ]
}

/**
 * 1文字を描く。
 *
 * @param {string} name        GLYPH_STROKES のキー
 * @param {object} options
 *   width, height   出力画素数
 *   inkHeight       字面の高さ（画素）。行間の基準になるので明示的に渡す
 *   baselineY       字面の下端（画素）
 *   weight          線幅（inkHeight に対する比）
 *   fillTop/fillBottom  本体の縦グラデーション
 *   outline         縁取りの色
 *   outlineWidth    縁取りの太さ（画素）
 *   shadow          影の色（省略で影なし）
 *   shadowOffset    影のずれ [dx, dy]（画素）
 *   shadowAlpha     影の濃さ
 */
export function renderGlyph(name, options) {
  const {
    width,
    height,
    inkHeight,
    baselineY,
    aspect,
    weight = 0.155,
    fillTop = '#ffffff',
    fillBottom = '#ffffff',
    outline = '#101828',
    outlineWidth = 0,
    shadow = null,
    shadowOffset = [0, 0],
    shadowAlpha = 0.45,
  } = options

  const strokes = GLYPH_STROKES[name]
  if (!strokes) throw new Error(`Unknown glyph: ${name}`)

  const png = new PNG({ width, height })
  png.data.fill(0)

  // 字形は縦横で別倍率に伸ばす（数字は正方形ではない）。距離を「字形座標で
  // 測ってから拡大」すると縦横で線幅が変わってしまうので、先に点を画素座標へ
  // 移し、距離は最初から画素で測る。こうすれば線幅は全方向で一定になる。
  const inkWidth = inkHeight * (aspect ?? GLYPH_ASPECT[name] ?? DEFAULT_ASPECT)
  const originX = (width - inkWidth) / 2
  const originY = baselineY - inkHeight
  const half = (weight * inkHeight) / 2

  const placed = strokes.map((points) =>
    points.map(([px, py]) => [originX + px * inkWidth, originY + py * inkHeight]),
  )

  const top = parseHex(fillTop)
  const bottom = parseHex(fillBottom)
  const outlineRgb = parseHex(outline)
  const shadowRgb = shadow ? parseHex(shadow) : null

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4

      if (shadowRgb) {
        const sd = distanceToStrokes(
          placed,
          x - shadowOffset[0],
          y - shadowOffset[1],
        )
        const sa = coverage(sd, half + outlineWidth)
        if (sa > 0) overlay(png.data, index, shadowRgb, sa * shadowAlpha)
      }

      const d = distanceToStrokes(placed, x, y)

      if (outlineWidth > 0) {
        const oa = coverage(d, half + outlineWidth)
        if (oa > 0) overlay(png.data, index, outlineRgb, oa)
      }

      const fa = coverage(d, half)
      if (fa > 0) {
        const t = Math.min(1, Math.max(0, (y - originY) / inkHeight))
        overlay(png.data, index, mixHex(top, bottom, t), fa)
      }
    }
  }

  return png
}
