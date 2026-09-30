// セリフの札（7枚）。ユーザーが選んだ言葉。画面には名前や出典を出さない。
// 札の画像は tools/generate-assets.mjs が source/quotes/ から作る（images/quotes/<番号>.png）。
// 並び順を変えると、日ごとに出る札が変わる。足す時は末尾に足す。
export const QUOTES = Object.freeze([
  { text: 'だめそうだったらさーリタイアすればいいよね', image: 'images/quotes/1.png' },
  { text: 'なんとかなれーッ!!', image: 'images/quotes/2.png' },
  { text: 'だいじょぶっいつもなんとかなってるもん!!', image: 'images/quotes/3.png' },
  { text: 'でもこれも…「味」だよねッ', image: 'images/quotes/4.png' },
  { text: 'なーんかやっけにうまみがあるような', image: 'images/quotes/5.png' },
  { text: 'どうなるか…わかんないケド…がんばりまーす‼', image: 'images/quotes/6.png' },
  { text: '仕事の後の一杯が楽しみだなッ!!', image: 'images/quotes/7.png' },
])

const DAY_MS = 24 * 60 * 60 * 1000

// 日替わり：その日の日付（時計の年・月・日）から、1970/1/1 からの通算日を出し、7 で割った余りの札を出す。
// 同じ日のうちは何度見ても同じ札。日付が変わると次の札になり、7日で一回りする。
export function quoteIndexFor(year, month, day) {
  if (![year, month, day].every(Number.isInteger)) return 0
  const days = Math.floor(Date.UTC(year, month - 1, day) / DAY_MS)
  return ((days % QUOTES.length) + QUOTES.length) % QUOTES.length
}
