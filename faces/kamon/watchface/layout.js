// 画面の座標・大きさ（Amazfit Bip 6：390×450）。
// 上から：通知アイコンの余白 → 気温（左）と電池（右）→ 紋の上に大きな時刻 → 曜日と日 → 歩数｜心拍。
// 紋・アイコン・区切りは固定背景（images/background.png）に入っている。数字と曜日だけを時計で重ねる。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 上の真ん中は、時計本体が通知のマークを出す所。何も置かない（実機で測ったマークは x=178〜212、y=10〜44）
export const NOTIFICATION = Object.freeze({ x: 170, y: 0, w: 50, h: 48 })

// 紋（背景に描く）。中心と外側の輪の半径
export const CREST = Object.freeze({ cx: 195, cy: 218, r: 128 })

// 数字・文字の画像の大きさ（w×h）。stroke は線の太さ、chamfer は角の切り落とし（どちらも px）
export const DIGITS = Object.freeze({
  time: { w: 68, h: 108, colonW: 24, gap: 4, stroke: 16, chamfer: 7 },
  aod: { w: 52, h: 84, colonW: 18, gap: 4, stroke: 5, chamfer: 5 },
  // 気温・電池・歩数・心拍・日付に共通の小さい数字。unitW は「-」と「°」の幅
  small: { w: 16, h: 24, gap: 2, unitW: 10, stroke: 4, chamfer: 2 },
  // 曜日の英字（3文字を1枚の画像にする）
  letter: { w: 16, h: 24, gap: 3, stroke: 4, chamfer: 2 },
})

// 時刻の数字列の幅（2桁の時：4桁＋「:」）
export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  const items = hourDigits + 3
  return (hourDigits + 2) * spec.w + spec.colonW + spec.gap * (items - 1)
}

// 小さい数字の列の幅（chars は「-」「°」を含めた字の並び）
export function smallWidth(chars) {
  const s = DIGITS.small
  const widths = chars.split('').map((ch) => (ch === '-' || ch === '°' ? s.unitW : s.w))
  return widths.reduce((sum, w) => sum + w, 0) + s.gap * Math.max(0, widths.length - 1)
}

export const WEEKDAY_W = 3 * DIGITS.letter.w + 2 * DIGITS.letter.gap

export const LAYOUT = Object.freeze({
  // 時刻：画面の中央にそろえ、紋の中心の高さに置く
  timeY: CREST.cy - Math.round(DIGITS.time.h / 2),
  // 曜日（英字3文字）と日（2桁）。まとめて画面の中央に来る
  weekday: { x: 146, y: 292, w: WEEKDAY_W, h: DIGITS.small.h },
  day: { x: 210, y: 292, w: 2 * DIGITS.small.w + DIGITS.small.gap, h: DIGITS.small.h },
  // 上の段：左に気温、右に電池
  tempIcon: { x: 44, y: 58, w: 14, h: 24 },
  temp: { x: 64, y: 58, w: 60, h: 24 }, // 「-12°」まで
  batteryIcon: { x: 262, y: 63, w: 26, h: 14 },
  batteryFill: { x: 265, y: 66, w: 18, h: 8 }, // 枠の内側。残りに合わせて左から塗る
  battery: { x: 294, y: 58, w: 52, h: 24 }, // 「100」まで
  // 下の段：歩数｜心拍
  stepsIcon: { x: 87, y: 376, w: 20, h: 24 },
  steps: { x: 111, y: 376, w: 88, h: 24 }, // 5桁（99999）まで
  divider: { x: 210, y: 378, w: 2, h: 20 },
  heartIcon: { x: 222, y: 378, w: 22, h: 20 },
  heart: { x: 250, y: 376, w: 52, h: 24 }, // 3桁まで
  aod: {
    timeY: 170,
    weekday: { x: 146, y: 272, w: WEEKDAY_W, h: DIGITS.small.h },
    day: { x: 210, y: 272, w: 2 * DIGITS.small.w + DIGITS.small.gap, h: DIGITS.small.h },
  },
})

// 数字が入る所（テストで、はみ出し・重なりを確かめる）
export const DATA_FIELDS = Object.freeze({
  temp: '-12°',
  battery: '100',
  steps: '99999',
  heart: '199',
})
