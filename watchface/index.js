import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { getCopyPreset } from './copy.js'
import {
  TOTAL_SEGMENTS,
  formatBatteryPercent,
  getBatteryColorKey,
  getFilledSegments,
  normalizeBattery,
} from './battery.js'
import { getTodayWeather, isNightAt, resolveWeatherTheme } from './weather.js'
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

const PANEL_ALPHA = 185

function panelFill(rect) {
  return ui.createWidget(ui.widget.FILL_RECT, {
    ...rect,
    color: COLORS.PANEL_NAVY,
    alpha: PANEL_ALPHA,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

function panelEdge(x, y, w, h) {
  return ui.createWidget(ui.widget.FILL_RECT, {
    x,
    y,
    w,
    h,
    color: COLORS.PANEL_EDGE,
    show_level: ui.show_level.ONLY_NORMAL,
  })
}

// RPGのウィンドウ装飾。四隅に金色のドットを置いて情報カード感を和らげる。
function cornerGems(rect, gem = 4) {
  ;[
    [rect.x - 1, rect.y - 1],
    [rect.x + rect.w - gem + 1, rect.y - 1],
    [rect.x - 1, rect.y + rect.h - gem + 1],
    [rect.x + rect.w - gem + 1, rect.y + rect.h - gem + 1],
  ].forEach(([gx, gy]) => {
    ui.createWidget(ui.widget.FILL_RECT, {
      x: gx,
      y: gy,
      w: gem,
      h: gem,
      color: COLORS.PANEL_ACCENT_GOLD,
      show_level: ui.show_level.ONLY_NORMAL,
    })
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
    hpPercent: null,
    aod: null,
    copyLabel: null,
    copyText: null,
    presetIndex: 0,
    weatherTheme: 'clear_day',
    debugIndex: 0,
    debugTick: 0,
    debugTimer: null,
    batteryCallback: null,
    minuteCallback: null,
  },

  onInit() {
    this.state.time = new Time()
    this.state.battery = new Battery()
    this.state.weather = hmSensor.createSensor(hmSensor.id.WEATHER)
    this.state.presetIndex = hmFS.SysProGetInt('pixel_wayfarer_preset') || 0
    this.state.debugIndex = normalizeDebugIndex(
      hmFS.SysProGetInt('pixel_wayfarer_debug_theme') || 0,
    )
  },

  build() {
    this.drawNormalView()
    this.state.aod = createAodView()
    this.updateTimeAndDate()
    this.updateBattery()
    this.updateWeather()
    this.loadMessagePreset()
    this.loadDebugTheme()
    this.startCycleTimer()

    this.state.minuteCallback = () => {
      this.updateTimeAndDate()
      this.updateWeather()
    }
    this.state.batteryCallback = () => this.updateBattery()
    this.state.time.onPerMinute(this.state.minuteCallback)
    this.state.battery.onChange(this.state.batteryCallback)

    ui.createWidget(ui.widget.WIDGET_DELEGATE, {
      resume_call: () => {
        this.updateTimeAndDate()
        this.updateBattery()
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

    this.drawTopBar()
    this.drawTime()
    this.drawCopyWindow()
    this.drawTemperature()
  },

  // 天候アイコン、日付、HPゲージを一列に収める。
  drawTopBar() {
    ui.createWidget(ui.widget.FILL_RECT, {
      ...LAYOUT.topBar,
      color: COLORS.BACKGROUND_NAVY,
      alpha: 100,
      radius: 2,
      show_level: ui.show_level.ONLY_NORMAL,
    })

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

    textWidget(
      LAYOUT.hp.label,
      'HP',
      TYPE.hp,
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
        color: COLORS.TEXT_MUTED,
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
    this.state.hpPercent = textWidget(
      LAYOUT.hp.percent,
      '--%',
      TYPE.hpPercent,
      COLORS.TEXT_PRIMARY,
      ui.align.RIGHT,
      ui.show_level.ONLY_NORMAL,
    )
  },

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
    this.state.amPm = textWidget(
      LAYOUT.amPm,
      '',
      TYPE.amPm,
      COLORS.TEXT_MUTED,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
  },

  // ラベルをタブとして本文ボックスの上に載せる。塗りは重ねず隣接させ、枠線は辺ごとに
  // 描いてタブ下辺と本文上辺の継ぎ目を開ける。半透明なので塗りで消すと線が透けてしまう。
  drawCopyWindow() {
    const panel = LAYOUT.copyPanel
    const tab = LAYOUT.copyTab

    panelFill(tab)
    panelFill(panel)

    // タブ: 上・左・右のみ（下辺は本文ボックスへ開ける）
    panelEdge(tab.x, tab.y, tab.w, 2)
    panelEdge(tab.x, tab.y, 2, tab.h)
    panelEdge(tab.x + tab.w - 2, tab.y, 2, tab.h)
    // 本文ボックス: 上辺はタブの右端から始める
    panelEdge(tab.x + tab.w - 2, panel.y, panel.x + panel.w - tab.x - tab.w + 2, 2)
    panelEdge(panel.x, panel.y, 2, panel.h)
    panelEdge(panel.x + panel.w - 2, panel.y, 2, panel.h)
    panelEdge(panel.x, panel.y + panel.h - 2, panel.w, 2)

    cornerGems({ x: tab.x, y: tab.y, w: panel.w, h: panel.y + panel.h - tab.y })

    const preset = getCopyPreset(this.state.presetIndex)
    this.state.copyLabel = textWidget(
      tab,
      preset.label,
      TYPE.copyLabel,
      COLORS.TEXT_MUTED,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )
    this.state.copyText = textWidget(
      LAYOUT.copyText,
      preset.text,
      TYPE.copyText,
      COLORS.TEXT_PRIMARY,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )
  },

  // L / NOW / H の3列。値はファームウェアの文字盤データ型へ直接バインドする。
  drawTemperature() {
    const temp = LAYOUT.temperature

    panelFill(temp.box)
    panelEdge(temp.box.x, temp.box.y, temp.box.w, 2)
    panelEdge(temp.box.x, temp.box.y, 2, temp.box.h)
    panelEdge(temp.box.x + temp.box.w - 2, temp.box.y, 2, temp.box.h)
    panelEdge(temp.box.x, temp.box.y + temp.box.h - 2, temp.box.w, 2)
    cornerGems(temp.box)
    temp.dividerXs.forEach((x) => panelEdge(x, temp.dividerY, 2, temp.dividerH))

    const columns = [
      { label: 'L', color: COLORS.LOW_BLUE, type: ui.data_type.WEATHER_LOW, path: 'temp-low' },
      { label: 'NOW', color: COLORS.TEXT_PRIMARY, type: ui.data_type.WEATHER_CURRENT, path: 'temp-now' },
      { label: 'H', color: COLORS.HIGH_ORANGE, type: ui.data_type.WEATHER_HIGH, path: 'temp-high' },
    ]
    columns.forEach((column, index) => {
      const geometry = temp.columns[index]
      textWidget(
        { x: geometry.labelX, y: temp.labelY, w: geometry.w, h: temp.labelH },
        column.label,
        TYPE.tempLabel,
        column.color,
        ui.align.CENTER_H,
        ui.show_level.ONLY_NORMAL,
      )
      temperatureWidget(
        { x: geometry.valueX, y: temp.valueY, w: geometry.w, h: temp.valueH },
        column.type,
        `images/digits/${column.path}`,
        `images/digits/${column.path}/degree.png`,
        ui.show_level.ONLY_NORMAL,
      )
    })
  },

  updateTimeAndDate() {
    const time = this.state.time
    const rawHour = time.getHours()
    const is12Hour = time.getHourFormat() === TIME_HOUR_FORMAT_12
    const displayHour = is12Hour ? time.getFormatHour() : rawHour
    const hourText = String(displayHour)
    const minuteText = String(time.getMinutes()).padStart(2, '0')
    this.state.mainTime.update(hourText, minuteText)
    this.state.aod.time.update(hourText, minuteText)

    const amPm = is12Hour ? (rawHour < 12 ? 'AM' : 'PM') : ''
    this.state.amPm.setProperty(ui.prop.TEXT, amPm)

    const weekday = WEEKDAYS[time.getDay() - 1] || '---'
    const dateText = `${time.getMonth()}/${time.getDate()} ${weekday}`
    this.state.date.setProperty(ui.prop.TEXT, dateText)
    this.state.aod.date.setProperty(ui.prop.TEXT, dateText)
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
        color: index < filled ? COLORS.AOD_TEXT : COLORS.HP_EMPTY,
      })
    })
    const percent = formatBatteryPercent(value)
    this.state.hpPercent.setProperty(ui.prop.TEXT, percent)
    this.state.aod.percent.setProperty(ui.prop.TEXT, percent)
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

  applyMessagePreset(value) {
    const preset = getCopyPreset(value)
    this.state.presetIndex = Number(value) || 0
    hmFS.SysProSetInt('pixel_wayfarer_preset', this.state.presetIndex)
    if (this.state.copyLabel) {
      this.state.copyLabel.setProperty(ui.prop.TEXT, preset.label)
    }
    if (this.state.copyText) {
      this.state.copyText.setProperty(ui.prop.TEXT, preset.text)
    }
  },

  loadMessagePreset() {
    this.request({ method: 'GET_MESSAGE_PRESET' })
      .then(({ presetIndex }) => this.applyMessagePreset(presetIndex))
      .catch(() => {
        logger.log('Using cached message preset')
      })
  },

  onCall(data) {
    if (!data) return
    if (data.type === 'MESSAGE_PRESET_CHANGED') {
      this.applyMessagePreset(data.presetIndex)
    }
    if (data.type === 'DEBUG_THEME_CHANGED') {
      this.applyDebugTheme(data.debugIndex)
    }
  },

  onDestroy() {
    if (this.state.battery && this.state.batteryCallback) {
      this.state.battery.offChange(this.state.batteryCallback)
    }
    this.stopCycleTimer()
    logger.log('watchface destroyed')
  },
  }),
)
