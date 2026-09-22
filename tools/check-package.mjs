// ビルド済みZABの中身を検査する。
//
// 角の切り抜きは元のPNGでは効いているのに、審査で
// "The transition has four corners" が3回続いた。`zeus build` は同梱PNGを
// すべてTGAへ変換する（ビルドログの [PNG2TGA]）。この変換でアルファが
// 落ちていれば、PNG側でいくら角を抜いても端末には不透明な角が届く。
// 元のPNGではなく、実際に端末へ入るTGAを直接見るためのツール。
//
//   node tools/check-package.mjs dist/1121508-....zab
//
// 判定の要:
//   - 32bpp かつ 記述子の下位4bitが8 → アルファあり
//   - 24bpp → アルファなし。この時点で角は不透明
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

function fail(message) {
  console.error(message)
  process.exit(1)
}

const zab = process.argv[2]
if (!zab) fail('使い方: node tools/check-package.mjs <ZABのパス>')
if (!fs.existsSync(zab)) fail(`ファイルがありません: ${zab}`)

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zab-'))
try {
  execFileSync('unzip', ['-o', '-q', path.resolve(zab), '-d', workDir], {
    stdio: ['ignore', 'ignore', 'pipe'],
  })
} catch (error) {
  fail(`ZABを展開できませんでした（zipではない可能性があります）: ${error.message}`)
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(workDir)

// TGAは18バイトのヘッダ。記述子の下位4bitがアルファのビット数を表す。
function readTga(file) {
  const d = fs.readFileSync(file)
  if (d.length < 18) return null
  const imageType = d[2]
  const width = d.readUInt16LE(12)
  const height = d.readUInt16LE(14)
  const bpp = d[16]
  const descriptor = d[17]
  const alphaBits = descriptor & 0x0f
  const topLeftOrigin = (descriptor & 0x20) !== 0
  return { data: d, imageType, width, height, bpp, alphaBits, topLeftOrigin, idLength: d[0] }
}

// 非圧縮トゥルーカラー(2)だけ画素を読む。RLE(10)はヘッダ情報で判断する。
function cornerAlpha(tga) {
  if (tga.imageType !== 2 || tga.bpp !== 32) return null
  const offset = 18 + tga.idLength
  const at = (x, y) => {
    const row = tga.topLeftOrigin ? y : tga.height - 1 - y
    const index = offset + ((row * tga.width + x) << 2)
    return index + 3 < tga.data.length ? tga.data[index + 3] : null
  }
  return {
    topLeft: at(0, 0),
    topRight: at(tga.width - 1, 0),
    bottomLeft: at(0, tga.height - 1),
    bottomRight: at(tga.width - 1, tga.height - 1),
  }
}

const tgaFiles = files.filter((f) => f.toLowerCase().endsWith('.tga'))
const pngFiles = files.filter((f) => f.toLowerCase().endsWith('.png'))

console.log(`ZAB: ${path.basename(zab)}`)
console.log(`展開したファイル数: ${files.length}（TGA ${tgaFiles.length} / PNG ${pngFiles.length}）\n`)

// app.json が同梱されていれば icon/cover の参照先を拾う
const manifest = files.find((f) => path.basename(f) === 'app.json')
let iconNames = []
if (manifest) {
  try {
    const app = JSON.parse(fs.readFileSync(manifest, 'utf8'))
    const refs = [app.app?.icon, ...(app.app?.cover ?? [])].filter(Boolean)
    iconNames = refs.map((ref) => path.basename(ref).replace(/\.png$/i, ''))
    console.log(`app.json の icon/cover: ${refs.join(', ')}`)
    console.log(`app.json の appId: ${app.app?.appId}\n`)
  } catch {
    console.log('app.json を解析できませんでした\n')
  }
}

let noAlpha = 0
let opaqueCorners = 0

for (const file of tgaFiles) {
  const tga = readTga(file)
  if (!tga) continue
  const name = path.relative(workDir, file)
  const base = path.basename(file).replace(/\.tga$/i, '')
  const isIcon = iconNames.includes(base)

  const hasAlpha = tga.bpp === 32 && tga.alphaBits === 8
  if (!hasAlpha) noAlpha += 1

  const corners = cornerAlpha(tga)
  const cornersOpaque =
    corners !== null && Object.values(corners).every((value) => value === 255)
  if (cornersOpaque && isIcon) opaqueCorners += 1

  // アイコンとアルファ無しだけ出す。90枚すべて並べても読めない。
  if (!isIcon && hasAlpha) continue

  const mark = isIcon ? '★' : ' '
  console.log(
    `${mark} ${name}  ${tga.width}x${tga.height}  ${tga.bpp}bpp  alphaBits=${tga.alphaBits}  ${
      hasAlpha ? 'アルファあり' : 'アルファなし'
    }${tga.imageType === 10 ? '  (RLE圧縮)' : ''}`,
  )
  if (corners) {
    console.log(
      `    四隅のalpha: 左上${corners.topLeft} 右上${corners.topRight} 左下${corners.bottomLeft} 右下${corners.bottomRight}`,
    )
  }
}

console.log('')
if (noAlpha > 0) {
  console.log(
    `⚠ アルファを持たないTGAが ${noAlpha} 枚あります。PNG側で角を抜いても、` +
      'この変換で不透明に戻されています。',
  )
}
if (opaqueCorners > 0) {
  console.log(`⚠ 同梱アイコンのTGAの四隅が不透明です（${opaqueCorners} 枚）。`)
}
if (noAlpha === 0 && opaqueCorners === 0) {
  console.log('TGAのアルファは保たれています。四隅の原因は別にあります。')
}

fs.rmSync(workDir, { recursive: true, force: true })
