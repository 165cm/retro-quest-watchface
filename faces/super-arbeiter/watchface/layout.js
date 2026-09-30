// 画面の座標・大きさ（Amazfit Bip 6：390×450）。最終採用案（完成図）の配置。
// 上から：赤い通知の余白と暖簾「スーパー／アルバイター」→ 左に日付と曜日・右に時刻 → 左に丼・右にセリフの吹き出し
// → 下の段に「くつ 歩数｜電池 残り」。
// 暖簾・提灯・カレンダー・丼・吹き出し・雷紋・くつ・区切り・電池の枠は固定背景（source/background.png）に入っている。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 上の真ん中は、時計本体が通知のマーク（タイマーなど）を出す所。文字を置かない。
// 実機の画面写真で測ったマークは x=178〜212、y=10〜44。暖簾の文字は y=47 から
export const NOTIFICATION = Object.freeze({ x: 170, y: 0, w: 50, h: 46 })

// 数字の画像の大きさ（w×h）。colonW は「:」、slashW は「/」の幅。
// 時刻と AOD は筆の数字（tools/brush-digits.mjs）。太さ・傾きを入れた輪郭がちょうど収まる大きさで書き出す。
// 日付・歩数・電池はフォントの数字（source/glyphs/）。字は画像の中央に、ふちに余白を残して置く
export const DIGITS = Object.freeze({
  time: { w: 66, h: 94, colonW: 24, gap: 0 },
  aod: { w: 48, h: 76, colonW: 17, gap: 0 },
  date: { w: 14, h: 22, slashW: 9, gap: -1 },
  steps: { w: 14, h: 28, gap: 0 },
  battery: { w: 18, h: 28, gap: 0 },
})

// 時刻の数字列の幅（2桁の時：4桁＋「:」）
export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  return (hourDigits + 2) * spec.w + spec.colonW + spec.gap * (hourDigits + 2)
}

export const LAYOUT = Object.freeze({
  // 時刻：この範囲の中央にそろえる（完成図の x=83〜374、y=117〜211）
  time: { x: 83, y: 117, w: 291 },
  // 日付（中央ぞろえ）と曜日。カレンダーのアイコン（x=26〜54、y=126〜152）の下
  date: { x: 14, y: 157, w: 64, h: 22 },
  weekday: { x: 14, y: 184, w: 64, h: 22 },
  // セリフの札（174×116、下地は透明）。吹き出しの内側（測った値 x=183〜377、y=244〜356）
  quote: { x: 195, y: 241, w: 174, h: 116 },
  // 下の段：くつ（x=40〜116）の右に歩数、区切り（x=209〜225）、電池の枠（x=223〜263）の右に残り
  steps: { x: 121, y: 394, w: 84, h: 28 }, // 6桁（999999）まで区切り（x=209〜）の手前に収まる
  battery: { x: 272, y: 394, w: 60, h: 28 },
  // 電池の枠の中（測った内側 x=227〜255、y=402〜416）。残りに合わせて左から塗る
  batteryFill: { x: 229, y: 404, w: 25, h: 11 },
  aod: { timeY: 150, date: { x: 70, y: 240, w: 250, h: 34 }, hp: { x: 70, y: 280, w: 250, h: 34 } },
})

// 固定背景の絵に入っている文字（素材の画素から測った範囲）。四隅と端12px・通知のマークの所に入らないこと
export const BAKED_TEXT = Object.freeze({
  title: { x: 97, y: 47, w: 194, h: 58 }, // スーパー／アルバイター
  lanternLeft: { x: 36, y: 47, w: 22, h: 46 }, // 営業中
  lanternRight: { x: 332, y: 46, w: 22, h: 48 }, // よし!
})
