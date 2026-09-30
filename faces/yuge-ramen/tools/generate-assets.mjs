// ゆげおばけの文字盤の絵（PNG）をすべて作る。絵は SVG で描き、resvg で PNG にする。
// キャラクター・数字・背景はすべてこのファイルで描いたオリジナル。既存作品の絵や公式フォントは使わない。
//
//   npm run assets -- yuge-ramen
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { DIGITS, LAYOUT, SCREEN } from '../watchface/layout.js'
import { MOODS } from '../watchface/shift.js'

const ROOT = process.cwd()
const IMAGES = path.join(ROOT, 'assets', 'bip-6', 'images')
const DOCS = path.join(ROOT, 'docs')

const C = {
  cocoa: '#5B4636',
  cocoaSoft: '#8A7462',
  cream: '#FFF8E7',
  white: '#FFFFFF',
  pink: '#F29AA8',
  red: '#E86A5C',
  broth: '#F4C27A',
  noodle: '#F2CF5B',
  band: '#7FB7E0',
  aod: '#A89C90',
  yellow: '#FFD98A',
}

// ---------- 書き出し ----------

function svg(width, height, body, viewBox = `0 0 ${width} ${height}`) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="none">${body}</svg>`
}

function renderPng(source) {
  return new Resvg(source, {
    font: { loadSystemFonts: true, defaultFontFamily: 'sans-serif' },
  })
    .render()
    .asPng()
}

function write(file, source) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, renderPng(source))
}

function dataUri(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`
}

// 決まった順に同じ乱数を出す（何度作っても同じ絵になる）。
function random(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

// ---------- 数字（手書き風の丸い線） ----------
// 40×64 の枠に、線（stroke）で描く。はし（線の端）は丸くする。

const GLYPHS = {
  0: '<ellipse cx="20" cy="32" rx="14" ry="24"/>',
  1: '<path d="M11 17 L22 8 V56"/>',
  2: '<path d="M7 19 C7 5 33 4 33 19 C33 31 13 41 7 56 H34"/>',
  3: '<path d="M8 13 C13 4 33 4 32 18 C31 27 23 30 18 30 C27 30 34 35 33 45 C32 60 12 60 7 51"/>',
  4: '<path d="M27 56 V8 L6 42 H35"/>',
  5: '<path d="M32 8 H12 L9 29 C15 24 33 24 33 41 C33 58 12 60 7 51"/>',
  6: '<path d="M30 10 C18 5 7 19 7 38 C7 52 13 58 21 58 C29 58 33 51 33 43 C33 35 28 29 20 29 C13 29 8 34 7 40"/>',
  7: '<path d="M7 8 H33 C24 22 18 38 16 56"/>',
  8: '<ellipse cx="20" cy="19" rx="11" ry="11"/><ellipse cx="20" cy="43" rx="13" ry="14"/>',
  9: '<path transform="rotate(180 20 32)" d="M30 10 C18 5 7 19 7 38 C7 52 13 58 21 58 C29 58 33 51 33 43 C33 35 28 29 20 29 C13 29 8 34 7 40"/>',
  negative: '<path d="M8 32 H32"/>',
}

function strokes(shape, color, width) {
  return `<g fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`
}

// outline を渡すと、白いふちどりを下に敷く（背景の上でも読めるように）。
function glyphSvg(shape, w, h, { color, width, outline }) {
  const body = (outline ? strokes(shape, outline, width + 7) : '') + strokes(shape, color, width)
  return svg(w, h, body, '-5 -4 50 72')
}

function colonSvg(w, h, { color, outline }) {
  // 40×64 の枠と同じ高さで、点を2つ
  const dots = (fill, r) =>
    `<circle cx="${w / 2}" cy="${h * 0.36}" r="${r}" fill="${fill}"/><circle cx="${w / 2}" cy="${h * 0.66}" r="${r}" fill="${fill}"/>`
  const r = Math.max(2.5, w * 0.2)
  return svg(w, h, (outline ? dots(outline, r + 3) : '') + dots(color, r))
}

function degreeSvg(w, h, color) {
  return svg(w, h, `<circle cx="${w / 2}" cy="${h * 0.22}" r="${w * 0.24}" fill="none" stroke="${color}" stroke-width="2.5"/>`)
}

function writeDigits(name, { w, h, colonW }, style) {
  const dir = path.join(IMAGES, 'digits', name)
  for (let digit = 0; digit <= 9; digit += 1) {
    write(path.join(dir, `${digit}.png`), glyphSvg(GLYPHS[digit], w, h, style))
  }
  write(path.join(dir, 'negative.png'), glyphSvg(GLYPHS.negative, Math.round(w * 0.7), h, style))
  if (colonW) write(path.join(dir, 'colon.png'), colonSvg(colonW, h, style))
  write(path.join(dir, 'degree.png'), degreeSvg(Math.round(w * 0.6), h, style.color))
}

// ---------- ゆげおばけ（160×160） ----------

const BODY =
  'M37 114 C29 68 46 39 73 36 C68 25 80 13 93 9 C88 19 86 29 91 36 C117 40 131 70 123 114 Z'

function face(mood) {
  const cheeks = `<ellipse cx="54" cy="84" rx="9" ry="5.5" fill="${C.pink}" opacity="0.85"/><ellipse cx="106" cy="84" rx="9" ry="5.5" fill="${C.pink}" opacity="0.85"/>`
  const dotEyes = `<ellipse cx="68" cy="71" rx="3.8" ry="4.8" fill="${C.cocoa}"/><ellipse cx="92" cy="71" rx="3.8" ry="4.8" fill="${C.cocoa}"/><circle cx="69.3" cy="69.3" r="1.3" fill="#fff"/><circle cx="93.3" cy="69.3" r="1.3" fill="#fff"/>`
  const line = (d, width = 2.6) =>
    `<path d="${d}" fill="none" stroke="${C.cocoa}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  switch (mood) {
    case 'work':
      return (
        cheeks +
        dotEyes +
        line('M62 62 L73 64') +
        line('M98 62 L87 64') +
        line('M75 81 Q80 84 85 81')
      )
    case 'happy':
      return (
        cheeks +
        line('M62 73 Q68 64 74 73', 3) +
        line('M86 73 Q92 64 98 73', 3) +
        `<path d="M73 79 Q80 90 87 79 Z" fill="${C.red}" stroke="${C.cocoa}" stroke-width="2.2" stroke-linejoin="round"/>`
      )
    case 'tired':
      return (
        cheeks +
        line('M62 70 Q68 74 74 71', 3) +
        line('M86 71 Q92 74 98 70', 3) +
        line('M73 84 Q76.5 80 80 84 Q83.5 88 87 84') +
        `<path d="M112 50 Q117 58 112 62 Q107 58 112 50 Z" fill="#BFE3F5" stroke="${C.cocoa}" stroke-width="1.6"/>`
      )
    case 'sleep':
      return (
        cheeks +
        line('M62 70 Q68 76 74 70', 3) +
        line('M86 70 Q92 76 98 70', 3) +
        `<ellipse cx="80" cy="83" rx="2.6" ry="2" fill="${C.cocoa}"/>`
      )
    default:
      return cheeks + dotEyes + line('M74 80 Q77 84 80 80 Q83 84 86 80')
  }
}

function extras(mood) {
  const line = (d, color = C.cocoa, width = 2.6) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  const star = (x, y, r) =>
    `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${C.yellow}" stroke="${C.cocoa}" stroke-width="1.2"/>`
  switch (mood) {
    case 'work':
      // はちまき（手ぬぐい）と結び目
      return (
        line('M40 57 Q80 44 121 57', C.band, 9) +
        `<ellipse cx="126" cy="55" rx="7" ry="4" fill="${C.band}" transform="rotate(-30 126 55)"/><ellipse cx="127" cy="63" rx="7" ry="4" fill="${C.band}" transform="rotate(25 127 63)"/>`
      )
    case 'happy':
      return star(128, 34, 8) + star(34, 46, 6) + star(136, 70, 5)
    case 'sleep':
      return line('M118 24 H128 L118 36 H128', C.cocoaSoft, 2.4) + line('M132 8 H139 L132 17 H139', C.cocoaSoft, 2)
    default:
      return ''
  }
}

function obakeSvg(mood, { lineColor = C.cocoa, aod = false } = {}) {
  if (aod) {
    // AOD 用：線だけで、光る所を少なく
    return svg(
      160,
      160,
      `<path d="${BODY}" fill="none" stroke="${C.aod}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M18 112 Q22 150 80 152 Q138 150 142 112 Z" fill="none" stroke="${C.aod}" stroke-width="3"/>`,
    )
  }
  const soup =
    `<ellipse cx="80" cy="112" rx="60" ry="11" fill="${C.broth}" stroke="${lineColor}" stroke-width="3"/>` +
    `<path d="M26 111 Q32 106 38 111 Q44 116 50 111" fill="none" stroke="${C.noodle}" stroke-width="3.5" stroke-linecap="round"/>` +
    `<circle cx="121" cy="110" r="7" fill="#fff" stroke="${lineColor}" stroke-width="1.6"/><path d="M121 110 m-3 0 a3 3 0 1 1 3 3 a5 5 0 1 1 -5 -5" fill="none" stroke="${C.pink}" stroke-width="1.8"/>`
  const arms =
    `<path d="M39 88 Q27 92 29 102" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M121 88 Q133 92 131 102" fill="none" stroke="${lineColor}" stroke-width="3" stroke-linecap="round"/>`
  const body = `<path d="${BODY}" fill="#FFFFFF" stroke="${lineColor}" stroke-width="3" stroke-linejoin="round"/>`
  const bowl =
    `<path d="M18 112 Q22 150 80 152 Q138 150 142 112 Q80 126 18 112 Z" fill="#FFFDF8" stroke="${lineColor}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M24 127 Q80 143 136 127" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M24 127 Q80 143 136 127" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2 7" stroke-linecap="round"/>` +
    `<ellipse cx="80" cy="152" rx="26" ry="5" fill="#FFFDF8" stroke="${lineColor}" stroke-width="2.5"/>`
  return svg(160, 160, soup + arms + body + face(mood) + extras(mood) + bowl)
}

// ---------- 小物 ----------

function bubbleSvg() {
  const { w, h } = LAYOUT.bubble
  return svg(
    w,
    h,
    `<path d="M36 4 H${w - 26} Q${w - 4} 4 ${w - 4} 26 V${h - 26} Q${w - 4} ${h - 4} ${w - 26} ${h - 4} H38 Q16 ${h - 4} 15 ${h - 22} L3 ${h - 12} L14 ${h - 36} V26 Q14 4 36 4 Z" fill="#FFFFFF" stroke="${C.cocoa}" stroke-width="3" stroke-linejoin="round"/>`,
  )
}

function footSvg() {
  const { w, h } = LAYOUT.stepIcon
  const foot = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse cx="0" cy="3" rx="4.2" ry="6" fill="${C.cocoaSoft}"/><circle cx="-3" cy="-5.5" r="1.4" fill="${C.cocoaSoft}"/><circle cx="0" cy="-6.4" r="1.4" fill="${C.cocoaSoft}"/><circle cx="3" cy="-5.5" r="1.4" fill="${C.cocoaSoft}"/></g>`
  return svg(w, h, foot(10, 18, -12) + foot(21, 11, 12))
}

// 電池：どんぶりの中のスープの量（0〜5）
function batterySvg(level) {
  const { w, h } = LAYOUT.batteryIcon
  const top = 9
  const bottom = 31
  const fillTop = bottom - ((bottom - top) * level) / 5
  const color = level <= 1 ? C.red : C.broth
  const bowlPath = `M3 ${top} Q4 ${bottom} ${w / 2} ${bottom + 1} Q${w - 4} ${bottom} ${w - 3} ${top} Z`
  return svg(
    w,
    h,
    `<defs><clipPath id="b"><path d="${bowlPath}"/></clipPath></defs>` +
      `<path d="${bowlPath}" fill="#FFFDF8"/>` +
      (level > 0 ? `<rect x="0" y="${fillTop}" width="${w}" height="${h}" fill="${color}" clip-path="url(#b)"/>` : '') +
      `<path d="${bowlPath}" fill="none" stroke="${C.cocoa}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="M${w / 2 - 5} 6 Q${w / 2 - 8} 3 ${w / 2 - 5} 0 M${w / 2 + 3} 6 Q${w / 2} 3 ${w / 2 + 3} 0" fill="none" stroke="${C.cocoaSoft}" stroke-width="1.6" stroke-linecap="round" opacity="${level > 0 ? 1 : 0}"/>`,
  )
}

// ---------- 背景（390×450） ----------

const SKIES = {
  clear_day: ['#BFE6FA', '#EAF8FF', '#BFE3A0', '#A8D68A', 'sun'],
  partly_cloudy_day: ['#C7E4F5', '#EEF7FC', '#BFE3A0', '#A8D68A', 'sun-cloud'],
  cloudy_day: ['#D3DDE6', '#EEF2F5', '#C4DDB0', '#AFCF98', 'cloud'],
  rain: ['#BCC9D8', '#E1E8F0', '#B4D6A4', '#9CC68C', 'rain'],
  thunder: ['#B6B4CF', '#DEDCEC', '#AFCFA0', '#98BF8A', 'thunder'],
  snow: ['#D5E6F3', '#F2F8FC', '#F6FAFC', '#E6EFF5', 'snow'],
  fog: ['#DCD8EA', '#F3F1F8', '#CFE2C2', '#BCD6AE', 'fog'],
  clear_night: ['#4B4F8C', '#8C86BF', '#6F8F87', '#5E7F78', 'moon'],
  cloudy_night: ['#5A5E8A', '#9A96BD', '#6F8F87', '#5E7F78', 'moon-cloud'],
  unknown: ['#D8F0E4', '#F4FBF6', '#C6E6B4', '#B0D89C', ''],
}

function cloud(x, y, s, opacity = 0.95) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#FFFFFF" opacity="${opacity}"><circle cx="0" cy="0" r="16"/><circle cx="18" cy="-8" r="20"/><circle cx="38" cy="0" r="15"/><rect x="0" y="0" width="38" height="15"/></g>`
}

function flower(x, y, r, petal, rnd) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 + rnd() * 0.5
    return `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.75).toFixed(1)}" fill="${petal}"/>`
  }).join('')
  return petals + `<circle cx="${x}" cy="${y}" r="${(r * 0.55).toFixed(1)}" fill="#FFE08A"/>`
}

function backgroundSvg(theme, seed) {
  const [skyTop, skyBottom, hillFar, hillNear, weather] = SKIES[theme]
  const night = theme.includes('night')
  const rnd = random(seed)
  const W = SCREEN.width
  const H = SCREEN.height
  let body = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient></defs>`
  body += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`

  // 空の飾り（時刻の後ろは避けて、左右のはしに置く）
  if (night) {
    for (let i = 0; i < 26; i += 1) {
      const x = 20 + rnd() * (W - 40)
      const y = 70 + rnd() * 220
      const r = 1 + rnd() * 1.6
      body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#FFF6C8" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`
    }
  }
  if (weather.startsWith('sun')) {
    body += `<circle cx="352" cy="158" r="17" fill="${C.yellow}"/><circle cx="352" cy="158" r="24" fill="${C.yellow}" opacity="0.35"/>`
  }
  if (weather.startsWith('moon')) {
    body += `<circle cx="352" cy="158" r="16" fill="#FFF3B8"/><circle cx="360" cy="152" r="14" fill="${skyBottom}"/>`
  }
  if (weather.includes('cloud') || ['rain', 'thunder'].includes(weather)) {
    const opacity = night ? 0.45 : 0.95
    body += cloud(26, 176, 0.9, opacity) + cloud(300, 106, 0.7, opacity) + cloud(330, 290, 0.6, opacity)
  }
  if (weather === 'thunder') {
    body += `<path d="M44 196 L32 222 H42 L34 246 L56 214 H45 L54 196 Z" fill="${C.yellow}" stroke="${C.cocoa}" stroke-width="1.6" stroke-linejoin="round"/>`
  }
  if (weather === 'fog') {
    for (const y of [120, 190, 262]) {
      body += `<rect x="-20" y="${y}" width="${W + 40}" height="22" rx="11" fill="#FFFFFF" opacity="0.55"/>`
    }
  }

  // 丘
  body += `<path d="M0 300 Q90 270 190 292 T390 282 V450 H0 Z" fill="${hillFar}"/>`
  body += `<path d="M0 330 Q110 306 220 326 T390 318 V450 H0 Z" fill="${hillNear}"/>`

  // 草と花
  const grass = night ? '#4E6E68' : theme === 'snow' ? '#C9D8E2' : '#8DBF74'
  for (let i = 0; i < 40; i += 1) {
    const x = rnd() * W
    const y = 320 + rnd() * 130
    body += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-3 -7 M${x.toFixed(1)} ${y.toFixed(1)} l3 -8" stroke="${grass}" stroke-width="1.8" stroke-linecap="round"/>`
  }
  const petals = night ? ['#C9C4E6', '#E7C6D6'] : theme === 'snow' ? ['#FFFFFF', '#F6D6DE'] : ['#FFFFFF', '#FBD3DB', '#FFFFFF']
  for (let i = 0; i < 16; i += 1) {
    const x = 20 + rnd() * (W - 40)
    const y = 322 + rnd() * 118
    body += flower(x, y, 3 + rnd() * 2.5, petals[i % petals.length], rnd)
  }

  // 雨・雪
  if (weather === 'rain' || weather === 'thunder') {
    for (let i = 0; i < 70; i += 1) {
      const x = rnd() * W
      const y = rnd() * H
      body += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-3 9" stroke="#8FB3D9" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`
    }
  }
  if (weather === 'snow') {
    for (let i = 0; i < 70; i += 1) {
      body += `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H).toFixed(1)}" r="${(1.5 + rnd() * 2).toFixed(1)}" fill="#FFFFFF" opacity="0.9"/>`
    }
  }
  return svg(W, H, body)
}

// ---------- プレビュー（文字盤全体をまとめて描く） ----------

function previewSvg({ theme, time, date, temp, label, message, mood, steps, battery }) {
  const img = (file, x, y, w, h) =>
    `<image href="${dataUri(path.join(IMAGES, file))}" x="${x}" y="${y}" width="${w}" height="${h}"/>`
  const text = (value, rect, size, anchor = 'middle', color = C.cocoa) => {
    const x = anchor === 'middle' ? rect.x + rect.w / 2 : anchor === 'end' ? rect.x + rect.w : rect.x
    return `<text x="${x}" y="${rect.y + rect.h / 2 + size * 0.36}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="bold">${value}</text>`
  }
  const row = (chars, dir, x0, y, w, h, extra = {}) => {
    let out = ''
    let x = x0
    for (const ch of chars) {
      const width = ch === ':' ? extra.colonW : ch === '°' ? Math.round(w * 0.6) : w
      const name = ch === ':' ? 'colon' : ch === '°' ? 'degree' : ch === '-' ? 'negative' : ch
      out += img(`digits/${dir}/${name}.png`, x, y, width, h)
      x += width + (extra.gap || 0)
    }
    return { out, width: x - x0 - (extra.gap || 0) }
  }
  const T = DIGITS.time
  const timeRow = row(time, 'time', 0, LAYOUT.time.y, T.w, T.h, T)
  const timeX = Math.round((SCREEN.width - timeRow.width) / 2)
  const S = DIGITS.small
  const tempRow = row(temp, 'small', 0, LAYOUT.temp.y, S.w, S.h, { gap: 1 })
  const stepRow = row(String(steps), 'small', LAYOUT.steps.x, LAYOUT.steps.y, S.w, S.h, { gap: 1 })
  const pill = (r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.radius}" fill="${C.cream}" opacity="0.8"/>`
  const level = Math.ceil((battery / 100) * 5)
  let body = img(`backgrounds/${theme}.png`, 0, 0, SCREEN.width, SCREEN.height)
  body += pill(LAYOUT.topPill)
  body += text(date, LAYOUT.date, 26, 'start')
  body += `<g transform="translate(${LAYOUT.temp.x + (LAYOUT.temp.w - tempRow.width) / 2} 0)">${tempRow.out}</g>`
  body += `<g transform="translate(${timeX} 0)">${timeRow.out}</g>`
  body += img(`obake/${mood}.png`, LAYOUT.obake.x, LAYOUT.obake.y, LAYOUT.obake.w, LAYOUT.obake.h)
  body += img('bubble.png', LAYOUT.bubble.x, LAYOUT.bubble.y, LAYOUT.bubble.w, LAYOUT.bubble.h)
  body += label
    ? text(label, LAYOUT.bubbleLabel, 20, 'middle', C.cocoaSoft) + text(message, LAYOUT.bubbleMain, 30)
    : text(message, LAYOUT.bubbleSingle, 27)
  body += pill(LAYOUT.bottomPill)
  body += img('icons/step.png', LAYOUT.stepIcon.x, LAYOUT.stepIcon.y, LAYOUT.stepIcon.w, LAYOUT.stepIcon.h)
  body += stepRow.out
  body += img(`battery/${level}.png`, LAYOUT.batteryIcon.x, LAYOUT.batteryIcon.y, LAYOUT.batteryIcon.w, LAYOUT.batteryIcon.h)
  body += text(`${battery}%`, LAYOUT.percent, 24, 'end', battery <= 20 ? '#D9534F' : C.cocoa)
  // Bip 6 の角丸（プレビューの見た目を実機に近づけるため）
  body += `<path d="M0 0 H${SCREEN.width} V${SCREEN.height} H0 Z M${SCREEN.cornerRadius} 0 H${SCREEN.width - SCREEN.cornerRadius} A${SCREEN.cornerRadius} ${SCREEN.cornerRadius} 0 0 1 ${SCREEN.width} ${SCREEN.cornerRadius} V${SCREEN.height - SCREEN.cornerRadius} A${SCREEN.cornerRadius} ${SCREEN.cornerRadius} 0 0 1 ${SCREEN.width - SCREEN.cornerRadius} ${SCREEN.height} H${SCREEN.cornerRadius} A${SCREEN.cornerRadius} ${SCREEN.cornerRadius} 0 0 1 0 ${SCREEN.height - SCREEN.cornerRadius} V${SCREEN.cornerRadius} A${SCREEN.cornerRadius} ${SCREEN.cornerRadius} 0 0 1 ${SCREEN.cornerRadius} 0 Z" fill="#000" fill-rule="evenodd"/>`
  return svg(SCREEN.width, SCREEN.height, body)
}

// ---------- 実行 ----------

fs.rmSync(IMAGES, { recursive: true, force: true })

writeDigits('time', DIGITS.time, { color: C.cocoa, width: 7, outline: C.white })
writeDigits('small', DIGITS.small, { color: C.cocoa, width: 7 })
writeDigits('aod', DIGITS.aod, { color: C.aod, width: 5 })

for (const mood of MOODS) write(path.join(IMAGES, 'obake', `${mood}.png`), obakeSvg(mood))
write(path.join(IMAGES, 'bubble.png'), bubbleSvg())
write(path.join(IMAGES, 'icons', 'step.png'), footSvg())
for (let level = 0; level <= 5; level += 1) write(path.join(IMAGES, 'battery', `${level}.png`), batterySvg(level))

Object.keys(SKIES).forEach((theme, index) => {
  write(path.join(IMAGES, 'backgrounds', `${theme}.png`), backgroundSvg(theme, 1000 + index))
})

const PREVIEWS = {
  'preview-390x450': { theme: 'clear_day', time: '14:45', date: '10/2 (木)', temp: '23°', label: 'おわりまで', message: 'あと 2:15', mood: 'work', steps: 8420, battery: 72 },
  'preview-after-390x450': { theme: 'partly_cloudy_day', time: '17:20', date: '10/3 (金)', temp: '21°', message: 'おつかれさま!', mood: 'happy', steps: 12380, battery: 46 },
  'preview-night-390x450': { theme: 'clear_night', time: '23:08', date: '10/3 (金)', temp: '17°', message: 'おやすみ…', mood: 'sleep', steps: 13051, battery: 38 },
  'preview-rain-390x450': { theme: 'rain', time: '10:05', date: '10/2 (木)', temp: '18°', label: 'しごとまで', message: 'あと 1:10', mood: 'tired', steps: 1204, battery: 18 },
}
for (const [name, state] of Object.entries(PREVIEWS)) {
  write(path.join(DOCS, `${name}.png`), previewSvg(state))
}
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(PREVIEWS['preview-390x450']))

console.log('Generated yuge-ramen assets in assets/bip-6/images and docs/')
