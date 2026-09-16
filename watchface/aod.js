import ui from '@zos/ui'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { createTimeSprites } from './time-sprites.js'

// 通常表示の省電力版。時刻の光学中心を通常表示と揃えてあるので、
// 手首を上げても視線の着地点が動かない。
// 板も枠も描かない。常時点灯では点いている画素の数がそのまま電力になる。
export function createAodView() {
  ui.createWidget(ui.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: SCREEN.width,
    h: SCREEN.height,
    color: COLORS.BLACK,
    show_level: ui.show_level.ONAL_AOD,
  })

  const time = createTimeSprites({
    y: LAYOUT.aod.time.y,
    digitPath: 'images/digits/aod',
    digitW: LAYOUT.aod.time.digitW,
    digitH: LAYOUT.aod.time.digitH,
    colonW: LAYOUT.aod.time.colonW,
    gap: LAYOUT.aod.time.gap,
    showLevel: ui.show_level.ONAL_AOD,
  })

  const date = ui.createWidget(ui.widget.TEXT, {
    ...LAYOUT.aod.date,
    color: COLORS.AOD_TEXT,
    text_size: TYPE.aodDate,
    align_h: ui.align.CENTER_H,
    align_v: ui.align.CENTER_V,
    text: '7/24 FRI',
    show_level: ui.show_level.ONAL_AOD,
  })

  // 溝がないと残量の分母が読めないため、暗い溝だけは置く。
  ui.createWidget(ui.widget.FILL_RECT, {
    ...LAYOUT.aod.hp,
    color: COLORS.AOD_MUTED,
    show_level: ui.show_level.ONAL_AOD,
  })
  const bar = ui.createWidget(ui.widget.FILL_RECT, {
    ...LAYOUT.aod.hp,
    color: COLORS.AOD_TEXT,
    show_level: ui.show_level.ONAL_AOD,
  })

  return { time, date, bar }
}
