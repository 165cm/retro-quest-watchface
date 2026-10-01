import { charWidth } from './layout.js'
import { createImageText } from '../../../shared/image-text.js'

const glyphName = (ch) => (ch === ':' ? 'colon' : ch === '/' ? 'slash' : ch)

// 数字の画像を、字ごとの幅で並べる（時刻・日付）。align は rect の中での寄せ方
export function createDigitText(spec, rect, showLevel, align = 'center') {
  return createImageText({
    rect,
    slots: 5,
    glyph: (ch) => `images/digits/${spec.name}/${glyphName(ch)}.png`,
    width: (ch) => charWidth(spec, ch),
    gap: spec.gap,
    align,
    showLevel,
  })
}
