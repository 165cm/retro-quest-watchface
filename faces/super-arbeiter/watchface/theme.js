// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606,
  BLACK: 0x000000,
  CREAM: 0xfff5d6,
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  DIVIDER: 0x6b4a1e, // 区切りの線・暖簾の奥の梁
})

// 絵の線の太さ（曜日の英字は 40×64 の枠に対する太さ。数字は tools/brush-digits.mjs の字形）
export const STROKE = Object.freeze({
  small: 12, // 曜日の英字
  divider: 2, // 区切りの線
})

// 筆の数字の太さ（倍率）と前傾（度）。時刻はいちばん太く、傾きは控えめ
export const DIGIT_STYLE = Object.freeze({
// margin は字形のまわりの余白（字形の枠 100×160 に対する左右の余白）。太いほど大きくして、となりの字とくっつかないようにする
  time: { weight: 1.3, slant: -5, dry: true, margin: 10 },
  small: { weight: 1.2, slant: -6, dry: false, margin: 10 }, // HP・STEPS・日付・BREAK
  aod: { weight: 0.8, slant: -5, dry: false, margin: 6 }, // 画面オフ時は細く、光る所を減らす
})

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
