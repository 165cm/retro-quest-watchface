// Zepp OSの Time.getDay() の返り値には、JS互換の 0=日曜〜6=土曜 と、
// 1=月曜〜7=日曜 の2つの流儀が資料によって食い違う。
//
// 実機のスクリーンショット（2026-08-11 火曜 → TUE）では判別できない。
// 月〜土は「JS互換の添字」と「1=月曜の添字」がたまたま同じ値になり、
// 両者が食い違うのは日曜だけ（0 か 7 か）だからである。
//
// そこで 7 を 0 へ畳んで日曜として扱う。こうすると 0〜7 のどちらの流儀でも
// 全曜日が正しく引ける。実機で流儀が判明するまで、この形が唯一安全な実装。
//
// 旧実装の WEEKDAYS[getDay() - 1] は 1=月曜の流儀を前提にしていたため、
// JS互換だった場合に日曜が WEEKDAYS[-1] → undefined となり、
// フォールバックの '---' が表示されていた。
const WEEKDAYS = Object.freeze(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])

// Number()で丸めない。Number(null) と Number('') は 0 になり、
// 「値が無い」が日曜と区別できなくなるため、数値型だけを受け付ける。
// steps.js / battery.js の正規化と同じ方針。
export function formatWeekday(day) {
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 7) {
    return '---'
  }
  return WEEKDAYS[day % 7]
}

// 通常表示とAODで同じ文字列を使う。月日はゼロ埋めしない（8/11 であって 08/11 ではない）。
export function formatDate(month, date, day) {
  return `${month}/${date} ${formatWeekday(day)}`
}
