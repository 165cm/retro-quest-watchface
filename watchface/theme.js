// 現行のドラクエ（XI / ウォーク系）のUIに合わせた配色。
// 8bit期の原色ではなく、濃紺のガラス板に金の縁、文字は白 ── の3層だけ。
// 色数を増やすほど背景の絵に負けるので、意味を持つ色は温度とHPに限る。
export const COLORS = Object.freeze({
  BACKGROUND_NAVY: 0x031426,

  // 板は真っ黒ではなく青みのある濃紺。黒だと背景から浮いて板が主役になる。
  PANEL: 0x08182c,
  // 縁は金。現行ドラクエのコマンドウィンドウの識別色で、白枠より柔らかい。
  PANEL_EDGE: 0xcdb87e,

  TEXT_PRIMARY: 0xf2f5fa,
  // ラベルは金系で一段落とす。値と同じ白にすると読む順番が決まらない。
  TEXT_LABEL: 0xcdb87e,
  TEXT_MUTED: 0x93a3b8,

  // HPは棒1本。溝は板よりわずかに明るくして、満タンでも溝の存在が分かるようにする。
  HP_TRACK: 0x1d2c41,
  HP_GREEN: 0x5cc27a,
  HP_YELLOW: 0xe8c15a,
  HP_RED: 0xe8695a,

  LOW_BLUE: 0x86c8f0,
  HIGH_ORANGE: 0xf0a45c,

  AOD_TEXT: 0xb4bcc6,
  AOD_MUTED: 0x4a525c,
  BLACK: 0x000000,
})

// 階層は「時刻(スプライト80px) / 実データ26px / ラベル18px」の3段。
export const TYPE = Object.freeze({
  date: 26,
  steps: 26,
  label: 18,
  battery: 20,
  aodDate: 24,
})
