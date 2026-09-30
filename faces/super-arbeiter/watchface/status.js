// STATUS の文言。いまは「まだいける」だけ。文言を足す時は、ここに足して
// tools/generate-assets.mjs で images/status/<番号>.png を作る（番号で選ぶので、並び順は変えない）。
export const STATUS_PRESETS = Object.freeze([{ text: 'まだいける', image: 'images/status/0.png' }])

export function getStatus(index) {
  return Number.isInteger(index) && index >= 0 && index < STATUS_PRESETS.length
    ? STATUS_PRESETS[index]
    : STATUS_PRESETS[0]
}
