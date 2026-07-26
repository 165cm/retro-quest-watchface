# 背景画像 生成指示書（Codex Image Gen 向け）

Pixel Wayfarer Face（Amazfit Bip 6 / 390×450）の**天候別背景10枚**をImage Genで生成するための指示書です。
受け入れ側の実装（§7）は対応済みなので、生成した画像は `art/backgrounds-src/` に置いて
`npm run normalize && npm run assets` を実行すればそのまま反映されます。
ファイル名・寸法・UI遮蔽マップ（§2）は厳守してください。

目標とする画風は**クラシックな16-bit和製RPGのフィールド画**です（詳細は§3）。

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

### 目標イメージ
**クラシックな16-bit和製RPGのフィールド／ワールドマップ画。**
「主人公が旅立って、丘の上から次の街と城を見晴らしている」ような、**牧歌的で広がりのある風景**。
ドット絵でありながら、空気遠近法（遠景ほど淡く青みがかる）で奥行きを感じさせる、
やや絵画的・情感のあるピクセルアートを目指します。

> **プロンプトに特定タイトル名（Dragon Quest 等）を書かないでください。**
> 既存作品の意匠を直接再現させると権利上のリスクが生じ、§8の申告とも矛盾します。
> 「classic 16-bit Japanese RPG overworld」のような**一般名詞での様式指定**に留めてください。

### 世界観
オリジナルのファンタジー風景。
**前景**＝なだらかな緑の草原（明暗のパッチで起伏を表現）、
**中景**＝密度のある針葉樹の森と、谷を蛇行して下る川、
**遠景**＝雪を抱いた連峰（空気遠近法で淡く霞む）、
**右手中景の丘**＝石造りの城（旗を掲げた塔、夜と雨天は窓が琥珀色に灯る）。

### 構図ロック（最重要）
10枚は**実行時に天候で差し替わる**ため、構図がズレると切り替わった瞬間に破綻して見えます。

> **10枚すべてを独立生成してはいけません。**
> `clear_day.png` を**マスター**として1枚仕上げ、残り9枚は
> **img2img / edit機能で構図を固定したまま**、光・色・天候エフェクトのみを差し替えて派生させてください。
> 山の稜線・川の流路・城の位置・木の配置は全10枚で**ピクセル単位で一致**させることが理想です。

### ピクセルアート様式
リファレンス画像に合わせ、**当初想定していた8-bit風のチャンキーなドットより解像度を上げます。**

- **1×1ピクセルグリッド**（366×430のネイティブ解像度でドットが立つ）。
  木や城の窓など小さな要素が判別できる密度が必要なため、2×2の粗いグリッドは使いません。
- **アンチエイリアス禁止。** 輪郭に中間色のにじみを作らないこと。境界は必ずハードエッジ。
- **滑らかなグラデーション禁止。** 空や霞のような階調は、
  **横帯（バンディング）＋境界のディザリング（市松模様）**で表現します。補間による連続グラデは不可。
- **空気遠近法を使う。** 遠景の山は明度を上げ・彩度を落とし・青側へ寄せる。
  近景の森は暗く濃く。これが「奥行きのあるRPGフィールド」感の核になります。
- 光源は**右上固定**。立体には右上ハイライト／左下シャドウ。
- 輪郭線（黒フチ）は使わない。色面で形を作る。
  ただし城のように小さく重要な要素は、1pxの明色縁で背景から分離してよい。

### パレット
1枚あたり**64色以内**（リファレンスの階調感を出すため、当初の24色から緩和）。
下表は**基準色（アンカー）**です。この色を軸に、ハイライト・シャドウ・ディザ用の中間色を派生させてください。
テーマ間の色温度の一貫性を保つために使います。

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
Detailed pixel art landscape in the style of a classic 16-bit Japanese RPG overworld.
Sweeping pastoral fantasy vista seen from a hilltop.

Composition (vertical, portrait):
- Foreground (bottom third): rolling green meadow, undulation shown with patches of
  lighter and darker green, a winding dirt path.
- Middle ground: dense coniferous pine forest, and a river meandering down a valley.
- Far background: a range of snow-capped mountain peaks, softened by aerial perspective.
- Middle-right, on a hill: a small original stone castle with a flagged tower.
- Sky: upper third, rendered as horizontal bands blended with checkerboard dithering.

Style rules (strict):
- Hard-edged pixel art at native 1:1 pixel scale. NO anti-aliasing, NO blurring,
  NO soft edges, NO smooth gradients. Tonal transitions ONLY via banding plus
  checkerboard dithering.
- Aerial perspective: distant mountains lighter, desaturated and shifted toward blue;
  foreground forest dark and saturated.
- Light source fixed at the upper right. Highlights upper-right, shadows lower-left.
- No black outlines. Form is defined by color areas.
- Limited palette, 64 colors maximum.

Absolute exclusions:
- NO text, NO numbers, NO letters, NO symbols, NO UI elements, NO HUD, NO frames.
- NO characters, people, creatures or monsters.
- Do NOT imitate any existing game's logo, characters, tilesets or specific artwork.

Readability constraint:
- Keep the horizontal band at roughly 47-65% of the image height in MID-TO-DARK tones
  only. Nothing brighter than mid-grey there. No bright snow, no bright sky, no
  high-contrast detail in that band.
```

> 最後の「Readability constraint」は§2の**時刻バンド**に対応します。ここが明るいと白い時刻数字が
> 埋もれます。生成時に効きにくい場合は、後処理で該当帯を暗く落とす方が確実です（§6の輝度チェック参照）。

各テーマの差分：

| ファイル | 追加プロンプト |
|---|---|
| `clear_day` | `Bright clear midday. Vivid saturated blue sky. Fluffy white cumulus clouds with dithered highlights on top and grey undersides. Lush sunlit emerald meadow in the foreground. Crisp white snow caps on the distant peaks. The most colorful and inviting of the set — this is the master image.` |
| `partly_cloudy_day` | `Softer daylight, slightly hazier blue sky. More and larger cumulus clouds drifting across the upper area, casting subtle shade patches on the meadow. Slightly muted greens.` |
| `cloudy_day` | `Fully overcast grey-blue daylight. Flat diffuse light, low contrast, no visible sun. Heavy grey cloud cover filling the upper band. Desaturated muted greens, subdued mountains.` |
| `rain` | `Overcast rainy scene, dark blue-grey and moody. Diagonal light-blue rain streaks evenly scattered across the whole image. Dark low storm clouds. The castle windows glow warm amber against the gloom. Wet darkened meadow, swollen river.` |
| `thunder` | `Violent night thunderstorm, very dark navy. Diagonal rain streaks. One bright jagged yellow lightning bolt striking down from the clouds in the upper middle area, faintly illuminating the peaks. Bruised dark storm clouds. Castle windows glow amber.` |
| `snow` | `Cold quiet snowfall, pale blue-grey. White snowflake pixels scattered evenly. Snow blanketing the meadow, forest canopy and mountains. Pine trees dusted white. Pale frozen river. IMPORTANT: keep the 47-65% height band mid-to-dark — do not let bright snow fill it.` |
| `fog` | `Thick fog, desaturated grey-green. Horizontal translucent fog bands sweeping across the mountains and forest at several heights. Very low contrast, distant peaks barely visible, depth flattened, mysterious.` |
| `clear_night` | `Clear night, deep dark navy sky. A crescent moon in the upper right with a dithered glow halo and small craters. Scattered white star pixels. The castle windows glow warm amber, with two small braziers flanking its gate. Deep dark forest silhouette, moonlit river catching pale highlights.` |
| `cloudy_night` | `Overcast night, dark slate blue. A crescent moon in the upper right partially veiled by drifting dark grey clouds. Few visible stars. Castle windows glow amber with braziers at the gate. Very dark forest silhouette.` |
| `unknown` | `Neutral overcast twilight, ambiguous time of day. Balanced blue-grey tones, no sun, no moon, no weather effects at all. Calm, understated, deliberately unremarkable — this is the fallback when weather data is unavailable.` |

---

## 5. 生成後の必須後処理

Image Genの出力はそのままでは**必ず**アンチエイリアスと色数過多を含み、Bip 6の実機では汚く見えます。
以下を必ず通してください。

1. **高解像度で生成**（例 1024×1024 以上）してから
2. **366×430にクロップ／リサイズ**（アスペクト比 366:430 ≈ 0.851 に合わせてクロップ）
3. **ピクセルグリッドに整列**：`--grid 1`（このスタイルの既定）で366×430へ整える。
   ドットが甘い・にじんでいる出力の場合のみ `--grid 2` で粗く締め直す
4. **パレット量子化**：64色以内に減色（ディザなしの最近色マッピング）
5. **検証**：色数・寸法・時刻バンドの最大輝度をチェック

手順3〜5は `tools/normalize-background.mjs` に実装済みです（`pngjs`は既にdevDependenciesにあります）。

```sh
# 単体
node tools/normalize-background.mjs art/backgrounds-src/clear_day.png \
  assets/bip-6/images/backgrounds/clear_day.png

# グリッドと色数を指定（既定は --grid 1 --colors 64）
node tools/normalize-background.mjs in.png out.png --grid 2 --colors 32

# 10枚まとめて（art/backgrounds-src/ の全PNGを変換）
npm run normalize
```

実行すると1枚ごとに検証結果が出力されます。

```
clear_day.png: 366x430, grid 1, 色数 61, 時刻バンド最大輝度 168
snow.png: 366x430, grid 1, 色数 58, 時刻バンド最大輝度 242
  ⚠ 時刻バンドが明るすぎ → 白文字が読めない恐れ
```

**注意1：** `--grid 2` 以上を指定すると、ボックス平均によって元画像のディザリング（市松模様）が
平均化され**潰れます**。Image Gen出力のアンチエイリアス除去には有効ですが、
リファレンスのような繊細な階調は失われます。**このスタイルでは `--grid 1`（既定）を使ってください。**

**注意2：** 時刻バンドの輝度警告が出た場合、プロンプトの再試行より
**該当帯（y214–279）を後処理で暗く落とす**方が確実です。`snow` は特に出やすいので注意してください。
---

## 6. 受け入れ基準

`npm run normalize` が自動判定する項目：

- [ ] 10ファイルすべて **366×430 px**、PNG（RGBA）
- [ ] 1枚あたり **64色以内**
- [ ] 時刻バンド（y 214–279 / x 75–291）の**最大輝度が200以下**

目視で確認する項目：

- [ ] **輪郭がハードエッジ**（アンチエイリアスのにじみ・ぼけがない）
- [ ] 階調が**バンディング＋ディザ**で表現されている（滑らかな連続グラデでない）
- [ ] **空気遠近法**が効いていて奥行きが感じられる
- [ ] 10枚の**構図が一致**（山の稜線・川・城の位置が揃っている）
- [ ] 半透明オーバーレイ領域（y 66–120 / 289–331 / 343–385）が**低ディテール**
- [ ] 背景に文字・数字・記号が**含まれていない**
- [ ] 人物・モンスターが**含まれていない**
- [ ] 既存ゲームの意匠に**似ていない**
- [ ] `npm run assets` で `docs/preview-*.png` を再生成し、UIとの重なりを目視確認済み

---

## 7. 実装側の統合作業（対応済み）

**この節の統合作業は完了しています。** 生成した画像をそのまま流し込めます。

対応内容：

1. `tools/generate-assets.mjs` の背景書き出しループを**既定で無効化**しました。
   `npm run assets` は背景PNGを上書きしません。
   コード描画の背景へ戻す場合のみ `npm run assets -- --with-backgrounds` を使います。
2. 元画像置き場として `art/backgrounds-src/` を用意しました（パッケージ対象外）。
3. `preview()` は `assets/bip-6/images/backgrounds/*.png` の**実ファイルを読み込む**ように変更しました。
   プレビューと実機表示が一致します。ファイルが無い／寸法が違う場合は
   警告を出して `drawWorld()` にフォールバックします。
4. `drawWorld()` と `PALETTES` はフォールバック兼パレット基準として**残してあります**。
5. 正規化ツール `tools/normalize-background.mjs` と `npm run normalize` を追加しました。

### 差し替え手順

```sh
# 1. 生成した元画像をテーマ名で置く
#    art/backgrounds-src/clear_day.png ... unknown.png（10枚）

# 2. 正規化して assets/ へ出力（寸法・色数・輝度を検証）
npm run normalize

# 3. プレビューを再生成してUIとの重なりを目視確認
npm run assets

# 4. docs/preview-390x450.png / -night / -rain を確認
```

1枚だけ試す場合：

```sh
node tools/normalize-background.mjs art/backgrounds-src/clear_day.png \
  assets/bip-6/images/backgrounds/clear_day.png
npm run assets
```

差し替え後、`assets/bip-6/images/backgrounds/*.png`（正規化済み）は必ずコミットしてください。
元画像をコミットするかどうかの判断は `art/backgrounds-src/README.md` を参照。

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
