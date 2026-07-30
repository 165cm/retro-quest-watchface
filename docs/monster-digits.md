# モンスター字形（Monster Digits）仕様

時刻に使う0〜9の数字を、**数字の骨格を保ったまま生き物の姿にした字形**の設計と生成プロンプトです。

---

## 0. 設計判断の記録

### 「分1〜60をモンスターにする」を額面どおりにはやらなかった理由

分を知るために**60体を暗記する**必要が生じます。腕時計の一次機能は時刻表示なので成立しません。
そこで要望を「数字をモンスターにしたい」という核だけ取り出し、
**数字そのものをモンスター化した字形**（0〜9の10体）として実装しました。
時刻は数字として読め、かつその数字が牙・目・爪を持っています。

### 時ごとの中ボスは作ったが、外した

一度は0〜12時に対応する中ボス13体を実装しました（`art/boss-src/`、`LAYOUT.boss`、
`watchface/boss.js`）。実物を見た判断で**撤去**しています。

- 時刻はすでに数字で読めるので、中ボスは情報を足していない
- 中央に110pxの不透明なキャラクターが立つと、10枚描いた背景の一番いい部分が隠れる
- TGA換算で+0.7MBを、装飾だけのために払っていた

撤去後は上下の窓を画面端から等距離（46px）に置き、中央248pxを絵に空けています。
再導入したくなった場合は、この判断とプロンプトがgit履歴に残っています
（`git log --follow -- docs/monster-digits.md`）。

---

## 1. 画面構成

```
y=0    ┌──────────────────────────────────────┐
       │  背景（天候別・既存10枚）              │
y=46   │  ╔════════════════════════════════╗  │
       │  ║ 🌤 7/28 TUE      HP ▮▮▮▮▮▮▯▯▯▯ ║  │  ステータス窓
y=92   │  ╚════════════════════════════════╝  │
       │                                      │
       │          （背景を見せる帯）            │
       │                                      │
y=180  │        1 0 : 3 8  PM                 │  ← 時刻（モンスター字形）
y=252  │                                      │
       │                                      │
y=340  │  ╔════════════════════════════════╗  │
       │  ║  L 22°  NOW 26°  H 29°  👣 6,255║  │  データ窓
y=404  │  ╚════════════════════════════════╝  │
y=450  └──────────────────────────────────────┘
```

### 座標

```js
topWindow:    { x: 32, y: 46,  w: 326, h: 46 }
time:         { y: 180, digitW: 52, digitH: 72, colonW: 18, gap: 6 }
bottomWindow: { x: 32, y: 340, w: 326, h: 64 }
```

時刻が乗る帯（背景ローカル座標 y170–242 / x58–360）は、
`tools/normalize-background.mjs` が明るい画素の比率を検査します。
時刻の`y`を変えたら、あちらの`TIME_BAND`も必ず合わせてください。

---

## 2. 作ってほしい画像

**`art/monster-digits-src/0.png` 〜 `9.png`**

- **キャンバス 104 × 144 px**（実機表示 52×72 の2倍。縮小して使います）
- 背景は**完全透過**
- 数字の骨格は太く単純に。生き物の要素は**輪郭の外側に足す**

---

## 3. 生成プロンプト

各数字ごとに、下のテンプレートの `<DIGIT>` と `<CREATURE>` を差し替えて投げてください。

```text
A single numeral rendered as a small monster, in the style of a 16-bit Japanese
console RPG enemy sprite (Super Famicom era, early 1990s).

THE MOST IMPORTANT RULE: the shape must read as the numeral "<DIGIT>" instantly,
from across a room, to someone who has never seen it before. The creature features
are decoration attached to the numeral's outside edge. They must NEVER break,
bend, close, or open the numeral's skeleton. If there is any conflict between
"looks like a monster" and "reads as <DIGIT>", the numeral always wins.

Construction:
- Start from a bold, simple, geometric numeral "<DIGIT>" with thick even strokes.
  Stroke width roughly 1/4 of the numeral's height. Closed counters stay closed,
  open counters stay open.
- Then add creature features ONLY on the outer contour: <CREATURE>
- Keep all features small. No feature may extend more than 15% of the numeral's
  height beyond its outline.
- The numeral's interior (counters/holes) stays empty. Do not fill it with a face.

Style:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO gradients.
- Shading via flat color areas and checkerboard dithering only. 2 to 3 tones max.
- Bone-white / ivory body (#F4F3E8 family) so it reads on any background.
- A hard black outline 4px thick around the entire silhouette.
- A solid black drop shadow offset 8px down-right, no blur.
- Limited palette, at most 12 colors.
- Eyes are the only saturated accent, a warm amber.

Framing:
- Canvas 104 x 144 pixels, fully transparent background.
- The numeral fills about 80% of the canvas height, centered.
- Nothing may touch the canvas edge.

Do NOT include: any other letters or numbers, text, UI, frames, backgrounds,
ground, shadows cast on a surface, or any character from an existing game.
```

差し替え表（`<CREATURE>` は各数字の形に合う特徴を選んでいます）:

| 数字 | `<CREATURE>` に入れる文章 |
|---|---|
| 0 | `two small horns on the top of the ring, a pair of eyes on the upper left of the ring, and three stubby clawed feet along the bottom of the ring` |
| 1 | `a single curved horn on the top of the flag, one large eye on the flag, and a spiked tail curling off the right of the base` |
| 2 | `a serpent head at the end of the upper curve with two eyes and a forked tongue, and small fins along the diagonal stroke` |
| 3 | `two eyes tucked into the upper bowl, a row of small spikes along the outer right edge of both bowls, and a short tail off the lower left` |
| 4 | `a beaked head at the top of the vertical stroke with one eye, and two clawed feet under the horizontal bar` |
| 5 | `two eyes on the flat top bar, a mane of short spikes along the top edge, and a stubby leg under the lower bowl` |
| 6 | `a large eye inside the upper hook area but outside the closed loop, a curled antenna off the top of the hook, and two small feet under the loop` |
| 7 | `two eyes on the underside of the top bar, bat-like membrane fins hanging under the bar, and a barbed tip at the bottom of the diagonal` |
| 8 | `four eyes, two in the upper ring area and two in the lower, small bristles around both rings, and two tiny wings on the upper left and right` |
| 9 | `a large eye inside the upper loop area but outside the closed counter, two antennae off the top of the loop, and a fin along the descender` |

> **重要:** 生成後、必ず**数字だけを見せて第三者に読ませてください。**
> 読み間違えられた数字は、モンスター要素を削って作り直してください。

---

## 4. 容量の見通し

Zeus CLIはビルド時に**同梱PNGをすべてTGAへ変換**します。TGAは非圧縮なので、
**画素数がそのまま容量**になります。

| アセット | 枚数 | 実機サイズ | TGA換算 |
|---|---|---|---|
| 背景 | 10 | 366×430 | 6.3 MB |
| モンスター字形 | 10 | 52×72 | 0.15 MB |

背景10枚が支配的です。字形の追加は誤差の範囲に収まります。

---

## 5. 生成後の受け入れ確認

- [ ] 全キャンバスが**完全透過**（背景色が焼き込まれていない）
- [ ] 10枚を**単体で見せて第三者が正しく読める**
- [ ] 4pxの黒縁がある（背景に乗せたとき輪郭が消えないため）
- [ ] アンチエイリアスのにじみがない
- [ ] キャンバスの端に接していない
- [ ] 既存ゲームのモンスターに似ていない

生成できたら `art/monster-digits-src/` に置き、`npm run sprites` で検査、
`npm run normalize-sprites` で実機サイズへ縮小してください。
