// ゆげラーメンの文字盤の絵（PNG）をすべて作る。絵は SVG で描き、resvg で PNG にする。
// 数字・背景（ラーメン屋の店内）・小物はすべてこのファイルで描いたオリジナル。既存作品の絵や公式フォントは使わない。
// キャラクターは描かない。お店の名前やロゴのような文字も描かない。
//
//   npm run assets -- yuge-ramen
import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { DIGITS, LAYOUT, SCREEN } from '../watchface/layout.js'

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
  wood: '#C8955E',
  woodDark: '#A8754A',
  woodLight: '#F6E2BD',
  wall: '#F8EBD0',
  noren: '#C8574B',
  lantern: '#E0604F',
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

// ---------- 背景：ラーメン屋の店内（390×450） ----------
// 上にのれん、左に赤ちょうちん、右に窓（天気が見える）、真ん中にシフトの木札、下にカウンターとラーメン。

// 窓の外の空：[上の色, 下の色, 天気]
const WINDOW_SKIES = {
  clear_day: ['#9ED8F5', '#D8F1FC', 'sun'],
  partly_cloudy_day: ['#A9D3EC', '#E0F0F9', 'sun-cloud'],
  cloudy_day: ['#B9C6D2', '#E2E8EE', 'cloud'],
  rain: ['#9FB0C4', '#D3DCE6', 'rain'],
  thunder: ['#8F8BB0', '#C9C6DE', 'thunder'],
  snow: ['#C9DCEB', '#F1F6FA', 'snow'],
  fog: ['#D3CFE2', '#EFEDF5', 'fog'],
  clear_night: ['#2E3266', '#555A96', 'moon'],
  cloudy_night: ['#3D4170', '#6A6D99', 'moon-cloud'],
  unknown: ['#CDEBDD', '#F0FAF4', ''],
}

const WINDOW = { x: 312, y: 184, w: 60, h: 78 }
const LANTERN = { cx: 50, cy: 224 }
const COUNTER_Y = 296

function cloud(x, y, s, opacity = 0.95) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#FFFFFF" opacity="${opacity}"><circle cx="0" cy="0" r="16"/><circle cx="18" cy="-8" r="20"/><circle cx="38" cy="0" r="15"/><rect x="0" y="0" width="38" height="15"/></g>`
}

function norenSvg() {
  const flaps = 4
  const gap = 4
  const flapW = (SCREEN.width - gap * (flaps - 1)) / flaps
  let out = `<rect x="0" y="0" width="${SCREEN.width}" height="8" fill="${C.woodDark}"/>`
  for (let i = 0; i < flaps; i += 1) {
    const x = i * (flapW + gap)
    out += `<path d="M${x} 6 H${x + flapW} V70 Q${x + flapW / 2} 74 ${x} 70 Z" fill="${C.noren}"/>`
    out += `<rect x="${x}" y="60" width="${flapW}" height="4" fill="#FFFFFF" opacity="0.8"/>`
  }
  return out
}

function lanternSvg(night) {
  const { cx, cy } = LANTERN
  let out = ''
  if (night) out += `<circle cx="${cx}" cy="${cy}" r="56" fill="${C.yellow}" opacity="0.35"/>`
  out += `<path d="M${cx} ${cy - 54} V${cy - 40}" stroke="${C.cocoa}" stroke-width="2"/>`
  out += `<ellipse cx="${cx}" cy="${cy}" rx="27" ry="36" fill="${night ? '#F07A5E' : C.lantern}" stroke="${C.cocoa}" stroke-width="2.5"/>`
  for (const dy of [-24, -12, 0, 12, 24]) {
    const rx = 27 * Math.sqrt(1 - (dy / 36) ** 2)
    out += `<path d="M${(cx - rx).toFixed(1)} ${cy + dy} Q${cx} ${cy + dy + 4} ${(cx + rx).toFixed(1)} ${cy + dy}" fill="none" stroke="#B2463A" stroke-width="1.4" opacity="0.8"/>`
  }
  out += `<rect x="${cx - 13}" y="${cy - 41}" width="26" height="8" rx="2" fill="${C.cocoa}"/>`
  out += `<rect x="${cx - 13}" y="${cy + 33}" width="26" height="8" rx="2" fill="${C.cocoa}"/>`
  out += `<path d="M${cx} ${cy + 41} V${cy + 52}" stroke="${C.lantern}" stroke-width="4" stroke-linecap="round"/>`
  return out
}

function windowSvg(theme, rnd) {
  const { x, y, w, h } = WINDOW
  const [top, bottom, weather] = WINDOW_SKIES[theme]
  let sky = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#win)"/>`
  if (weather.startsWith('sun')) sky += `<circle cx="${x + 40}" cy="${y + 22}" r="11" fill="${C.yellow}"/>`
  if (weather.startsWith('moon')) {
    sky += `<circle cx="${x + 40}" cy="${y + 22}" r="10" fill="#FFF3B8"/><circle cx="${x + 45}" cy="${y + 18}" r="9" fill="${top}"/>`
    for (let i = 0; i < 6; i += 1) {
      sky += `<circle cx="${(x + 6 + rnd() * (w - 12)).toFixed(1)}" cy="${(y + 30 + rnd() * (h - 36)).toFixed(1)}" r="1.2" fill="#FFF6C8"/>`
    }
  }
  if (weather.includes('cloud') || weather === 'rain' || weather === 'thunder') {
    sky += cloud(x + 8, y + 40, 0.55, weather.startsWith('moon') ? 0.5 : 0.95)
  }
  if (weather === 'rain' || weather === 'thunder') {
    for (let i = 0; i < 14; i += 1) {
      const rx = x + rnd() * w
      const ry = y + 46 + rnd() * (h - 50)
      sky += `<path d="M${rx.toFixed(1)} ${ry.toFixed(1)} l-2 6" stroke="#6F93BD" stroke-width="1.6" stroke-linecap="round"/>`
    }
  }
  if (weather === 'thunder') {
    sky += `<path d="M${x + 44} ${y + 34} L${x + 36} ${y + 50} H${x + 43} L${x + 38} ${y + 64} L${x + 52} ${y + 44} H${x + 45} L${x + 50} ${y + 34} Z" fill="${C.yellow}" stroke="${C.cocoa}" stroke-width="1"/>`
  }
  if (weather === 'snow') {
    for (let i = 0; i < 16; i += 1) {
      sky += `<circle cx="${(x + rnd() * w).toFixed(1)}" cy="${(y + rnd() * h).toFixed(1)}" r="${(1.2 + rnd() * 1.3).toFixed(1)}" fill="#FFFFFF"/>`
    }
  }
  if (weather === 'fog') {
    for (const fy of [y + 20, y + 42, y + 62]) sky += `<rect x="${x}" y="${fy}" width="${w}" height="9" rx="4.5" fill="#FFFFFF" opacity="0.7"/>`
  }
  return (
    `<defs><linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>` +
    `<clipPath id="winclip"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>` +
    `<g clip-path="url(#winclip)">${sky}</g>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${C.woodDark}" stroke-width="6"/>` +
    `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${C.woodDark}" stroke-width="3"/>` +
    `<rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="6" rx="2" fill="${C.wood}"/>`
  )
}

function cardSvg() {
  const { x, y, w, h } = LAYOUT.card
  const cx = x + w / 2
  return (
    `<path d="M${cx - 40} ${y + 8} L${cx} ${y - 6} L${cx + 40} ${y + 8}" fill="none" stroke="${C.cocoaSoft}" stroke-width="2"/>` +
    `<rect x="${x + 3}" y="${y + 5}" width="${w - 6}" height="${h - 8}" rx="10" fill="${C.woodLight}" stroke="${C.cocoa}" stroke-width="3"/>` +
    `<rect x="${x + 10}" y="${y + 12}" width="${w - 20}" height="${h - 22}" rx="6" fill="none" stroke="${C.wood}" stroke-width="1.5" opacity="0.7"/>` +
    `<circle cx="${cx - 40}" cy="${y + 9}" r="3" fill="${C.cocoa}"/><circle cx="${cx + 40}" cy="${y + 9}" r="3" fill="${C.cocoa}"/>`
  )
}

// どんぶりの縁の雷文（ラーメンどんぶりによくある、四角いうずまきの模様）
function keyPattern(x0, y, width, size, color) {
  let d = ''
  for (let x = x0; x < x0 + width; x += size + 4) {
    const s = size
    d += `M${x} ${y + s} V${y} H${x + s} V${y + s * 0.75} H${x + s * 0.25} V${y + s * 0.25} H${x + s * 0.6} `
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>`
}

function counterSvg() {
  const W = SCREEN.width
  let out = `<rect x="0" y="${COUNTER_Y}" width="${W}" height="12" fill="${C.wood}"/>`
  out += `<rect x="0" y="${COUNTER_Y + 12}" width="${W}" height="${SCREEN.height - COUNTER_Y - 12}" fill="${C.woodDark}"/>`
  out += `<rect x="0" y="${COUNTER_Y + 12}" width="${W}" height="3" fill="#8E6038" opacity="0.6"/>`
  for (let x = 40; x < W; x += 56) {
    out += `<path d="M${x} ${COUNTER_Y + 36} V${SCREEN.height}" stroke="#946640" stroke-width="2" opacity="0.6"/>`
  }
  out += `<rect x="0" y="${COUNTER_Y + 20}" width="${W}" height="14" fill="${C.cream}"/>`
  out += keyPattern(6, COUNTER_Y + 22, W, 10, C.red)
  return out
}

function ramenSvg() {
  const cx = SCREEN.width / 2
  const rimY = COUNTER_Y - 14
  let out = ''
  // 湯気（木札の後ろへ立ちのぼる）
  for (const dx of [-22, 0, 22]) {
    out += `<path d="M${cx + dx} ${rimY - 6} Q${cx + dx - 9} ${rimY - 16} ${cx + dx} ${rimY - 26} Q${cx + dx + 9} ${rimY - 36} ${cx + dx} ${rimY - 46}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`
  }
  out += `<ellipse cx="${cx}" cy="${rimY}" rx="54" ry="10" fill="${C.broth}" stroke="${C.cocoa}" stroke-width="2.5"/>`
  // のり・チャーシュー・なると・たまご・ねぎ
  out += `<rect x="${cx + 22}" y="${rimY - 22}" width="16" height="22" rx="2" fill="#2F4A3A" transform="rotate(12 ${cx + 30} ${rimY - 10})"/>`
  out += `<ellipse cx="${cx - 20}" cy="${rimY - 1}" rx="14" ry="6" fill="#D9A07C" stroke="#A8664A" stroke-width="1.5"/>`
  out += `<circle cx="${cx + 8}" cy="${rimY - 1}" r="6.5" fill="#FFFFFF" stroke="${C.cocoa}" stroke-width="1.2"/><path d="M${cx + 8} ${rimY - 1} m-2.5 0 a2.5 2.5 0 1 1 2.5 2.5 a4.5 4.5 0 1 1 -4.5 -4.5" fill="none" stroke="${C.pink}" stroke-width="1.6"/>`
  out += `<ellipse cx="${cx - 40}" cy="${rimY - 1}" rx="8" ry="5" fill="#FFFFFF" stroke="${C.cocoaSoft}" stroke-width="1"/><circle cx="${cx - 40}" cy="${rimY - 1}" r="3.4" fill="#F7B733"/>`
  for (const [dx, dy] of [[-4, 3], [22, 4], [-30, 4], [34, 2]]) {
    out += `<circle cx="${cx + dx}" cy="${rimY + dy}" r="2" fill="#7BB661"/>`
  }
  // どんぶり
  out += `<path d="M${cx - 54} ${rimY} Q${cx - 50} ${rimY + 30} ${cx} ${rimY + 32} Q${cx + 50} ${rimY + 30} ${cx + 54} ${rimY} Q${cx} ${rimY + 14} ${cx - 54} ${rimY} Z" fill="#FFFDF8" stroke="${C.cocoa}" stroke-width="2.5" stroke-linejoin="round"/>`
  out += `<path d="M${cx - 46} ${rimY + 13} Q${cx} ${rimY + 26} ${cx + 46} ${rimY + 13}" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`
  out += `<ellipse cx="${cx}" cy="${rimY + 32}" rx="20" ry="4" fill="#FFFDF8" stroke="${C.cocoa}" stroke-width="2"/>`
  return out
}

function backgroundSvg(theme, seed) {
  const night = theme.includes('night')
  const rnd = random(seed)
  const W = SCREEN.width
  let body = `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night ? '#EAD4AC' : C.wall}"/><stop offset="1" stop-color="${night ? '#DCC196' : '#F1DDB8'}"/></linearGradient></defs>`
  body += `<rect width="${W}" height="${SCREEN.height}" fill="url(#wall)"/>`
  // 壁の板の継ぎ目（うすく）
  for (let x = 65; x < W; x += 65) {
    body += `<path d="M${x} 72 V${COUNTER_Y}" stroke="#E2CBA2" stroke-width="1.5" opacity="0.7"/>`
  }
  body += norenSvg()
  body += windowSvg(theme, rnd)
  body += lanternSvg(night)
  body += counterSvg()
  body += ramenSvg()
  body += cardSvg()
  return svg(W, SCREEN.height, body)
}

// ---------- プレビュー（文字盤全体をまとめて描く） ----------

function previewSvg({ theme, time, date, temp, label, message, steps, battery }) {
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
  const pill = (r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${r.radius}" fill="${C.cream}" opacity="0.92"/>`
  const level = Math.ceil((battery / 100) * 5)
  let body = img(`backgrounds/${theme}.png`, 0, 0, SCREEN.width, SCREEN.height)
  body += pill(LAYOUT.topPill)
  body += text(date, LAYOUT.date, 26, 'start')
  body += `<g transform="translate(${LAYOUT.temp.x + (LAYOUT.temp.w - tempRow.width) / 2} 0)">${tempRow.out}</g>`
  body += `<g transform="translate(${timeX} 0)">${timeRow.out}</g>`
  body += label
    ? text(label, LAYOUT.cardLabel, 20, 'middle', C.cocoaSoft) + text(message, LAYOUT.cardMain, 30)
    : text(message, LAYOUT.cardSingle, 27)
  body += pill(LAYOUT.bottomPill)
  body += img('icons/step.png', LAYOUT.stepIcon.x, LAYOUT.stepIcon.y, LAYOUT.stepIcon.w, LAYOUT.stepIcon.h)
  body += stepRow.out
  body += img(`battery/${level}.png`, LAYOUT.batteryIcon.x, LAYOUT.batteryIcon.y, LAYOUT.batteryIcon.w, LAYOUT.batteryIcon.h)
  body += text(`${battery}%`, LAYOUT.percent, 24, 'end', battery <= 20 ? '#D9534F' : C.cocoa)
  // Bip 6 の角丸（プレビューの見た目を実機に近づけるため）
  const r = SCREEN.cornerRadius
  const { width: W, height: H } = SCREEN
  body += `<path d="M0 0 H${W} V${H} H0 Z M${r} 0 H${W - r} A${r} ${r} 0 0 1 ${W} ${r} V${H - r} A${r} ${r} 0 0 1 ${W - r} ${H} H${r} A${r} ${r} 0 0 1 0 ${H - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z" fill="#000" fill-rule="evenodd"/>`
  return svg(W, H, body)
}

// ---------- 実行 ----------

fs.rmSync(IMAGES, { recursive: true, force: true })

writeDigits('time', DIGITS.time, { color: C.cocoa, width: 7, outline: C.white })
writeDigits('small', DIGITS.small, { color: C.cocoa, width: 7 })
writeDigits('aod', DIGITS.aod, { color: C.aod, width: 5 })

write(path.join(IMAGES, 'icons', 'step.png'), footSvg())
for (let level = 0; level <= 5; level += 1) write(path.join(IMAGES, 'battery', `${level}.png`), batterySvg(level))

Object.keys(WINDOW_SKIES).forEach((theme, index) => {
  write(path.join(IMAGES, 'backgrounds', `${theme}.png`), backgroundSvg(theme, 1000 + index))
})

const PREVIEWS = {
  'preview-390x450': { theme: 'clear_day', time: '14:45', date: '10/2 (木)', temp: '23°', label: 'おわりまで', message: 'あと 2:15', steps: 8420, battery: 72 },
  'preview-after-390x450': { theme: 'partly_cloudy_day', time: '17:20', date: '10/3 (金)', temp: '21°', message: 'おつかれさま!', steps: 12380, battery: 46 },
  'preview-night-390x450': { theme: 'clear_night', time: '23:08', date: '10/3 (金)', temp: '17°', message: 'おやすみ…', steps: 13051, battery: 38 },
  'preview-rain-390x450': { theme: 'rain', time: '10:05', date: '10/2 (木)', temp: '18°', label: 'しごとまで', message: 'あと 1:10', steps: 1204, battery: 18 },
}
for (const [name, state] of Object.entries(PREVIEWS)) {
  write(path.join(DOCS, `${name}.png`), previewSvg(state))
}
// アプリのアイコン・ストアのカバー用
write(path.join(IMAGES, 'preview.png'), previewSvg(PREVIEWS['preview-390x450']))

console.log('Generated yuge-ramen assets in assets/bip-6/images and docs/')
