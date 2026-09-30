// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606, // HP の数字・BREAK の箱
  BLACK: 0x000000,
  CREAM: 0xfff5d6, // BREAK の数字・セリフの札と吹き出しの内側
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  BOX_EDGE: 0x7a0000, // BREAK の箱の縁
  NOTIFICATION_CHECK: 0x22cc88, // 確認図だけに重ねる、通知のマークの目印（製品の背景には入れない）
})

// 絵の線の太さ（曜日の英字は 40×64 の枠に対する太さ。数字は tools/brush-digits.mjs の字形）
export const STROKE = Object.freeze({
  small: 12, // 曜日の英字
})

// 筆の数字の太さ（倍率）・前傾（度）・横の細さ（squeeze）。時刻はいちばん太く、傾きは控えめ
export const DIGIT_STYLE = Object.freeze({
  time: { weight: 1.38, slant: -5, dry: true, squeeze: 0.86 },
  small: { weight: 1.35, slant: -6, dry: false, squeeze: 0.84 }, // HP・STEPS・日付・BREAK（横を少し細くして縦に大きく）
  aod: { weight: 0.8, slant: -5, dry: false, squeeze: 1 }, // 画面オフ時は細く、光る所を減らす
})

// BREAK の箱の縁の筆の荒れ（弱く、固定の模様。中は平らな赤で、数字が読みやすいまま）
export const TEXTURE = Object.freeze({
  boxEdgeOpacity: 0.28,
})

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
