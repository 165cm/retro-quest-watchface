// 色。元のデザインの色を画素から測ったもの。絵の色（tools/generate-assets.mjs）もここから読む。
export const COLORS = Object.freeze({
  BLACK: 0x000000, // 地
  SUMI: 0x222222, // 紋（墨色）
  GOLD: 0xc8a45a, // レアのタイトル（金）
  GOLD_DIM: 0x6e5524, // レアの紋（暗い金。時刻より目立たせない）
  RED: 0xff001f, // 時刻・下の段の数字・ハート・電池の塗り
  RULE: 0x80000e, // 題字の左右の線・下の段の区切り（暗い赤）
  CREAM: 0xf2e6d8, // 題字・日付・アイコン
  AOD_TIME: 0x8a0012, // 画面オフ時の時刻（暗い赤）
  AOD_TEXT: 0x6e665e, // 画面オフ時の日付
  NOTIFICATION_CHECK: 0x22cc88, // 確認図だけに重ねる通知の目印（製品の背景には入れない）
})
