import ui from '@zos/ui'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { TOTAL_SEGMENTS } from './battery.js'
import { createTimeSprites } from './time-sprites.js'

// 通常表示の省電力版。時刻の光学中心を通常表示と揃えてあるので、
// 手首を上げても視線の着地点が動かない。
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

  // 空セグメントも輪郭が見えないと残量の分母が読めないため、
  // 通常表示と同じく枠を持たせる。
  const segments = []
  for (let i = 0; i < TOTAL_SEGMENTS; i += 1) {
    const x = LAYOUT.aod.hpGaugeX + i * (LAYOUT.aod.segmentW + LAYOUT.aod.gap)
    ui.createWidget(ui.widget.STROKE_RECT, {
      x: x - 1,
      y: LAYOUT.aod.hpGaugeY - 1,
      w: LAYOUT.aod.segmentW + 2,
      h: LAYOUT.aod.segmentH + 2,
      color: COLORS.AOD_EMPTY,
      line_width: 1,
      radius: 0,
      show_level: ui.show_level.ONAL_AOD,
    })
    segments.push(
      ui.createWidget(ui.widget.FILL_RECT, {
        x,
        y: LAYOUT.aod.hpGaugeY,
        w: LAYOUT.aod.segmentW,
        h: LAYOUT.aod.segmentH,
        color: COLORS.AOD_EMPTY,
        show_level: ui.show_level.ONAL_AOD,
      }),
    )
  }

  return { time, date, segments }
}
