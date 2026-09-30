// 画面の座標・大きさ（Amazfit Bip 6：390×450）。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 数字の画像の大きさ（w×h）。colonW は「:」、slashW は「/」の幅
export const DIGITS = Object.freeze({
  time: { w: 64, h: 94, colonW: 22, gap: 3 },
  hp: { w: 20, h: 28, gap: 1 },
  steps: { w: 16, h: 22, gap: 1 },
  date: { w: 15, h: 22, slashW: 10, gap: 1 },
  break: { w: 14, h: 20, colonW: 7, gap: 1 },
  aod: { w: 48, h: 76, colonW: 16, gap: 3 },
})

export const WEEKDAY = Object.freeze({ w: 45, h: 20 })

export const LAYOUT = Object.freeze({
  // 上：暖簾と提灯（背景の絵）
  noren: { x: 80, y: 0, w: 230, h: 77 },
  lanternLeft: { x: 22, y: 22, w: 48, h: 96 },
  lanternRight: { x: 320, y: 22, w: 48, h: 96 },
  // 真ん中：時刻・赤い筆の線・STATUS
  time: { y: 112 },
  underline: { x: 77, y: 200, w: 236, h: 22 },
  status: { x: 110, y: 224, w: 171, h: 24 },
  // 左下：HP と STEPS
  batteryIcon: { x: 16, y: 257, w: 34, h: 19 },
  hpLabel: { x: 54, y: 260, w: 24, h: 13 },
  hp: { x: 16, y: 279, w: 120, h: 28 },
  shoeIcon: { x: 14, y: 309, w: 40, h: 18 },
  stepsLabel: { x: 58, y: 311, w: 50, h: 15 },
  steps: { x: 16, y: 328, w: 120, h: 22 },
  // 中央下：丼（背景の絵）と区切りの線
  bowl: { x: 145, y: 262, w: 100, h: 81 },
  dividerLeft: { x: 141, y: 262, h: 80 },
  dividerRight: { x: 249, y: 262, h: 80 },
  // 右下：日付と BREAK
  calendarIcon: { x: 255, y: 256, w: 20, h: 20 },
  date: { x: 279, y: 255, w: 95, h: 22 },
  weekday: { x: 279, y: 280, w: 45, h: 20 },
  clockIcon: { x: 255, y: 304, w: 20, h: 17 },
  breakLabel: { x: 279, y: 305, w: 48, h: 15 },
  breakBox: { x: 255, y: 323, w: 116, h: 28 },
  breakTime: { x: 255, y: 327, w: 116, h: 20 },
  // 下：カウンターの飾りと FINAL（背景の絵）
  counter: { x: 12, y: 351, w: 365, h: 45 },
  footer: { x: 50, y: 393, w: 290, h: 55 },
  // AOD（画面オフ時）：時刻・日付・HP だけ
  aod: {
    timeY: 150,
    date: { x: 70, y: 240, w: 250, h: 34 },
    hp: { x: 70, y: 280, w: 250, h: 34 },
  },
})
