// 時刻の文字：24時間は2桁（09:05）、12時間は先頭の0なし（9:05）
export function hourText(hour, is12h, formatHour) {
  return is12h ? String(formatHour) : String(hour).padStart(2, '0')
}

// 日は2桁（05）。曜日と日の幅がいつも同じになり、まとめて画面の中央に来る
export function dayText(date) {
  return String(date).padStart(2, '0')
}
