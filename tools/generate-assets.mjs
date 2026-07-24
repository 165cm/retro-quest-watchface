import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const ROOT = process.cwd()
const ASSET_ROOT = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS_ROOT = path.join(ROOT, 'docs')

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

function generateDigitSet(name, width, height, scale, fill, outline = null) {
  const directory = path.join(ASSET_ROOT, 'digits', name)
  for (let digit = 0; digit <= 9; digit += 1) {
    const png = image(width, height, '#00000000')
    const glyphW = 5 * scale
    const glyphH = 7 * scale
    const x = Math.floor((width - glyphW) / 2)
    const y = Math.floor((height - glyphH) / 2)
    if (outline) drawGlyphOutlined(png, digit, x, y, scale, fill, outline)
    else drawGlyph(png, digit, x, y, scale, fill)
    writePng(path.join(directory, `${digit}.png`), png)
  }

  const colon = image(name === 'time' ? 16 : name === 'aod' ? 12 : width, height, '#00000000')
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
  rect(png, x + 8, y + 16, 46, 5, shade)
}

function pine(png, x, y, height, dark, light) {
  const trunkW = Math.max(2, Math.floor(height / 10))
  rect(png, x - Math.floor(trunkW / 2), y - height + 8, trunkW, height - 8, '#392F2A')
  polygon(png, [[x, y - height], [x - height * 0.22, y - height * 0.45], [x + height * 0.22, y - height * 0.45]], light)
  polygon(png, [[x, y - height * 0.75], [x - height * 0.3, y - height * 0.18], [x + height * 0.3, y - height * 0.18]], dark)
  polygon(png, [[x, y - height * 0.5], [x - height * 0.35, y], [x + height * 0.35, y]], dark)
}

function castle(png, x, y, night) {
  const stone = night ? '#5D6670' : '#B7AA8B'
  const lightStone = night ? '#78808A' : '#D0C19E'
  const roof = night ? '#14233E' : '#253E56'
  rect(png, x, y - 60, 68, 60, stone)
  rect(png, x - 12, y - 46, 20, 46, stone)
  rect(png, x + 60, y - 46, 20, 46, stone)
  rect(png, x + 24, y - 84, 22, 84, lightStone)
  polygon(png, [[x - 14, y - 46], [x - 2, y - 64], [x + 10, y - 46]], roof)
  polygon(png, [[x + 20, y - 84], [x + 35, y - 106], [x + 50, y - 84]], roof)
  polygon(png, [[x + 58, y - 46], [x + 70, y - 64], [x + 82, y - 46]], roof)
  rect(png, x + 30, y - 22, 12, 22, '#20232B')
  const window = night ? '#F5B942' : '#497795'
  for (const [wx, wy] of [[4, -36], [28, -66], [52, -36], [67, -28]]) {
    rect(png, x + wx, y + wy, 5, 8, window)
    rect(png, x + wx + 2, y + wy, 1, 8, lightStone)
  }
  rect(png, x + 34, y - 118, 3, 14, '#D7D6C4')
  rect(png, x + 37, y - 117, 12, 7, '#D9534F')
}

function drawWorld(theme) {
  const palette = PALETTES[theme]
  const png = image(366, 430, palette.sky[0])
  const night = theme.includes('night')

  palette.sky.forEach((band, index) => rect(png, 0, index * 48, 366, 48, band))

  if (night) {
    ;[[24, 18], [72, 61], [124, 34], [184, 79], [234, 22], [284, 58], [340, 31]]
      .forEach(([x, y]) => rect(png, x, y, 3, 3, '#D5E7EB'))
    drawPattern(
      png,
      ['001110000', '011110000', '111100000', '111000000', '111000000', '111100000', '011111100', '001111000'],
      292,
      18,
      4,
      { 1: '#F0DB82' },
    )
  } else if (!['cloudy_day', 'rain', 'thunder', 'snow', 'fog', 'unknown'].includes(theme)) {
    drawPattern(
      png,
      ['0001000', '0011100', '0111110', '1112111', '0111110', '0011100', '0001000'],
      24,
      20,
      6,
      { 1: '#F8D257', 2: '#FFF2A1' },
    )
    rect(png, 42, 10, 6, 7, '#F8D257')
    rect(png, 42, 65, 6, 7, '#F8D257')
    rect(png, 14, 38, 7, 6, '#F8D257')
    rect(png, 69, 38, 7, 6, '#F8D257')
  }

  if (theme.includes('cloudy') || ['rain', 'thunder', 'snow', 'unknown'].includes(theme)) {
    cloud(png, 24, 54, theme === 'thunder' ? '#555D72' : '#AEB9BE', '#7F919B')
    cloud(png, 244, 78, night ? '#53637A' : '#C5CDD0', night ? '#3D4D64' : '#9DADB4')
  }
  if (theme === 'partly_cloudy_day') cloud(png, 252, 54, '#E4E9E5', '#B8CDD4')

  polygon(png, [[0, 238], [58, 146], [112, 229], [165, 126], [226, 230], [286, 155], [366, 236], [366, 300], [0, 300]], palette.far)
  polygon(png, [[32, 215], [58, 164], [80, 205]], '#D7E3E1')
  polygon(png, [[133, 180], [165, 126], [196, 178], [178, 163], [165, 178], [153, 158]], '#E5EBE6')
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

function preview(theme = 'clear_day') {
  const png = image(390, 450, '#031426')
  blit(png, drawWorld(theme), 12, 10)
  overlayRect(png, 18, 76, 354, 54, '#031426', 150)
  rect(png, 12, 146, 366, 68, '#061B31')
  rect(png, 12, 146, 366, 2, '#F4F3E8')
  rect(png, 12, 212, 366, 2, '#F4F3E8')
  rect(png, 12, 146, 2, 68, '#F4F3E8')
  rect(png, 376, 146, 2, 68, '#F4F3E8')

  drawText(png, 'L 24°', 25, 101, 2, '#69A7E8', 2)
  drawText(png, '29°', 162, 91, 4, '#F4F3E8', 3)
  drawText(png, 'H 32°', 277, 101, 2, '#E98A4A', 2)
  drawText(png, 'TACTIC', 26, 155, 2, '#A9B0B8', 2)
  drawText(png, 'SAFETY FIRST', 26, 181, 3, '#F4F3E8', 3)

  const digits = [1, 0, 0, 9]
  const xs = [81, 131, 193, 243]
  digits.forEach((digit, index) =>
    drawGlyphOutlined(png, digit, xs[index], 231, 8, '#F4F3E8', '#031426'),
  )
  rect(png, 179, 250, 7, 7, '#F4F3E8')
  rect(png, 179, 273, 7, 7, '#F4F3E8')

  overlayRect(png, 18, 299, 354, 42, '#031426', 145)
  drawText(png, '7/24 FRI', 117, 307, 3, '#F4F3E8', 3)
  overlayRect(png, 18, 353, 354, 42, '#031426', 165)
  drawText(png, 'HP', 22, 365, 3, '#F4F3E8', 3)
  drawText(png, '68%', 316, 365, 3, '#F4F3E8', 2)

  for (let i = 0; i < 10; i += 1) {
    rect(png, 68 + i * 24, 367, 20, 15, '#A9B0B8')
    rect(png, 70 + i * 24, 369, 16, 11, i < 7 ? '#62B84A' : '#183047')
  }
  return png
}

generateDigitSet('time', 44, 65, 8, '#F4F3E8', '#031426')
generateDigitSet('aod', 32, 49, 6, '#B8B8B8', '#000000')
generateDigitSet('temp-low', 15, 24, 3, '#69A7E8')
generateDigitSet('temp-now', 22, 35, 4, '#F4F3E8')
generateDigitSet('temp-high', 15, 24, 3, '#E98A4A')

Object.keys(PALETTES).forEach((theme) => {
  writePng(path.join(ASSET_ROOT, 'backgrounds', `${theme}.png`), drawWorld(theme))
})

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
