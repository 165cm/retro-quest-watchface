# 背景画像 生成指示書（Codex Image Gen 向け）

Pixel Wayfarer Face（Amazfit Bip 6 / 390×450）の**天候別背景10枚**をImage Genで生成するための指示書です。
受け入れ側の実装（§7）は対応済みなので、生成した画像は `art/backgrounds-src/` に置いて
`npm run normalize && npm run assets` を実行すればそのまま反映されます。
ファイル名・寸法・UI遮蔽マップ（§2）は厳守してください。

目標とする画風は**クラシックな16-bit和製RPGのフィールド画**です（詳細は§3）。

> 📋 **そのまま貼れる10枚分の完成プロンプトは [背景画像 生成プロンプト集](background-prompts.md) にあります。**
> この指示書は「なぜその制約なのか」の根拠、プロンプト集は「実際に投げる文面」です。

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

なお最上段に表示される**天候アイコン**（34×34、`assets/bip-6/images/weather/*.png`）は
`tools/generate-assets.mjs`がコード生成する別アセットで、**この指示書の対象外**です。
天候はアイコンが明示するため、背景側に太陽・月を描く必要はありません（§2参照）。

---

## 2. 最重要制約：UI遮蔽マップ

背景の上には時刻・日付・HP・コピー・気温が重なります。**「絵として良い」より「UIが読める」が優先**です。
以下は**背景画像ローカル座標**（画面座標から x−12 / y−10 したもの）です。

```
x=0                                                              x=366
y=0    ┌──────────────────────────────────────────────────────────┐
y=2    │ ▒ トップバー（天候アイコン/日付/HP）  背景の可視率 53%    │
y=64   ├──────────────────────────────────────────────────────────┤
       │                                                          │
       │ ★ 完全可視（76px）── ここが最大の見せ場                  │
       │                                                          │
y=140  ├──────┬────────────────────────────────────────┬──────────┤
       │ ★可視│ 時刻数字が直接乗る（覆いなし）           │ ★可視    │
       │ x0–31│ x31–335                                │ x335–366 │
y=212  ├──────┴────────────────────────────────────────┴──────────┤
y=218  │ ▒ コピー（サブタイトル）  背景の可視率 65%                │
y=258  ├──────────────────────────────────────────────────────────┤
       │                                                          │
       │ ★ 完全可視（98px）── 2つめの見せ場                       │
       │                                                          │
y=356  ├──────────────────────────────────────────────────────────┤
       │ ▒ 気温3列 + 歩数  背景の可視率 41%                        │
y=418  ├──────────────────────────────────────────────────────────┤
       │ ★ 完全可視（12px）                                       │
y=430  └──────────────────────────────────────────────────────────┘
```

### このレイアウトの性質（重要）

**大きなパネルを廃し、背景が主役として見えるレイアウトです。**
覆いがあるのは上下の帯とコピーの薄い暗幕だけで、
**y64–140 と y258–356 の合計174pxは完全に開いています。**

したがって：

- **地平線は y 150–210 あたり**に置いてください。時刻の左右マージンに稜線が覗きます。
- **中景（森・川・城）は y 258–356 に主役を置いてください。** ここが最も広く見えます。
- **城は右側（x 280–366）**。時刻の右マージンとその下の開放部で大きく見えます。
- **前景の草地は y 356 以降**。下段の暗幕越しでも41%見えます。
- 細部を描き込む価値のある構図です（以前の版と違い、隠れる面積が小さくなりました）。

### ゾーン別の描き込み方針

- **▒ トップバー（y 2–64 / 可視率53%）**
  天候アイコン・日付・HPゲージが乗ります。
  → **太陽・月をここに描かないでください。** 天候アイコンと二重になります。
  → 空として成立させつつ、**平坦で低コントラスト**に保ってください。
  → 夜は星を散らすのは可（小さな点なので文字を邪魔しません）。

- **時刻バンド（y 140–212 / x 31–335）**
  半透明の覆いが**一切ありません**。白（`#F4F3E8`）の巨大数字が黒縁取り＋影付きで直接乗ります。
  → **明部（輝度200超）が面積の5%以下**（`npm run normalize` が自動判定）。
  → **白い雪冠・明るい雲をこの矩形に入れないこと。**
  → 左右マージン（x 0–31 / x 335–366）は完全可視。稜線や城を覗かせる好位置です。

- **▒ コピー（y 218–258 / 可視率65%）**
  時刻のサブタイトルが乗ります。65%透けるので、**なだらかな面**を通してください。

- **▒ 下段（y 356–418 / 可視率41%）**
  気温3列と歩数が乗ります。前景の草地が透けて見える想定です。

- **★ 完全可視（y 64–140 / 212–218 / 258–356 / 418–430）**
  合計約190px。**ここに絵の見せ場を集中させてください。**

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
- 0-15%: sky only, flat horizontal bands blended with checkerboard dithering.
  Keep it plain and low-contrast. NO sun and NO moon anywhere.
- 15-33%: FULLY VISIBLE. Distant snow-capped mountains softened by aerial
  perspective. This is the primary showcase — put your best detail here.
- 33-49%: CRITICAL. Must stay mid-tone to dark; the clock digits sit directly on it.
- 49-83%: FULLY VISIBLE. Pine forest, a river winding down a valley, and on the
  RIGHT side (70-100% width) a small original stone castle with a flagged tower.
- 83-100%: foreground meadow with a winding dirt path.

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

Readability constraint (critical):
- The horizontal band from 33% to 49% of the image height must be MID-TO-DARK only.
  Nothing brighter than mid-grey there. No bright snow caps, no bright clouds,
  no sun, no high-contrast detail inside that band.
- Most of the image will be covered by translucent UI panels, so favor large calm
  shapes and broad tonal areas over fine intricate detail.
```

> 「Readability constraint」は§2の**時刻バンド（y 140–212 = 高さの33〜49%）**に対応します。
> ここが明るいと白い時刻数字が埋もれます。生成時に効きにくい場合は、
> 後処理で該当帯を暗く落とす方が確実です（§6の輝度チェック参照）。

各テーマの差分：

| ファイル | 追加プロンプト |
|---|---|
| `clear_day` | `Bright clear midday, no sun visible. Vivid saturated blue sky band at the very top. Lush sunlit emerald meadow and forest. Snow caps on the distant peaks, placed in the fully visible 15-33% band. The most colorful and inviting of the set — this is the master image.` |
| `partly_cloudy_day` | `Softer daylight, slightly hazier blue sky. More and larger cumulus clouds drifting across the upper area, casting subtle shade patches on the meadow. Slightly muted greens.` |
| `cloudy_day` | `Fully overcast grey-blue daylight. Flat diffuse light, low contrast, no visible sun. Heavy grey cloud cover filling the upper band. Desaturated muted greens, subdued mountains.` |
| `rain` | `Overcast rainy scene, dark blue-grey and moody. Diagonal light-blue rain streaks evenly scattered across the whole image. Dark low storm clouds. The castle windows glow warm amber against the gloom. Wet darkened meadow, swollen river.` |
| `thunder` | `Violent night thunderstorm, very dark navy. Diagonal rain streaks. One bright jagged yellow lightning bolt striking down from the clouds in the upper middle area, faintly illuminating the peaks. Bruised dark storm clouds. Castle windows glow amber.` |
| `snow` | `Cold quiet snowfall, pale blue-grey. White snowflake pixels scattered evenly. Snow blanketing the meadow, forest canopy and mountains. Pine trees dusted white. Pale frozen river. IMPORTANT: keep the 33-49% height band mid-to-dark — do not let bright snow fill it.` |
| `fog` | `Thick fog, desaturated grey-green. Horizontal translucent fog bands sweeping across the mountains and forest at several heights. Very low contrast, distant peaks barely visible, depth flattened, mysterious.` |
| `clear_night` | `Clear night, deep dark navy sky, NO moon. Scattered small white star pixels in the sky band. The castle windows glow warm amber, with two small braziers flanking its gate. Deep dark forest silhouette, river catching pale highlights.` |
| `cloudy_night` | `Overcast night, dark slate blue, NO moon. Drifting dark grey clouds, few visible stars. Castle windows glow amber with braziers at the gate. Very dark forest silhouette.` |
| `unknown` | `Neutral overcast twilight, ambiguous time of day. Balanced blue-grey tones, no sun, no moon, no weather effects at all. Calm, understated, deliberately unremarkable — this is the fallback when weather data is unavailable.` |

---

## 5. 生成後の必須後処理

Image Genの出力はそのままでは**必ず**アンチエイリアスと色数過多を含み、Bip 6の実機では汚く見えます。
以下を必ず通してください。

1. **高解像度で生成**（例 1024×1024 以上）してから
2. 縦横比は気にしなくてよい。`npm run normalize` が **366:430 に合わせて中央を切り出す**
   （`--fit cover` が既定。切り出した範囲はログに出る。`--fit stretch` で旧来の引き伸ばしも可能）
3. **ピクセルグリッドに整列**：`--grid 1`（このスタイルの既定）で366×430へ整える。
   ドットが甘い・にじんでいる出力の場合のみ `--grid 2` で粗く締め直す
4. **パレット量子化**：64色以内に減色（ディザなしの最近色マッピング）
5. **検証**：色数・寸法・時刻バンドの最大輝度をチェック

手順3〜5は `tools/normalize-background.mjs` に実装済みです（`pngjs`は既にdevDependenciesにあります）。

`art/backgrounds-src/` の全PNGをまとめて変換する場合:

```sh
npm run normalize
```

1枚だけ指定する場合:

```sh
node tools/normalize-background.mjs art/backgrounds-src/clear_day.png assets/bip-6/images/backgrounds/clear_day.png
```

オプション（既定は `--grid 1 --colors 64 --fit cover`）:

```sh
node tools/normalize-background.mjs in.png out.png --grid 2 --colors 32 --fit stretch
```

実行すると1枚ごとに検証結果が出力されます。

```
clear_day.png: 366x430, grid 1, 色数 54, 時刻バンド 平均輝度 126 / 明部 0.0%
snow.png: 366x430, grid 1, 色数 62, 時刻バンド 平均輝度 160 / 明部 2.4%
```

**注意1：** `--grid 2` 以上を指定すると、ボックス平均によって元画像のディザリング（市松模様）が
平均化され**潰れます**。Image Gen出力のアンチエイリアス除去には有効ですが、
リファレンスのような繊細な階調は失われます。**このスタイルでは `--grid 1`（既定）を使ってください。**

**注意2：** 時刻バンドの警告が出た場合、プロンプトの再試行より
**該当帯（ローカル y140–212）を後処理で暗く落とす**方が確実です。
`snow` と `partly_cloudy_day` は明部が増えやすいので注意してください。

---

## 6. 受け入れ基準

`npm run normalize` が自動判定する項目：

- [ ] 10ファイルすべて **366×430 px**、PNG（RGBA）
- [ ] 1枚あたり **64色以内**
- [ ] 時刻バンド（y 140–212 / x 31–335）の**明部（輝度200超）が面積の5%以下**
      ※ 星や雪の粒のような小さな明点は許容されます。判定は面積比です。

目視で確認する項目：

- [ ] **輪郭がハードエッジ**（アンチエイリアスのにじみ・ぼけがない）
- [ ] 階調が**バンディング＋ディザ**で表現されている（滑らかな連続グラデでない）
- [ ] **空気遠近法**が効いていて奥行きが感じられる
- [ ] 10枚の**構図が一致**（山の稜線・川・城の位置が揃っている）
- [ ] 半透明領域（y 2–64 / 218–258 / 356–418）が**低ディテール**
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

1. 生成した元画像をテーマ名で `art/backgrounds-src/` へ置く
   （`clear_day.png` 〜 `unknown.png` の10枚）
2. 正規化して `assets/` へ出力する（寸法・色数・輝度を検証）
3. プレビューを再生成してUIとの重なりを目視確認する
4. `docs/preview-390x450.png` / `-night` / `-rain` を開いて確認する

2〜3で実行するコマンドはこの2行です。

```sh
npm run normalize
npm run assets
```

1枚だけ試す場合：

```sh
node tools/normalize-background.mjs art/backgrounds-src/clear_day.png assets/bip-6/images/backgrounds/clear_day.png
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
