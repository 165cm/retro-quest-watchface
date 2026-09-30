import ui from '@zos/ui'
import { DIGITS, LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'

// 画面オフ時：黒い背景に、時刻・日付・HP だけ（暗いクリーム色で、光る所を少なく）
export function createAodView() {
  const showLevel = ui.show_level.ONAL_AOD
  ui.createWidget(ui.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN.width,
    h: SCREEN.height,
    color: COLORS.BLACK,
    show_level: showLevel,
  })

  const time = createTimeSprites({
    screenWidth: SCREEN.width,
    y: LAYOUT.aod.timeY,
    digitPath: 'images/digits/aod',
    digitW: DIGITS.aod.w,
    digitH: DIGITS.aod.h,
    colonW: DIGITS.aod.colonW,
    gap: DIGITS.aod.gap,
    showLevel,
  })

  const text = (rect, size) =>
    ui.createWidget(ui.widget.TEXT, {
      ...rect,
      text: '',
      text_size: size,
      color: COLORS.AOD_TEXT,
      align_h: ui.align.CENTER_H,
      align_v: ui.align.CENTER_V,
      show_level: showLevel,
    })

  return {
    time,
    date: text(LAYOUT.aod.date, TYPE.aodDate),
    hp: text(LAYOUT.aod.hp, TYPE.aodHp),
  }
}
