import ui from '@zos/ui'

function spritePath(root, value) {
  return `${root}/${value}.png`
}

// screenWidth の幅の中央にそろえる。x を渡すと、x から screenWidth の範囲の中央にそろえる
export function createTimeSprites({
  screenWidth,
  x: left = 0,
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
    update(hourText, minuteText) {
      const hasLeadingHour = hourText.length === 2
      const items = hasLeadingHour ? 5 : 4
      const width =
        (hasLeadingHour ? 4 : 3) * digitW + colonW + (items - 1) * gap
      let x = left + Math.round((screenWidth - width) / 2)
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
    },
  }
}
