import ui from '@zos/ui'

// 文字を1つずつ画像で並べる（例："9/30"・"15:00"）。使う画像は glyph(文字) で決め、
// 文字ごとの幅は width(文字) で決める。枠（rect）の中で左・中央・右にそろえる。
// 画像の部品は最初に slots 個だけ作り、あとは中身と位置を入れ替える（毎分作り直さない）。
export function layoutImageText(text, { rect, width, gap = 0, align = 'left' }) {
  const chars = String(text).split('')
  const total = chars.reduce((sum, ch) => sum + width(ch), 0) + gap * Math.max(0, chars.length - 1)
  let x = rect.x
  if (align === 'center') x = rect.x + Math.round((rect.w - total) / 2)
  if (align === 'right') x = rect.x + rect.w - total
  return chars.map((ch) => {
    const item = { ch, x, w: width(ch) }
    x += item.w + gap
    return item
  })
}

export function createImageText({ rect, slots, glyph, width, gap = 0, align = 'left', showLevel }) {
  const widgets = Array.from({ length: slots }, () =>
    ui.createWidget(ui.widget.IMG, {
      x: rect.x,
      y: rect.y,
      w: 1,
      h: rect.h,
      src: glyph('0'),
      show_level: showLevel,
    }),
  )
  return {
    update(text) {
      const items = layoutImageText(text, { rect, width, gap, align }).slice(0, slots)
      widgets.forEach((widget, index) => {
        const item = items[index]
        widget.setProperty(ui.prop.VISIBLE, Boolean(item))
        if (item) {
          widget.setProperty(ui.prop.MORE, { x: item.x, y: rect.y, w: item.w, h: rect.h, src: glyph(item.ch) })
        }
      })
    },
  }
}
