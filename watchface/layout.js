export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  safe: 12,
})

// 上から順に: 天候アイコン＋日付＋HP / 時刻 / TACTICウィンドウ / 気温3分割ボックス。
export const LAYOUT = Object.freeze({
  background: { x: 12, y: 10, w: 366, h: 430 },

  // 最上段。背景の明るさに影響されないよう薄い暗幕を敷く。
  topBar: { x: 12, y: 12, w: 366, h: 66 },
  weatherIcon: { x: 20, y: 22, w: 34, h: 34 },
  date: { x: 62, y: 22, w: 140, h: 34 },
  hp: {
    label: { x: 208, y: 22, w: 32, h: 34 },
    gaugeX: 242,
    gaugeY: 30,
    segmentW: 11,
    segmentH: 16,
    gap: 2,
    percent: { x: 300, y: 52, w: 70, h: 24 },
  },

  // 時刻は覆いなしで背景に直接乗る。数字側の縁取りと影で視認性を確保する。
  time: { y: 96, digitW: 52, digitH: 72, colonW: 18, gap: 6 },
  amPm: { x: 324, y: 140, w: 50, h: 28 },

  // ラベルはタブとして本文ボックスの上に載せる。両者は隣接させ、
  // 枠線を辺ごとに描いて境目を開けることで1枚のウィンドウに見せる。
  copyTab: { x: 20, y: 192, w: 124, h: 32 },
  copyPanel: { x: 20, y: 224, w: 350, h: 64 },
  copyText: { x: 30, y: 226, w: 330, h: 60 },

  // 気温は L / NOW / H の3列。列幅は等分で、区切り線で仕切る。
  temperature: {
    box: { x: 20, y: 314, w: 350, h: 96 },
    dividerY: 316,
    dividerH: 92,
    dividerXs: [136, 252],
    columns: [
      { labelX: 22, valueX: 22, w: 114 },
      { labelX: 138, valueX: 138, w: 114 },
      { labelX: 254, valueX: 254, w: 114 },
    ],
    labelY: 324,
    labelH: 24,
    valueY: 354,
    valueH: 35,
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
