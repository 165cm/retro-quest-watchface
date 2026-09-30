import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { DIGITS, LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { getMood, getShiftMessage, getShiftStatus, normalizeShift } from './shift.js'
import { createAodView } from './aod.js'
import { getFilledSegments, normalizeBattery, formatBatteryPercent } from '../../../shared/battery.js'
import { getTodayWeather, isNightAt, resolveWeatherTheme } from '../../../shared/weather.js'
import { createTimeSprites } from '../../../shared/time-sprites.js'
import { formatWeekday } from '../../../shared/date.js'

const logger = log.getLogger('yuge-ramen-face')
const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土']
const BATTERY_LEVELS = 5

// 時計の中に控えておくキー。値は「分＋1」（0 と「保存なし」を区別するため）
const STORE = {
  enabled: 'yuge_shift_on', // 1 = オン、2 = オフ
  start: 'yuge_shift_start',
  end: 'yuge_shift_end',
}

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

function textWidget(rect, text, size, color, align = ui.align.CENTER_H) {
  return ui.createWidget(ui.widget.TEXT, {
    ...rect,
    text,
    text_size: size,
    color,
    align_h: align,
    align_v: ui.align.CENTER_V,
    text_style: ui.text_style.ELLIPSIS,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function smallNumber(rect, type, align, withUnit) {
  const path = 'images/digits/small'
  const unit = withUnit ? `${path}/degree.png` : undefined
  return ui.createWidget(ui.widget.TEXT_IMG, {
    ...rect,
    type,
    font_array: digitArray(path),
    negative_image: `${path}/negative.png`,
    unit_sc: unit,
    unit_tc: unit,
    unit_en: unit,
    imperial_unit_sc: unit,
    imperial_unit_tc: unit,
    imperial_unit_en: unit,
    h_space: 1,
    align_h: align,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function pill(rect) {
  ui.createWidget(ui.widget.FILL_RECT, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    radius: rect.radius,
    color: COLORS.CREAM,
    alpha: 205,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function readStoredShift() {
  const get = (key) => tolerate(() => hmFS.SysProGetInt(key), 0) || 0
  const enabledRaw = get(STORE.enabled)
  const startRaw = get(STORE.start)
  const endRaw = get(STORE.end)
  return normalizeShift({
    enabled: enabledRaw === 0 ? undefined : enabledRaw === 1,
    startMin: startRaw > 0 ? startRaw - 1 : undefined,
    endMin: endRaw > 0 ? endRaw - 1 : undefined,
  })
}

function storeShift(shift) {
  tolerate(() => {
    hmFS.SysProSetInt(STORE.enabled, shift.enabled ? 1 : 2)
    hmFS.SysProSetInt(STORE.start, shift.startMin + 1)
    hmFS.SysProSetInt(STORE.end, shift.endMin + 1)
  })
}

WatchFace(
  BasePage({
    state: {
      time: null,
      battery: null,
      weather: null,
      shift: null,
      batteryPercent: null,
      widgets: {},
      aod: null,
      minuteCallback: null,
      batteryCallback: null,
    },

    onInit() {
      this.state.time = new Time()
      this.state.battery = new Battery()
      this.state.weather = tolerate(() => hmSensor.createSensor(hmSensor.id.WEATHER), null)
      this.state.shift = readStoredShift()
    },

    build() {
      this.drawNormalView()
      this.state.aod = createAodView()
      this.updateBattery()
      this.updateMinute()
      this.loadShift()

      this.state.minuteCallback = () => this.updateMinute()
      this.state.batteryCallback = () => {
        this.updateBattery()
        this.updateMinute()
      }
      this.state.time.onPerMinute(this.state.minuteCallback)
      this.state.battery.onChange(this.state.batteryCallback)

      ui.createWidget(ui.widget.WIDGET_DELEGATE, {
        resume_call: () => {
          this.updateBattery()
          this.updateMinute()
        },
        pause_call: () => {},
      })
    },

    drawNormalView() {
      const w = this.state.widgets
      w.background = ui.createWidget(ui.widget.IMG, {
        x: 0,
        y: 0,
        w: SCREEN.width,
        h: SCREEN.height,
        src: 'images/backgrounds/clear_day.png',
        show_level: ui.show_level.ONLY_NORMAL,
      })

      pill(LAYOUT.topPill)
      w.date = textWidget(LAYOUT.date, '', TYPE.date, COLORS.COCOA, ui.align.LEFT)
      smallNumber(LAYOUT.temp, ui.data_type.WEATHER_CURRENT, ui.align.CENTER_H, true)

      w.time = createTimeSprites({
        screenWidth: SCREEN.width,
        y: LAYOUT.time.y,
        digitPath: 'images/digits/time',
        digitW: DIGITS.time.w,
        digitH: DIGITS.time.h,
        colonW: DIGITS.time.colonW,
        gap: DIGITS.time.gap,
        showLevel: ui.show_level.ONLY_NORMAL,
      })

      w.obake = ui.createWidget(ui.widget.IMG, {
        ...LAYOUT.obake,
        src: 'images/obake/normal.png',
        show_level: ui.show_level.ONLY_NORMAL,
      })
      ui.createWidget(ui.widget.IMG, {
        ...LAYOUT.bubble,
        src: 'images/bubble.png',
        show_level: ui.show_level.ONLY_NORMAL,
      })
      w.bubbleLabel = textWidget(LAYOUT.bubbleLabel, '', TYPE.bubbleLabel, COLORS.COCOA_SOFT)
      w.bubbleMain = textWidget(LAYOUT.bubbleSingle, '', TYPE.bubbleSingle, COLORS.COCOA)

      pill(LAYOUT.bottomPill)
      ui.createWidget(ui.widget.IMG, {
        ...LAYOUT.stepIcon,
        src: 'images/icons/step.png',
        show_level: ui.show_level.ONLY_NORMAL,
      })
      smallNumber(LAYOUT.steps, ui.data_type.STEP, ui.align.LEFT, false)
      w.batteryIcon = ui.createWidget(ui.widget.IMG, {
        ...LAYOUT.batteryIcon,
        src: 'images/battery/5.png',
        show_level: ui.show_level.ONLY_NORMAL,
      })
      w.percent = textWidget(LAYOUT.percent, '--%', TYPE.percent, COLORS.COCOA, ui.align.RIGHT)
    },

    // 分ごと：時刻・日付・天気・シフト・表情
    updateMinute() {
      const time = this.state.time
      const w = this.state.widgets
      const hour = time.getHours()
      const minute = time.getMinutes()
      const hourText = String(time.getHourFormat() === TIME_HOUR_FORMAT_12 ? time.getFormatHour() : hour)
      const minuteText = String(minute).padStart(2, '0')
      w.time.update(hourText, minuteText)
      this.state.aod.time.update(hourText, minuteText)

      const dateText = `${time.getMonth()}/${time.getDate()} (${formatWeekday(time.getDay(), WEEKDAYS_JA)})`
      w.date.setProperty(ui.prop.TEXT, dateText)
      this.state.aod.date.setProperty(ui.prop.TEXT, dateText)

      const weather = getTodayWeather(this.state.weather)
      const night = isNightAt(hour, minute, weather.sunrise, weather.sunset)
      w.background.setProperty(ui.prop.SRC, `images/backgrounds/${resolveWeatherTheme(weather.code, night)}.png`)

      const status = getShiftStatus(hour * 60 + minute, this.state.shift)
      const message = getShiftMessage(status, hour)
      w.bubbleLabel.setProperty(ui.prop.TEXT, message.label)
      const mainRect = message.label ? LAYOUT.bubbleMain : LAYOUT.bubbleSingle
      w.bubbleMain.setProperty(ui.prop.MORE, {
        ...mainRect,
        text: message.main,
        text_size: message.label ? TYPE.bubbleMain : TYPE.bubbleSingle,
      })
      this.state.aod.shift.setProperty(ui.prop.TEXT, `${message.label} ${message.main}`.trim())

      const mood = getMood(status, this.state.batteryPercent, hour)
      w.obake.setProperty(ui.prop.SRC, `images/obake/${mood}.png`)
    },

    updateBattery() {
      const value = normalizeBattery(this.state.battery.getCurrent())
      this.state.batteryPercent = value
      const level = getFilledSegments(value, BATTERY_LEVELS)
      this.state.widgets.batteryIcon.setProperty(ui.prop.SRC, `images/battery/${level}.png`)
      this.state.widgets.percent.setProperty(ui.prop.MORE, {
        ...LAYOUT.percent,
        text: formatBatteryPercent(value),
        color: value !== null && value <= 20 ? COLORS.BATTERY_LOW : COLORS.COCOA,
      })
    },

    applyShift(shift) {
      this.state.shift = normalizeShift(shift)
      storeShift(this.state.shift)
      this.updateMinute()
    },

    loadShift() {
      this.request({ method: 'GET_SHIFT' })
        .then(({ shift }) => this.applyShift(shift))
        .catch(() => logger.log('Using cached shift'))
    },

    onCall(data) {
      if (data && data.type === 'SHIFT_CHANGED') this.applyShift(data.shift)
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
