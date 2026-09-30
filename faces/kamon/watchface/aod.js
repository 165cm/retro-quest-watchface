import ui from '@zos/ui'
import { DIGITS, LAYOUT, SCREEN } from './layout.js'
import { COLORS } from './theme.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'

// 画面オフ時：黒い背景に、細い線の時刻と曜日・日だけ（紋・アイコン・数字のデータは出さない）
export function createAodView() {
  const showLevel = ui.show_level.ONAL_AOD
  const L = LAYOUT.aod
  ui.createWidget(ui.widget.FILL_RECT, { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height, color: COLORS.BLACK, show_level: showLevel })

  const time = createTimeSprites({
    screenWidth: SCREEN.width,
    y: L.timeY,
    digitPath: 'images/digits/aod',
    digitW: DIGITS.aod.w,
    digitH: DIGITS.aod.h,
    colonW: DIGITS.aod.colonW,
    gap: DIGITS.aod.gap,
    showLevel,
  })
  const weekday = ui.createWidget(ui.widget.IMG, { ...L.weekday, src: 'images/weekday-aod/0.png', show_level: showLevel })
  const day = [0, 1].map((i) =>
    ui.createWidget(ui.widget.IMG, {
      x: L.day.x + i * (DIGITS.small.w + DIGITS.small.gap),
      y: L.day.y,
      w: DIGITS.small.w,
      h: DIGITS.small.h,
      src: 'images/digits/aod-small/0.png',
      show_level: showLevel,
    }),
  )
  return { time, weekday, day }
}
