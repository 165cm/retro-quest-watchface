// 画面の座標・大きさ（Amazfit Bip 6：390×450）。改修版（3案目）の完成見本（docs/preview-390x450.png）の配置。
// 上から：赤い通知の余白と暖簾 → 時刻（左に HP、右に日付と曜日）→ 左に丼・右にセリフの吹き出し → 下の段に STEPS と BREAK。
// 暖簾・提灯・丼・吹き出し・ラベル・アイコンは固定背景（source/background.png）に入っている。
// Bip 6 の画面は四隅が大きく丸い（実効の半径およそ105px）。大事な表示は四隅と端12px以内に置かない。
export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  cornerRadius: 105,
  safe: 12,
})

// 上の真ん中は、時計本体が通知のマーク（タイマーなど）を出す所。文字を置かない。
// 実機の画面写真で測ったマークは x=178〜212、y=10〜44。少し広めにとる
export const NOTIFICATION = Object.freeze({ x: 170, y: 0, w: 50, h: 50 })

// 数字の画像の大きさ（w×h）。colonW は「:」、slashW は「/」の幅。
// 筆の数字の画像は、太さ・傾きを入れた輪郭がちょうど収まる大きさで書き出す（tools/brush-digits.mjs の exportViews）。
// 画像のふちに少し余白があるので、gap は 0 で字どうしがくっつかない
export const DIGITS = Object.freeze({
  time: { w: 52, h: 88, colonW: 20, gap: 0 },
  hp: { w: 18, h: 32, gap: 0 },
  steps: { w: 18, h: 26, gap: 0 },
  date: { w: 12, h: 20, slashW: 8, gap: -1 },
  break: { w: 16, h: 24, colonW: 8, gap: 0 },
  aod: { w: 48, h: 76, colonW: 17, gap: 0 },
})

export const WEEKDAY = Object.freeze({ w: 42, h: 18 })

// 時刻の数字列の幅（2桁の時：4桁＋「:」）
export function timeWidth(spec = DIGITS.time, hourDigits = 2) {
  const items = hourDigits + 3
  return (hourDigits + 2) * spec.w + spec.colonW + (items - 1) * spec.gap
}

export const LAYOUT = Object.freeze({
  // 真ん中の段：左に HP、真ん中に時刻、右に日付と曜日
  time: { y: 110 },
  hp: { x: 15, y: 150, w: 56, h: 32 },
  date: { x: 318, y: 150, w: 58, h: 20 }, // 右寄せ（時刻に近づけない）
  weekday: { x: 327, y: 174, w: 42, h: 18 },
  // 吹き出しの中のセリフの札（吹き出しの内側は背景で平らなクリームにしてある）
  quote: { x: 199, y: 240, w: 171, h: 108 }, // 吹き出しの平らなクリームの中（背景の画素から測った x=197〜372・y=238〜350 の内側）
  // 下の段：STEPS の数字と BREAK の時刻
  steps: { x: 108, y: 391, w: 92, h: 26 },
  breakBox: { x: 264, y: 390, w: 78, h: 30, radius: 5 },
  breakTime: { x: 266, y: 393, w: 74, h: 24 },
  // 背景の BREAK の赤い箱は右下の丸い角にかかるので消して、内側に描き直す。
  // 消す範囲と、写してくる黄色い地の範囲（時刻の後ろの、何も描いていない所）
  breakBoxErase: { x: 266, y: 384, w: 112, h: 46, from: { x: 90, y: 146, w: 110, h: 40 } },
  // AOD（画面オフ時）：時刻・日付・HP だけ
  aod: {
    timeY: 150,
    date: { x: 70, y: 240, w: 250, h: 34 },
    hp: { x: 70, y: 280, w: 250, h: 34 },
  },
})

// 固定背景に入っている文字の範囲（390×450 の座標。背景の画素から測った値）。
// 四隅に欠けないか・通知のマークにかからないかのテストで使う
export const BAKED_TEXT = Object.freeze({
  noren: { x: 83, y: 50, w: 230, h: 43 }, // SUPER ARBEITER
  lanternLeft: { x: 37, y: 46, w: 21, h: 50 }, // 営業中
  lanternRight: { x: 333, y: 46, w: 20, h: 50 }, // よし!
  hpLabel: { x: 51, y: 126, w: 23, h: 14 },
  stepsLabel: { x: 60, y: 394, w: 42, h: 14 },
  breakLabel: { x: 214, y: 405, w: 39, h: 18 },
})
