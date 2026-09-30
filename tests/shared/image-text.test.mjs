import test from 'node:test'
import assert from 'node:assert/strict'

// '@zos/ui' は時計の中にしかないので、並べ方の計算だけを取り出して確かめる
const source = await import('node:fs').then((fs) => fs.readFileSync(new URL('../../shared/image-text.js', import.meta.url), 'utf8'))
const { layoutImageText } = await import(
  `data:text/javascript,${encodeURIComponent(source.replace("import ui from '@zos/ui'", 'const ui = {}'))}`
)

const width = (ch) => (ch === '/' || ch === ':' ? 8 : 15)

test('characters are laid out left, center and right', () => {
  const rect = { x: 100, y: 0, w: 100, h: 20 }
  assert.deepEqual(
    layoutImageText('9/30', { rect, width, gap: 1 }).map((i) => i.x),
    [100, 116, 125, 141],
  )
  const center = layoutImageText('15:00', { rect, width, gap: 1, align: 'center' })
  assert.equal(center[0].x, 100 + Math.round((100 - 72) / 2))
  const right = layoutImageText('73', { rect, width, align: 'right' })
  assert.equal(right[1].x + right[1].w, 200)
})
