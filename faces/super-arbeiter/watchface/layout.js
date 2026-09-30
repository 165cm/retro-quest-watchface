// 画面の座標・大きさ（Amazfit Bip 6：390×450）。完成見本（docs/preview-390x450.png）の配置。
// 参考画像の構図に合わせ、時刻の左に HP、右に日付、下の段に STEPS・丼・BREAK を置く。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 数字の画像の大きさ（w×h）。colonW は「:」、slashW は「/」の幅。
// 筆の数字の画像は、太さ・傾きを入れた輪郭がちょうど収まる大きさで書き出す（tools/brush-digits.mjs の exportViews）。\n// 画像のふちに少し余白があるので、gap は 0 で字どうしがくっつかない
export const DIGITS = Object.freeze({
  time: { w: 54, h: 96, colonW: 22, gap: 0 },
  hp: { w: 21, h: 38, gap: 0 },
  steps: { w: 23, h: 36, gap: 0 },
  date: { w: 16, h: 26, slashW: 9, gap: -2 },
  break: { w: 24, h: 34, colonW: 10, gap: -2 },
  aod: { w: 48, h: 76, colonW: 17, gap: 0 },
})

export const WEEKDAY = Object.freeze({ w: 48, h: 22 })

// 時刻の数字列の幅（2桁の時：4桁＋「:」）
export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  const items = hourDigits + 3
  return (hourDigits + 2) * spec.w + spec.colonW + (items - 1) * spec.gap
}

export const LAYOUT = Object.freeze({
  // 上：暖簾と提灯（背景の絵）。暖簾の絵は縦横比を保って大きく置き、
  // 足りない左右は同じ赤の布と竿を描き足して横幅いっぱいにする。提灯は暖簾の手前に重ねる
  noren: { x: 45, y: -2, w: 300, h: 100 },
  norenRod: { y: 1, h: 8 }, // 横幅いっぱいの竿
  norenSides: { y: 6, h: 84, inner: 60 }, // 左右に描き足す布（端から inner px まで。暖簾の絵の下に入る）
  lanternLeft: { x: 24, y: 24, w: 44, h: 88 },
  lanternRight: { x: 322, y: 24, w: 44, h: 88 },
  // 真ん中の段：左に HP、真ん中に時刻、右に日付
  time: { y: 108 },
  batteryIcon: { x: 16, y: 124, w: 34, h: 19 },
  hpLabel: { x: 54, y: 127, w: 24, h: 13 },
  hp: { x: 12, y: 146, w: 64, h: 38 },
  dateIcon: { x: 334, y: 124, w: 20, h: 20 },
  date: { x: 308, y: 146, w: 68, h: 26 }, // 右寄せ（時刻に近づけない）
  weekday: { x: 318, y: 175, w: 48, h: 22 },
  columnLines: [
    { x1: 18, x2: 74, y: 192 },
    { x1: 316, x2: 372, y: 200 },
  ],
  // 時刻の下：赤い筆の線と STATUS
  underline: { x: 62, y: 203, w: 266, h: 24 },
  status: { x: 110, y: 228, w: 171, h: 24 },
  // 下の段：左に STEPS、真ん中に丼、右に BREAK
  shoeIcon: { x: 18, y: 256, w: 50, h: 26 },
  stepsLabel: { x: 20, y: 284, w: 62, h: 19 },
  steps: { x: 14, y: 303, w: 118, h: 36 },
  bowl: { x: 142, y: 262, w: 106, h: 86 },
  dividerLeft: { x: 137, y: 262, h: 86 },
  dividerRight: { x: 253, y: 262, h: 86 },
  clockIcon: { x: 305, y: 256, w: 24, h: 20 },
  breakLabel: { x: 285, y: 279, w: 64, h: 20 },
  breakBox: { x: 260, y: 302, w: 114, h: 44, radius: 6 },
  breakTime: { x: 260, y: 307, w: 114, h: 34 },
  // 下：カウンターの飾りと FINAL（背景の絵）
  counter: { x: 12, y: 356, w: 365, h: 38 },
  footer: { x: 50, y: 390, w: 290, h: 55 },
  // 勢いの飾り（背景の絵。受け取った飾りの素材）。flip は左右反転
  decor: [
    { name: 'burst-2', x: 98, y: 257, w: 26, h: 22 },
    { name: 'burst-2', x: 338, y: 255, w: 24, h: 21, flip: true },
    { name: 'burst-3', x: 106, y: 279, w: 24, h: 21 },
    { name: 'brush-short', x: 14, y: 340, w: 112, h: 10 },
    { name: 'brush-short', x: 124, y: 249, w: 150, h: 7 },
    { name: 'burst-2', x: 144, y: 263, w: 16, h: 14, flip: true },
    { name: 'burst-2', x: 230, y: 263, w: 16, h: 14 },
  ],
  // AOD（画面オフ時）：時刻・日付・HP だけ
  aod: {
    timeY: 150,
    date: { x: 70, y: 240, w: 250, h: 34 },
    hp: { x: 70, y: 280, w: 250, h: 34 },
  },
})

// 飾りの絵の中で、文字が入っている範囲（絵の枠に対する割合）。四隅に欠けないかのテストで使う。
// FINAL の文字の範囲は、テストで素材の画素から測って確かめる
export const TEXT_IN_ART = Object.freeze({
  noren: { x: 0.089, y: 0.227, w: 0.833, h: 0.676 }, // 素材の画素から測った、文字と丼の印の範囲
  lanternLeft: { x: 0.2, y: 0.3, w: 0.6, h: 0.5 },
  lanternRight: { x: 0.2, y: 0.3, w: 0.6, h: 0.5 },
})
