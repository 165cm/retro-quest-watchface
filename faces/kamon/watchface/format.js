// 時刻の文字：24時間は2桁（09:05）、12時間は先頭の0なし（9:05）
export function hourText(hour, is12h, formatHour) {
  return is12h ? String(formatHour) : String(hour).padStart(2, '0')
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

// 日付：元のデザインと同じ「WED 30 SEP」。weekday は 0＝日〜6＝土（null なら曜日を出さない）、month は 1〜12
export function dateText(weekday, date, month) {
  const parts = [weekday === null ? null : WEEKDAYS[weekday], String(date), MONTHS[month - 1]]
  return parts.filter(Boolean).join(' ')
}
