// 数字と英字の字形。「角字」（四角い字）のように、太さのそろった直線だけで組む。フォントは使わない。
// 1本の線は点の並び（0〜1 の座標。左上が 0,0）。closed: true の線は輪になる。
// 角はあとで少し切り落とし（chamfer）、家紋の線のような硬い印象にする。

const line = (...points) => ({ points, closed: false })
const loop = (...points) => ({ points, closed: true })

export const DIGIT_STROKES = Object.freeze({
  0: [loop([0, 0], [1, 0], [1, 1], [0, 1])],
  1: [line([0.15, 0], [0.58, 0], [0.58, 1]), line([0.15, 1], [1, 1])],
  2: [line([0, 0], [1, 0], [1, 0.5], [0, 0.5], [0, 1], [1, 1])],
  3: [line([0, 0], [1, 0], [1, 1], [0, 1]), line([0.3, 0.5], [1, 0.5])],
  4: [line([0, 0], [0, 0.62], [1, 0.62]), line([0.72, 0.28], [0.72, 1])],
  5: [line([1, 0], [0, 0], [0, 0.5], [1, 0.5], [1, 1], [0, 1])],
  6: [line([1, 0], [0, 0], [0, 1], [1, 1], [1, 0.5], [0, 0.5])],
  7: [line([0, 0.22], [0, 0], [1, 0], [1, 1])],
  8: [loop([0, 0], [1, 0], [1, 1], [0, 1]), line([0, 0.5], [1, 0.5])],
  9: [line([0, 1], [1, 1], [1, 0], [0, 0], [0, 0.5], [1, 0.5])],
})

// 曜日（SUN〜SAT）に使う英字だけ
export const LETTER_STROKES = Object.freeze({
  A: [line([0, 1], [0, 0], [1, 0], [1, 1]), line([0, 0.55], [1, 0.55])],
  D: [loop([0, 0], [0.65, 0], [1, 0.3], [1, 0.7], [0.65, 1], [0, 1])],
  E: [line([1, 0], [0, 0], [0, 1], [1, 1]), line([0, 0.5], [0.8, 0.5])],
  F: [line([1, 0], [0, 0], [0, 1]), line([0, 0.5], [0.8, 0.5])],
  H: [line([0, 0], [0, 1]), line([1, 0], [1, 1]), line([0, 0.5], [1, 0.5])],
  I: [line([0.5, 0], [0.5, 1]), line([0.15, 0], [0.85, 0]), line([0.15, 1], [0.85, 1])],
  M: [line([0, 1], [0, 0], [0.5, 0.45], [1, 0], [1, 1])],
  N: [line([0, 1], [0, 0], [1, 1], [1, 0])],
  O: [loop([0, 0], [1, 0], [1, 1], [0, 1])],
  R: [line([0, 1], [0, 0], [1, 0], [1, 0.5], [0, 0.5]), line([0.45, 0.5], [1, 1])],
  S: [line([1, 0], [0, 0], [0, 0.5], [1, 0.5], [1, 1], [0, 1])],
  T: [line([0, 0], [1, 0]), line([0.5, 0], [0.5, 1])],
  U: [line([0, 0], [0, 1], [1, 1], [1, 0])],
  W: [line([0, 0], [0, 1], [0.5, 0.55], [1, 1], [1, 0])],
})

// 日曜はじまり（shared/date.js の weekdayIndex と同じ並び）
export const WEEKDAYS = Object.freeze(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])

// 角を切り落とした点の並びにする。端の点（線の始まりと終わり）はそのまま
function chamfered(points, closed, c) {
  const out = []
  const n = points.length
  for (let i = 0; i < n; i += 1) {
    const isEnd = !closed && (i === 0 || i === n - 1)
    const p = points[i]
    if (isEnd || c <= 0) {
      out.push(p)
      continue
    }
    const prev = points[(i - 1 + n) % n]
    const next = points[(i + 1) % n]
    const toward = (q) => {
      const dx = q[0] - p[0]
      const dy = q[1] - p[1]
      const len = Math.hypot(dx, dy)
      const k = Math.min(c, len / 3) / len
      return [p[0] + dx * k, p[1] + dy * k]
    }
    out.push(toward(prev), toward(next))
  }
  return out
}

// 字を SVG の線にする。box は字を置く枠（px）。線の外側が枠にちょうど収まるよう、線の中心は太さの半分だけ内側を通る
export function strokePaths(strokes, { x = 0, y = 0, w, h, stroke, chamfer = 0, color }) {
  const half = stroke / 2
  const map = ([u, v]) => [x + half + u * (w - stroke), y + half + v * (h - stroke)]
  return strokes
    .map(({ points, closed }) => {
      const pts = chamfered(points.map(map), closed, chamfer)
      const d = pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`).join(' ') + (closed ? ' Z' : '')
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="miter" stroke-miterlimit="10" stroke-linecap="square"/>`
    })
    .join('')
}
