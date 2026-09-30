import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { DIGITS, LAYOUT, SCREEN } from './layout.js'
import { QUOTES, quoteIndexFor } from './quotes.js'
import { createAodView } from './aod.js'
import { formatBreak, normalizeBreakMinutes } from '../setting/keys.js'
import { normalizeBattery } from '../../../shared/battery.js'
import { weekdayIndex } from '../../../shared/date.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'
import { createImageText } from '../../../shared/image-text.js'

const logger = log.getLogger('super-arbeiter')
const NORMAL = ui.show_level.ONLY_NORMAL
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const BREAK_STORE_KEY = 'sa_break' // 時計に控える休憩の時刻。値は「分＋1」（0 は保存なし）

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

// 時計のデータ（電池・歩数）を、数字の画像で直接出す
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

function spriteWidth(spec) {
  return (ch) => (ch === ':' ? spec.colonW : ch === '/' ? spec.slashW : spec.w)
}

function spriteGlyph(dir) {
  return (ch) => `images/digits/${dir}/${ch === ':' ? 'colon' : ch === '/' ? 'slash' : ch}.png`
}

function readStoredBreak() {
  const raw = tolerate(() => hmFS.SysProGetInt(BREAK_STORE_KEY), 0) || 0
  return normalizeBreakMinutes(raw > 0 ? raw - 1 : undefined)
}

WatchFace(
  BasePage({
    state: {
      time: null,
      battery: null,
      breakMinutes: null,
      quoteIndex: null,
      widgets: {},
      aod: null,
      minuteCallback: null,
      batteryCallback: null,
    },

    onInit() {
      this.state.time = new Time()
      this.state.battery = new Battery()
      this.state.breakMinutes = readStoredBreak()
    },

    build() {
      this.drawNormalView()
      this.state.aod = createAodView()
      this.updateMinute()
      this.updateBattery()
      this.updateBreak()
      this.loadBreak()

      this.state.minuteCallback = () => this.updateMinute()
      this.state.batteryCallback = () => this.updateBattery()
      this.state.time.onPerMinute(this.state.minuteCallback)
      this.state.battery.onChange(this.state.batteryCallback)

      ui.createWidget(ui.widget.WIDGET_DELEGATE, {
        resume_call: () => {
          this.updateMinute()
          this.updateBattery()
        },
        pause_call: () => {},
      })
    },

    // 背景の絵に、暖簾・提灯・丼・吹き出し・ラベル・アイコン・BREAK の赤い箱まで入っている
    drawNormalView() {
      const w = this.state.widgets
      image({ x: 0, y: 0, w: SCREEN.width, h: SCREEN.height }, 'images/background.png')
      // セリフの札は1枚だけ置き、日付が変わった時に画像を入れ替える（7枚を同時に描かない）
      w.quote = image(LAYOUT.quote, QUOTES[0].image)

      w.time = createTimeSprites({
        screenWidth: SCREEN.width,
        y: LAYOUT.time.y,
        digitPath: 'images/digits/time',
        digitW: DIGITS.time.w,
        digitH: DIGITS.time.h,
        colonW: DIGITS.time.colonW,
        gap: DIGITS.time.gap,
        showLevel: NORMAL,
      })

      dataNumber(LAYOUT.hp, ui.data_type.BATTERY, 'images/digits/hp', DIGITS.hp.gap)
      dataNumber(LAYOUT.steps, ui.data_type.STEP, 'images/digits/steps', DIGITS.steps.gap)

      w.date = createImageText({
        rect: LAYOUT.date,
        slots: 5,
        glyph: spriteGlyph('date'),
        width: spriteWidth(DIGITS.date),
        gap: DIGITS.date.gap,
        align: 'right',
        showLevel: NORMAL,
      })
      w.weekday = image(LAYOUT.weekday, 'images/weekday/0.png')
      w.breakTime = createImageText({
        rect: LAYOUT.breakTime,
        slots: 5,
        glyph: spriteGlyph('break'),
        width: spriteWidth(DIGITS.break),
        gap: DIGITS.break.gap,
        align: 'center',
        showLevel: NORMAL,
      })
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
      // セリフ：日替わり。同じ日のうちは入れ替えない
      const quote = quoteIndexFor(time.getFullYear(), time.getMonth(), time.getDate())
      if (quote !== this.state.quoteIndex) {
        this.state.quoteIndex = quote
        w.quote.setProperty(ui.prop.SRC, QUOTES[quote].image)
      }
      w.weekday.setProperty(ui.prop.VISIBLE, day !== null)
      if (day !== null) w.weekday.setProperty(ui.prop.SRC, `images/weekday/${day}.png`)
      this.state.aod.date.setProperty(ui.prop.TEXT, `${dateText} ${day === null ? '' : WEEKDAYS_EN[day]}`.trim())
    },

    // HP の数字（通常表示）は時計のデータに直接つないでいる。ここでは AOD の HP だけ更新する
    updateBattery() {
      const value = normalizeBattery(this.state.battery.getCurrent())
      this.state.aod.hp.setProperty(ui.prop.TEXT, `HP ${value === null ? '--' : value}`)
    },

    updateBreak() {
      this.state.widgets.breakTime.update(formatBreak(this.state.breakMinutes))
    },

    applyBreak(minutes) {
      this.state.breakMinutes = normalizeBreakMinutes(minutes)
      tolerate(() => hmFS.SysProSetInt(BREAK_STORE_KEY, this.state.breakMinutes + 1))
      this.updateBreak()
    },

    loadBreak() {
      this.request({ method: 'GET_BREAK' })
        .then(({ breakMinutes }) => this.applyBreak(breakMinutes))
        .catch(() => logger.log('Using cached break time'))
    },

    onCall(data) {
      if (data && data.type === 'BREAK_CHANGED') this.applyBreak(data.breakMinutes)
    },

    onDestroy() {
      if (this.state.battery && this.state.batteryCallback) {
        this.state.battery.offChange(this.state.batteryCallback)
      }
      if (this.state.time && this.state.minuteCallback) {
        tolerate(() => this.state.time.offPerMinute(this.state.minuteCallback))
      }
    },
  }),
)
