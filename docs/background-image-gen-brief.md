# 背景画像 生成指示書（Codex Image Gen 向け）

Pixel Wayfarer Face（Amazfit Bip 6 / 390×450）の**天候別背景10枚**をImage Genで生成するための指示書です。
実装コードは変更不要で差し替えられる前提の仕様になっています。ファイル名・寸法・パレットは厳守してください。

---

## 1. 成果物

`assets/bip-6/images/backgrounds/` に以下10ファイル。**すべて 366 × 430 px / PNG（RGBA, 8bit）**。

| ファイル名 | 用途 | 時間帯 |
|---|---|---|
| `clear_day.png` | 晴れ | 昼 |
| `partly_cloudy_day.png` | 晴れ時々曇り | 昼 |
| `cloudy_day.png` | 曇り | 昼 |
| `rain.png` | 雨 | 昼夜共用 |
| `thunder.png` | 雷雨 | 昼夜共用 |
| `snow.png` | 雪 | 昼夜共用 |
| `fog.png` | 霧・霞・砂塵 | 昼夜共用 |
| `clear_night.png` | 晴れ | 夜 |
| `cloudy_night.png` | 曇り | 夜 |
| `unknown.png` | 天候不明・取得失敗時 | 中立 |

寸法が1pxでも違うと`ui.widget.IMG`側で引き伸ばされ、ピクセルが濁って台無しになります。**必ず366×430ぴったり**にしてください。

---

## 2. 最重要制約：UI遮蔽マップ

背景の上には時刻・気温・コピー・日付・HPが重なります。**「絵として良い」より「UIが読める」が優先**です。
以下は**背景画像ローカル座標**（画面座標から x−12 / y−10 したもの）です。

```
x=0                                                              x=366
y=0    ┌──────────────────────────────────────────────────────────┐
       │ ★ 完全可視ゾーン（66px）── 空・太陽/月・雲の主役エリア   │
y=66   ├──────────────────────────────────────────────────────────┤
       │ ▒ 気温オーバーレイ  背景の可視率 41%   （x6–360）        │
y=120  ├──────────────────────────────────────────────────────────┤
       │ ★ 可視（16px）                                           │
y=136  ├──────────────────────────────────────────────────────────┤
       │ █ コピーパネル  完全不可視・不透明で塗り潰される         │
y=204  ├──────────────────────────────────────────────────────────┤
       │ ★ 可視（10px）                                           │
y=214  ├──────────┬────────────────────────────┬──────────────────┤
       │ ★ 可視   │ 時刻数字が直接乗る（覆いなし）│ ★ 可視         │
       │ x0–75    │ x75–291                    │ x291–366         │
y=279  ├──────────┴────────────────────────────┴──────────────────┤
       │ ★ 可視（10px）                                           │
y=289  ├──────────────────────────────────────────────────────────┤
       │ ▒ 日付オーバーレイ  背景の可視率 43%   （x6–360）        │
y=331  ├──────────────────────────────────────────────────────────┤
       │ ★ 可視（12px）                                           │
y=343  ├──────────────────────────────────────────────────────────┤
       │ ▒ HPオーバーレイ  背景の可視率 35%     （x6–360）        │
y=385  ├──────────────────────────────────────────────────────────┤
       │ ★ 完全可視ゾーン（45px）── 前景の森・草地               │
y=430  └──────────────────────────────────────────────────────────┘
```

### ゾーン別の描き込み方針

- **★ 完全可視ゾーン（y 0–66 / y 385–430）**
  ここが実質的な「見せ場」です。ディテールと魅力を集中させてください。
  上部＝空と太陽/月、下部＝前景の森・草地・川の合流点。

- **時刻バンド（y 214–279）**
  半透明の覆いが**一切ありません**。ここに白（`#F4F3E8`）の巨大数字が黒縁取り付きで直接乗ります。
  → **`#C8C8C8`より明るい色の大面積を置かないこと。** 中明度〜暗めの山肌に留めてください。
  → 左右マージン（x 0–75 / x 291–366）は完全可視なので、右側は城や塔を覗かせる好位置です。
  → ただし **x 298–352 / y 239–269 は12時間表示時にAM/PMテキストが乗る**ため、高輝度を避けてください。

- **▒ 半透明オーバーレイ（気温41% / 日付43% / HP35%）**
  紺（`#031426`）が被って暗くなりますが**完全には隠れません**。
  → 細かい模様・高コントラストな境界線を置くと、透けてノイズに見えます。**なだらかな面**にしてください。
  → 逆に「何も描かない」必要はありません。山や森の大きな面が緩やかに通過するのが理想です。

- **█ コピーパネル（y 136–204）**
  不透明パネルで100%隠れます。作画コストをかける必要はありませんが、
  **上下の構図が不連続にならないよう地形は繋げて**ください（将来パネルを半透明化する余地を残すため）。

---

## 3. アートディレクション（全10枚共通）

### 世界観
オリジナルの8-bit RPG風ファンタジー風景。手前に針葉樹の森、中景に川が谷を下り、
遠景に雪を抱いた三連の山、右手中景の丘に**石造りの城**（旗付きの塔）が建つ。
「冒険の出発地点から城を望む」構図。

### 構図ロック（最重要）
10枚は**実行時に天候で差し替わる**ため、構図がズレると切り替わった瞬間に破綻して見えます。

> **10枚すべてを独立生成してはいけません。**
> `clear_day.png` を**マスター**として1枚仕上げ、残り9枚は
> **img2img / edit機能で構図を固定したまま**、光・色・天候エフェクトのみを差し替えて派生させてください。
> 山の稜線・川の流路・城の位置・木の配置は全10枚で**ピクセル単位で一致**させることが理想です。

### ピクセルアート様式
- **2×2ピクセルグリッド**を基本単位とする（実効解像度183×215相当のチャンキーなドット）
- **アンチエイリアス禁止・グラデーション禁止**。階調は必ず**ディザリング（市松模様）**で表現する
- 光源は**右上固定**。すべての立体に右上ハイライト／左下シャドウを入れる
- 空は**4段の横帯**（上が濃く下が淡い）＋帯の境界をディザで馴染ませる
- 輪郭線は使わない（色の面で形を作る）。ただし城など小さい要素は1pxの明色縁で背景から分離してよい

### パレット
1枚あたり**24色以内**。各テーマの基準色は下表を使ってください（現行実装と色設計を揃えるため）。

| テーマ | 空（上→下 4段） | 遠山 | 中山 | 近山 | 森 | 草地 | 水 |
|---|---|---|---|---|---|---|---|
| clear_day | `#0A5FC1` `#1178D2` `#2794DF` `#52AFE5` | `#7BB6D5` | `#397CB0` | `#174F78` | `#0B4D42` | `#39763B` | `#45A5D0` |
| partly_cloudy_day | `#18588E` `#2C75A8` `#4A91BB` `#70A9C7` | `#91B5C5` | `#4F7893` | `#28536B` | `#17493F` | `#456D3D` | `#5B94AA` |
| cloudy_day | `#384D62` `#4E6477` `#687C8B` `#84939B` | `#97A2A5` | `#65747A` | `#3B5158` | `#294943` | `#52684A` | `#667F87` |
| rain | `#162B42` `#223A50` `#304B60` `#435F70` | `#5E7280` | `#3F5664` | `#243D4B` | `#173B39` | `#344E3D` | `#426D7E` |
| thunder | `#11162D` `#1A2340` `#28324C` `#3B455A` | `#535C69` | `#343F50` | `#1B2938` | `#142D2D` | `#2C3B35` | `#3E5968` |
| snow | `#46677E` `#66879A` `#86A4B0` `#A9BDC1` | `#D9E4E3` | `#91A7AE` | `#596F78` | `#375957` | `#AFC2BE` | `#718F9B` |
| fog | `#56676F` `#6B7B81` `#808E91` `#97A1A0` | `#AAB2AF` | `#7F8D8C` | `#566966` | `#455D56` | `#697A68` | `#788B8C` |
| clear_night | `#020A25` `#07163A` `#0C2452` `#133665` | `#263D69` | `#172D54` | `#0B1E3E` | `#082A2D` | `#183A32` | `#164B69` |
| cloudy_night | `#080F24` `#111D35` `#1B2A43` `#2A3A50` | `#3A4960` | `#25354B` | `#14263A` | `#102D2E` | `#283D35` | `#2B5062` |
| unknown | `#142436` `#203448` `#30475A` `#425C6A` | `#657680` | `#435966` | `#293F4B` | `#1D3D3A` | `#3D5545` | `#496D7A` |

**UI側で使用中のため、背景で大面積に使ってはいけない色：**
`#F4F3E8`（文字）/ `#69A7E8`（最低気温）/ `#E98A4A`（最高気温）/ `#62B84A`（HP緑）/ `#C9A85C`（枠の金）

### 権利上の禁止事項
既存ゲームのロゴ・キャラクター・UI・タイルセット・フォントに**似せないこと**。
特定タイトルを想起させる固有デザイン（配色の丸写し、象徴的な城の形状など）は避け、
オリジナルの構図として成立させてください。文字・数字・記号は**背景に一切描かないこと**。

---

## 4. テーマ別プロンプト

まず以下の**共通ベース**を全プロンプトの先頭に置いてください（英語推奨）。

```
Original 8-bit RPG fantasy landscape, chunky pixel art on a strict 2x2 pixel grid,
hard-edged dithered shading only, NO anti-aliasing, NO gradients, NO outlines,
limited palette of 24 colors or fewer, light source fixed at upper right.
Composition: coniferous pine forest in the foreground, a river flowing down a valley
through the middle ground, three snow-capped mountain peaks in the far background,
and a small stone castle with a flagged tower on a hill at the middle-right.
Sky rendered as four horizontal bands, darkest at top, blended with checkerboard dithering.
Vertical composition. No text, no numbers, no symbols, no UI elements, no characters.
Keep the middle horizontal band (roughly 50-65% height) in mid-to-dark tones only.
```

各テーマの差分：

| ファイル | 追加プロンプト |
|---|---|
| `clear_day` | `Bright clear midday. Vivid blue sky. A radiant pixel sun in the upper LEFT area with a dithered glow halo and four cross rays. Sunlit green grass in the foreground.` |
| `partly_cloudy_day` | `Softer daylight, slightly hazy blue sky. Two or three chunky white cumulus clouds in the upper area with dithered white highlights on top and grey shading underneath.` |
| `cloudy_day` | `Fully overcast grey-blue daylight. Flat diffuse light, low contrast, no visible sun. Heavy grey cloud cover filling the upper band. Muted desaturated greens.` |
| `rain` | `Overcast rainy scene, dark blue-grey. Diagonal pixel rain streaks in light blue (2px wide) evenly scattered across the whole image. Dark storm clouds above. The castle windows glow warm amber. Wet, darkened ground.` |
| `thunder` | `Violent night thunderstorm, very dark navy. Diagonal rain streaks. A bright jagged yellow lightning bolt striking down from the clouds in the upper middle area. Dark bruised storm clouds. Castle windows glow amber.` |
| `snow` | `Cold snowy scene, pale blue-grey. Chunky white snowflake pixels (4x4) scattered evenly. Snow blanketing the grass, forest and mountains. Pine trees dusted white. Frozen pale river.` |
| `fog` | `Thick fog, desaturated grey-green. Horizontal translucent fog bands sweeping across the mountains and forest at several heights. Very low contrast, distant peaks barely visible, flattened depth.` |
| `clear_night` | `Clear night, very dark navy sky. A crescent moon in the upper RIGHT with a dithered glow halo and small craters. Scattered white star pixels. Castle windows glow warm amber, plus two small braziers flanking the castle gate. Deep dark forest.` |
| `cloudy_night` | `Overcast night, dark slate blue. A crescent moon in the upper right partially veiled by dark grey clouds. Few stars. Castle windows glow amber with braziers at the gate. Very dark forest silhouette.` |
| `unknown` | `Neutral overcast twilight, ambiguous time of day. Balanced blue-grey tones, no sun, no moon, no weather effects. Calm and readable. Deliberately understated.` |

---

## 5. 生成後の必須後処理

Image Genの出力はそのままでは**必ず**アンチエイリアスと色数過多を含み、Bip 6の実機では汚く見えます。
以下を必ず通してください。

1. **高解像度で生成**（例 1024×1024 以上）してから
2. **366×430にクロップ／リサイズ**（アスペクト比 366:430 ≈ 0.851 に合わせてクロップ）
3. **2×2ピクセルグリッドに強制**：183×215へボックス縮小 → 最近傍で×2拡大
4. **パレット量子化**：上表の基準色＋派生を含む24色以内に減色（ディザなしの最近色マッピング）
5. **検証**：色数・寸法・時刻バンドの最大輝度をチェック

手順3〜5を一括で行うNodeスクリプト例（`pngjs`は既にdevDependenciesにあります）。
このプロジェクトのルートに置いて実行してください（モジュール解決のため）。

```js
// tools/normalize-background.mjs  ―― 使い方: node tools/normalize-background.mjs in.png out.png [色数]
import fs from 'node:fs'
import { PNG } from 'pngjs'

const [, , input, output, maxColorsArg] = process.argv
const MAX_COLORS = Number(maxColorsArg) || 24
const src = PNG.sync.read(fs.readFileSync(input))
const W = 366, H = 430, GRID = 2
const bw = W / GRID, bh = H / GRID          // 183 × 215
const out = new PNG({ width: W, height: H })

// --- 手順3: ボックス縮小 → 最近傍×2拡大（2×2グリッドへ強制） ---
const blocks = []
for (let by = 0; by < bh; by += 1) {
  for (let bx = 0; bx < bw; bx += 1) {
    const x0 = Math.floor((bx / bw) * src.width)
    const x1 = Math.max(x0 + 1, Math.floor(((bx + 1) / bw) * src.width))
    const y0 = Math.floor((by / bh) * src.height)
    const y1 = Math.max(y0 + 1, Math.floor(((by + 1) / bh) * src.height))
    let r = 0, g = 0, b = 0, n = 0
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const i = (src.width * y + x) << 2
        r += src.data[i]; g += src.data[i + 1]; b += src.data[i + 2]; n += 1
      }
    }
    blocks.push([Math.round(r / n), Math.round(g / n), Math.round(b / n)])
  }
}

// --- 手順4: 減色（出現頻度上位N色を代表色にして最近色マッピング） ---
const histogram = new Map()
for (const [r, g, b] of blocks) {
  // 5bitに粗く丸めて頻度を集計（近い色をまとめる）
  const key = `${r >> 3},${g >> 3},${b >> 3}`
  const entry = histogram.get(key)
  if (entry) { entry.count += 1; entry.r += r; entry.g += g; entry.b += b }
  else histogram.set(key, { count: 1, r, g, b })
}
const palette = [...histogram.values()]
  .sort((a, b) => b.count - a.count)
  .slice(0, MAX_COLORS)
  .map((e) => [Math.round(e.r / e.count), Math.round(e.g / e.count), Math.round(e.b / e.count)])

function nearest([r, g, b]) {
  let best = palette[0]
  let bestDistance = Infinity
  for (const candidate of palette) {
    const dr = r - candidate[0], dg = g - candidate[1], db = b - candidate[2]
    const distance = dr * dr + dg * dg + db * db
    if (distance < bestDistance) { bestDistance = distance; best = candidate }
  }
  return best
}

blocks.forEach((raw, index) => {
  const [r, g, b] = nearest(raw)
  const bx = index % bw
  const by = Math.floor(index / bw)
  for (let dy = 0; dy < GRID; dy += 1) {
    for (let dx = 0; dx < GRID; dx += 1) {
      const o = (W * (by * GRID + dy) + (bx * GRID + dx)) << 2
      out.data[o] = r; out.data[o + 1] = g; out.data[o + 2] = b; out.data[o + 3] = 255
    }
  }
})
fs.writeFileSync(output, PNG.sync.write(out, { colorType: 6 }))

// --- 手順5: 検証レポート ---
const colors = new Set()
let maxLumaInTimeBand = 0
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const i = (W * y + x) << 2
    colors.add(`${out.data[i]},${out.data[i + 1]},${out.data[i + 2]}`)
    if (y >= 214 && y < 279 && x >= 75 && x < 291) {
      const luma = 0.299 * out.data[i] + 0.587 * out.data[i + 1] + 0.114 * out.data[i + 2]
      if (luma > maxLumaInTimeBand) maxLumaInTimeBand = luma
    }
  }
}
console.log(`${output}: ${W}x${H}, 色数 ${colors.size}, 時刻バンド最大輝度 ${Math.round(maxLumaInTimeBand)}`)
if (colors.size > MAX_COLORS) console.warn('  ⚠ 色数が上限を超過')
if (maxLumaInTimeBand > 200) console.warn('  ⚠ 時刻バンドが明るすぎ → 白文字が読めない恐れ')
```

**注意：** このスクリプトのボックス縮小は、元画像のディザリング（市松模様）を平均化して**潰します**。
Image Gen出力のアンチエイリアスを除去する目的では正しい挙動ですが、
「ディザの質感」自体はプロンプト側で2×2グリッドに乗る粗さで描かせるか、
仕上げに手作業／別途ディザ処理で入れ直す必要があります。

---

## 6. 受け入れ基準

- [ ] 10ファイルすべて **366×430 px**、PNG（RGBA）
- [ ] 1枚あたり **24色以内**
- [ ] アンチエイリアス由来の中間色が**ない**（2×2グリッドが崩れていない）
- [ ] 10枚の**構図が一致**（山の稜線・川・城の位置が揃っている）
- [ ] 時刻バンド（y 214–279 / x 75–291）の**最大輝度が200以下**
- [ ] 半透明オーバーレイ領域（y 66–120 / 289–331 / 343–385）が**低ディテール**
- [ ] 背景に文字・数字・記号が**含まれていない**
- [ ] 既存ゲームの意匠に**似ていない**
- [ ] `docs/preview-*.png` を再生成して実際の重なりを目視確認済み

---

## 7. 実装側の統合作業（画像を入れる前に必須）

⚠ **現状のままPNGを置いても、`npm run assets` を実行した瞬間に上書き消滅します。**
`tools/generate-assets.mjs` の以下の行が背景を毎回コード生成で書き出しているためです。

```js
// tools/generate-assets.mjs:541
Object.keys(PALETTES).forEach((theme) => {
  writePng(path.join(ASSET_ROOT, 'backgrounds', `${theme}.png`), drawWorld(theme))
})
```

差し替えにあたって以下の対応が必要です。

1. **上記の背景書き出しループを削除**（またはフラグで無効化）し、背景はコード生成の管轄外にする
2. Image Gen由来の元データは `art/backgrounds-src/` などに保管し、後処理済みPNGを
   `assets/bip-6/images/backgrounds/` へ配置するフローにする
3. `preview()` は現在 `drawWorld(theme)` の**戻り値を直接blit**しているため、
   実ファイル（`assets/bip-6/images/backgrounds/*.png`）を**読み込んでblitする**よう変更する
   （でないとプレビューと実機表示が乖離します）
4. `drawWorld()` と `PALETTES` は不要になるが、**当面は残す**ことを推奨
   （生成画像が実機で不満な場合のフォールバック、およびパレット基準表として）

---

## 8. ライセンス・ストア申告上の注意（要確認）

現在の `README.md` には次の記載があります。

> 生成AI画像、既存ゲームのロゴ、キャラクター、UI画像、公式フォントは使用していません。

Image Gen由来の背景を採用すると**この記述は事実と異なることになります**。以下の対応が必要です。

- `README.md` の「アセットとライセンス」節を、生成AI画像の使用を明記する内容へ**修正する**
- 使用するImage Genサービスの**利用規約上、商用配布が許諾されているか**を確認する
  （出力物の権利帰属・商用利用条項）
- Zepp Console提出時の「独自制作物の申告」について、**AI生成アセットの取り扱い方針**を
  Zepp側のポリシーで確認する（申告内容を誤ると審査差し戻し・公開停止のリスクがあります）

これは法的助言ではありません。公開前に一次情報（各サービスの規約・Zeppの提出ガイドライン）で
必ず確認してください。
