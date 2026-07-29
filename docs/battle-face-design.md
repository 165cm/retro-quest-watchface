# 戦闘画面デザイン仕様（Battle Face）

文字盤を**モンスターとの戦闘シーン**として作り直すための設計と、画像生成の指示です。

---

## 0. まず設計判断の説明

### ご提案そのままだと時刻が読めなくなる

「分1〜60をモンスターにする」を額面どおり実装すると、**分を知るために60体を暗記する**必要が生じます。
腕時計の一次機能は時刻表示なので、ここは成立しません。同じ理由で「時0〜12を中ボスに置き換える」も、
それ**だけ**では時が読めません。

### そこで、コンセプトを2つに分解しました

| ご要望 | 実装 | 時刻の可読性 |
|---|---|---|
| 数字をモンスターにしたい | **数字そのものをモンスター化した字形**（0〜9の10体） | ✅ 数字として読める |
| 0〜12を中ボスにしたい | **時ごとに変わる中ボス**が戦闘エリアに立つ（13体） | ✅ 時刻は数字で読む |

- **時刻は数字で読む。** ただしその数字は牙・目・爪を持つ生き物の姿をしている
- **中ボスは1時間ごとに入れ替わる。** 「今の時間の敵」であり、画面の主役

これで「戦闘シーン」の絵作りと「時計として読める」が両立します。
60体という数は、後述の**フェーズ2**で別の形で回収します。

---

## 1. 画面構成

```
y=0    ┌──────────────────────────────────────┐
       │  背景（天候別の戦闘フィールド・既存10枚）│
y=46   │  ╔════════════════════════════════╗  │
       │  ║ 🌤 7/28 TUE      HP ▮▮▮▮▮▮▯▯▯▯ ║  │  ステータス窓
y=92   │  ╚════════════════════════════════╝  │
       │                                      │
y=104  │            ╱▔▔▔▔▔▔╲                  │
       │           │  中ボス  │                │  ← 時(0〜12)で変わる
       │           │  110px  │                │     130 × 110
y=214  │            ╲______╱                  │
       │                                      │
y=226  │        1 0 : 3 8  PM                 │  ← 時刻（モンスター字形）
y=298  │                                      │
y=308  │  ╔════════════════════════════════╗  │
       │  ║ ▶ NIGHT WRAITH あらわれた！     ║  │  メッセージ窓
       │  ╟────────────────────────────────╢  │
       │  ║  L 22°  NOW 26°  H 29°  👣 6,255║  │
y=404  │  ╚════════════════════════════════╝  │
y=450  └──────────────────────────────────────┘
```

上下の窓は現行のものをそのまま使います（角丸の安全領域を通過済み）。
**新しいのは中央の戦闘エリア**と、メッセージ窓の1行目です。

### 座標

```js
topWindow:    { x: 32, y: 46,  w: 326, h: 46 }   // 現行のまま
boss:         { x: 130, y: 104, w: 130, h: 110 } // 新規。中央寄せ
time:         { y: 226, digitW: 52, digitH: 72, colonW: 18, gap: 6 }
bottomWindow: { x: 32, y: 308, w: 326, h: 96 }   // 現行のまま
  encounter:  { x: 70, y: 316, w: 272, h: 28 }   // 「◯◯があらわれた！」
  divider:    { x: 40, y: 352, w: 310, h: 1 }
  temperature / steps: 現行のまま
```

中ボスは背景の**完全可視ゾーン（ローカル y82–150 / y222–298）**をまたぐので、
背景の絵と重なっても成立するよう**透過PNG**にします。

---

## 2. 作ってほしい画像

### A. モンスター字形（10枚）── 最優先

**`art/monster-digits-src/0.png` 〜 `9.png`**

時刻に使う0〜9の数字です。**数字として読めることが絶対条件**で、
モンスター要素は「装飾」であって「骨格」ではありません。

- **キャンバス 104 × 144 px**（実機表示 52×72 の2倍。縮小して使います）
- 背景は**完全透過**
- 数字の骨格は太く単純に。生き物の要素は**輪郭の外側に足す**

### B. 中ボス（13枚）

**`art/boss-src/00.png` 〜 `12.png`**（時刻の「時」に対応）

- **キャンバス 260 × 220 px**（実機表示 130×110 の2倍）
- 背景は**完全透過**
- 正面向き・左右対称・下端接地（足元がキャンバス下辺に接する）
- 13体で**シルエットが被らない**こと

---

## 3. 生成プロンプト

### A. モンスター字形（0〜9）

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

### B. 中ボス（0〜12時）

各時刻ごとに `<HOUR_THEME>` を差し替えます。

```text
An original monster, front-facing, in the style of a 16-bit Japanese console RPG
enemy sprite (Super Famicom era, early 1990s).

Subject: <HOUR_THEME>

Composition:
- Front view, bilaterally symmetrical, standing or floating, facing the viewer.
- The feet or lowest point of the creature touch the bottom edge of the canvas.
- The silhouette must be instantly readable as a distinct shape at 130x110 pixels.
  Prioritize one strong recognizable outline over intricate internal detail.

Style:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO gradients.
- Shading via flat color areas and checkerboard dithering only. 3 to 4 tones.
- A hard black outline 4px thick around the entire silhouette so it separates
  from any background it is placed on.
- Limited palette, at most 16 colors.
- Light source at the upper right.

Framing:
- Canvas 260 x 220 pixels, fully transparent background.
- The creature fills 85 to 95% of the canvas width and height.
- No ground, no cast shadow, no platform, no background of any kind.

Do NOT include: text, letters, numbers, UI, frames, health bars, weapons held by
an off-screen character, humans, or any character from an existing game.
Do not imitate any existing game's monster designs.
```

`<HOUR_THEME>` の割り当て（時間帯の情感に合わせています）:

| 時 | `<HOUR_THEME>` |
|---|---|
| 0 | `a midnight wraith, a hooded floating figure of deep indigo with two cold white eyes and tattered robes trailing into darkness` |
| 1 | `a moth-winged sentinel, a pale nocturnal moth creature with wide dusty wings and a single glowing eye at its center` |
| 2 | `a cave crawler, a low armored insect of dull violet with many legs and a segmented shell` |
| 3 | `a stone gargoyle, a squat grey winged statue with folded wings and cracked granite skin` |
| 4 | `a dawn wisp, a small pale blue flame spirit with a wispy trailing tail and two dark eye sockets` |
| 5 | `a rooster golem, an upright bronze bird construct with a bright red crest and clockwork joints` |
| 6 | `a meadow sprout, a cheerful green plant creature with two broad leaves for arms and a bud head` |
| 7 | `a sunlit lizard, an orange scaled reptile standing upright with a broad frill around its neck` |
| 8 | `a sand scorpion, a tan armored scorpion with raised claws and a curled stinger tail` |
| 9 | `a mirror slime, a rounded translucent blob of pale cyan with a reflective highlight and two dot eyes` |
| 10 | `a storm crow, a large dark bird with ragged wings spread and crackling energy at its wingtips` |
| 11 | `an iron sentry, a boxy armored guardian of dark steel with a single horizontal visor slit` |
| 12 | `a noon guardian, a radiant golden lion-like beast with a flowing mane, the most imposing of the set` |

---

## 4. 容量の見通し（重要）

Zeus CLI はビルド時に**同梱PNGをすべてTGAへ変換**します。TGAは非圧縮なので、
**画素数がそのまま容量**になります。

| アセット | 枚数 | 実機サイズ | TGA換算 |
|---|---|---|---|
| 背景 | 10 | 366×430 | 6.3 MB |
| 中ボス | 13 | 130×110 | 0.7 MB |
| モンスター字形 | 10 | 52×72 | 0.15 MB |
| **合計（概算）** | | | **約 7 MB** |

背景10枚がすでに支配的です。中ボス13体の追加は**+0.7MB**で、比率としては小さい。

いっぽう**分60体を同じサイズで作ると +3.4MB** になり、背景の半分を超えます。
実機のパッケージ上限は未確認なので、**まず13体で作ってビルドし、`.zab` の実サイズを見てから**
拡張を判断してください。

---

## 5. フェーズ分け

### フェーズ1（今回作る）
- モンスター字形 10枚
- 中ボス 13枚
- レイアウト実装（戦闘エリアの追加、メッセージ窓の1行目）

### フェーズ2（フェーズ1が実機で成立したら）
「60体」はここで回収します。案は2つ:

- **案A: 分の下1桁で雑魚を出す**（10体追加）
  中ボスの足元に小さい雑魚が並ぶ。分が変わるたびに入れ替わる。合計23体で済む
- **案B: 中ボスを分でも切り替える**（+47体）
  1〜60を全部作る。最も贅沢だが容量とビルド時間の実測が前提

**先に案Aを勧めます。** 「毎分変わる」体験は案Aでも得られ、容量は1/5で済みます。

---

## 6. 生成後の受け入れ確認

- [ ] 全キャンバスが**完全透過**（背景色が焼き込まれていない）
- [ ] 数字10枚を**単体で見せて第三者が正しく読める**
- [ ] 中ボス13体の**シルエットが互いに被らない**
- [ ] 4pxの黒縁がある（背景に乗せたとき輪郭が消えないため）
- [ ] アンチエイリアスのにじみがない
- [ ] 数字は画面の端に接していない（中ボスは**下辺のみ接地でよい**。仕様どおり）
- [ ] 既存ゲームのモンスターに似ていない

生成できたら `art/monster-digits-src/` と `art/boss-src/` に置き、`npm run sprites` で検査してください。
正規化ツールと組み込みはこちらで実装します。
