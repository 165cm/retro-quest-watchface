import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BOSS_COUNT,
  BOSS_NAMES,
  getBossName,
  getBossSprite,
  normalizeBossIndex,
} from '../watchface/boss.js'

test('hours 0 through 12 map to their own boss', () => {
  for (let hour = 0; hour <= 12; hour += 1) {
    assert.equal(normalizeBossIndex(hour), hour)
  }
  assert.equal(BOSS_NAMES.length, BOSS_COUNT)
})

test('24-hour afternoon hours fold onto the same boss as the morning', () => {
  assert.equal(normalizeBossIndex(13), 1)
  assert.equal(normalizeBossIndex(18), 6)
  assert.equal(normalizeBossIndex(23), 11)
  assert.equal(normalizeBossIndex(12), 12)
})

test('malformed hours fall back to the first boss', () => {
  assert.equal(normalizeBossIndex(-1), 0)
  assert.equal(normalizeBossIndex(24), 0)
  assert.equal(normalizeBossIndex(1.5), 0)
  assert.equal(normalizeBossIndex(undefined), 0)
  assert.equal(normalizeBossIndex('9'), 0)
})

test('sprite names are zero padded to match the files', () => {
  assert.equal(getBossSprite(0), '00')
  assert.equal(getBossSprite(9), '09')
  assert.equal(getBossSprite(12), '12')
  assert.equal(getBossSprite(21), '09')
})

test('every boss has a name and a sprite on disk', () => {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const root = path.join(here, '..', 'assets', 'bip-6', 'images')
  for (let hour = 0; hour < BOSS_COUNT; hour += 1) {
    assert.ok(getBossName(hour).length > 0, `missing name for ${hour}`)
    const sprite = path.join(root, 'boss', `${getBossSprite(hour)}.png`)
    assert.ok(fs.existsSync(sprite), `missing sprite: ${getBossSprite(hour)}.png`)
  }
})

test('every monster digit sprite exists on disk', () => {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const root = path.join(here, '..', 'assets', 'bip-6', 'images', 'digits', 'monster')
  for (let digit = 0; digit <= 9; digit += 1) {
    assert.ok(fs.existsSync(path.join(root, `${digit}.png`)), `missing digit ${digit}`)
  }
})
