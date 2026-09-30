import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { CREST, DIGITS, LAYOUT, SCREEN, TITLE } from './layout.js'
import { crestImage, pickCrest, titleImage } from './crests.js'
import { COLORS } from './theme.js'
import { createAodView } from './aod.js'
import { dateText, hourText } from './format.js'
import { normalizeBattery } from '../../../shared/battery.js'
import { weekdayIndex } from '../../../shared/date.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'

const logger = log.getLogger('kamont')
const NORMAL = ui.show_level.ONLY_NORMAL
const SMALL = 'images/digits/small'

// 古い API が使えない端末でも、時刻の表示だけは残す
function tolerate(operation, fallback) {
  try {
    return operation()
  } catch (error) {
    logger.log('API unavailable, using fallback')
    return fallback
  }
}

function digitArray(path) {
  return Array.from({ length: 10 }, (_, index) => `${path}/${index}.png`)
}

// 時計のデータ（気温・歩数・心拍・電池）を、赤い数字の画像で直接出す。データが無い時は「--」
function dataNumber(rect, type, extra = {}) {
  return tolerate(() =>
    ui.createWidget(ui.widget.TEXT_IMG, {
      ...rect,
      type,
      font_array: digitArray(SMALL),
      h_space: DIGITS.small.gap,
      align_h: ui.align.LEFT,
      invalid_image: `${SMALL}/invalid.png`,
      show_level: NORMAL,
      ...extra,
    }),
  )
}

// 「°」は摂氏・華氏で同じ画像（単位は時計の設定に従う）
const DEGREE = `${SMALL}/degree.png`
const TEMPERATURE = {
  negative_image: `${SMALL}/negative.png`,
  unit_sc: DEGREE,
  unit_tc: DEGREE,
  unit_en: DEGREE,
  imperial_unit_sc: DEGREE,
  imperial_unit_tc: DEGREE,
  imperial_unit_en: DEGREE,
}

WatchFace({
  state: {
    time: null,
    battery: null,
    crest: null,
    widgets: {},
    aod: null,
    minuteCallback: null,
    batteryCallback: null,
  },

  onInit() {
    this.state.time = new Time()
    this.state.battery = new Battery()
  },

  build() {
    this.drawNormalView()
    this.state.aod = createAodView()
    this.updateMinute()
    this.updateBattery()

    this.state.minuteCallback = () => this.updateMinute()
    this.state.batteryCallback = () => this.updateBattery()
    this.state.time.onPerMinute(this.state.minuteCallback)
    this.state.battery.onChange(this.state.batteryCallback)

    ui.createWidget(ui.widget.WIDGET_DELEGATE, {
      resume_call: () => {
        this.nextCrest()
        this.updateMinute()
        this.updateBattery()
      },
      pause_call: () => {},
    })
  },

  // 背景の絵に、太い輪・線・アイコン・区切り・電池の枠まで入っている。
  // 輪の中の紋とタイトルは1枚ずつだけ置き、画面が点くたびに画像を入れ替える（全部の紋を同時に描かない）
  drawNormalView() {
    const w = this.state.widgets
    const L = LAYOUT
    ui.createWidget(ui.widget.IMG, { x: 0, y: 0, w: SCREEN.width, h: SCREEN.height, src: 'images/background.png', show_level: NORMAL })
    this.state.crest = pickCrest(null)
    w.crest = ui.createWidget(ui.widget.IMG, { ...CREST.image, src: crestImage(this.state.crest), show_level: NORMAL })
    w.title = ui.createWidget(ui.widget.IMG, { ...TITLE.image, src: titleImage(this.state.crest), show_level: NORMAL })
    // 電池の枠の中の塗り（残りに合わせて左から）
    w.batteryFill = ui.createWidget(ui.widget.FILL_RECT, { ...L.batteryFill, color: COLORS.RED, show_level: NORMAL })

    w.time = createTimeSprites({
      screenWidth: SCREEN.width,
      y: L.timeY,
      digitPath: 'images/digits/time',
      digitW: DIGITS.time.w,
      digitH: DIGITS.time.h,
      colonW: DIGITS.time.colonW,
      gap: DIGITS.time.gap,
      showLevel: NORMAL,
    })

    // 日付は時計のシステムの文字（元のデザインと同じ）
    const { size, ...rect } = L.date
    w.date = ui.createWidget(ui.widget.TEXT, {
      ...rect,
      text: '',
      text_size: size,
      color: COLORS.CREAM,
      align_h: ui.align.CENTER_H,
      align_v: ui.align.CENTER_V,
      show_level: NORMAL,
    })

    dataNumber(L.temp, ui.data_type.WEATHER_CURRENT, TEMPERATURE)
    dataNumber(L.steps, ui.data_type.STEP)
    dataNumber(L.heart, ui.data_type.HEART)
    dataNumber(L.battery, ui.data_type.BATTERY)
  },

  // 画面が点いた時だけ、紋とタイトルをランダムに次のものへ（直前と同じものは出さない。まれに金のレア）
  nextCrest() {
    this.state.crest = pickCrest(this.state.crest)
    this.state.widgets.crest.setProperty(ui.prop.SRC, crestImage(this.state.crest))
    this.state.widgets.title.setProperty(ui.prop.SRC, titleImage(this.state.crest))
  },

  // 分ごと：時刻と日付
  updateMinute() {
    const time = this.state.time
    const hours = hourText(time.getHours(), time.getHourFormat() === TIME_HOUR_FORMAT_12, time.getFormatHour())
    const minutes = String(time.getMinutes()).padStart(2, '0')
    this.state.widgets.time.update(hours, minutes)
    this.state.aod.time.update(hours, minutes)

    const date = dateText(weekdayIndex(time.getDay()), time.getDate(), time.getMonth())
    this.state.widgets.date.setProperty(ui.prop.TEXT, date)
    this.state.aod.date.setProperty(ui.prop.TEXT, date)
  },

  // 電池の数字は時計のデータに直接つないでいる。ここでは枠の中の塗りだけを更新する
  updateBattery() {
    const value = normalizeBattery(this.state.battery.getCurrent())
    const fill = LAYOUT.batteryFill
    const width = Math.round((fill.w * (value === null ? 0 : value)) / 100)
    this.state.widgets.batteryFill.setProperty(ui.prop.VISIBLE, width > 0)
    if (width > 0) this.state.widgets.batteryFill.setProperty(ui.prop.MORE, { ...fill, w: width, color: COLORS.RED })
  },

  onDestroy() {
    if (this.state.battery && this.state.batteryCallback) {
      this.state.battery.offChange(this.state.batteryCallback)
    }
    if (this.state.time && this.state.minuteCallback) {
      tolerate(() => this.state.time.offPerMinute(this.state.minuteCallback))
    }
  },
})
