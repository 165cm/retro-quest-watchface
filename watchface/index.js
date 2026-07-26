import ui from '@zos/ui'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import { log } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { LAYOUT, SCREEN } from './layout.js'
import { COLORS, TYPE } from './theme.js'
import { getCopyPreset } from './copy.js'
import {
  formatBatteryPercent,
  getBatteryColorKey,
  getFilledSegments,
  normalizeBattery,
} from './battery.js'
import { getTodayWeather, isNightAt, resolveWeatherTheme } from './weather.js'
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

function questWindowFrame(rect, { inset = false } = {}) {
  ui.createWidget(ui.widget.STROKE_RECT, {
    ...rect,
    color: COLORS.PANEL_EDGE,
    line_width: 2,
    radius: 0,
    show_level: ui.show_level.ONLY_NORMAL,
  })
  if (inset) {
    ui.createWidget(ui.widget.STROKE_RECT, {
      x: rect.x + 4,
      y: rect.y + 4,
      w: rect.w - 8,
      h: rect.h - 8,
      color: COLORS.PANEL_ACCENT_GOLD,
      line_width: 1,
      radius: 0,
      show_level: ui.show_level.ONLY_NORMAL,
    })
  }
  const gem = inset ? 4 : 3
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
    mainTime: null,
    amPm: null,
    date: null,
    hpSegments: [],
    hpPercent: null,
    aod: null,
    copyLabel: null,
    copyText: null,
    presetIndex: 0,
    batteryCallback: null,
    minuteCallback: null,
  },

  onInit() {
    this.state.time = new Time()
    this.state.battery = new Battery()
    this.state.weather = hmSensor.createSensor(hmSensor.id.WEATHER)
    this.state.presetIndex = hmFS.SysProGetInt('pixel_wayfarer_preset') || 0
  },

  build() {
    this.drawNormalView()
    this.state.aod = createAodView()
    this.updateTimeAndDate()
    this.updateBattery()
    this.updateWeather()
    this.loadMessagePreset()

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
      },
      pause_call: () => {},
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

    ui.createWidget(ui.widget.FILL_RECT, {
      x: 18,
      y: 76,
      w: 354,
      h: 54,
      color: COLORS.BACKGROUND_NAVY,
      alpha: 150,
      radius: 2,
      show_level: ui.show_level.ONLY_NORMAL,
    })

    textWidget(
      LAYOUT.temperature.low,
      'L --°',
      22,
      COLORS.LOW_BLUE,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )
    textWidget(
      LAYOUT.temperature.current,
      '--°',
      30,
      COLORS.TEXT_PRIMARY,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )
    textWidget(
      LAYOUT.temperature.high,
      'H --°',
      22,
      COLORS.HIGH_ORANGE,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )

    textWidget(
      { x: 24, y: 91, w: 22, h: 35 },
      'L',
      22,
      COLORS.LOW_BLUE,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    temperatureWidget(
      { x: 43, y: 94, w: 78, h: 30 },
      ui.data_type.WEATHER_LOW,
      'images/digits/temp-low',
      'images/digits/temp-low/degree.png',
      ui.show_level.ONLY_NORMAL,
    )
    temperatureWidget(
      LAYOUT.temperature.current,
      ui.data_type.WEATHER_CURRENT,
      'images/digits/temp-now',
      'images/digits/temp-now/degree.png',
      ui.show_level.ONLY_NORMAL,
    )
    textWidget(
      { x: 270, y: 91, w: 22, h: 35 },
      'H',
      22,
      COLORS.HIGH_ORANGE,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    temperatureWidget(
      { x: 289, y: 94, w: 77, h: 30 },
      ui.data_type.WEATHER_HIGH,
      'images/digits/temp-high',
      'images/digits/temp-high/degree.png',
      ui.show_level.ONLY_NORMAL,
    )

    ui.createWidget(ui.widget.FILL_RECT, {
      ...LAYOUT.copyPanel,
      color: COLORS.PANEL_NAVY,
      show_level: ui.show_level.ONLY_NORMAL,
    })
    questWindowFrame(LAYOUT.copyPanel, { inset: true })
    const preset = getCopyPreset(this.state.presetIndex)
    this.state.copyLabel = textWidget(
      LAYOUT.copyLabel,
      preset.label,
      TYPE.copyLabel,
      COLORS.TEXT_MUTED,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    this.state.copyText = textWidget(
      LAYOUT.copyText,
      preset.text,
      TYPE.copyText,
      COLORS.TEXT_PRIMARY,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )

    this.state.mainTime = createTimeSprites({
      y: LAYOUT.time.y,
      digitPath: 'images/digits/time',
      digitW: 44,
      digitH: 65,
      colonW: 16,
      gap: 6,
      showLevel: ui.show_level.ONLY_NORMAL,
    })
    this.state.amPm = textWidget(
      LAYOUT.amPm,
      '',
      TYPE.amPm,
      COLORS.TEXT_MUTED,
      ui.align.RIGHT,
      ui.show_level.ONLY_NORMAL,
    )
    ui.createWidget(ui.widget.FILL_RECT, {
      x: 18,
      y: 299,
      w: 354,
      h: 42,
      color: COLORS.BACKGROUND_NAVY,
      alpha: 145,
      radius: 2,
      show_level: ui.show_level.ONLY_NORMAL,
    })
    this.state.date = textWidget(
      LAYOUT.date,
      '7/24 FRI',
      TYPE.date,
      COLORS.TEXT_PRIMARY,
      ui.align.CENTER_H,
      ui.show_level.ONLY_NORMAL,
    )

    ui.createWidget(ui.widget.FILL_RECT, {
      x: 18,
      y: 353,
      w: 354,
      h: 42,
      color: COLORS.BACKGROUND_NAVY,
      alpha: 165,
      radius: 2,
      show_level: ui.show_level.ONLY_NORMAL,
    })
    questWindowFrame({ x: 18, y: 353, w: 354, h: 42 })
    textWidget(
      LAYOUT.hp.label,
      'HP',
      TYPE.hp,
      COLORS.TEXT_PRIMARY,
      ui.align.LEFT,
      ui.show_level.ONLY_NORMAL,
    )
    for (let i = 0; i < 10; i += 1) {
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
      TYPE.hp,
      COLORS.TEXT_PRIMARY,
      ui.align.RIGHT,
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
    const theme = resolveWeatherTheme(weather.code, night)
    this.state.background.setProperty(
      ui.prop.SRC,
      `images/backgrounds/${theme}.png`,
    )
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
    if (data && data.type === 'MESSAGE_PRESET_CHANGED') {
      this.applyMessagePreset(data.presetIndex)
    }
  },

  onDestroy() {
    if (this.state.battery && this.state.batteryCallback) {
      this.state.battery.offChange(this.state.batteryCallback)
    }
    logger.log('watchface destroyed')
  },
  }),
)
