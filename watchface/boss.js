// 時（0〜12）に対応する中ボス。12時間制の表示時刻をそのまま鍵にする。
// 24時間制でも 13〜23時は 1〜11 へ畳んで同じ敵を出す。
export const BOSS_COUNT = 13

export const BOSS_NAMES = Object.freeze([
  'NIGHT WRAITH',
  'MOTH SENTINEL',
  'CAVE CRAWLER',
  'STONE GARGOYLE',
  'DAWN WISP',
  'ROOSTER GOLEM',
  'MEADOW SPROUT',
  'SUNLIT LIZARD',
  'SAND SCORPION',
  'MIRROR SLIME',
  'STORM CROW',
  'IRON SENTRY',
  'NOON GUARDIAN',
])

// battery.js と同じく、型は厳密に見る。センサーは数値を返すため、
// 文字列や範囲外が来た時点で異常であり、黙って解釈しない。
export function normalizeBossIndex(hour) {
  if (typeof hour !== 'number' || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    return 0
  }
  // 0〜12はそのまま、13〜23は12を引いて1〜11へ畳む。
  return hour > 12 ? hour - 12 : hour
}

export function getBossSprite(hour) {
  return String(normalizeBossIndex(hour)).padStart(2, '0')
}

export function getBossName(hour) {
  return BOSS_NAMES[normalizeBossIndex(hour)]
}
