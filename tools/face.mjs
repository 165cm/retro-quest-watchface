// 文字盤を名前で指定して、faces/<名前>/ の中で Zeus CLI や素材づくりを動かす
// 使い方: npm run build -- pixel-wayfarer   （文字盤が1つだけなら名前は省略できる）
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FACES_DIR = path.join(ROOT, 'faces')
const COMMANDS = ['build', 'dev', 'preview', 'assets']

const [command, name, ...rest] = process.argv.slice(2)
const faces = fs
  .readdirSync(FACES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

function fail(message) {
  console.error(message)
  console.error(`文字盤の一覧: ${faces.join(', ')}`)
  process.exit(1)
}

if (!COMMANDS.includes(command)) {
  fail(`使い方: node tools/face.mjs <${COMMANDS.join('|')}> <文字盤の名前>`)
}
const face = name || (faces.length === 1 ? faces[0] : null)
if (!face) fail(`文字盤の名前を指定してください（例: npm run ${command} -- ${faces[0]}）`)
if (!faces.includes(face)) fail(`faces/${face} がありません`)

const cwd = path.join(FACES_DIR, face)
const result =
  command === 'assets'
    ? spawnSync(process.execPath, ['tools/generate-assets.mjs', ...rest], { cwd, stdio: 'inherit' })
    : spawnSync(path.join(ROOT, 'node_modules', '.bin', 'zeus'), [command, ...rest], {
        cwd,
        stdio: 'inherit',
      })
process.exit(result.status ?? 1)
