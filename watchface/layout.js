export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  safe: 32,
})

// Bip 6は角丸ディスプレイ。角の高さでは画面幅をそのまま使えないため、
// 内容は上下の窓に押し込め、窓の四隅が角丸の内側へ収まる位置に置く。
// 想定半径と検証は tools/check-safe-area.mjs / npm run safe-area を参照。
const WINDOW_X = 32
const WINDOW_W = SCREEN.width - WINDOW_X * 2

// 構成は「上の窓（状態）／中央の開放（背景と時刻）／下の窓（数値）」。
// 上下の窓は画面の上下端から等距離（46px / 46px）に置き、中央248pxを絵に空ける。
export const LAYOUT = Object.freeze({
  background: { x: 12, y: 10, w: 366, h: 430 },

  topWindow: { x: WINDOW_X, y: 46, w: WINDOW_W, h: 46 },
  weatherIcon: { x: 44, y: 52, w: 34, h: 34 },
  date: { x: 90, y: 54, w: 126, h: 30 },
  hp: {
    gaugeX: 228,
    gaugeY: 61,
    segmentW: 11,
    segmentH: 16,
    gap: 2,
  },

  // 時刻は窓を持たず背景へ直接乗せる。数字列そのものを画面中央へ寄せ、
  // AM/PMはその右へ続ける。12h/24hや桁数で中心が動かないようにするため、
  // AM/PMの幅は中央寄せの計算に含めない。
  // yは開放帯（92〜340）の中央。視覚的中心は幾何中心よりわずかに上が心地よい。
  time: { y: 180, digitW: 52, digitH: 72, colonW: 18, gap: 6 },
  amPm: { w: 44, h: 30, gap: 8, offsetY: 40 },

  bottomWindow: { x: WINDOW_X, y: 340, w: WINDOW_W, h: 64 },
  temperature: {
    labelY: 350,
    labelH: 18,
    valueY: 370,
    valueH: 26,
    // 列幅68は氷点下 "-10°"（符号込み67px）がぎりぎり収まる幅。
    columns: [
      { x: 40, w: 68 },
      { x: 108, w: 68 },
      { x: 176, w: 68 },
    ],
  },
  // 歩数は5桁 "12,345" まで入る幅を確保する。
  steps: {
    icon: { x: 252, y: 372, w: 22, h: 22 },
    text: { x: 278, y: 370, w: 78, h: 26 },
  },

  aod: {
    timeY: 172,
    date: { x: 12, y: 258, w: 366, h: 34 },
    hpGaugeX: 121,
    hpGaugeY: 310,
    segmentW: 12,
    segmentH: 11,
    gap: 3,
  },
})
