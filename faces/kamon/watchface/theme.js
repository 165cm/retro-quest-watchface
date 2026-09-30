// 色。絵の色（tools/generate-assets.mjs）もここから読む。
export const COLORS = Object.freeze({
  BLACK: 0x000000, // 地（有機ELで光らない黒）
  SUMI: 0x2a2a2a, // 紋（墨色。時刻より目立たせない）
  SHU: 0xe53a2f, // 時刻（朱色）
  GOLD: 0xc8a45a, // アイコン・区切り・電池の塗り
  KINARI: 0xefe7d6, // 小さい数字と曜日（生成り）
  LOW: 0xe53a2f, // 電池が少ない時の塗り（色だけでなく数字も出す）
  AOD_TIME: 0x9a2a22, // 画面オフ時の時刻（暗い朱）
  AOD_TEXT: 0x6e675a, // 画面オフ時の曜日と日（暗い生成り）
  NOTIFICATION_CHECK: 0x22cc88, // 確認図だけに重ねる通知の目印（製品の背景には入れない）
})

// 電池がこれ以下なら塗りを朱にする（%）
export const LOW_BATTERY = 20
