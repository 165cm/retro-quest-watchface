// 輪の中に置く紋の形（SVG）。どれも昔からある紋の「形の種類」を、この文字盤のために新しく描いたもの。
// 実在の家の紋を写したものではない。菊・桐・葵・卍・丸に十字・武田菱・三つ鱗・亀甲は使わない。
// 関数はどれも、中心 (cx, cy)・半径 R の円に収まる形を、color の1色で返す（くり抜きは黒ではなく mask で抜く）。

const f = (n) => Number(n).toFixed(2)
const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)]
}
const pts = (list) => list.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ')

// くり抜き（mask）つきで描く。cut は黒で描く抜きの形
function masked(id, cx, cy, R, color, shape, cut = '') {
  const box = `x="${f(cx - R - 4)}" y="${f(cy - R - 4)}" width="${f(2 * R + 8)}" height="${f(2 * R + 8)}"`
  return `<mask id="${id}" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#000"/><g fill="#fff" stroke="#fff">${shape}</g><g fill="#000" stroke="#000">${cut}</g></mask><rect ${box} fill="${color}" mask="url(#${id})"/>`
}

function diamond(x, y, rx, ry, angle) {
  return `<path d="M0 ${-ry} L${rx} 0 L0 ${ry} L${-rx} 0 Z" transform="translate(${f(x)} ${f(y)}) rotate(${angle})" stroke="none"/>`
}

// 七宝：正方形から四隅の円をくり抜いた四つ星と、その先を通る円。まん中に花菱をくり抜く
function shippo(cx, cy, R, color) {
  const sw = Math.round(R * 0.107)
  let shape = `<rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" stroke="none"/>`
  let cut = ''
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) cut += `<circle cx="${cx + dx * R}" cy="${cy + dy * R}" r="${R}" stroke="none"/>`
  for (let i = 0; i < 4; i += 1) {
    const [x, y] = polar(cx, cy, R * 0.2, i * 90)
    cut += diamond(x, y, R * 0.1, R * 0.15, i * 90)
  }
  const star = masked('shippo', cx, cy, R, color, shape, cut)
  return star + `<circle cx="${cx}" cy="${cy}" r="${R - sw / 2}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
}

// 蜻蛉（とんぼ）：上から見た姿。前にしか飛ばない「勝ち虫」
function tombo(cx, cy, R, color) {
  let shape = ''
  const wing = (dx, dy, len, w, angle) =>
    `<ellipse cx="${f(cx + dx)}" cy="${f(cy + dy)}" rx="${f(len)}" ry="${f(w)}" transform="rotate(${angle} ${f(cx + dx)} ${f(cy + dy)})" stroke="none"/>`
  // 羽：前の2枚は少し上向き、後ろの2枚は少し下向き
  shape += wing(-R * 0.5, -R * 0.36, R * 0.46, R * 0.13, -8) + wing(R * 0.5, -R * 0.36, R * 0.46, R * 0.13, 8)
  shape += wing(-R * 0.46, -R * 0.08, R * 0.42, R * 0.12, 10) + wing(R * 0.46, -R * 0.08, R * 0.42, R * 0.12, -10)
  // 頭・胸・長い胴
  shape += `<circle cx="${cx}" cy="${f(cy - R * 0.72)}" r="${f(R * 0.14)}" stroke="none"/>`
  shape += `<ellipse cx="${cx}" cy="${f(cy - R * 0.36)}" rx="${f(R * 0.11)}" ry="${f(R * 0.22)}" stroke="none"/>`
  shape += `<rect x="${f(cx - R * 0.055)}" y="${f(cy - R * 0.18)}" width="${f(R * 0.11)}" height="${f(R * 1.1)}" rx="${f(R * 0.05)}" stroke="none"/>`
  // 目と、胴の節・羽の筋をくり抜く
  let cut = `<circle cx="${f(cx - R * 0.07)}" cy="${f(cy - R * 0.75)}" r="${f(R * 0.035)}" stroke="none"/><circle cx="${f(cx + R * 0.07)}" cy="${f(cy - R * 0.75)}" r="${f(R * 0.035)}" stroke="none"/>`
  for (let k = 0; k < 5; k += 1) cut += `<rect x="${f(cx - R * 0.08)}" y="${f(cy + R * (0.05 + k * 0.17))}" width="${f(R * 0.16)}" height="${f(R * 0.025)}" stroke="none"/>`
  for (const [dx, dy, len, angle] of [[-0.5, -0.36, 0.34, -8], [0.5, -0.36, 0.34, 8], [-0.46, -0.08, 0.3, 10], [0.46, -0.08, 0.3, -10]]) {
    cut += `<rect x="${f(cx + R * dx - R * len)}" y="${f(cy + R * dy - R * 0.012)}" width="${f(2 * R * len)}" height="${f(R * 0.024)}" transform="rotate(${angle} ${f(cx + R * dx)} ${f(cy + R * dy)})" stroke="none"/>`
  }
  return masked('tombo', cx, cy, R, color, shape, cut)
}

// 並び鷹の羽：2本の鷹の羽を並べる。羽の黒い斑（ふ）を帯でくり抜く
function taka(cx, cy, R, color) {
  let shape = ''
  let cut = ''
  for (const side of [-1, 1]) {
    const x = cx + side * R * 0.3
    const top = cy - R * 0.92
    const bottom = cy + R * 0.72
    const w = R * 0.24
    // 羽の形（上がとがった細長い葉の形）
    shape += `<path d="M${f(x)} ${f(top)} C${f(x + w * 1.1)} ${f(top + R * 0.35)} ${f(x + w)} ${f(bottom - R * 0.25)} ${f(x + w * 0.5)} ${f(bottom)} L${f(x - w * 0.5)} ${f(bottom)} C${f(x - w)} ${f(bottom - R * 0.25)} ${f(x - w * 1.1)} ${f(top + R * 0.35)} ${f(x)} ${f(top)} Z" stroke="none"/>`
    // 羽の軸（下に少し出る）
    shape += `<rect x="${f(x - R * 0.025)}" y="${f(bottom - 2)}" width="${f(R * 0.05)}" height="${f(R * 0.2)}" stroke="none"/>`
    // 軸の線と、斑の帯（斜め）
    cut += `<rect x="${f(x - R * 0.012)}" y="${f(top + R * 0.2)}" width="${f(R * 0.024)}" height="${f(bottom - top - R * 0.2)}" stroke="none"/>`
    for (let k = 0; k < 3; k += 1) {
      const y = top + R * (0.5 + k * 0.4)
      cut += `<path d="${pts([[x - w * 1.2, y], [x, y - R * 0.12], [x + w * 1.2, y], [x + w * 1.2, y + R * 0.12], [x, y], [x - w * 1.2, y + R * 0.12]])} Z" stroke="none"/>`
    }
  }
  return masked('taka', cx, cy, R, color, shape, cut)
}

// 竹：まっすぐな幹と節、左右に3枚ずつの笹の葉
function take(cx, cy, R, color) {
  let shape = `<rect x="${f(cx - R * 0.08)}" y="${f(cy - R * 0.95)}" width="${f(R * 0.16)}" height="${f(R * 1.9)}" rx="${f(R * 0.03)}" stroke="none"/>`
  let cut = ''
  for (const y of [-0.45, 0.05, 0.55]) {
    cut += `<rect x="${f(cx - R * 0.1)}" y="${f(cy + R * y)}" width="${f(R * 0.2)}" height="${f(R * 0.035)}" stroke="none"/>`
  }
  const leaf = (x, y, len, w, angle) =>
    `<path d="M0 0 C${f(len * 0.3)} ${f(-w)} ${f(len * 0.75)} ${f(-w * 0.7)} ${f(len)} 0 C${f(len * 0.75)} ${f(w * 0.7)} ${f(len * 0.3)} ${f(w)} 0 0 Z" transform="translate(${f(x)} ${f(y)}) rotate(${angle})" stroke="none"/>`
  for (const side of [-1, 1]) {
    const bx = cx + side * R * 0.06
    const by = cy + side * R * 0.18 - R * 0.2
    for (const [angle, len] of [[-30, 0.8], [0, 0.88], [30, 0.74]]) {
      shape += leaf(bx, by, R * len, R * 0.14, side === 1 ? angle : 180 - angle)
    }
  }
  return masked('take', cx, cy, R, color, shape, cut)
}

// 青海波：重なる半円の波を、円の中に敷きつめる
function nami(cx, cy, R, color) {
  const r = R * 0.34
  let shape = ''
  let cut = ''
  const rows = []
  for (let row = -4; row <= 5; row += 1) {
    const y = cy + row * r * 0.5
    const offset = row % 2 === 0 ? 0 : r
    for (let col = -4; col <= 4; col += 1) rows.push([cx + col * 2 * r + offset, y])
  }
  // 上の段から順に、円（塗り）→ 内側の輪（抜き）を重ねると、波の模様になる
  let layers = ''
  for (const [x, y] of rows) {
    layers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fff" stroke="none"/>`
    for (const k of [0.78, 0.5]) layers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * k)}" fill="none" stroke="#000" stroke-width="${f(r * 0.12)}"/>`
    layers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="none" stroke="#000" stroke-width="${f(r * 0.1)}"/>`
  }
  const id = 'nami'
  const box = `x="${f(cx - R - 4)}" y="${f(cy - R - 4)}" width="${f(2 * R + 8)}" height="${f(2 * R + 8)}"`
  shape = `<clipPath id="${id}-clip"><circle cx="${cx}" cy="${cy}" r="${f(R * 0.9)}"/></clipPath>`
  const ring = `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.95)}" fill="none" stroke="${color}" stroke-width="${f(R * 0.09)}"/>`
  return `${shape}<mask id="${id}" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#000"/><g clip-path="url(#${id}-clip)">${layers}</g></mask><rect ${box} fill="${color}" mask="url(#${id})"/>${ring}${cut}`
}

// 三つ巴：頭が丸く、尾が外側の円にそって細くなる「巴」を3つ回す
function tomoe(cx, cy, R, color) {
  const h = R * 0.3 // 頭の半径
  const sweep = 88 // 尾の長さ（度）。頭のふくらみと合わせて、となりの巴にぶつからない長さ
  let shape = ''
  for (let k = 0; k < 3; k += 1) {
    const base = k * 120
    const a = (base * Math.PI) / 180
    const u = [Math.sin(a), -Math.cos(a)] // 中心から外へ
    const v = [Math.cos(a), Math.sin(a)] // 時計回りの向き
    const path = []
    // 外側：頭の外の点から、尾の先まで外の円にそって
    for (let t = 0; t <= sweep; t += 4) path.push(polar(cx, cy, R, base + t))
    // 内側：尾の先から頭の内側の点まで、半径を少しずつ小さく
    for (let t = sweep; t >= 0; t -= 4) path.push(polar(cx, cy, R - 2 * h * (1 - t / sweep) ** 0.8, base + t))
    // 頭：内側の点から、後ろ側（反時計回りの側）を回って外側の点へ
    const [hx, hy] = polar(cx, cy, R - h, base)
    for (let d = 0; d <= 180; d += 10) {
      const p = (d * Math.PI) / 180
      path.push([hx + h * (-Math.cos(p) * u[0] - Math.sin(p) * v[0]), hy + h * (-Math.cos(p) * u[1] - Math.sin(p) * v[1])])
    }
    shape += `<path d="${pts(path)} Z" fill="${color}"/>`
  }
  return shape
}

// 違い矢：2本の矢を×に交差させる（上に矢じり、下に矢羽）
function ya(cx, cy, R, color) {
  let shape = ''
  for (const angle of [-35, 35]) {
    const L = R * 0.95
    const w = R * 0.07
    let arrow = `<rect x="${f(-w / 2)}" y="${f(-L + R * 0.2)}" width="${f(w)}" height="${f(2 * L - R * 0.3)}"/>`
    arrow += `<path d="M0 ${f(-L)} L${f(R * 0.13)} ${f(-L + R * 0.3)} L${f(-R * 0.13)} ${f(-L + R * 0.3)} Z"/>`
    for (const side of [-1, 1]) {
      arrow += `<path d="M${f(side * w * 0.5)} ${f(L - R * 0.45)} L${f(side * R * 0.17)} ${f(L - R * 0.35)} L${f(side * R * 0.17)} ${f(L - R * 0.02)} L${f(side * w * 0.5)} ${f(L - R * 0.12)} Z"/>`
    }
    shape += `<g transform="translate(${cx} ${cy}) rotate(${angle})" fill="${color}" stroke="#000" stroke-width="${f(R * 0.03)}" paint-order="stroke">${arrow}</g>`
  }
  return shape
}

// 桜：切れ込みのある花びら5枚。まん中をくり抜いて、しべを残す
function sakura(cx, cy, R, color) {
  let shape = ''
  const petal = `M0 ${f(-R * 0.16)} C${f(-R * 0.5)} ${f(-R * 0.3)} ${f(-R * 0.55)} ${f(-R * 0.82)} ${f(-R * 0.2)} ${f(-R * 0.95)} L0 ${f(-R * 0.8)} L${f(R * 0.2)} ${f(-R * 0.95)} C${f(R * 0.55)} ${f(-R * 0.82)} ${f(R * 0.5)} ${f(-R * 0.3)} 0 ${f(-R * 0.16)} Z`
  for (let k = 0; k < 5; k += 1) shape += `<path d="${petal}" transform="translate(${cx} ${cy}) rotate(${k * 72})" stroke="none"/>`
  shape += `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.24)}" stroke="none"/>`
  let cut = `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.17)}" stroke="none"/>`
  let stamens = `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.06)}" stroke="none"/>`
  for (let k = 0; k < 5; k += 1) {
    const [x, y] = polar(cx, cy, R * 0.12, k * 72 + 36)
    stamens += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(R * 0.025)}" stroke="none"/>`
  }
  return masked('sakura', cx, cy, R, color, shape + '', cut) + `<g fill="${color}">${stamens}</g>`
}

// 日足（レア）：丸い日と、まわりに広がる光の足
function hiashi(cx, cy, R, color) {
  let shape = `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.36)}" stroke="none"/>`
  for (let k = 0; k < 12; k += 1) {
    const deg = k * 30
    const [x1, y1] = polar(cx, cy, R * 0.44, deg - 9)
    const [x2, y2] = polar(cx, cy, R * 0.44, deg + 9)
    const [x3, y3] = polar(cx, cy, R * (k % 2 === 0 ? 0.98 : 0.8), deg)
    shape += `<path d="${pts([[x1, y1], [x3, y3], [x2, y2]])} Z" stroke="none"/>`
  }
  const cut = `<circle cx="${cx}" cy="${cy}" r="${f(R * 0.26)}" fill="none" stroke-width="${f(R * 0.035)}"/>`
  return masked('hiashi', cx, cy, R, color, shape, cut)
}

export const CREST_SHAPES = Object.freeze({ shippo, tombo, taka, take, nami, tomoe, ya, sakura, hiashi })
