export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  safe: 12,
})

export const LAYOUT = Object.freeze({
  background: { x: 12, y: 10, w: 366, h: 430 },
  temperature: {
    low: { x: 24, y: 91, w: 96, h: 35 },
    current: { x: 142, y: 80, w: 106, h: 46 },
    high: { x: 270, y: 91, w: 96, h: 35 },
  },
  copyPanel: { x: 12, y: 146, w: 366, h: 68 },
  copyLabel: { x: 26, y: 151, w: 130, h: 25 },
  copyText: { x: 26, y: 174, w: 338, h: 32 },
  time: { y: 224, h: 70 },
  amPm: { x: 310, y: 249, w: 54, h: 30 },
  date: { x: 12, y: 301, w: 366, h: 38 },
  hp: {
    y: 365,
    label: { x: 22, y: 358, w: 48, h: 32 },
    gaugeX: 68,
    gaugeY: 367,
    segmentW: 20,
    segmentH: 15,
    gap: 4,
    percent: { x: 310, y: 358, w: 62, h: 32 },
  },
  aod: {
    timeY: 154,
    date: { x: 12, y: 232, w: 366, h: 34 },
    hpLabel: { x: 70, y: 293, w: 44, h: 28 },
    hpGaugeX: 114,
    hpGaugeY: 301,
    percent: { x: 278, y: 293, w: 58, h: 28 },
    segmentW: 12,
    segmentH: 11,
    gap: 3,
  },
})
