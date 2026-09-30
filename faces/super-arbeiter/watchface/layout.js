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
  hp: { w: 24, h: 34, gap: 1 },
  steps: { w: 20, h: 26, gap: 1 },
  date: { w: 18, h: 26, slashW: 10, gap: 1 },
  break: { w: 20, h: 30, colonW: 8, gap: 1 },
  aod: { w: 48, h: 76, colonW: 16, gap: 3 },
})

export const WEEKDAY = Object.freeze({ w: 45, h: 20 })

// 時刻の数字列の幅（2桁の時：4桁＋「:」）
export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  const items = hourDigits + 3
  return (hourDigits + 2) * spec.w + spec.colonW + (items - 1) * spec.gap
}

export const LAYOUT = Object.freeze({
  // 上：暖簾と提灯（背景の絵）
  noren: { x: 80, y: 0, w: 230, h: 77 },
  lanternLeft: { x: 22, y: 22, w: 48, h: 96 },
  lanternRight: { x: 320, y: 22, w: 48, h: 96 },
  // 真ん中：時刻・赤い筆の線・STATUS
  time: { y: 110 },
  underline: { x: 62, y: 201, w: 266, h: 24 },
  status: { x: 110, y: 225, w: 171, h: 24 },
  // 左下：HP と STEPS
  batteryIcon: { x: 16, y: 256, w: 34, h: 19 },
  hpLabel: { x: 54, y: 259, w: 24, h: 13 },
  hp: { x: 16, y: 275, w: 120, h: 34 },
  shoeIcon: { x: 14, y: 309, w: 38, h: 20 },
  stepsLabel: { x: 58, y: 312, w: 50, h: 15 },
  steps: { x: 16, y: 329, w: 120, h: 26 },
  // 中央下：丼（背景の絵）と区切りの線
  bowl: { x: 145, y: 262, w: 100, h: 81 },
  dividerLeft: { x: 141, y: 262, h: 84 },
  dividerRight: { x: 249, y: 262, h: 84 },
  // 右下：日付と BREAK
  calendarIcon: { x: 255, y: 257, w: 20, h: 20 },
  date: { x: 279, y: 254, w: 95, h: 26 },
  weekday: { x: 279, y: 282, w: 45, h: 20 },
  clockIcon: { x: 255, y: 304, w: 20, h: 17 },
  breakLabel: { x: 279, y: 305, w: 48, h: 15 },
  breakBox: { x: 255, y: 322, w: 116, h: 34, radius: 5 },
  breakTime: { x: 255, y: 324, w: 116, h: 30 },
  // 下：カウンターの飾りと FINAL（背景の絵）
  counter: { x: 12, y: 358, w: 365, h: 38 },
  footer: { x: 50, y: 393, w: 290, h: 55 },
  // 勢いの飾り（背景の絵。受け取った飾りの素材）。flip は左右反転
  decor: [
    { name: 'steam-a', x: 74, y: 80, w: 46, h: 30 },
    { name: 'steam-b', x: 272, y: 80, w: 44, h: 30, flip: true },
    { name: 'burst-3', x: 12, y: 142, w: 40, h: 37 },
    { name: 'burst-2', x: 344, y: 160, w: 30, h: 28, flip: true },
    { name: 'burst-2', x: 104, y: 280, w: 26, h: 24 },
    { name: 'brush-short', x: 14, y: 353, w: 108, h: 10 },
  ],
  // AOD（画面オフ時）：時刻・日付・HP だけ
  aod: {
    timeY: 150,
    date: { x: 70, y: 240, w: 250, h: 34 },
    hp: { x: 70, y: 280, w: 250, h: 34 },
  },
})

// 飾りの絵の中で、文字が入っている範囲（絵の枠に対する割合）。四隅に欠けないかのテストで使う
export const TEXT_IN_ART = Object.freeze({
  noren: { x: 0.1, y: 0.3, w: 0.8, h: 0.45 },
  lanternLeft: { x: 0.2, y: 0.3, w: 0.6, h: 0.5 },
  lanternRight: { x: 0.2, y: 0.3, w: 0.6, h: 0.5 },
  footer: { x: 0.2, y: 0.3, w: 0.6, h: 0.45 },
})
