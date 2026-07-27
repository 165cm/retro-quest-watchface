import ui from '@zos/ui'
import { SCREEN } from './layout.js'

function spritePath(root, value) {
  return `${root}/${value}.png`
}

export function createTimeSprites({
  y,
  digitPath,
  digitW,
  digitH,
  colonW,
  gap,
  showLevel,
}) {
  const digits = [0, 1, 2, 3].map(() =>
    ui.createWidget(ui.widget.IMG, {
      x: 0,
      y,
      w: digitW,
      h: digitH,
      src: spritePath(digitPath, 0),
      show_level: showLevel,
    }),
  )
  const colon = ui.createWidget(ui.widget.IMG, {
    x: 0,
    y,
    w: colonW,
    h: digitH,
    src: spritePath(digitPath, 'colon'),
    show_level: showLevel,
  })

  return {
    digits,
    colon,
    digitPath,
    digitW,
    colonW,
    gap,
    // reserveRight にAM/PMの幅を渡すと、それも含めた全体を中央へ寄せる。
    // 戻り値は数字列の右端。AM/PMの配置に使う。
    update(hourText, minuteText, reserveRight = 0) {
      const hasLeadingHour = hourText.length === 2
      const items = hasLeadingHour ? 5 : 4
      const width =
        (hasLeadingHour ? 4 : 3) * digitW + colonW + (items - 1) * gap
      let x = Math.round((SCREEN.width - width - reserveRight) / 2)
      digits[0].setProperty(ui.prop.VISIBLE, hasLeadingHour)

      const hourDigits = hasLeadingHour ? hourText : `0${hourText}`
      if (hasLeadingHour) {
        digits[0].setProperty(ui.prop.MORE, {
          x,
          y,
          w: digitW,
          h: digitH,
          src: spritePath(digitPath, hourDigits[0]),
        })
        x += digitW + gap
      }
      digits[1].setProperty(ui.prop.MORE, {
        x,
        y,
        w: digitW,
        h: digitH,
        src: spritePath(digitPath, hourDigits[1]),
      })
      x += digitW + gap
      colon.setProperty(ui.prop.MORE, {
        x,
        y,
        w: colonW,
        h: digitH,
        src: spritePath(digitPath, 'colon'),
      })
      x += colonW + gap
      for (let i = 0; i < 2; i += 1) {
        digits[i + 2].setProperty(ui.prop.MORE, {
          x,
          y,
          w: digitW,
          h: digitH,
          src: spritePath(digitPath, minuteText[i]),
        })
        x += digitW + gap
      }
      return x - gap
    },
  }
}
