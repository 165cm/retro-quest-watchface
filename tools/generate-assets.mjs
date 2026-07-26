import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

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

function overlayRect(png, x, y, w, h, fill, alpha) {
  const rgba = color(fill)
  const opacity = alpha / 255
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      if (xx < 0 || yy < 0 || xx >= png.width || yy >= png.height) continue
      const index = (png.width * yy + xx) << 2
      setPixel(png, xx, yy, [
        Math.round(png.data[index] * (1 - opacity) + rgba[0] * opacity),
        Math.round(png.data[index + 1] * (1 - opacity) + rgba[1] * opacity),
        Math.round(png.data[index + 2] * (1 - opacity) + rgba[2] * opacity),
        255,
      ])
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

function writePng(file, png) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, PNG.sync.write(png, { colorType: 6 }))
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

function drawGlyphOutlined(png, glyph, x, y, scale, fill, outline, thickness = 2) {
  for (let oy = -thickness; oy <= thickness; oy += 1) {
    for (let ox = -thickness; ox <= thickness; ox += 1) {
      if (Math.abs(ox) + Math.abs(oy) <= thickness + 1) {
        drawGlyph(png, glyph, x + ox, y + oy, scale, outline)
      }
    }
  }
  drawGlyph(png, glyph, x, y, scale, fill)
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

function drawPattern(png, rows, x, y, scale, palette) {
  rows.forEach((row, rowIndex) => {
    ;[...row].forEach((pixel, columnIndex) => {
      if (pixel !== '0') {
        rect(
          png,
          x + columnIndex * scale,
          y + rowIndex * scale,
          scale,
          scale,
          palette[pixel],
        )
      }
    })
  })
}

function generateDigitSet(name, width, height, scale, fill, outline = null, options = {}) {
  const { thickness = 2, shadow = null, shadowOffset = 3, colonW = null } = options
  const directory = path.join(ASSET_ROOT, 'digits', name)
  for (let digit = 0; digit <= 9; digit += 1) {
    const png = image(width, height, '#00000000')
    const glyphW = 5 * scale
    const glyphH = 7 * scale
    const x = Math.floor((width - glyphW) / 2)
    const y = Math.floor((height - glyphH) / 2)
    if (outline) {
      if (shadow) drawGlyph(png, digit, x + shadowOffset, y + shadowOffset, scale, shadow)
      drawGlyphOutlined(png, digit, x, y, scale, fill, outline, thickness)
    } else {
      drawGlyph(png, digit, x, y, scale, fill)
    }
    writePng(path.join(directory, `${digit}.png`), png)
  }

  const colon = image(colonW || (name === 'aod' ? 12 : width), height, '#00000000')
  const dot = Math.max(2, scale)
  rect(colon, Math.floor((colon.width - dot) / 2), Math.floor(height * 0.32), dot, dot, fill)
  rect(colon, Math.floor((colon.width - dot) / 2), Math.floor(height * 0.64), dot, dot, fill)
  writePng(path.join(directory, 'colon.png'), colon)

  const negative = image(Math.max(scale * 3, 8), height, '#00000000')
  rect(negative, 0, Math.floor(height / 2), negative.width, Math.max(2, scale), fill)
  writePng(path.join(directory, 'negative.png'), negative)

  const degree = image(Math.max(scale * 4, 10), height, '#00000000')
  const d = Math.max(2, scale)
  const ox = 1
  const oy = Math.max(1, Math.floor(height * 0.12))
  rect(degree, ox + d, oy, d * 2, d, fill)
  rect(degree, ox, oy + d, d, d * 2, fill)
  rect(degree, ox + d * 3, oy + d, d, d * 2, fill)
  rect(degree, ox + d, oy + d * 3, d * 2, d, fill)
  writePng(path.join(directory, 'degree.png'), degree)
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
const ICON_SIZE = 34

const ICON_COLORS = Object.freeze({
  sun: '#F8D257',
  sunCore: '#FFF2A1',
  moon: '#F0DB82',
  moonShade: '#D9A93A',
  cloud: '#DCE4E6',
  cloudShade: '#A7B4BA',
  cloudDark: '#7C8A93',
  rain: '#69A7E8',
  snow: '#F4F3E8',
  bolt: '#F5D765',
  fog: '#C2CBCB',
})

function iconSun(png, cx, cy, radius) {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      const distance = x * x + y * y
      if (distance > radius * radius) continue
      const fill = distance <= (radius - 3) * (radius - 3) ? ICON_COLORS.sunCore : ICON_COLORS.sun
      rect(png, cx + x, cy + y, 1, 1, fill)
    }
  }
  const reach = radius + 5
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    rect(png, cx + dx * reach - (dy === 0 ? 0 : 1), cy + dy * reach - (dx === 0 ? 0 : 1), dy === 0 ? 4 : 2, dx === 0 ? 4 : 2, ICON_COLORS.sun)
  }
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const offset = Math.round(reach * 0.7)
    rect(png, cx + dx * offset - 1, cy + dy * offset - 1, 2, 2, ICON_COLORS.sun)
  }
}

function iconMoon(png, cx, cy, radius) {
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      if (x * x + y * y > radius * radius) continue
      // 右側を欠かせて三日月にする。
      const bite = (x - radius * 0.55) ** 2 + y * y
      if (bite <= (radius * 0.9) ** 2) continue
      const edge = x * x + y * y > (radius - 2) * (radius - 2)
      rect(png, cx + x, cy + y, 1, 1, edge ? ICON_COLORS.moonShade : ICON_COLORS.moon)
    }
  }
}

function iconCloud(png, x, y, dark = false) {
  const body = dark ? ICON_COLORS.cloudDark : ICON_COLORS.cloud
  const shade = dark ? '#5E6C75' : ICON_COLORS.cloudShade
  rect(png, x + 6, y + 2, 12, 6, body)
  rect(png, x + 2, y + 6, 20, 7, body)
  rect(png, x, y + 9, 24, 5, body)
  rect(png, x + 2, y + 12, 20, 3, shade)
  rect(png, x + 6, y + 2, 8, 2, dark ? '#95A2AB' : '#FFFFFF')
}

function iconRain(png, x, y) {
  for (const dx of [3, 10, 17]) {
    line(png, x + dx, y, x + dx - 3, y + 8, ICON_COLORS.rain, 2)
  }
}

function iconSnow(png, x, y) {
  for (const [dx, dy] of [[3, 1], [11, 5], [19, 1], [7, 8], [15, 8]]) {
    rect(png, x + dx, y + dy, 3, 3, ICON_COLORS.snow)
  }
}

function iconBolt(png, x, y) {
  line(png, x + 10, y, x + 4, y + 7, ICON_COLORS.bolt, 3)
  line(png, x + 4, y + 7, x + 10, y + 7, ICON_COLORS.bolt, 3)
  line(png, x + 10, y + 7, x + 3, y + 15, ICON_COLORS.bolt, 3)
}

function drawWeatherIcon(theme) {
  const png = image(ICON_SIZE, ICON_SIZE, '#00000000')
  switch (theme) {
    case 'clear_day':
      iconSun(png, 17, 17, 9)
      break
    case 'partly_cloudy_day':
      iconSun(png, 12, 11, 7)
      iconCloud(png, 5, 14)
      break
    case 'cloudy_day':
      iconCloud(png, 5, 9)
      break
    case 'rain':
      iconCloud(png, 5, 4)
      iconRain(png, 7, 21)
      break
    case 'thunder':
      iconCloud(png, 5, 3, true)
      iconBolt(png, 8, 18)
      break
    case 'snow':
      iconCloud(png, 5, 4)
      iconSnow(png, 5, 21)
      break
    case 'fog':
      iconCloud(png, 5, 2)
      for (let i = 0; i < 3; i += 1) {
        rect(png, 3 + (i % 2) * 4, 20 + i * 5, 26 - (i % 2) * 6, 3, ICON_COLORS.fog)
      }
      break
    case 'clear_night':
      iconMoon(png, 18, 17, 11)
      break
    case 'cloudy_night':
      iconMoon(png, 20, 11, 8)
      iconCloud(png, 5, 14)
      break
    default:
      iconCloud(png, 5, 9, true)
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

// watchface/index.js の cornerGems() と同じ装飾。
function cornerGemsAt(png, x, y, w, h, gem = 4) {
  ;[
    [x - 1, y - 1],
    [x + w - gem + 1, y - 1],
    [x - 1, y + h - gem + 1],
    [x + w - gem + 1, y + h - gem + 1],
  ].forEach(([gx, gy]) => rect(png, gx, gy, gem, gem, '#C9A85C'))
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
function preview(theme = 'clear_day') {
  const png = image(390, 450, '#031426')
  blit(png, loadBackground(theme), 12, 10)

  // 最上段: 薄い暗幕 + 天候アイコン + 日付 + HP
  overlayRect(png, 12, 12, 366, 66, '#031426', 100)
  blit(png, drawWeatherIcon(theme), 20, 22)
  drawText(png, '7/24 FRI', 62, 30, 3, '#F4F3E8', 2)
  drawText(png, 'HP', 208, 30, 3, '#F4F3E8', 3)
  for (let i = 0; i < 10; i += 1) {
    const x = 242 + i * 13
    rect(png, x, 30, 11, 16, '#A9B0B8')
    rect(png, x + 2, 32, 7, 12, i < 7 ? '#62B84A' : '#183047')
  }
  drawText(png, '68%', 321, 54, 3, '#F4F3E8', 2)

  // 時刻: 覆いなしで背景に直接。影 + 太い縁取りで視認性を確保。
  // 座標は watchface/time-sprites.js の中央寄せ計算と一致させる。
  const digitW = 52
  const digitH = 72
  const colonW = 18
  const gap = 6
  const timeY = 96
  const totalW = 4 * digitW + colonW + 4 * gap
  let cursor = Math.round((390 - totalW) / 2)
  const glyphInsetX = Math.floor((digitW - 5 * 9) / 2)
  const glyphInsetY = Math.floor((digitH - 7 * 9) / 2)
  ;[1, 0].forEach((digit) => {
    drawGlyph(png, digit, cursor + glyphInsetX + 4, timeY + glyphInsetY + 4, 9, '#010912')
    drawGlyphOutlined(png, digit, cursor + glyphInsetX, timeY + glyphInsetY, 9, '#F4F3E8', '#031426', 3)
    cursor += digitW + gap
  })
  rect(png, cursor + Math.floor((colonW - 9) / 2), timeY + Math.floor(digitH * 0.32), 9, 9, '#F4F3E8')
  rect(png, cursor + Math.floor((colonW - 9) / 2), timeY + Math.floor(digitH * 0.64), 9, 9, '#F4F3E8')
  cursor += colonW + gap
  ;[0, 9].forEach((digit) => {
    drawGlyph(png, digit, cursor + glyphInsetX + 4, timeY + glyphInsetY + 4, 9, '#010912')
    drawGlyphOutlined(png, digit, cursor + glyphInsetX, timeY + glyphInsetY, 9, '#F4F3E8', '#031426', 3)
    cursor += digitW + gap
  })
  drawText(png, 'AM', 324, 148, 3, '#A9B0B8', 3)

  // TACTICウィンドウ: タブと本文の塗りを隣接させ、枠線は辺ごとに描いて継ぎ目を開ける。
  overlayRect(png, 20, 192, 124, 32, '#061B31', 185)
  overlayRect(png, 20, 224, 350, 64, '#061B31', 185)
  rect(png, 20, 192, 124, 2, '#F4F3E8')
  rect(png, 20, 192, 2, 32, '#F4F3E8')
  rect(png, 142, 192, 2, 32, '#F4F3E8')
  rect(png, 142, 224, 228, 2, '#F4F3E8')
  rect(png, 20, 224, 2, 64, '#F4F3E8')
  rect(png, 368, 224, 2, 64, '#F4F3E8')
  rect(png, 20, 286, 350, 2, '#F4F3E8')
  cornerGemsAt(png, 20, 192, 350, 96)
  drawText(png, 'TACTIC', 45, 201, 2, '#A9B0B8', 2)
  drawText(png, 'SAFETY FIRST', 92, 243, 3, '#F4F3E8', 3)

  // 気温: L / NOW / H の3列
  overlayRect(png, 20, 314, 350, 96, '#061B31', 185)
  rect(png, 20, 314, 350, 2, '#F4F3E8')
  rect(png, 20, 314, 2, 96, '#F4F3E8')
  rect(png, 368, 314, 2, 96, '#F4F3E8')
  rect(png, 20, 408, 350, 2, '#F4F3E8')
  cornerGemsAt(png, 20, 314, 350, 96)
  rect(png, 136, 316, 2, 92, '#F4F3E8')
  rect(png, 252, 316, 2, 92, '#F4F3E8')
  drawText(png, 'L', 74, 330, 2, '#69A7E8', 2)
  drawText(png, 'NOW', 177, 330, 2, '#F4F3E8', 2)
  drawText(png, 'H', 306, 330, 2, '#E98A4A', 2)
  drawText(png, '24°', 46, 358, 4, '#69A7E8', 3)
  drawText(png, '29°', 162, 358, 4, '#F4F3E8', 3)
  drawText(png, '32°', 278, 358, 4, '#E98A4A', 3)

  return png
}

generateDigitSet('time', 52, 72, 9, '#F4F3E8', '#031426', {
  thickness: 3,
  shadow: '#010912',
  shadowOffset: 4,
  colonW: 18,
})
generateDigitSet('aod', 32, 49, 6, '#B8B8B8', '#000000')
generateDigitSet('temp-low', 22, 35, 4, '#69A7E8')
generateDigitSet('temp-now', 22, 35, 4, '#F4F3E8')
generateDigitSet('temp-high', 22, 35, 4, '#E98A4A')

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
writePng(path.join(DOCS_ROOT, 'preview-rain-390x450.png'), preview('rain'))
writePng(path.join(DOCS_ROOT, 'preview-night-390x450.png'), preview('clear_night'))

const thumbnail = image(266, 307, '#031426')
for (let y = 0; y < thumbnail.height; y += 1) {
  for (let x = 0; x < thumbnail.width; x += 1) {
    const sx = Math.floor((x / thumbnail.width) * fullPreview.width)
    const sy = Math.floor((y / thumbnail.height) * fullPreview.height)
    const sourceIndex = (fullPreview.width * sy + sx) << 2
    setPixel(thumbnail, x, y, [
      fullPreview.data[sourceIndex],
      fullPreview.data[sourceIndex + 1],
      fullPreview.data[sourceIndex + 2],
      fullPreview.data[sourceIndex + 3],
    ])
  }
}
writePng(path.join(ASSET_ROOT, 'preview.png'), thumbnail)

console.log('Generated original pixel assets in assets/bip-6/images')
