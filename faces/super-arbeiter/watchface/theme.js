// 色と文字の大きさ。絵の色（tools/generate-assets.mjs の C）とそろえる。
export const COLORS = Object.freeze({
  YELLOW: 0xffe033, // 地
  RED: 0xe10606,
  BLACK: 0x000000,
  CREAM: 0xfff5d6,
  AOD_TEXT: 0x8c8676, // 画面オフ時の文字（暗いクリーム）
  DIVIDER: 0x6b4a1e, // 区切りの線
  NOREN: 0xc60606, // 暖簾の布（描き足す左右の布。暖簾の絵の赤に合わせる）
  NOREN_EDGE: 0x140000, // 暖簾の布のふち
  ROD: 0x9a5a1e, // 暖簾の竿
  ROD_LIGHT: 0xe0a143, // 竿のつや
})

// 絵の線の太さ（曜日の英字は 40×64 の枠に対する太さ。数字は tools/brush-digits.mjs の字形）
export const STROKE = Object.freeze({
  small: 12, // 曜日の英字
  divider: 2, // 区切りの線
})

// 筆の数字の太さ（倍率）・前傾（度）・横の細さ（squeeze）。時刻はいちばん太く、傾きは控えめ
export const DIGIT_STYLE = Object.freeze({
  time: { weight: 1.38, slant: -5, dry: true, squeeze: 0.86 },
  small: { weight: 1.35, slant: -6, dry: false, squeeze: 0.84 }, // HP・STEPS・日付・BREAK（横を少し細くして縦に大きく）
  aod: { weight: 0.8, slant: -5, dry: false, squeeze: 1 }, // 画面オフ時は細く、光る所を減らす
})

// 紙と筆の質感（弱く、固定の模様）。数字の後ろは平らなまま、外周と BREAK の箱の縁だけに入れる
export const TEXTURE = Object.freeze({
  paperOpacity: 0.07, // 黄色い地の外周のまだら
  paperInset: 70, // 外周から何px までにまだらを入れるか（内側は平ら）
  boxEdgeOpacity: 0.28, // BREAK の箱の縁の筆の荒れ
})

export const TYPE = Object.freeze({
  aodDate: 26,
  aodHp: 26,
})
