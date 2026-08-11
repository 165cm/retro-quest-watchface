import ui from '@zos/ui'
import { Battery, Step, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { getBarWidth, getBatteryColorKey, normalizeBattery } from './battery.js'
import { getTodayWeather, isNightAt, resolveWeatherTheme } from './weather.js'
import { formatSteps } from './steps.js'
import { formatDate } from './date.js'
import {
  CYCLE_INTERVAL_MS,
  isCycleMode,
  normalizeDebugIndex,
  resolveDisplayTheme,
} from './debug-theme.js'
import { createTimeSprites } from './time-sprites.js'
import { createAodView } from './aod.js'

const logger = log.getLogger('pixel-wayfarer-face')
const DEBUG_STORAGE_KEY = 'pixel_wayfarer_debug_theme'

// レガシーのグローバルAPI（hmSensor / hmFS）を触る箇所を包む。
// onInit で例外が出ると build() へ到達せず文字盤が真っ黒になるため、
// 天候やデバッグ設定のような「無くても時刻は出せる」機能で
// 全体を道連れにしない。失敗時は既定値へ落として描画を続ける。
function tolerate(operation, fallback) {
  try {
    return operation()
  } catch (error) {
    logger.log('legacy API unavailable, using fallback')
    return fallback
  }
}

const BATTERY_COLORS = {
  green: COLORS.HP_GREEN,
  yellow: COLORS.HP_YELLOW,
  red: COLORS.HP_RED,
  // 値が読めないときは棒の幅が0になるので、色は溝と同じでよい。
  empty: COLORS.HP_TRACK,
}

function textWidget(rect, text, size, color, align = ui.align.LEFT, showLevel) {
  return ui.createWidget(ui.widget.TEXT, {
    ...rect,
    text,
    text_size: size,
    color,
    align_h: align,
    align_v: ui.align.CENTER_V,
    text_style: ui.text_style.ELLIPSIS,
    show_level: showLevel,
  })
}

function digitArray(path) {
  return Array.from({ length: 10 }, (_, index) => `${path}/${index}.png`)
}

// 現行ドラクエのコマンドウィンドウ。角丸の濃紺ガラスに金の細枠、それだけ。
// 背景は透かすが、透過率は上下で揃えて材質を一つに見せる。
const PANEL_ALPHA = 205

function questPanel(rect) {
  ui.createWidget(ui.widget.FILL_RECT, {
    ...rect,
    radius: LAYOUT.panelRadius,
    color: COLORS.PANEL,
    alpha: PANEL_ALPHA,
    show_level: ui.show_level.ONLY_NORMAL,
  })
  ui.createWidget(ui.widget.STROKE_RECT, {
    ...rect,
    radius: LAYOUT.panelRadius,
    color: COLORS.PANEL_EDGE,
    line_width: 2,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function temperatureWidget(rect, type, path, align, showLevel) {
  const unitPath = `${path}/degree.png`
  return ui.createWidget(ui.widget.TEXT_IMG, {
    ...rect,
    type,
    font_array: digitArray(path),
    negative_image: `${path}/negative.png`,
    unit_sc: unitPath,
    unit_tc: unitPath,
    unit_en: unitPath,
    imperial_unit_sc: unitPath,
    imperial_unit_tc: unitPath,
    imperial_unit_en: unitPath,
    h_space: 1,
    align_h: align,
    show_level: showLevel,
  })
}

WatchFace(
  BasePage({
  state: {
    time: null,
    battery: null,
    weather: null,
    background: null,
    weatherIcon: null,
    mainTime: null,
    amPm: null,
    date: null,
    hpBar: null,
    hpText: null,
    aod: null,
    step: null,
    steps: null,
    weatherTheme: 'clear_day',
    debugIndex: 0,
    debugTick: 0,
    debugTimer: null,
    batteryCallback: null,
    minuteCallback: null,
    stepCallback: null,
  },

  onInit() {
    this.state.time = new Time()
    this.state.battery = new Battery()
    this.state.step = new Step()
    // null のまま渡しても getTodayWeather() が既定値を返し、背景は unknown になる。
    this.state.weather = tolerate(
      () => hmSensor.createSensor(hmSensor.id.WEATHER),
      null,
    )
    this.state.debugIndex = normalizeDebugIndex(
      tolerate(() => hmFS.SysProGetInt(DEBUG_STORAGE_KEY), 0) || 0,
    )
  },

  build() {
    this.drawNormalView()
    this.state.aod = createAodView()
    this.updateTimeAndDate()
    this.updateBattery()
    this.updateSteps()
    this.updateWeather()
    this.loadDebugTheme()
    this.startCycleTimer()

    this.state.minuteCallback = () => {
      this.updateTimeAndDate()
      this.updateWeather()
    }
    this.state.batteryCallback = () => this.updateBattery()
    this.state.stepCallback = () => this.updateSteps()
    this.state.time.onPerMinute(this.state.minuteCallback)
    this.state.battery.onChange(this.state.batteryCallback)
    this.state.step.onChange(this.state.stepCallback)

    ui.createWidget(ui.widget.WIDGET_DELEGATE, {
      resume_call: () => {
        this.updateTimeAndDate()
        this.updateBattery()
        this.updateSteps()
        this.updateWeather()
        this.startCycleTimer()
      },
      // 文字盤が見えていない間は巡回タイマーを止める。
      pause_call: () => this.stopCycleTimer(),
    })
  },

  drawNormalView() {
    ui.createWidget(ui.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN.width,
      h: SCREEN.height,
      color: COLORS.BACKGROUND_NAVY,
      show_level: ui.show_level.ONLY_NORMAL,
    })

    this.state.background = ui.createWidget(ui.widget.IMG, {
      ...LAYOUT.background,
      src: 'images/backgrounds/clear_day.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })

    this.drawTopPanel()
    this.drawTime()
    this.drawBottomPanel()
  },

  // 上の板は「外の様子」だけ。天候アイコン・日付・現在気温を1行に集める。
  drawTopPanel() {
    questPanel(LAYOUT.topPanel)

    this.state.weatherIcon = ui.createWidget(ui.widget.IMG, {
      ...LAYOUT.weatherIcon,
      src: 'images/weather/clear_day.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })

    this.state.date = textWidget(
      LAYOUT.date,
      '7/24 FRI',
      TYPE.date,
      COLORS.TEXT_PRIMARY,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )

    temperatureWidget(
      LAYOUT.nowTemp,
      ui.data_type.WEATHER_CURRENT,
      'images/digits/temp-now',
      ui.align.RIGHT,
      ui.show_level.ONLY_NORMAL,
    )
  },

  // 時刻は板を持たず背景へ直接。数字は縁取りと影を焼いたベクター字形なので、
  // どの背景の上でも輪郭が消えない。
  drawTime() {
    this.state.mainTime = createTimeSprites({
      y: LAYOUT.time.y,
      digitPath: 'images/digits/time',
      digitW: LAYOUT.time.digitW,
      digitH: LAYOUT.time.digitH,
      colonW: LAYOUT.time.colonW,
      gap: LAYOUT.time.gap,
      showLevel: ui.show_level.ONLY_NORMAL,
    })
    this.state.amPm = ui.createWidget(ui.widget.IMG, {
      x: 0,
      y: LAYOUT.time.y + LAYOUT.amPm.offsetY,
      w: LAYOUT.amPm.w,
      h: LAYOUT.amPm.h,
      src: 'images/ampm/am.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })
  },

  // 下の板は「自分の状態」。1段目にHPの棒、2段目に歩数と今日の気温幅。
  drawBottomPanel() {
    questPanel(LAYOUT.bottomPanel)

    const hp = LAYOUT.hp
    textWidget(
      hp.label,
      'HP',
      TYPE.label,
      COLORS.TEXT_LABEL,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    ui.createWidget(ui.widget.FILL_RECT, {
      ...hp.track,
      radius: hp.radius,
      color: COLORS.HP_TRACK,
      show_level: ui.show_level.ONLY_NORMAL,
    })
    this.state.hpBar = ui.createWidget(ui.widget.FILL_RECT, {
      ...hp.track,
      radius: hp.radius,
      color: COLORS.HP_GREEN,
      show_level: ui.show_level.ONLY_NORMAL,
    })
    this.state.hpText = textWidget(
      hp.text,
      '100%',
      TYPE.battery,
      COLORS.TEXT_PRIMARY,
      ui.align.RIGHT,
      ui.show_level.ONLY_NORMAL,
    )

    ui.createWidget(ui.widget.IMG, {
      ...LAYOUT.steps.icon,
      src: 'images/steps.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })
    this.state.steps = textWidget(
      LAYOUT.steps.text,
      '0',
      TYPE.steps,
      COLORS.TEXT_PRIMARY,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )

    const range = LAYOUT.range
    textWidget(
      range.lowLabel,
      'L',
      TYPE.label,
      COLORS.LOW_BLUE,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    temperatureWidget(
      range.lowValue,
      ui.data_type.WEATHER_LOW,
      'images/digits/temp-low',
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    textWidget(
      range.highLabel,
      'H',
      TYPE.label,
      COLORS.HIGH_ORANGE,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    temperatureWidget(
      range.highValue,
      ui.data_type.WEATHER_HIGH,
      'images/digits/temp-high',
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
  },

  updateTimeAndDate() {
    const time = this.state.time
    const rawHour = time.getHours()
    const is12Hour = time.getHourFormat() === TIME_HOUR_FORMAT_12
    const displayHour = is12Hour ? time.getFormatHour() : rawHour
    const hourText = String(displayHour)
    const minuteText = String(time.getMinutes()).padStart(2, '0')

    // 数字列そのものを中央へ寄せる。AM/PMの幅を計算へ含めると、
    // 12h/24hの切替や桁数で時刻の中心が動いてしまう。
    const timeEndX = this.state.mainTime.update(hourText, minuteText)
    this.state.aod.time.update(hourText, minuteText)

    this.state.amPm.setProperty(ui.prop.MORE, {
      x: timeEndX + LAYOUT.amPm.gap,
      y: LAYOUT.time.y + LAYOUT.amPm.offsetY,
      w: LAYOUT.amPm.w,
      h: LAYOUT.amPm.h,
      src: is12Hour
        ? rawHour < 12
          ? 'images/ampm/am.png'
          : 'images/ampm/pm.png'
        : 'images/ampm/blank.png',
    })

    const dateText = formatDate(time.getMonth(), time.getDate(), time.getDay())
    this.state.date.setProperty(ui.prop.TEXT, dateText)
    this.state.aod.date.setProperty(ui.prop.TEXT, dateText)
  },

  updateSteps() {
    this.state.steps.setProperty(ui.prop.TEXT, formatSteps(this.state.step.getCurrent()))
  },

  updateBattery() {
    const value = normalizeBattery(this.state.battery.getCurrent())
    const color = BATTERY_COLORS[getBatteryColorKey(value)]
    const track = LAYOUT.hp.track

    this.state.hpBar.setProperty(ui.prop.MORE, {
      x: track.x,
      y: track.y,
      w: getBarWidth(value, track.w, track.h),
      h: track.h,
      radius: LAYOUT.hp.radius,
      color,
    })
    this.state.hpText.setProperty(ui.prop.TEXT, value === null ? '--%' : `${value}%`)

    const aodBar = LAYOUT.aod.hp
    this.state.aod.bar.setProperty(ui.prop.MORE, {
      x: aodBar.x,
      y: aodBar.y,
      w: getBarWidth(value, aodBar.w, aodBar.h),
      h: aodBar.h,
      radius: aodBar.radius,
      color: COLORS.AOD_TEXT,
    })
  },

  updateWeather() {
    const weather = getTodayWeather(this.state.weather)
    const time = this.state.time
    const night = isNightAt(
      time.getHours(),
      time.getMinutes(),
      weather.sunrise,
      weather.sunset,
    )
    this.state.weatherTheme = resolveWeatherTheme(weather.code, night)
    this.applyTheme()
  },

  // 背景と天候アイコンを描き替える。デバッグ指定があればそちらを優先する。
  applyTheme() {
    const theme = resolveDisplayTheme(
      this.state.debugIndex,
      this.state.weatherTheme,
      this.state.debugTick,
    )
    this.state.background.setProperty(
      ui.prop.SRC,
      `images/backgrounds/${theme}.png`,
    )
    this.state.weatherIcon.setProperty(
      ui.prop.SRC,
      `images/weather/${theme}.png`,
    )
  },

  // 巡回モードのときだけタイマーを動かす。通常表示では秒タイマーを持たない。
  // アプリスコープの setInterval を使う（@zos/timer の createSysTimer は
  // 息屏中も動くシステム定時器なので、文字盤のデバッグ用途には使わない）。
  startCycleTimer() {
    this.stopCycleTimer()
    if (!isCycleMode(this.state.debugIndex)) return
    this.state.debugTimer = setInterval(() => {
      this.state.debugTick += 1
      this.applyTheme()
    }, CYCLE_INTERVAL_MS)
  },

  stopCycleTimer() {
    if (this.state.debugTimer !== null) {
      clearInterval(this.state.debugTimer)
      this.state.debugTimer = null
    }
  },

  applyDebugTheme(value) {
    const next = normalizeDebugIndex(value)
    // 起動のたびに loadDebugTheme() から同じ値で呼ばれる。値が変わって
    // いないときまで書き込むとフラッシュを無駄に消耗するので、差分だけ保存する。
    if (next !== this.state.debugIndex) {
      this.state.debugTick = 0
      this.state.debugIndex = next
      tolerate(() => hmFS.SysProSetInt(DEBUG_STORAGE_KEY, next), null)
    }
    this.applyTheme()
    this.startCycleTimer()
  },

  loadDebugTheme() {
    this.request({ method: 'GET_DEBUG_THEME' })
      .then(({ debugIndex }) => this.applyDebugTheme(debugIndex))
      .catch(() => {
        logger.log('Using cached debug theme')
      })
  },

  onCall(data) {
    if (!data) return
    if (data.type === 'DEBUG_THEME_CHANGED') {
      this.applyDebugTheme(data.debugIndex)
    }
  },

  onDestroy() {
    // 購読したものは全部外す。分更新だけ外し忘れていた。
    if (this.state.time && this.state.minuteCallback) {
      this.state.time.offPerMinute(this.state.minuteCallback)
    }
    if (this.state.battery && this.state.batteryCallback) {
      this.state.battery.offChange(this.state.batteryCallback)
    }
    if (this.state.step && this.state.stepCallback) {
      this.state.step.offChange(this.state.stepCallback)
    }
    this.stopCycleTimer()
    logger.log('watchface destroyed')
  },
  }),
)
