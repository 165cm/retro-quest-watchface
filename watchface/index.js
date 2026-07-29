import ui from '@zos/ui'
import { Battery, Step, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { getBossName, getBossSprite } from './boss.js'
import {
  TOTAL_SEGMENTS,
  getBatteryColorKey,
  getFilledSegments,
  normalizeBattery,
} from './battery.js'
import { getTodayWeather, isNightAt, resolveWeatherTheme } from './weather.js'
import { formatSteps } from './steps.js'
import {
  CYCLE_INTERVAL_MS,
  isCycleMode,
  normalizeDebugIndex,
  resolveDisplayTheme,
} from './debug-theme.js'
import { createTimeSprites } from './time-sprites.js'
import { createAodView } from './aod.js'

const logger = log.getLogger('pixel-wayfarer-face')
const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const BATTERY_COLORS = {
  green: COLORS.HP_GREEN,
  yellow: COLORS.HP_YELLOW,
  red: COLORS.HP_RED,
  empty: COLORS.HP_EMPTY,
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

// ドラクエ様式の窓。黒地に白い2pxの直角枠、それだけ。
// 背景は完全に隠さず透かすが、透過率は上下で揃えて材質を一つに見せる。
const WINDOW_ALPHA = 200

function questWindow(rect) {
  ui.createWidget(ui.widget.FILL_RECT, {
    ...rect,
    color: COLORS.WINDOW,
    alpha: WINDOW_ALPHA,
    show_level: ui.show_level.ONLY_NORMAL,
  })
  ui.createWidget(ui.widget.STROKE_RECT, {
    ...rect,
    color: COLORS.TEXT_PRIMARY,
    line_width: 2,
    radius: 0,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function temperatureWidget(rect, type, path, unitPath, showLevel) {
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
    h_space: 2,
    align_h: ui.align.CENTER_H,
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
    hpSegments: [],
    aod: null,
    encounter: null,
    boss: null,
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
    this.state.weather = hmSensor.createSensor(hmSensor.id.WEATHER)
    this.state.debugIndex = normalizeDebugIndex(
      hmFS.SysProGetInt('pixel_wayfarer_debug_theme') || 0,
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

    this.drawTopWindow()
    this.drawBoss()
    this.drawTime()
    this.drawBottomWindow()
  },

  // 上の窓: 天候アイコン・日付・HPゲージを1行に。
  // パーセント表示はゲージと同じ値の二重表示なので通常表示では持たない。
  drawTopWindow() {
    questWindow(LAYOUT.topWindow)

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

    for (let i = 0; i < TOTAL_SEGMENTS; i += 1) {
      const x = LAYOUT.hp.gaugeX + i * (LAYOUT.hp.segmentW + LAYOUT.hp.gap)
      ui.createWidget(ui.widget.STROKE_RECT, {
        x,
        y: LAYOUT.hp.gaugeY,
        w: LAYOUT.hp.segmentW,
        h: LAYOUT.hp.segmentH,
        color: COLORS.TEXT_PRIMARY,
        line_width: 1,
        radius: 0,
        show_level: ui.show_level.ONLY_NORMAL,
      })
      this.state.hpSegments.push(
        ui.createWidget(ui.widget.FILL_RECT, {
          x: x + 2,
          y: LAYOUT.hp.gaugeY + 2,
          w: LAYOUT.hp.segmentW - 4,
          h: LAYOUT.hp.segmentH - 4,
          color: COLORS.HP_EMPTY,
          show_level: ui.show_level.ONLY_NORMAL,
        }),
      )
    }
  },

  // 中ボス。時ごとに入れ替わる「今の時間の敵」。
  drawBoss() {
    this.state.boss = ui.createWidget(ui.widget.IMG, {
      ...LAYOUT.boss,
      src: 'images/boss/00.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })
  },

  // 時刻は窓を持たず背景へ直接。数字はモンスター字形で、縁取りと影を焼いてある。
  drawTime() {
    this.state.mainTime = createTimeSprites({
      y: LAYOUT.time.y,
      digitPath: 'images/digits/monster',
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

  // 下の窓: ▶カーソル付きのコピー、区切り線、気温3列、歩数。
  drawBottomWindow() {
    questWindow(LAYOUT.bottomWindow)

    ui.createWidget(ui.widget.IMG, {
      ...LAYOUT.copyCursor,
      src: 'images/cursor.png',
      show_level: ui.show_level.ONLY_NORMAL,
    })
    this.state.encounter = textWidget(
      LAYOUT.encounterText,
      '',
      TYPE.encounter,
      COLORS.TEXT_PRIMARY,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )

    ui.createWidget(ui.widget.FILL_RECT, {
      ...LAYOUT.divider,
      color: COLORS.TEXT_PRIMARY,
      alpha: 90,
      show_level: ui.show_level.ONLY_NORMAL,
    })

    const temp = LAYOUT.temperature
    const columns = [
      { label: 'L', color: COLORS.LOW_BLUE, type: ui.data_type.WEATHER_LOW, path: 'temp-low' },
      { label: 'NOW', color: COLORS.TEXT_PRIMARY, type: ui.data_type.WEATHER_CURRENT, path: 'temp-now' },
      { label: 'H', color: COLORS.HIGH_ORANGE, type: ui.data_type.WEATHER_HIGH, path: 'temp-high' },
    ]
    columns.forEach((column, index) => {
      const geometry = temp.columns[index]
      textWidget(
        { x: geometry.x, y: temp.labelY, w: geometry.w, h: temp.labelH },
        column.label,
        TYPE.tempLabel,
        column.color,
        ui.align.CENTER_H,
        ui.show_level.ONLY_NORMAL,
      )
      temperatureWidget(
        { x: geometry.x, y: temp.valueY, w: geometry.w, h: temp.valueH },
        column.type,
        `images/digits/${column.path}`,
        `images/digits/${column.path}/degree.png`,
        ui.show_level.ONLY_NORMAL,
      )
    })

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

    // 中ボスは表示時刻の「時」で決まる。24時間制の午後は午前と同じ敵になる。
    this.state.boss.setProperty(
      ui.prop.SRC,
      `images/boss/${getBossSprite(displayHour)}.png`,
    )
    this.state.encounter.setProperty(
      ui.prop.TEXT,
      `${getBossName(displayHour)} APPEARS!`,
    )

    const weekday = WEEKDAYS[time.getDay() - 1] || '---'
    const dateText = `${time.getMonth()}/${time.getDate()} ${weekday}`
    this.state.date.setProperty(ui.prop.TEXT, dateText)
    this.state.aod.date.setProperty(ui.prop.TEXT, dateText)
  },

  updateSteps() {
    this.state.steps.setProperty(ui.prop.TEXT, formatSteps(this.state.step.getCurrent()))
  },

  updateBattery() {
    const value = normalizeBattery(this.state.battery.getCurrent())
    const filled = getFilledSegments(value)
    const color = BATTERY_COLORS[getBatteryColorKey(value)]
    this.state.hpSegments.forEach((segment, index) => {
      segment.setProperty(ui.prop.MORE, {
        x: LAYOUT.hp.gaugeX + index * (LAYOUT.hp.segmentW + LAYOUT.hp.gap) + 2,
        y: LAYOUT.hp.gaugeY + 2,
        w: LAYOUT.hp.segmentW - 4,
        h: LAYOUT.hp.segmentH - 4,
        color: index < filled ? color : COLORS.HP_EMPTY,
      })
    })
    this.state.aod.segments.forEach((segment, index) => {
      segment.setProperty(ui.prop.MORE, {
        x:
          LAYOUT.aod.hpGaugeX +
          index * (LAYOUT.aod.segmentW + LAYOUT.aod.gap),
        y: LAYOUT.aod.hpGaugeY,
        w: LAYOUT.aod.segmentW,
        h: LAYOUT.aod.segmentH,
        color: index < filled ? COLORS.AOD_TEXT : COLORS.AOD_EMPTY,
      })
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
    if (next !== this.state.debugIndex) this.state.debugTick = 0
    this.state.debugIndex = next
    hmFS.SysProSetInt('pixel_wayfarer_debug_theme', next)
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
