import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { DIGITS, LAYOUT, SCREEN } from './layout.js'
import { QUOTES, nextQuoteIndex } from './quotes.js'
import { WEEKDAYS_JA } from './glyphs.js'
import { COLORS } from './theme.js'
import { createAodView } from './aod.js'
import { normalizeBattery } from '../../../shared/battery.js'
import { weekdayIndex } from '../../../shared/date.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'
import { createImageText } from '../../../shared/image-text.js'

const logger = log.getLogger('super-arbeiter')
const NORMAL = ui.show_level.ONLY_NORMAL

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

// 時計のデータ（歩数・電池）を、数字の画像で直接出す
function dataNumber(rect, type, path, gap) {
  return ui.createWidget(ui.widget.TEXT_IMG, {
    ...rect,
    type,
    font_array: digitArray(path),
    h_space: gap,
    align_h: ui.align.LEFT,
    show_level: NORMAL,
  })
}

function image(rect, src) {
  return ui.createWidget(ui.widget.IMG, { ...rect, src, show_level: NORMAL })
}

const dateWidth = (ch) => (ch === '/' ? DIGITS.date.slashW : DIGITS.date.w)
const dateGlyph = (ch) => `images/digits/date/${ch === '/' ? 'slash' : ch}.png`

WatchFace({
  state: {
    time: null,
    battery: null,
    quoteIndex: 0,
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
        this.nextQuote()
        this.updateMinute()
        this.updateBattery()
      },
      pause_call: () => {},
    })
  },

  // 背景の絵に、暖簾・提灯・カレンダー・丼・吹き出し・雷紋・くつ・区切り・電池の枠まで入っている
  drawNormalView() {
    const w = this.state.widgets
    image({ x: 0, y: 0, w: SCREEN.width, h: SCREEN.height }, 'images/background.png')
    // セリフの札は1枚だけ置き、画面が点くたびに画像を入れ替える（7枚を同時に描かない）
    w.quote = image(LAYOUT.quote, QUOTES[this.state.quoteIndex].image)

    w.time = createTimeSprites({
      screenWidth: LAYOUT.time.w,
      x: LAYOUT.time.x,
      y: LAYOUT.time.y,
      digitPath: 'images/digits/time',
      digitW: DIGITS.time.w,
      digitH: DIGITS.time.h,
      colonW: DIGITS.time.colonW,
      gap: DIGITS.time.gap,
      showLevel: NORMAL,
    })

    w.date = createImageText({
      rect: LAYOUT.date,
      slots: 5,
      glyph: dateGlyph,
      width: dateWidth,
      gap: DIGITS.date.gap,
      align: 'center',
      showLevel: NORMAL,
    })
    w.weekday = image(LAYOUT.weekday, 'images/weekday/0.png')

    dataNumber(LAYOUT.steps, ui.data_type.STEP, 'images/digits/steps', DIGITS.steps.gap)
    dataNumber(LAYOUT.battery, ui.data_type.BATTERY, 'images/digits/battery', DIGITS.battery.gap)
    // 電池の枠の中の塗り（残りに合わせて左から）
    w.batteryFill = ui.createWidget(ui.widget.FILL_RECT, { ...LAYOUT.batteryFill, color: COLORS.RED, show_level: NORMAL })
  },

  // 分ごと：時刻・日付・曜日
  updateMinute() {
    const time = this.state.time
    const w = this.state.widgets
    const hour = time.getHours()
    const hourText = String(time.getHourFormat() === TIME_HOUR_FORMAT_12 ? time.getFormatHour() : hour)
    const minuteText = String(time.getMinutes()).padStart(2, '0')
    w.time.update(hourText, minuteText)
    this.state.aod.time.update(hourText, minuteText)

    const dateText = `${time.getMonth()}/${time.getDate()}`
    const day = weekdayIndex(time.getDay())
    w.date.update(dateText)
    w.weekday.setProperty(ui.prop.VISIBLE, day !== null)
    if (day !== null) w.weekday.setProperty(ui.prop.SRC, `images/weekday/${day}.png`)
    this.state.aod.date.setProperty(ui.prop.TEXT, day === null ? dateText : `${dateText}(${WEEKDAYS_JA[day]})`)
  },

  // 画面が点いた時だけ、セリフを次の札に替える（画面が消えている間は何もしない）
  nextQuote() {
    this.state.quoteIndex = nextQuoteIndex(this.state.quoteIndex)
    this.state.widgets.quote.setProperty(ui.prop.SRC, QUOTES[this.state.quoteIndex].image)
  },

  // 電池の数字（通常表示）は時計のデータに直接つないでいる。ここでは電池の枠の塗りと、AOD の HP を更新する
  updateBattery() {
    const value = normalizeBattery(this.state.battery.getCurrent())
    const fill = LAYOUT.batteryFill
    const width = Math.round((fill.w * (value === null ? 0 : value)) / 100)
    this.state.widgets.batteryFill.setProperty(ui.prop.VISIBLE, width > 0)
    if (width > 0) this.state.widgets.batteryFill.setProperty(ui.prop.MORE, { ...fill, w: width, color: COLORS.RED })
    this.state.aod.hp.setProperty(ui.prop.TEXT, `HP ${value === null ? '--' : value}`)
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
