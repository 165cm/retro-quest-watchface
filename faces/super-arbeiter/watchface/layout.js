// 画面の座標・大きさ（Amazfit Bip 6：390×450）。
// 上から：赤い通知の余白と暖簾「スーパー／アルバイター」→ 時刻（左右のまん中）→ 左に丼・右にセリフの吹き出し
// → 下の段に「カレンダー 日付｜くつ 歩数｜電池 残り」。
// 暖簾・提灯・丼・吹き出し・雷紋は固定背景（source/background.png）に入っている。
// 下の段のアイコン（カレンダー・くつ・電池の枠）と区切りの線は、tools/generate-assets.mjs が背景に描き込む。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
import { GLYPH_WIDTHS } from './glyph-widths.js'

export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 上の真ん中は、時計本体が通知のマーク（タイマーなど）を出す所。文字を置かない。
// 実機の画面写真で測ったマークは x=178〜212、y=10〜44。暖簾の文字は y=47 から
export const NOTIFICATION = Object.freeze({ x: 170, y: 0, w: 50, h: 46 })

// 数字の画像。どれもフォントの字形（source/glyphs/）で、字は画像の中央に、左右に GLYPH_PAD の余白を残して置く。
// - 時刻・AOD・日付は字ごとの幅（GLYPH_WIDTHS。tools/generate-assets.mjs が書き出す）。並びの中央＝字の中央になる
// - 歩数・電池は時計のデータを直接出す（TEXT_IMG）ので、全部同じ幅 w
// maxInk：字の幅の上限（それより広い字は横だけ細くする。slashInk は「/」の上限）。gap：字と字の間
export const DIGITS = Object.freeze({
  time: { name: 'time', h: 94, gap: 3 },
  aod: { name: 'aod', h: 72, gap: 2 },
  date: { name: 'date', h: 22, gap: -1, maxInk: 11, slashInk: 7 },
  steps: { name: 'steps', w: 13, h: 24, gap: 0 },
  battery: { name: 'battery', w: 15, h: 24, gap: 0 },
})

// 1文字の画像の幅
export function charWidth(spec, ch) {
  const table = GLYPH_WIDTHS[spec.name]
  return table ? table[ch] : spec.w
}

// 文字列の画像を並べた幅（shared/image-text.js と同じ）
export function textWidth(spec, text) {
  const chars = String(text).split('')
  return chars.reduce((sum, ch) => sum + charWidth(spec, ch), 0) + spec.gap * Math.max(0, chars.length - 1)
}

// 下の段：左から「カレンダー 日付｜くつ 歩数｜電池 残り」。高さのまん中は y=404
const ROW_Y = 404
const row = (x, w, h) => Object.freeze({ x, y: ROW_Y - h / 2, w, h })

export const LAYOUT = Object.freeze({
  // 時刻：画面の左右のまん中にそろえる
  time: { x: 0, y: 116, w: 390, h: DIGITS.time.h },
  // セリフの札（174×116、下地は透明）。吹き出しの内側（測った値 x=183〜377、y=244〜356）
  quote: { x: 195, y: 241, w: 174, h: 116 },
  // 下の段（アイコンと線は背景、数字は時計で重ねる）。数字はアイコンのすぐ右に左ぞろえ。
  // 並び全体（x=47〜343）は画面の左右のまん中で、いちばん長い値（10/30・999999・100）でも区切りに当たらない
  calendarIcon: row(47, 22, 20),
  date: row(73, 55, DIGITS.date.h),
  divider1: row(134, 2, 20),
  shoeIcon: row(142, 32, 21),
  steps: row(177, 78, DIGITS.steps.h),
  divider2: row(261, 2, 20),
  batteryIcon: row(269, 26, 15),
  battery: row(298, 45, DIGITS.battery.h),
  // 電池の枠の中（アイコンの内側）。残りに合わせて左から塗る
  batteryFill: row(272, 17, 9),
  aod: { time: { x: 0, y: 150, w: 390, h: DIGITS.aod.h }, date: { x: 70, y: 240, w: 250, h: 34 }, hp: { x: 70, y: 280, w: 250, h: 34 } },
})

// 固定背景の絵に入っている文字（素材の画素から測った範囲）。四隅と端12px・通知のマークの所に入らないこと
export const BAKED_TEXT = Object.freeze({
  title: { x: 97, y: 47, w: 194, h: 58 }, // スーパー／アルバイター
  lanternLeft: { x: 36, y: 47, w: 22, h: 46 }, // 営業中
  lanternRight: { x: 332, y: 46, w: 22, h: 48 }, // よし!
})
