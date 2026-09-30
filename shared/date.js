// Zepp OS の Time.getDay() は、資料によって 0=日曜〜6=土曜（JS と同じ）と
// 1=月曜〜7=日曜 の2つの流儀が食い違う。月〜土はどちらでも同じ添字になり、
// 違うのは日曜（0 か 7 か）だけなので、7 を 0 に畳めばどちらでも正しく引ける。
// 「値が無い」を日曜と取り違えないよう、Number() で丸めず数値型だけを受け付ける。
export function weekdayIndex(day) {
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 7) {
    return null
  }
  return day % 7
}

// names は日曜はじまりの7つ。例：['SUN', 'MON', ...]、['日', '月', ...]
export function formatWeekday(day, names) {
  const index = weekdayIndex(day)
  return index === null ? '---' : names[index]
}
