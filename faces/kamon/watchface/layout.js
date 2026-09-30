// 画面の座標・大きさ（Amazfit Bip 6：390×450）。
// 元のデザイン（ユーザーのドラマ風の時計のプレビュー）の位置・大きさを画素から測り、そのまま使っている。
// 変えたのは、元のデザインで問題があった所だけ（名前・マーク・天気のアイコン・電池の塗り）。
//
// 上から：タイトル（紋ごとの英単語）と左右の赤い線 → 墨色の紋（太い輪と、その中の紋）→ 大きな赤い時刻
// → 日付（WED 30 SEP）→ 下の段（気温｜歩数｜心拍｜電池）。
// 太い輪・線・アイコン・区切りは固定背景（images/background.png）。輪の中の紋とタイトルは、画面が点くたびに差し替える画像。
export const SCREEN = Object.freeze({ width: 390, height: 450 })

// 画面の四隅の丸み：上（または下）の端から y 行目で、左右それぞれ何 px が画面の外か。
// 元のデザインのプレビューの画面の形から測った（左右・上下で同じ）。ここに載っていない行は 0
export const CORNER_INSET = Object.freeze([
  76, 70, 65, 62, 58, 56, 53, 51, 49, 47, 45, 43, 41, 40, 38, 37, 35, 34, 33, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20,
  19, 19, 18, 17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 5, 5, 4, 4, 4, 4, 3, 3, 3, 2, 2,
  2, 2, 2, 1, 1, 1, 1, 1, 1,
])
// 数字・アイコンは、画面の端からさらにこれだけ内側に置く
export const EDGE_MARGIN = 4

// 上の真ん中は、時計本体が通知のマークを出す所。文字を置かない（実機で測ったマークは x=178〜212、y=10〜44）
export const NOTIFICATION = Object.freeze({ x: 170, y: 0, w: 50, h: 48 })

// 紋。太い輪（背景）の外側の半径と太さは元のデザインと同じ。輪の中の紋は image の枠（下地は透明）に描く
export const CREST = Object.freeze({
  cx: 195,
  cy: 208,
  r: 152,
  ring: 28,
  motif: 112, // 輪の中の紋の半径（輪の内側 124 より小さく）
  image: { x: 79, y: 92, w: 232, h: 232 },
})

// タイトルと左右の線（元のデザインと同じ高さ）。タイトルは紋ごとの画像（images/titles/）
export const TITLE = Object.freeze({
  maxLength: 8,
  image: { x: 122, y: 48, w: 146, h: 18 }, // 左右の線（x 65〜120・273〜328）の間
  x: 195,
  y: 52,
  h: 11, // 大文字の高さ
  pitch: 18, // 1文字ずつの間隔
  rules: [
    { x: 65, y: 57, w: 55, h: 2 },
    { x: 273, y: 57, w: 55, h: 2 },
  ],
})

// 数字の画像の大きさ（w×h）。size はフォントの大きさ（px）。colonW は「:」の枠の幅
export const DIGITS = Object.freeze({
  // 元のデザイン：数字は 52×76、70px おき。「:」は 5px 幅の縦長の四角が2つ
  time: { w: 70, h: 84, colonW: 25, gap: 0, size: 106, colonBar: { w: 5, h: 17, top: 19, bottom: 50 } },
  aod: { w: 48, h: 60, colonW: 18, gap: 0, size: 74, colonBar: { w: 4, h: 12, top: 14, bottom: 36 } },
  // 下の段の数字。unitW は「-」と「°」の幅
  small: { w: 12, h: 20, gap: 0, size: 19, unitW: 8 },
})

export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  return (hourDigits + 2) * spec.w + spec.colonW + spec.gap * (hourDigits + 2)
}

export function smallWidth(chars) {
  const s = DIGITS.small
  const widths = chars.split('').map((ch) => (ch === '-' || ch === '°' ? s.unitW : s.w))
  return widths.reduce((sum, w) => sum + w, 0) + s.gap * Math.max(0, widths.length - 1)
}

const ROW_Y = 395
const ROW_H = DIGITS.small.h

export const LAYOUT = Object.freeze({
  timeY: 181, // 元のデザインで数字は y=185〜261
  date: { x: 70, y: 317, w: 250, h: 28, size: 22 }, // 元のデザインで y=324〜339
  // 下の段（元のデザインの並び）。区切りの線は x=99・216・294
  tempIcon: { x: 23, y: ROW_Y, w: 14, h: ROW_H },
  temp: { x: 54, y: ROW_Y, w: 40, h: ROW_H }, // 「-12°」まで
  stepsIcon: { x: 110, y: ROW_Y, w: 20, h: ROW_H },
  steps: { x: 142, y: ROW_Y, w: 60, h: ROW_H }, // 5桁（99999）まで
  heartIcon: { x: 230, y: ROW_Y + 2, w: 20, h: 17 },
  heart: { x: 256, y: ROW_Y, w: 36, h: ROW_H }, // 3桁まで
  batteryIcon: { x: 304, y: ROW_Y + 3, w: 26, h: 14 },
  batteryFill: { x: 307, y: ROW_Y + 6, w: 18, h: 8 }, // 枠の内側。残りに合わせて左から塗る
  battery: { x: 333, y: ROW_Y, w: 36, h: ROW_H }, // 「100」まで
  dividers: [99, 216, 294].map((x) => ({ x, y: ROW_Y - 2, w: 1, h: ROW_H + 4 })),
  aod: { timeY: 180, date: { x: 70, y: 256, w: 250, h: 28, size: 22 } },
})

// 数字が入る所と、いちばん幅を取る値（テストで、はみ出し・重なりを確かめる）
export const DATA_FIELDS = Object.freeze({
  temp: '-12°',
  steps: '99999',
  heart: '199',
  battery: '100',
})
