import ui from '@zos/ui'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { createTimeSprites } from './time-sprites.js'

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
    y: LAYOUT.aod.timeY,
    digitPath: 'images/digits/aod',
    digitW: 32,
    digitH: 49,
    colonW: 12,
    gap: 4,
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

  const hpLabel = ui.createWidget(ui.widget.TEXT, {
    ...LAYOUT.aod.hpLabel,
    color: COLORS.AOD_TEXT,
    text_size: TYPE.aodHp,
    align_h: ui.align.LEFT,
    align_v: ui.align.CENTER_V,
    text: 'HP',
    show_level: ui.show_level.ONAL_AOD,
  })

  const segments = []
  for (let i = 0; i < 10; i += 1) {
    segments.push(
      ui.createWidget(ui.widget.FILL_RECT, {
        x: LAYOUT.aod.hpGaugeX + i * (LAYOUT.aod.segmentW + LAYOUT.aod.gap),
        y: LAYOUT.aod.hpGaugeY,
        w: LAYOUT.aod.segmentW,
        h: LAYOUT.aod.segmentH,
        color: COLORS.HP_EMPTY,
        show_level: ui.show_level.ONAL_AOD,
      }),
    )
  }

  const percent = ui.createWidget(ui.widget.TEXT, {
    ...LAYOUT.aod.percent,
    color: COLORS.AOD_TEXT,
    text_size: TYPE.aodHp,
    align_h: ui.align.RIGHT,
    align_v: ui.align.CENTER_V,
    text: '--%',
    show_level: ui.show_level.ONAL_AOD,
  })

  return { time, date, hpLabel, segments, percent }
}
