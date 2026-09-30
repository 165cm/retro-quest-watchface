// セリフの札（7枚）。ユーザーが選んだ言葉。画面には名前や出典を出さない。
// 札の画像は tools/generate-assets.mjs が source/quotes/ から作る（images/quotes/<番号>.png）。
// 画面が点くたびに、この並び順で次の札に替わる。足す時は末尾に足す。
export const QUOTES = Object.freeze([
  { text: 'だめそうだったらさーリタイアすればいいよね', image: 'images/quotes/1.png' },
  { text: 'なんとかなれーッ!!', image: 'images/quotes/2.png' },
  { text: 'だいじょぶっいつもなんとかなってるもん!!', image: 'images/quotes/3.png' },
  { text: 'でもこれも…「味」だよねッ', image: 'images/quotes/4.png' },
  { text: 'なーんかやっけにうまみがあるような', image: 'images/quotes/5.png' },
  { text: 'どうなるか…わかんないケド…がんばりまーす‼', image: 'images/quotes/6.png' },
  { text: '仕事の後の一杯が楽しみだなッ!!', image: 'images/quotes/7.png' },
])// 画面が点くたびに、次の札へ（最後の次は1枚目）。変な値の時は1枚目。
// 何番目かは時計の記憶に置くだけで、保存はしない（書き込みの電気を使わないため）。
export function nextQuoteIndex(current) {
  if (!Number.isInteger(current) || current < 0 || current >= QUOTES.length) return 0
  return (current + 1) % QUOTES.length
}
