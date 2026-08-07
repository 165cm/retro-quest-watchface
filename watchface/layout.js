export const SCREEN = Object.freeze({
  width: 390,
  height: 450,
  safe: 30,
  // 画面の角丸半径。Zepp OSのgetDeviceInfo()はwidth/height/screenShapeしか
  // 返さず半径を公開していないため、実機で欠けた事実から逆算した想定値。
  // 90pxでは実機の欠けを説明できないので105を採用している。
  // 座標の検査（check-safe-area）と提出用プレビューの角の切り抜きが、
  // 同じ値を見るようにここへ置いている。
  cornerRadius: 105,
})

// Bip 6は角丸ディスプレイ。角の高さでは画面幅をそのまま使えないため、
// 内容は上下の板に押し込め、板の四隅が角丸の内側へ収まる位置に置く。
// 想定半径と検証は tools/check-safe-area.mjs / npm run safe-area を参照。
const PANEL_X = 30
const PANEL_W = SCREEN.width - PANEL_X * 2
// 板の内側の余白。中の要素はすべてこの内側に収める。
const PAD = 16
const INNER_X = PANEL_X + PAD
const INNER_RIGHT = PANEL_X + PANEL_W - PAD

// 情報の並びは「いま・ここ（上） / 時刻（中） / 自分の状態（下）」。
// 上下の板は画面端から等距離（40px）に置き、中央224pxを絵へ空ける。
export const LAYOUT = Object.freeze({
  background: { x: 12, y: 10, w: 366, h: 430 },

  panelRadius: 14,

  // 上の板: 天気と日付。天候アイコンと現在気温を同じ行に置き、
  // 「外の様子」を1行で読み切れるようにする。
  topPanel: { x: PANEL_X, y: 40, w: PANEL_W, h: 58 },
  weatherIcon: { x: INNER_X, y: 54, w: 30, h: 30 },
  date: { x: 84, y: 54, w: 152, h: 30 },
  nowTemp: { x: 244, y: 54, w: INNER_RIGHT - 244, h: 30 },

  // 時刻は板を持たず背景へ直接乗せる。数字列そのものを画面中央へ寄せ、
  // AM/PMはその右へ続ける。12h/24hや桁数で中心が動かないようにするため、
  // AM/PMの幅は中央寄せの計算に含めない。
  time: { y: 170, digitW: 56, digitH: 80, colonW: 20, gap: 6 },
  amPm: { w: 40, h: 26, gap: 10, offsetY: 50 },

  // 下の板: 自分の状態。1段目にHP、2段目に歩数と今日の気温幅。
  bottomPanel: { x: PANEL_X, y: 322, w: PANEL_W, h: 88 },
  hp: {
    label: { x: INNER_X, y: 334, w: 32, h: 20 },
    // 棒は角丸。溝と中身を同じ半径にすると、残量が少なくても形が崩れない。
    track: { x: 84, y: 340, w: 206, h: 12 },
    radius: 6,
    text: { x: 294, y: 334, w: INNER_RIGHT - 294, h: 20 },
  },
  steps: {
    icon: { x: INNER_X, y: 368, w: 22, h: 22 },
    text: { x: 74, y: 366, w: 84, h: 26 },
  },
  // 最低・最高は歩数の右へ。現在気温は上の板にあるのでここには出さない。
  // 値の幅62pxは氷点下 "-10°"（符号込み61px）が収まる幅。
  range: {
    lowLabel: { x: 170, y: 368, w: 16, h: 20 },
    lowValue: { x: 186, y: 366, w: 62, h: 26 },
    highLabel: { x: 258, y: 368, w: 16, h: 20 },
    highValue: { x: 274, y: 366, w: 62, h: 26 },
  },

  aod: {
    time: { y: 166, digitW: 40, digitH: 58, colonW: 14, gap: 5 },
    date: { x: 12, y: 248, w: 366, h: 30 },
    hp: { x: 125, y: 300, w: 140, h: 8, radius: 4 },
  },
})
