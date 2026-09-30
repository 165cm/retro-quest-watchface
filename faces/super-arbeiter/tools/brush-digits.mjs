// SUPER ARBEITER の筆の数字（0〜9 と「:」）。1字ずつ、筆の運びを決めて作った独自の字形。
//
// 字形は 100×160 の枠で決める。1字は何本かの「画」でできていて、画は筆の通る点の並び
// [x, y, 太さ] で表す。点をなめらかにつなぎ、太さに合わせて左右にふくらませて、塗りつぶしの形にする。
// 入りは太く（筆を置いた所）、終わりは細く（払い）。最後に少し前へ傾ける。
//
// dry: true の画は、終わりの方に細いかすれを入れる（大きい時刻の数字だけで使う）。
// 形は毎回同じ（乱れも固定）。既存の書体やフォントは使っていない。

export const BOX = { w: 100, h: 160 }
export const SLANT = -8 // 前傾（度）

export const DIGIT_STROKES = {
  0: [
    { dry: true, points: [[64, 14, 20], [40, 16, 28], [23, 48, 33], [20, 96, 34], [30, 136, 30], [54, 148, 26], [76, 130, 28], [83, 88, 31], [79, 42, 28], [63, 15, 20], [48, 18, 10]] },
  ],
  1: [
    { points: [[24, 48, 12], [40, 34, 20], [58, 16, 26]] },
    { dry: true, points: [[58, 14, 34], [58, 58, 36], [56, 108, 34], [54, 148, 18]] },
  ],
  2: [
    { dry: true, points: [[20, 50, 16], [27, 24, 26], [50, 12, 30], [73, 22, 32], [79, 48, 32], [65, 80, 30], [42, 108, 28], [22, 138, 28]] },
    { points: [[20, 140, 28], [50, 134, 30], [78, 138, 24], [88, 136, 8]] },
  ],
  3: [
    { points: [[20, 34, 16], [38, 14, 26], [66, 14, 30], [82, 34, 32], [72, 62, 28], [46, 74, 20]] },
    { dry: true, points: [[44, 74, 18], [72, 80, 30], [86, 108, 34], [74, 140, 30], [46, 150, 26], [18, 136, 12]] },
  ],
  4: [
    { points: [[58, 12, 20], [34, 56, 20], [8, 106, 22]] },
    { points: [[6, 108, 22], [50, 106, 24], [88, 108, 20], [96, 106, 8]] },
    { dry: true, points: [[72, 24, 30], [72, 78, 32], [70, 122, 30], [68, 152, 16]] },
  ],
  5: [
    { points: [[32, 18, 24], [60, 14, 28], [84, 18, 20], [94, 16, 8]] },
    { points: [[34, 16, 26], [30, 48, 28], [27, 72, 22]] },
    { dry: true, points: [[27, 72, 20], [52, 60, 28], [78, 76, 34], [84, 108, 34], [72, 140, 30], [44, 150, 26], [16, 136, 12]] },
  ],
  6: [
    { dry: true, points: [[80, 20, 14], [58, 10, 20], [32, 28, 28], [18, 68, 30], [18, 110, 30], [32, 144, 26], [58, 152, 24], [82, 134, 26], [88, 104, 24], [72, 78, 20], [44, 78, 18], [22, 100, 12]] },
  ],
  7: [
    { points: [[14, 22, 22], [50, 16, 28], [88, 20, 26]] },
    { dry: true, points: [[88, 20, 28], [72, 56, 30], [56, 98, 32], [46, 148, 20]] },
  ],
  8: [
    { dry: true, points: [[78, 34, 16], [56, 8, 20], [26, 18, 22], [22, 48, 22], [50, 70, 26], [80, 92, 28], [86, 124, 28], [62, 152, 24], [32, 150, 24], [14, 122, 26], [26, 92, 24], [52, 72, 22], [78, 52, 18], [78, 30, 12]] },
  ],
}
// 9 は 6 を180度まわした形
DIGIT_STROKES[9] = DIGIT_STROKES[6].map((stroke) => ({
  ...stroke,
  points: stroke.points.map(([x, y, w]) => [BOX.w - x, BOX.h - y, w]),
}))

// 「:」は、少しいびつな2つの点（枠 36×160）
export const COLON_BOX = { w: 36, h: 160 }
export const COLON_DOTS = [
  { cx: 20, cy: 60, rx: 11, ry: 10, rot: -25 },
  { cx: 17, cy: 116, rx: 12, ry: 10, rot: -12 },
]

// 決まった順に同じ乱数を出す（字形の乱れを毎回同じにする）
function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

// 点の並びをなめらかにつなぐ（Catmull-Rom）。太さも同じようにつなぐ
function smooth(points, steps = 10) {
  const out = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    for (let s = 0; s < steps; s += 1) {
      const t = s / steps
      const t2 = t * t
      const t3 = t2 * t
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), p1[2] + (p2[2] - p1[2]) * t])
    }
  }
  out.push(points[points.length - 1])
  return out
}

function fmt(n) {
  return n.toFixed(1)
}

// 1本の画の輪郭の点（ring）と、入りの丸（start = [x, y, 太さ]）
function strokeGeometry(points, seed = 1, rough = 0.9) {
  const line = smooth(points)
  const rnd = random(seed)
  const phaseL = rnd() * 6.28
  const phaseR = rnd() * 6.28
  const left = []
  const right = []
  line.forEach(([x, y, w], i) => {
    const a = line[Math.max(0, i - 1)]
    const b = line[Math.min(line.length - 1, i + 1)]
    let dx = b[0] - a[0]
    let dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len
    const half = w / 2
    // ふちの乱れは、ゆるやかな波＋ごく小さなばらつき（ガタガタにしない）
    const jl = rough * (Math.sin(i * 0.33 + phaseL) + (rnd() - 0.5) * 0.4)
    const jr = rough * (Math.sin(i * 0.29 + phaseR) + (rnd() - 0.5) * 0.4)
    left.push([x - dy * (half + jl), y + dx * (half + jl)])
    right.push([x + dy * (half + jr), y - dx * (half + jr)])
  })
  return { ring: [...left, ...right.reverse()], start: line[0] }
}

// 1本の画を、塗りつぶしの形（path の d）にする。入りは丸く太く、終わりは払う
export function strokeOutline(points, seed = 1, rough = 0.9) {
  const { ring, start: [sx, sy, sw] } = strokeGeometry(points, seed, rough)
  const d = `M${ring.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L')} Z`
  // 入りの丸み（筆を置いた所）
  const start = `M${fmt(sx - sw / 2)} ${fmt(sy)} a${fmt(sw / 2)} ${fmt(sw / 2)} 0 1 0 ${fmt(sw)} 0 a${fmt(sw / 2)} ${fmt(sw / 2)} 0 1 0 ${fmt(-sw)} 0 Z`
  return `${d} ${start}`
}

// かすれ：画の終わりの方に、筆の向きにそった細いすき間を数本入れる
export function dryStreaks(points, seed = 1) {
  const line = smooth(points)
  const rnd = random(seed * 31 + 7)
  const from = Math.floor(line.length * 0.62)
  const streaks = []
  for (let k = 0; k < 2; k += 1) {
    const offset = (rnd() - 0.5) * 0.7
    const begin = from + Math.floor(rnd() * 6)
    const seg = line.slice(begin, Math.min(line.length - 2, begin + 8 + Math.floor(rnd() * 8)))
    if (seg.length < 2) continue
    const pts = seg.map(([x, y, w], i) => {
      const a = line[Math.max(0, begin + i - 1)]
      const b = line[Math.min(line.length - 1, begin + i + 1)]
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const nx = -(b[1] - a[1]) / len
      const ny = (b[0] - a[0]) / len
      return [x + nx * w * offset, y + ny * w * offset]
    })
    streaks.push(`M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(' L')}`)
  }
  return streaks
}

// 1字の SVG の中身（100×160 の枠の座標）。
// dry=false なら、かすれを入れない。weight は画の太さの倍率、slant は前傾（度）
export function digitBody(digit, color, { dry = true, id = 'd', weight = 1, slant = SLANT } = {}) {
  const strokes = DIGIT_STROKES[digit].map((s) => ({ ...s, points: s.points.map(([x, y, w]) => [x, y, w * weight]) }))
  const shapes = strokes.map((s, i) => `<path d="${strokeOutline(s.points, digit * 10 + i + 1)}" fill="${color}"/>`).join('')
  const lean = Math.tan((slant * Math.PI) / 180)
  const shift = fmt(-lean * (BOX.h / 2) + centerShift(digit, { weight, slant }))
  if (!dry) return `<g transform="translate(${shift} 0) skewX(${slant})">${shapes}</g>`
  const streaks = strokes
    .filter((s) => s.dry)
    .flatMap((s, i) => dryStreaks(s.points, digit * 10 + i + 1))
    .map((d) => `<path d="${d}" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"/>`)
    .join('')
  return (
    `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="200">` +
    `<rect x="-20" y="-20" width="140" height="200" fill="#fff"/>${streaks}</mask></defs>` +
    `<g transform="translate(${shift} 0) skewX(${slant})"><g mask="url(#${id})">${shapes}</g></g>`
  )
}

export function colonBody(color, { weight = 1, slant = SLANT } = {}) {
  const lean = Math.tan((slant * Math.PI) / 180)
  return COLON_DOTS.map(({ cx, cy, rx, ry, rot }) => {
    const x = fmt(cx + lean * (cy - BOX.h / 2) * -1)
    return `<ellipse cx="${x}" cy="${cy}" rx="${fmt(rx * weight)}" ry="${fmt(ry * weight)}" transform="rotate(${rot} ${x} ${cy})" fill="${color}"/>`
  }).join('')
}

// ---------- 書き出す枠（切れないように） ----------
// 太さ・前傾・入りの丸み・ふちの乱れを入れたあとの、実際の輪郭の範囲を計算する。
// 0〜9 に共通の枠を使うので、どの数字も同じ縮尺・同じ基準線になる。

// 「/」と「-」の画（100×160 の枠）
export const SLASH_STROKE = [[62, 16, 20], [44, 80, 18], [24, 146, 12]]
export const MINUS_STROKE = [[20, 82, 22], [80, 80, 20]]

function weighted(points, weight) {
  return points.map(([x, y, w]) => [x, y, w * weight])
}

function skewX(x, y, slant) {
  return x + Math.tan((slant * Math.PI) / 180) * (y - BOX.h / 2)
}

function boundsOfStrokes(strokes, seedBase, { weight = 1, slant = SLANT } = {}) {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  const add = (x, y) => {
    const sx = skewX(x, y, slant)
    b.x0 = Math.min(b.x0, sx)
    b.x1 = Math.max(b.x1, sx)
    b.y0 = Math.min(b.y0, y)
    b.y1 = Math.max(b.y1, y)
  }
  strokes.forEach((points, i) => {
    const { ring, start } = strokeGeometry(weighted(points, weight), seedBase + i + 1)
    ring.forEach(([x, y]) => add(x, y))
    const [cx, cy, w] = start
    for (let k = 0; k < 16; k += 1) {
      const a = (k / 16) * Math.PI * 2
      add(cx + (Math.cos(a) * w) / 2, cy + (Math.sin(a) * w) / 2)
    }
  })
  return b
}

function rawDigitBounds(digit, style = {}) {
  return boundsOfStrokes(DIGIT_STROKES[digit].map((s) => s.points), digit * 10, style)
}

// 数字ごとに、横の真ん中が枠の真ん中（x=50）に来るようにずらす量
export function centerShift(digit, style = {}) {
  const b = rawDigitBounds(digit, style)
  return BOX.w / 2 - (b.x0 + b.x1) / 2
}

// 横のずらしを入れたあとの、数字の輪郭の範囲
export function digitBounds(digit, style = {}) {
  const b = rawDigitBounds(digit, style)
  const dx = centerShift(digit, style)
  return { x0: b.x0 + dx, x1: b.x1 + dx, y0: b.y0, y1: b.y1 }
}

export function colonBounds({ weight = 1, slant = SLANT } = {}) {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  for (const { cx, cy, rx, ry } of COLON_DOTS) {
    const x = skewX(cx, cy, slant)
    const r = Math.max(rx, ry) * weight
    b.x0 = Math.min(b.x0, x - r)
    b.x1 = Math.max(b.x1, x + r)
    b.y0 = Math.min(b.y0, cy - r)
    b.y1 = Math.max(b.y1, cy + r)
  }
  return b
}

// 画像1枚の大きさ（w×h）に合わせて、切れない viewBox を決める。
// 0〜9 をすべて囲む範囲に余白をつけ、画像にちょうど収まる縮尺にする。
// squeeze（1 以下）で横だけ細く描ける（細い枠の中で、字を縦に大きく使うため）。
// 「:」「/」「-」は数字と同じ縮尺・同じ上下の範囲にして、幅だけそれぞれの画像に合わせる。
// 余白は画像の上で最低 minPadPx（px）とる（小さい画像ほど、字形の単位では大きな余白になる）
export function exportViews(spec, style, minPadPx = 2) {
  const squeeze = style.squeeze || 1
  const all = Array.from({ length: 10 }, (_, d) => digitBounds(d, style))
  const u = {
    x0: Math.min(...all.map((b) => b.x0)),
    x1: Math.max(...all.map((b) => b.x1)),
    y0: Math.min(...all.map((b) => b.y0)),
    y1: Math.max(...all.map((b) => b.y1)),
  }
  const inkW = u.x1 - u.x0
  const inkH = u.y1 - u.y0
  // 縦の縮尺 sy（px／単位）、横は sx = sy × squeeze。余白を入れて少しずつ近づけて決める
  let padX = 4
  let padY = 4
  let sy = 1
  for (let i = 0; i < 6; i += 1) {
    sy = Math.min(spec.h / (inkH + padY * 2), spec.w / ((inkW + padX * 2) * squeeze))
    padY = Math.max(4, minPadPx / sy)
    padX = Math.max(4, minPadPx / (sy * squeeze))
  }
  const sx = sy * squeeze
  const vw = spec.w / sx
  const vh = spec.h / sy
  const cx = (u.x0 + u.x1) / 2
  const y0 = (u.y0 + u.y1) / 2 - vh / 2
  const view = (centerX, widthPx) => {
    const w = widthPx / sx
    return { x: centerX - w / 2, y: y0, w, h: vh }
  }
  const center = (b) => (b.x0 + b.x1) / 2
  return {
    sx,
    sy,
    digit: { x: cx - vw / 2, y: y0, w: vw, h: vh },
    colon: spec.colonW ? view(center(colonBounds(style)), spec.colonW) : null,
    slash: spec.slashW ? view(center(boundsOfStrokes([SLASH_STROKE], 91, style)), spec.slashW) : null,
    minus: view(center(boundsOfStrokes([MINUS_STROKE], 90, style)), Math.round(spec.w * 0.7)),
  }
}

export function viewBoxText(v) {
  return `${fmt(v.x)} ${fmt(v.y)} ${fmt(v.w)} ${fmt(v.h)}`
}

// 「/」と「-」の SVG の中身（数字と同じ太さ・前傾）
export function slashBody(color, { weight = 1, slant = SLANT } = {}) {
  const lean = Math.tan((slant * Math.PI) / 180)
  return `<g transform="translate(${fmt(-lean * (BOX.h / 2))} 0) skewX(${slant})"><path d="${strokeOutline(weighted(SLASH_STROKE, weight), 92)}" fill="${color}"/></g>`
}

export function minusBody(color, { weight = 1, slant = SLANT } = {}) {
  const lean = Math.tan((slant * Math.PI) / 180)
  return `<g transform="translate(${fmt(-lean * (BOX.h / 2))} 0) skewX(${slant})"><path d="${strokeOutline(weighted(MINUS_STROKE, weight), 91)}" fill="${color}"/></g>`
}
