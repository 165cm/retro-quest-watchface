// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606, // 電池の残りの数字と、電池の枠の中の塗り
  BLACK: 0x000000, // 時刻・日付・曜日・歩数
  CREAM: 0xfff5d6, // セリフの札と吹き出しの内側
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  NOTIFICATION_CHECK: 0x22cc88, // 確認図だけに重ねる、通知のマークの目印（製品の背景には入れない）
})

// 筆の数字の太さ（倍率）・前傾（度）・横の細さ（squeeze）。時刻はいちばん太く、傾きは控えめ
export const DIGIT_STYLE = Object.freeze({
  time: { weight: 1.5, slant: -5, dry: true, squeeze: 0.97 },
  aod: { weight: 0.8, slant: -5, dry: false, squeeze: 1 }, // 画面オフ時は細く、光る所を減らす
})

// フォントの数字（日付・歩数・電池）を画像の枠に置く時の、上下左右の余白（px）
export const GLYPH_PAD = 1
// フォントの数字の横幅の倍率（少し細くして、狭い枠でも縦を大きく出す）
export const GLYPH_SQUEEZE = 0.85

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
