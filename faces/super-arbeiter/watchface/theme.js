// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606, // 電池の残りの数字と、電池の枠の中の塗り
  BLACK: 0x000000, // 時刻・日付・曜日・歩数
  CREAM: 0xfff5d6, // セリフの札と吹き出しの内側
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  NOTIFICATION_CHECK: 0x22cc88, // 確認図だけに重ねる、通知のマークの目印（製品の背景には入れない）
})

// フォントの数字を画像に置く時の、上下左右の余白（px）
export const GLYPH_PAD = 1

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
