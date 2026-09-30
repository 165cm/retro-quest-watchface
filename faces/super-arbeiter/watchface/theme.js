// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606,
  BLACK: 0x000000,
  CREAM: 0xfff5d6,
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  DIVIDER: 0x6b4a1e, // 区切りの線・暖簾の奥の梁
})

// 絵の線の太さ（数字の枠 40×64 に対する太さ）
export const STROKE = Object.freeze({
  small: 12, // HP・STEPS・日付・BREAK・曜日
  aod: 6, // 画面オフ時の時刻（細くして光る所を減らす）
  divider: 2,
})

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
