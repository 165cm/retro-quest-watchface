// 画面の座標・大きさ（Amazfit Bip 6：390×450）。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。四隅に部品を置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
})

export const DIGITS = Object.freeze({
  time: { w: 60, h: 88, colonW: 24, gap: 2 },
  small: { w: 20, h: 30 },
  aod: { w: 48, h: 70, colonW: 20, gap: 2 },
})

export const LAYOUT = Object.freeze({
  // 上の帯：日付と気温
  topPill: { x: 70, y: 24, w: 250, h: 44, radius: 22 },
  date: { x: 86, y: 26, w: 140, h: 40 },
  temp: { x: 226, y: 31, w: 82, h: 30 },
  // 時刻
  time: { y: 78 },
  // ゆげおばけ（どんぶりつき）と吹き出し
  obake: { x: 18, y: 178, w: 160, h: 160 },
  bubble: { x: 168, y: 196, w: 206, h: 86 },
  // 2行の時：小さいラベル＋大きい文字。1行の時：真ん中に1行
  bubbleLabel: { x: 184, y: 203, w: 184, h: 28 },
  bubbleMain: { x: 184, y: 228, w: 184, h: 42 },
  bubbleSingle: { x: 184, y: 210, w: 184, h: 56 },
  // 下の帯：歩数と電池
  bottomPill: { x: 60, y: 352, w: 270, h: 56, radius: 28 },
  stepIcon: { x: 76, y: 365, w: 30, h: 30 },
  steps: { x: 108, y: 365, w: 110, h: 30 },
  batteryIcon: { x: 222, y: 363, w: 38, h: 34 },
  percent: { x: 258, y: 360, w: 64, h: 40 },
  // AOD（画面オフ時）
  aod: {
    timeY: 150,
    date: { x: 70, y: 236, w: 250, h: 36 },
    shift: { x: 70, y: 276, w: 250, h: 36 },
  },
})
