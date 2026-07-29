// UIは白・黒・寒色・暖色の4系統に絞る。装飾色を足すほど絵に負ける。
export const COLORS = Object.freeze({
  BACKGROUND_NAVY: 0x031426,
  // 窓は黒。紺は現代的すぎて、描き込まれた絵の上では濁って見える。
  WINDOW: 0x000000,
  TEXT_PRIMARY: 0xf4f3e8,
  TEXT_MUTED: 0xa9b0b8,
  HP_GREEN: 0x4fa83e,
  HP_YELLOW: 0xe1b84a,
  HP_RED: 0xe8483c,
  HP_EMPTY: 0x1a1a1a,
  // 天候アイコンの雨粒と同じ値だったため、意味が衝突しないようずらしている。
  LOW_BLUE: 0x7cc6f5,
  HIGH_ORANGE: 0xf2a03a,
  AOD_TEXT: 0xb8b8b8,
  AOD_EMPTY: 0x3a3a3a,
  BLACK: 0x000000,
})

// 階層は「時刻(スプライト72px) / 実データ24px / ラベル20px」の3段だけ。
// コピーは装飾なので実データより上位に置かない。
export const TYPE = Object.freeze({
  date: 24,
  steps: 24,
  encounter: 24,
  tempLabel: 20,
  aodDate: 24,
})
