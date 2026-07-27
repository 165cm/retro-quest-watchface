export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  // 端末の縁で見切れないよう、内容は左右24pxを空ける。
  safe: 24,
})

const CONTENT_X = 24
const CONTENT_W = SCREEN.width - CONTENT_X * 2

// 上段（天候アイコン・日付・HP）と下段（気温・歩数）だけに薄い暗幕を敷き、
// 中央は開けて背景を見せる。時刻とコピーがひとかたまりの主役。
export const LAYOUT = Object.freeze({
  background: { x: 12, y: 10, w: 366, h: 430 },

  topBar: { x: 12, y: 12, w: 366, h: 62 },
  weatherIcon: { x: CONTENT_X, y: 20, w: 30, h: 30 },
  date: { x: 60, y: 20, w: 142, h: 30 },
  hp: {
    label: { x: 206, y: 20, w: 28, h: 30 },
    gaugeX: 236,
    gaugeY: 27,
    segmentW: 11,
    segmentH: 16,
    gap: 2,
    percent: { x: 296, y: 48, w: 70, h: 22 },
  },

  // 時刻は覆いなしで背景に直接。AM/PM込みで中央寄せするため、
  // 12時間表示のときだけ右側に幅を予約する。
  time: { y: 150, digitW: 52, digitH: 72, colonW: 18, gap: 6 },
  amPm: { w: 46, h: 28, gap: 8, offsetY: 40 },

  // コピーは時刻のサブタイトル。枠は持たせず、薄い暗幕だけ敷く。
  copyScrim: { x: 12, y: 228, w: 366, h: 40 },
  copyText: { x: CONTENT_X, y: 230, w: CONTENT_W, h: 36 },

  bottomBar: { x: 12, y: 366, w: 366, h: 62 },
  temperature: {
    labelY: 372,
    labelH: 22,
    valueY: 396,
    valueH: 26,
    columns: [
      { x: CONTENT_X, w: 72 },
      { x: CONTENT_X + 72, w: 72 },
      { x: CONTENT_X + 144, w: 72 },
    ],
  },
  steps: {
    icon: { x: 252, y: 399, w: 22, h: 22 },
    text: { x: 280, y: 396, w: 86, h: 26 },
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
