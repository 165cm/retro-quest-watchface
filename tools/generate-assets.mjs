import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import { LAYOUT, SCREEN } from '../watchface/layout.js'
import { renderGlyph } from './render-glyph.mjs'

const ROOT = process.cwd()
const ASSET_ROOT = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS_ROOT = path.join(ROOT, 'docs')
const BACKGROUND_W = 366
const BACKGROUND_H = 430

const GLYPHS = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '%': ['11001', '11010', '00100', '01000', '10110', '00110', '00000'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00110', '01100'],
  '°': ['01100', '10010', '10010', '01100', '00000', '00000', '00000'],
}

function color(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
    255,
  ]
}

function image(width, height, fill = '#00000000') {
  const png = new PNG({ width, height })
  const rgba =
    fill.length === 9
      ? [
          Number.parseInt(fill.slice(1, 3), 16),
          Number.parseInt(fill.slice(3, 5), 16),
          Number.parseInt(fill.slice(5, 7), 16),
          Number.parseInt(fill.slice(7, 9), 16),
        ]
      : color(fill)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) setPixel(png, x, y, rgba)
  }
  return png
}

function setPixel(png, x, y, rgba) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return
  const index = (png.width * y + x) << 2
  png.data[index] = rgba[0]
  png.data[index + 1] = rgba[1]
  png.data[index + 2] = rgba[2]
  png.data[index + 3] = rgba[3]
}

function rect(png, x, y, w, h, fill) {
  const rgba = typeof fill === 'string' ? color(fill) : fill
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(png, xx, yy, rgba)
  }
}

function dither(png, x, y, w, h, colorA, colorB, phase = 0) {
  const a = typeof colorA === 'string' ? color(colorA) : colorA
  const b = typeof colorB === 'string' ? color(colorB) : colorB
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(png, xx, yy, (xx + yy + phase) % 2 === 0 ? a : b)
    }
  }
}

function ditherPolygon(png, points, colorA, colorB, phase = 0) {
  const ys = points.map((point) => point[1])
  const minY = Math.max(0, Math.floor(Math.min(...ys)))
  const maxY = Math.min(png.height - 1, Math.ceil(Math.max(...ys)))
  const a = typeof colorA === 'string' ? color(colorA) : colorA
  const b = typeof colorB === 'string' ? color(colorB) : colorB
  for (let y = minY; y <= maxY; y += 1) {
    const intersections = []
    for (let i = 0; i < points.length; i += 1) {
      const p0 = points[i]
      const p1 = points[(i + 1) % points.length]
      if ((p0[1] <= y && p1[1] > y) || (p1[1] <= y && p0[1] > y)) {
        const ratio = (y - p0[1]) / (p1[1] - p0[1])
        intersections.push(p0[0] + ratio * (p1[0] - p0[0]))
      }
    }
    intersections.sort((m, n) => m - n)
    for (let i = 0; i < intersections.length; i += 2) {
      const start = Math.ceil(intersections[i])
      const end = Math.floor(intersections[i + 1])
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue
      for (let x = start; x <= end; x += 1) {
        setPixel(png, x, y, (x + y + phase) % 2 === 0 ? a : b)
      }
    }
  }
}


function line(png, x0, y0, x1, y1, fill, thickness = 1) {
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let error = dx + dy
  while (true) {
    rect(png, x0, y0, thickness, thickness, fill)
    if (x0 === x1 && y0 === y1) break
    const twice = 2 * error
    if (twice >= dy) {
      error += dy
      x0 += sx
    }
    if (twice <= dx) {
      error += dx
      y0 += sy
    }
  }
}

function polygon(png, points, fill) {
  const ys = points.map((point) => point[1])
  const minY = Math.max(0, Math.floor(Math.min(...ys)))
  const maxY = Math.min(png.height - 1, Math.ceil(Math.max(...ys)))
  for (let y = minY; y <= maxY; y += 1) {
    const intersections = []
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        const ratio = (y - a[1]) / (b[1] - a[1])
        intersections.push(a[0] + ratio * (b[0] - a[0]))
      }
    }
    intersections.sort((a, b) => a - b)
    for (let i = 0; i < intersections.length; i += 2) {
      const start = Math.ceil(intersections[i])
      const end = Math.floor(intersections[i + 1])
      if (Number.isFinite(start) && Number.isFinite(end)) {
        rect(png, start, y, end - start + 1, 1, fill)
      }
    }
  }
}

// ドット絵はPNGの適応行フィルタと相性が悪い。同色の連続を壊してしまい、
// かえって圧縮率が落ちる。フィルタ無し + 既定のdeflate戦略にすると
// 同じ画素のまま容量が大きく減る（可逆・画素は完全一致）。
// pngjsは渡されたオプションへ内部で書き込むため、毎回コピーを渡すこと。
const PNG_WRITE_OPTIONS = Object.freeze({
  colorType: 6,
  deflateLevel: 9,
  deflateStrategy: 0,
  filterType: 0,
})

function writePng(file, png) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, PNG.sync.write(png, { ...PNG_WRITE_OPTIONS }))
}

function drawGlyph(png, glyph, x, y, scale, fill) {
  const rows = GLYPHS[glyph]
  rows.forEach((row, rowIndex) => {
    ;[...row].forEach((pixel, columnIndex) => {
      if (pixel === '1') {
        rect(png, x + columnIndex * scale, y + rowIndex * scale, scale, scale, fill)
      }
    })
  })
}


function drawText(png, text, x, y, scale, fill, spacing = scale) {
  let cursor = x
  for (const character of String(text).toUpperCase()) {
    if (character === ' ') {
      cursor += 3 * scale + spacing
      continue
    }
    const rows = GLYPHS[character]
    if (rows) drawGlyph(png, character, cursor, y, scale, fill)
    cursor += 5 * scale + spacing
  }
  return cursor
}


const PALETTES = {
  clear_day: { sky: ['#0A5FC1', '#1178D2', '#2794DF', '#52AFE5'], far: '#7BB6D5', mid: '#397CB0', near: '#174F78', forest: '#0B4D42', grass: '#39763B', water: '#45A5D0' },
  partly_cloudy_day: { sky: ['#18588E', '#2C75A8', '#4A91BB', '#70A9C7'], far: '#91B5C5', mid: '#4F7893', near: '#28536B', forest: '#17493F', grass: '#456D3D', water: '#5B94AA' },
  cloudy_day: { sky: ['#384D62', '#4E6477', '#687C8B', '#84939B'], far: '#97A2A5', mid: '#65747A', near: '#3B5158', forest: '#294943', grass: '#52684A', water: '#667F87' },
  rain: { sky: ['#162B42', '#223A50', '#304B60', '#435F70'], far: '#5E7280', mid: '#3F5664', near: '#243D4B', forest: '#173B39', grass: '#344E3D', water: '#426D7E' },
  thunder: { sky: ['#11162D', '#1A2340', '#28324C', '#3B455A'], far: '#535C69', mid: '#343F50', near: '#1B2938', forest: '#142D2D', grass: '#2C3B35', water: '#3E5968' },
  snow: { sky: ['#46677E', '#66879A', '#86A4B0', '#A9BDC1'], far: '#D9E4E3', mid: '#91A7AE', near: '#596F78', forest: '#375957', grass: '#AFC2BE', water: '#718F9B' },
  fog: { sky: ['#56676F', '#6B7B81', '#808E91', '#97A1A0'], far: '#AAB2AF', mid: '#7F8D8C', near: '#566966', forest: '#455D56', grass: '#697A68', water: '#788B8C' },
  clear_night: { sky: ['#020A25', '#07163A', '#0C2452', '#133665'], far: '#263D69', mid: '#172D54', near: '#0B1E3E', forest: '#082A2D', grass: '#183A32', water: '#164B69' },
  cloudy_night: { sky: ['#080F24', '#111D35', '#1B2A43', '#2A3A50'], far: '#3A4960', mid: '#25354B', near: '#14263A', forest: '#102D2E', grass: '#283D35', water: '#2B5062' },
  unknown: { sky: ['#142436', '#203448', '#30475A', '#425C6A'], far: '#657680', mid: '#435966', near: '#293F4B', forest: '#1D3D3A', grass: '#3D5545', water: '#496D7A' },
}

function cloud(png, x, y, fill, shade) {
  rect(png, x + 8, y, 32, 8, fill)
  rect(png, x, y + 8, 58, 12, fill)
  rect(png, x + 18, y - 8, 22, 10, fill)
  dither(png, x + 8, y + 16, 46, 5, fill, shade)
  dither(png, x + 18, y - 8, 22, 4, '#FFFFFF', fill, 1)
}

function pine(png, x, y, height, dark, light) {
  const trunkW = Math.max(2, Math.floor(height / 10))
  rect(png, x - Math.floor(trunkW / 2), y - height + 8, trunkW, height - 8, '#392F2A')
  polygon(png, [[x, y - height], [x - height * 0.22, y - height * 0.45], [x + height * 0.22, y - height * 0.45]], light)
  polygon(png, [[x, y - height * 0.75], [x - height * 0.3, y - height * 0.18], [x + height * 0.3, y - height * 0.18]], dark)
  polygon(png, [[x, y - height * 0.5], [x - height * 0.35, y], [x + height * 0.35, y]], dark)
  ditherPolygon(png, [[x, y - height], [x, y - height * 0.45], [x + height * 0.22, y - height * 0.45]], light, dark, Math.round(x))
  ditherPolygon(png, [[x, y - height * 0.5], [x, y], [x + height * 0.35, y]], dark, light, Math.round(x) + 1)
}

function castle(png, x, y, night) {
  const stone = night ? '#5D6670' : '#B7AA8B'
  const lightStone = night ? '#78808A' : '#D0C19E'
  const shadowStone = night ? '#3E4650' : '#8A7C5E'
  const roof = night ? '#14233E' : '#253E56'
  const roofShade = night ? '#0C1830' : '#182B3D'
  rect(png, x, y - 60, 68, 60, stone)
  dither(png, x, y - 60, 14, 60, shadowStone, stone)
  rect(png, x - 12, y - 46, 20, 46, stone)
  dither(png, x - 12, y - 46, 10, 46, shadowStone, stone)
  rect(png, x + 60, y - 46, 20, 46, stone)
  dither(png, x + 60, y - 46, 10, 46, shadowStone, stone)
  rect(png, x + 24, y - 84, 22, 84, lightStone)
  dither(png, x + 24, y - 84, 9, 84, stone, lightStone)
  polygon(png, [[x - 14, y - 46], [x - 2, y - 64], [x + 10, y - 46]], roof)
  ditherPolygon(png, [[x - 2, y - 64], [x - 2, y - 46], [x + 10, y - 46]], roofShade, roof, 3)
  polygon(png, [[x + 20, y - 84], [x + 35, y - 106], [x + 50, y - 84]], roof)
  ditherPolygon(png, [[x + 35, y - 106], [x + 35, y - 84], [x + 50, y - 84]], roofShade, roof, 3)
  polygon(png, [[x + 58, y - 46], [x + 70, y - 64], [x + 82, y - 46]], roof)
  ditherPolygon(png, [[x + 70, y - 64], [x + 70, y - 46], [x + 82, y - 46]], roofShade, roof, 3)
  rect(png, x + 30, y - 22, 12, 22, '#20232B')
  const window = night ? '#F5B942' : '#497795'
  for (const [wx, wy] of [[4, -36], [28, -66], [52, -36], [67, -28]]) {
    if (night) {
      dither(png, x + wx - 2, y + wy - 2, 9, 12, '#7A5A2A', stone, wx + wy)
    }
    rect(png, x + wx, y + wy, 5, 8, window)
    rect(png, x + wx + 2, y + wy, 1, 8, lightStone)
  }
  rect(png, x + 34, y - 118, 3, 14, '#D7D6C4')
  rect(png, x + 37, y - 117, 12, 7, '#D9534F')
  if (night) {
    rect(png, x - 10, y, 3, 10, '#392F2A')
    rect(png, x + 76, y, 3, 10, '#392F2A')
    dither(png, x - 13, y - 9, 9, 9, '#F5B942', '#D9862F', 1)
    dither(png, x + 73, y - 9, 9, 9, '#F5B942', '#D9862F', 1)
  }
}

// 34×34の天候アイコン。背景と同じテーマキーで差し替える。
const ICON_SIZE = 30

// 天候アイコンと足あとは、時刻の字形と同じ距離場で描く。
// ディザリングで階調を作る8bit期の手法をやめ、輪郭を連続値で出す。
const ICON_COLORS = Object.freeze({
  sun: '#FFCF52',
  sunRay: '#FFD86E',
  moon: '#F2DE94',
  cloud: '#E4EAF0',
  cloudDark: '#8C9AA6',
  rain: '#7FBBF2',
  snow: '#F2F6FA',
  bolt: '#FFD34F',
  fog: '#C6D0D8',
})

function blendPixel(png, x, y, rgb, alpha) {
  if (alpha <= 0 || x < 0 || y < 0 || x >= png.width || y >= png.height) return
  const index = (png.width * y + x) << 2
  const existing = png.data[index + 3] / 255
  const out = alpha + existing * (1 - alpha)
  if (out <= 0) return
  for (let c = 0; c < 3; c += 1) {
    png.data[index + c] = Math.round(
      (rgb[c] * alpha + png.data[index + c] * existing * (1 - alpha)) / out,
    )
  }
  png.data[index + 3] = Math.round(out * 255)
}

// 円。境界から1画素ぶんで落として滑らかにする。
function aaCircle(png, cx, cy, radius, fill, { cutCx, cutCy, cutR } = {}) {
  const rgb = color(fill)
  for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y += 1) {
    for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x += 1) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - radius
      let a = Math.min(1, Math.max(0, 0.5 - d))
      if (a <= 0) continue
      if (cutR !== undefined) {
        const cd = Math.hypot(x + 0.5 - cutCx, y + 0.5 - cutCy) - cutR
        a *= Math.min(1, Math.max(0, 0.5 + cd))
      }
      blendPixel(png, x, y, rgb, a)
    }
  }
}

// 太さのある折れ線。線端は丸。時刻の字形と同じ考え方。
function aaStroke(png, points, width, fill) {
  const rgb = color(fill)
  const half = width / 2
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const x0 = Math.floor(Math.min(...xs) - half - 1)
  const x1 = Math.ceil(Math.max(...xs) + half + 1)
  const y0 = Math.floor(Math.min(...ys) - half - 1)
  const y1 = Math.ceil(Math.max(...ys) + half + 1)

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      let best = Infinity
      if (points.length === 1) {
        best = Math.hypot(x + 0.5 - points[0][0], y + 0.5 - points[0][1])
      }
      for (let i = 0; i < points.length - 1; i += 1) {
        const [ax, ay] = points[i]
        const [bx, by] = points[i + 1]
        const dx = bx - ax
        const dy = by - ay
        const lengthSquared = dx * dx + dy * dy
        let t = 0
        if (lengthSquared > 0) {
          t = ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / lengthSquared
          t = Math.min(1, Math.max(0, t))
        }
        const d = Math.hypot(x + 0.5 - (ax + t * dx), y + 0.5 - (ay + t * dy))
        if (d < best) best = d
      }
      const a = Math.min(1, Math.max(0, 0.5 - (best - half)))
      if (a > 0) blendPixel(png, x, y, rgb, a)
    }
  }
}

function iconSun(png, cx, cy, radius) {
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI / 4) * i
    const inner = radius + 2.5
    const outer = radius + 5.5
    aaStroke(
      png,
      [
        [cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner],
        [cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer],
      ],
      2.4,
      ICON_COLORS.sunRay,
    )
  }
  aaCircle(png, cx, cy, radius, ICON_COLORS.sun)
}

function iconMoon(png, cx, cy, radius) {
  aaCircle(png, cx, cy, radius, ICON_COLORS.moon, {
    cutCx: cx + radius * 0.62,
    cutCy: cy - radius * 0.24,
    cutR: radius * 0.88,
  })
}

// 雲は円3つと角丸の土台。輪郭が重なる部分は同じ色なので継ぎ目が出ない。
function iconCloud(png, cx, cy, scale = 1, dark = false) {
  const fill = dark ? ICON_COLORS.cloudDark : ICON_COLORS.cloud
  aaCircle(png, cx - 5 * scale, cy + 1 * scale, 5 * scale, fill)
  aaCircle(png, cx + 1 * scale, cy - 3 * scale, 6.5 * scale, fill)
  aaCircle(png, cx + 7 * scale, cy + 1 * scale, 5 * scale, fill)
  aaStroke(png, [[cx - 6 * scale, cy + 4 * scale], [cx + 8 * scale, cy + 4 * scale]], 6 * scale, fill)
}

function iconRain(png, x, y) {
  for (const dx of [0, 7, 14]) {
    aaStroke(png, [[x + dx + 2, y], [x + dx, y + 6]], 2.4, ICON_COLORS.rain)
  }
}

function iconSnow(png, x, y) {
  for (const [dx, dy] of [[0, 0], [7, 3], [14, 0]]) {
    aaCircle(png, x + dx, y + dy, 1.8, ICON_COLORS.snow)
  }
}

function iconBolt(png, x, y) {
  aaStroke(
    png,
    [[x + 7, y], [x + 2, y + 5], [x + 6, y + 5], [x + 1, y + 11]],
    2.6,
    ICON_COLORS.bolt,
  )
}

// 歩数用の足あと。22×22。左右一対を斜めにずらして「歩いている」形にする。
function drawStepsIcon() {
  const png = image(22, 22, '#00000000')
  const foot = (cx, cy, flip) => {
    aaCircle(png, cx, cy, 3.1, '#F2F5FA')
    aaCircle(png, cx + flip * 2.6, cy + 4.4, 2.2, '#F2F5FA')
    for (let i = 0; i < 3; i += 1) {
      aaCircle(png, cx - flip * 3.2 + flip * i * 2.3, cy - 4.2 - (i === 1 ? 0.8 : 0), 1.1, '#F2F5FA')
    }
  }
  foot(6, 7, -1)
  foot(16, 14, 1)
  return png
}

function drawWeatherIcon(theme) {
  const png = image(ICON_SIZE, ICON_SIZE, '#00000000')
  switch (theme) {
    case 'clear_day':
      iconSun(png, 15, 15, 7)
      break
    case 'partly_cloudy_day':
      iconSun(png, 10, 9, 5)
      iconCloud(png, 15, 19, 0.95)
      break
    case 'cloudy_day':
      iconCloud(png, 15, 16, 1.15)
      break
    case 'rain':
      iconCloud(png, 15, 11, 1)
      iconRain(png, 7, 20)
      break
    case 'thunder':
      iconCloud(png, 15, 10, 1, true)
      iconBolt(png, 11, 17)
      break
    case 'snow':
      iconCloud(png, 15, 11, 1)
      iconSnow(png, 8, 22)
      break
    case 'fog':
      iconCloud(png, 15, 10, 1)
      for (let i = 0; i < 3; i += 1) {
        const inset = i % 2 === 0 ? 4 : 7
        aaStroke(png, [[inset, 19 + i * 4.5], [ICON_SIZE - inset, 19 + i * 4.5]], 2.6, ICON_COLORS.fog)
      }
      break
    case 'clear_night':
      iconMoon(png, 15, 15, 10)
      break
    case 'cloudy_night':
      iconMoon(png, 19, 9, 7)
      iconCloud(png, 14, 19, 0.95)
      break
    default:
      iconCloud(png, 15, 16, 1.15, true)
      break
  }
  return png
}

function drawWorld(theme) {
  const palette = PALETTES[theme]
  const png = image(BACKGROUND_W, BACKGROUND_H, palette.sky[0])
  const night = theme.includes('night')

  palette.sky.forEach((band, index) => rect(png, 0, index * 48, 366, 48, band))

  // 太陽・月は最上段の天候アイコンが担うため、背景には描かない。
  // 空の上部はトップバーでほぼ覆われるので、星は覆いの下端より下にも散らす。
  if (night) {
    ;[[24, 74], [72, 61], [124, 92], [184, 79], [234, 68], [284, 100], [340, 84], [46, 108], [312, 62], [156, 112]]
      .forEach(([x, y]) => rect(png, x, y, 3, 3, '#D5E7EB'))
  }

  // 雲は時刻バンドの左右マージン側へ寄せる。中央に明るい塊を置くと時刻が読みにくくなる。
  if (theme.includes('cloudy') || ['rain', 'thunder', 'snow', 'unknown'].includes(theme)) {
    cloud(png, 16, 84, theme === 'thunder' ? '#555D72' : '#AEB9BE', '#7F919B')
    cloud(png, 296, 98, night ? '#53637A' : '#C5CDD0', night ? '#3D4D64' : '#9DADB4')
  }
  if (theme === 'partly_cloudy_day') cloud(png, 294, 86, '#E4E9E5', '#B8CDD4')

  // 遠景の連峰。白い雪冠が時刻バンド（y86–158）に入らないよう、稜線を下げてある。
  polygon(png, [[0, 270], [58, 178], [112, 261], [165, 158], [226, 262], [286, 187], [366, 268], [366, 332], [0, 332]], palette.far)
  polygon(png, [[32, 247], [58, 196], [80, 237]], '#D7E3E1')
  ditherPolygon(png, [[32, 247], [58, 196], [66, 216]], '#F4F3E8', '#D7E3E1', 1)
  polygon(png, [[133, 212], [165, 158], [196, 210], [178, 195], [165, 210], [153, 190]], '#E5EBE6')
  ditherPolygon(png, [[153, 190], [165, 158], [178, 195], [165, 210]], '#F4F3E8', '#E5EBE6', 1)
  ditherPolygon(png, [[133, 212], [153, 190], [165, 210]], palette.far, '#E5EBE6', 1)
  polygon(png, [[0, 277], [84, 194], [139, 268], [218, 187], [292, 269], [341, 209], [366, 248], [366, 326], [0, 326]], palette.mid)
  polygon(png, [[0, 315], [65, 245], [128, 306], [205, 233], [278, 311], [366, 251], [366, 350], [0, 350]], palette.near)
  polygon(png, [[0, 306], [76, 285], [150, 321], [222, 288], [300, 308], [366, 278], [366, 430], [0, 430]], palette.forest)
  polygon(png, [[0, 360], [92, 322], [176, 350], [252, 309], [366, 340], [366, 430], [0, 430]], palette.grass)
  polygon(png, [[176, 268], [194, 268], [207, 314], [232, 352], [204, 430], [151, 430], [194, 352], [184, 314]], palette.water)
  polygon(png, [[184, 280], [190, 280], [199, 321], [217, 352], [196, 399], [183, 399], [207, 352], [191, 321]], '#8FD3DF')

  for (let x = 2; x < 366; x += 18) {
    pine(png, x, 326 + ((x * 3) % 17), 24 + ((x * 7) % 19), '#0A3B36', '#17604B')
  }
  for (let x = 8; x < 150; x += 27) {
    pine(png, x, 410 - ((x * 5) % 18), 46 + (x % 20), '#082E2D', '#12503E')
  }

  castle(png, 268, 332, night || theme === 'rain' || theme === 'thunder')

  if (theme === 'rain' || theme === 'thunder') {
    for (let x = 12; x < 360; x += 23) {
      for (let y = 18 + (x % 31); y < 420; y += 58) line(png, x, y, x - 6, y + 17, '#69A7E8', 2)
    }
  }
  if (theme === 'thunder') {
    line(png, 176, 44, 162, 76, '#F5D765', 5)
    line(png, 162, 76, 178, 76, '#F5D765', 5)
    line(png, 178, 76, 160, 112, '#F5D765', 5)
  }
  if (theme === 'snow') {
    for (let x = 14; x < 360; x += 23) {
      for (let y = 18 + (x % 27); y < 420; y += 52) rect(png, x, y, 4, 4, '#F4F3E8')
    }
  }
  if (theme === 'fog') {
    for (let y = 74; y < 352; y += 42) rect(png, 8 + (y % 31), y, 330, 9, '#A9B0B8')
  }
  return png
}

function blit(target, source, dx, dy) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const sourceIndex = (source.width * y + x) << 2
      const alpha = source.data[sourceIndex + 3]
      if (alpha === 0) continue
      setPixel(target, dx + x, dy + y, [
        source.data[sourceIndex],
        source.data[sourceIndex + 1],
        source.data[sourceIndex + 2],
        alpha,
      ])
    }
  }
}


// 背景は assets/ に置かれた実ファイルを正とする。プレビューと実機表示を一致させるため、
// コード生成の drawWorld() はファイルが無い／寸法が違う場合のフォールバックとしてのみ使う。
function loadBackground(theme) {
  const file = path.join(ASSET_ROOT, 'backgrounds', `${theme}.png`)
  if (fs.existsSync(file)) {
    const png = PNG.sync.read(fs.readFileSync(file))
    if (png.width === BACKGROUND_W && png.height === BACKGROUND_H) return png
    console.warn(
      `warn: ${theme}.png は ${png.width}x${png.height} です（期待値 ${BACKGROUND_W}x${BACKGROUND_H}）。drawWorld() にフォールバックします。`,
    )
  }
  return drawWorld(theme)
}

// 実機のdrawNormalView()と同じ座標で合成する。watchface/layout.js を変えたらここも合わせる。
// 実機のdrawNormalView()と同じ座標で合成する。watchface/layout.js を変えたらここも合わせる。
// 実機と同じ座標で合成する。座標は watchface/layout.js を読み、
// 数字・アイコン類は生成済みの実スプライトを貼るので、実装とずれない。
// ただし日付・気温ラベル・歩数は実機ではシステムフォントで描かれる。
// ここではビットマップ字形で近似しているため、字幅は実機と完全一致しない。
function loadAsset(relative) {
  return PNG.sync.read(fs.readFileSync(path.join(ASSET_ROOT, relative)))
}

// 角丸の板。実機は Zepp OS の radius で描かれるが、こちらは距離場で近似する。
// 内外の判定を連続値で取るので、プレビュー側の角は実機よりわずかに滑らかになる。
function roundRectDistance(px, py, x, y, w, h, radius) {
  const cx = x + w / 2
  const cy = y + h / 2
  const dx = Math.abs(px - cx) - (w / 2 - radius)
  const dy = Math.abs(py - cy) - (h / 2 - radius)
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  return outside + Math.min(Math.max(dx, dy), 0) - radius
}

function previewPanel(png, rect, radius, fill, alpha, edge, edgeWidth) {
  const fillRgb = color(fill)
  const edgeRgb = color(edge)
  const x0 = Math.max(0, rect.x - edgeWidth - 1)
  const y0 = Math.max(0, rect.y - edgeWidth - 1)
  const x1 = Math.min(png.width, rect.x + rect.w + edgeWidth + 1)
  const y1 = Math.min(png.height, rect.y + rect.h + edgeWidth + 1)

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const index = (png.width * y + x) << 2
      const d = roundRectDistance(x + 0.5, y + 0.5, rect.x, rect.y, rect.w, rect.h, radius)

      const inside = Math.min(1, Math.max(0, 0.5 - d))
      if (inside > 0) {
        const a = (inside * alpha) / 255
        setPixel(png, x, y, [
          Math.round(png.data[index] * (1 - a) + fillRgb[0] * a),
          Math.round(png.data[index + 1] * (1 - a) + fillRgb[1] * a),
          Math.round(png.data[index + 2] * (1 - a) + fillRgb[2] * a),
          255,
        ])
      }

      const onEdge = Math.min(1, Math.max(0, 0.5 - (Math.abs(d) - edgeWidth / 2)))
      if (onEdge > 0) {
        setPixel(png, x, y, [
          Math.round(png.data[index] * (1 - onEdge) + edgeRgb[0] * onEdge),
          Math.round(png.data[index + 1] * (1 - onEdge) + edgeRgb[1] * onEdge),
          Math.round(png.data[index + 2] * (1 - onEdge) + edgeRgb[2] * onEdge),
          255,
        ])
      }
    }
  }
}

function previewBar(png, rect, radius, fill) {
  const rgb = color(fill)
  for (let y = rect.y; y < rect.y + rect.h; y += 1) {
    for (let x = rect.x; x < rect.x + rect.w; x += 1) {
      const index = (png.width * y + x) << 2
      const d = roundRectDistance(x + 0.5, y + 0.5, rect.x, rect.y, rect.w, rect.h, radius)
      const a = Math.min(1, Math.max(0, 0.5 - d))
      if (a <= 0) continue
      setPixel(png, x, y, [
        Math.round(png.data[index] * (1 - a) + rgb[0] * a),
        Math.round(png.data[index + 1] * (1 - a) + rgb[1] * a),
        Math.round(png.data[index + 2] * (1 - a) + rgb[2] * a),
        255,
      ])
    }
  }
}

// 気温はTEXT_IMGが数字画像を横に並べる。実機と同じ順序・同じ字送りで合成する。
function previewTemperature(png, rect, set, value, align) {
  const sprites = [...value].map((character) =>
    loadAsset(`digits/${set}/${character === '-' ? 'negative' : character}.png`),
  )
  sprites.push(loadAsset(`digits/${set}/degree.png`))
  const totalW = sprites.reduce((sum, sprite) => sum + sprite.width, 0) + (sprites.length - 1)
  let x = align === 'right' ? rect.x + rect.w - totalW : rect.x
  for (const sprite of sprites) {
    blit(png, sprite, x, rect.y + Math.round((rect.h - sprite.height) / 2))
    x += sprite.width + 1
  }
}

function preview(theme = 'clear_day', { hour = '10', minute = '09', amPm = 'am' } = {}) {
  const png = image(390, 450, '#031426')
  blit(png, loadBackground(theme), LAYOUT.background.x, LAYOUT.background.y)

  // 上の板: 天候アイコン・日付・現在気温
  previewPanel(png, LAYOUT.topPanel, LAYOUT.panelRadius, '#08182C', 205, '#CDB87E', 2)
  blit(png, drawWeatherIcon(theme), LAYOUT.weatherIcon.x, LAYOUT.weatherIcon.y)
  drawText(png, '7/24 FRI', LAYOUT.date.x, LAYOUT.date.y + 8, 2, '#F2F5FA', 2)
  previewTemperature(png, LAYOUT.nowTemp, 'temp-now', '24', 'right')

  // 時刻: 実スプライトを貼る。中央寄せの式も実装と同じ。
  const t = LAYOUT.time
  const hasLeading = hour.length === 2
  const items = hasLeading ? 5 : 4
  const width = (hasLeading ? 4 : 3) * t.digitW + t.colonW + (items - 1) * t.gap
  let cursor = Math.round((390 - width) / 2)
  const place = (sprite, w) => {
    blit(png, sprite, cursor, t.y)
    cursor += w + t.gap
  }
  if (hasLeading) place(loadAsset(`digits/time/${hour[0]}.png`), t.digitW)
  place(loadAsset(`digits/time/${hour[hour.length - 1]}.png`), t.digitW)
  place(loadAsset('digits/time/colon.png'), t.colonW)
  place(loadAsset(`digits/time/${minute[0]}.png`), t.digitW)
  place(loadAsset(`digits/time/${minute[1]}.png`), t.digitW)
  const timeEndX = cursor - t.gap
  if (amPm) {
    blit(png, loadAsset(`ampm/${amPm}.png`), timeEndX + LAYOUT.amPm.gap, t.y + LAYOUT.amPm.offsetY)
  }

  // 下の板: HPの棒 / 歩数と気温幅
  previewPanel(png, LAYOUT.bottomPanel, LAYOUT.panelRadius, '#08182C', 205, '#CDB87E', 2)

  const hp = LAYOUT.hp
  drawText(png, 'HP', hp.label.x, hp.label.y + 3, 2, '#CDB87E', 2)
  previewBar(png, hp.track, hp.radius, '#1D2C41')
  previewBar(png, { ...hp.track, w: Math.round(hp.track.w * 0.78) }, hp.radius, '#5CC27A')
  drawText(png, '78%', hp.text.x + hp.text.w - 40, hp.text.y + 3, 2, '#F2F5FA', 2)

  blit(png, drawStepsIcon(), LAYOUT.steps.icon.x, LAYOUT.steps.icon.y)
  drawText(png, '3,548', LAYOUT.steps.text.x, LAYOUT.steps.text.y + 6, 2, '#F2F5FA', 2)

  const range = LAYOUT.range
  drawText(png, 'L', range.lowLabel.x, range.lowLabel.y + 3, 2, '#86C8F0', 2)
  previewTemperature(png, range.lowValue, 'temp-low', '23', 'left')
  drawText(png, 'H', range.highLabel.x, range.highLabel.y + 3, 2, '#F0A45C', 2)
  previewTemperature(png, range.highValue, 'temp-high', '30', 'left')

  return png
}


// ── ベクター字形の書き出し ────────────────────────────────────────────
// Zepp OSはフォントファイルを読めないので数字は画像で持つしかない。
// ドット格子の拡大をやめ、距離場から起こした滑らかな字形を焼き込む。
// 縁取りと影も画像に含めるので、どの背景の上でも輪郭が消えない。

const TIME_STYLE = {
  weight: 0.145,
  fillTop: '#FFFFFF',
  fillBottom: '#CFD9E6',
  outline: '#0A1220',
  outlineWidth: 3,
  shadow: '#000000',
  shadowOffset: [0, 3],
  shadowAlpha: 0.5,
}

function writeGlyph(directory, name, file, options) {
  writePng(path.join(directory, `${file}.png`), renderGlyph(name, options))
}

// 数字0〜9とコロン・度・マイナスを1組で書き出す。
// コロンだけ幅が違うので、字面の高さと下端は共通にして縦位置を揃える。
function generateGlyphSet(name, { cellW, cellH, inkHeight, baselineY, style, extras = {} }) {
  const directory = path.join(ASSET_ROOT, 'digits', name)
  const base = { height: cellH, inkHeight, baselineY, ...style }

  for (let digit = 0; digit <= 9; digit += 1) {
    writeGlyph(directory, String(digit), String(digit), { ...base, width: cellW })
  }
  if (extras.colonW) {
    writeGlyph(directory, 'colon', 'colon', { ...base, width: extras.colonW })
  }
  writeGlyph(directory, 'degree', 'degree', { ...base, width: extras.degreeW || cellW })
  writeGlyph(directory, 'negative', 'negative', {
    ...base,
    width: extras.negativeW || cellW,
  })
}

// AM/PM。2文字を1枚に詰めるので、字ごとに描いてから合成する。
function generateAmPm({ cellW, cellH, inkHeight, baselineY, style, letterGap = 2 }) {
  const directory = path.join(ASSET_ROOT, 'ampm')
  const letterW = Math.round(inkHeight * 0.72) + 6

  for (const word of ['am', 'pm']) {
    const png = image(cellW, cellH, '#00000000')
    const letters = [...word.toUpperCase()]
    const totalW = letters.length * letterW + (letters.length - 1) * letterGap
    let x = Math.round((cellW - totalW) / 2)
    for (const letter of letters) {
      const glyph = renderGlyph(letter, {
        width: letterW,
        height: cellH,
        inkHeight,
        baselineY,
        ...style,
      })
      blit(png, glyph, x, 0)
      x += letterW + letterGap
    }
    writePng(path.join(directory, `${word}.png`), png)
  }
  // 24時間表示のとき差し替える透明画像。ウィジェットを作り直さずに消せる。
  writePng(path.join(directory, 'blank.png'), image(cellW, cellH, '#00000000'))
}

generateGlyphSet('time', {
  cellW: LAYOUT.time.digitW,
  cellH: LAYOUT.time.digitH,
  inkHeight: 62,
  baselineY: 72,
  style: TIME_STYLE,
  extras: { colonW: LAYOUT.time.colonW },
})

generateAmPm({
  cellW: LAYOUT.amPm.w,
  cellH: LAYOUT.amPm.h,
  inkHeight: 19,
  baselineY: 22,
  style: { ...TIME_STYLE, outlineWidth: 2, shadowOffset: [0, 2] },
})

// AODは黒地に単色。縁取りも影も点灯画素を増やすだけなので持たせない。
generateGlyphSet('aod', {
  cellW: LAYOUT.aod.time.digitW,
  cellH: LAYOUT.aod.time.digitH,
  inkHeight: 46,
  baselineY: 52,
  style: { weight: 0.14, fillTop: '#B4BCC6', fillBottom: '#B4BCC6' },
  extras: { colonW: LAYOUT.aod.time.colonW },
})

// 気温は板の上に乗るが、板は半透明で背景が透ける。暗い縁取りを焼いておく。
const TEMP_STYLE = { weight: 0.16, outline: '#05101E', outlineWidth: 2 }

generateGlyphSet('temp-now', {
  cellW: 20,
  cellH: 30,
  inkHeight: 24,
  baselineY: 27,
  style: { ...TEMP_STYLE, fillTop: '#FFFFFF', fillBottom: '#DCE4EE' },
  extras: { degreeW: 14, negativeW: 14 },
})
generateGlyphSet('temp-low', {
  cellW: 17,
  cellH: 26,
  inkHeight: 19,
  baselineY: 22,
  style: { ...TEMP_STYLE, fillTop: '#9FD4F5', fillBottom: '#6FB6E4' },
  extras: { degreeW: 12, negativeW: 12 },
})
generateGlyphSet('temp-high', {
  cellW: 17,
  cellH: 26,
  inkHeight: 19,
  baselineY: 22,
  style: { ...TEMP_STYLE, fillTop: '#F7BC7C', fillBottom: '#E8934A' },
  extras: { degreeW: 12, negativeW: 12 },
})

writePng(path.join(ASSET_ROOT, 'steps.png'), drawStepsIcon())

Object.keys(PALETTES).forEach((theme) => {
  writePng(path.join(ASSET_ROOT, 'weather', `${theme}.png`), drawWeatherIcon(theme))
})

// 背景PNGは既定では書き出さない。Image Gen由来の画像を上書きしてしまうため。
// コード生成の背景へ戻したい場合のみ `npm run assets -- --with-backgrounds` を使う。
if (process.argv.includes('--with-backgrounds')) {
  Object.keys(PALETTES).forEach((theme) => {
    writePng(path.join(ASSET_ROOT, 'backgrounds', `${theme}.png`), drawWorld(theme))
  })
  console.log('Regenerated code-drawn backgrounds (--with-backgrounds)')
}

const fullPreview = preview('clear_day')
writePng(path.join(DOCS_ROOT, 'preview-390x450.png'), fullPreview)
// プレビューごとに別の時刻を出す。桁数の違いで中心がずれないことも確認できる。
writePng(path.join(DOCS_ROOT, 'preview-rain-390x450.png'), preview('rain', { hour: '9', minute: '32' }))
writePng(
  path.join(DOCS_ROOT, 'preview-night-390x450.png'),
  preview('clear_night', { hour: '2', minute: '47' }),
)

// 提出用プレビュー。Zeppの審査要件は次の3つ。
//   1. 画面解像度と同じ寸法（390×450）にする
//   2. 端末の角丸に合わせて四隅を切り抜く（不透明な直角の隅があると差し戻される）
//   3. 時刻は 10:09 を表示する
// 角は距離場でアルファを落とす。1画素ぶんで落とすので、拡大表示されても
// 階段状にならない。
function cropToScreenCorners(source, radius) {
  const png = new PNG({ width: source.width, height: source.height })
  source.data.copy(png.data)
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const d = roundRectDistance(x + 0.5, y + 0.5, 0, 0, png.width, png.height, radius)
      const coverage = Math.min(1, Math.max(0, 0.5 - d))
      if (coverage >= 1) continue
      const index = (png.width * y + x) << 2
      png.data[index + 3] = Math.round(png.data[index + 3] * coverage)
    }
  }
  return png
}

writePng(
  path.join(ASSET_ROOT, 'preview.png'),
  cropToScreenCorners(fullPreview, SCREEN.cornerRadius),
)

console.log('Generated original pixel assets in assets/bip-6/images')
