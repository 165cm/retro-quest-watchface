# 背景画像 生成プロンプト集（10枚・コピペ用）

`docs/background-image-gen-brief.md` の仕様を、**そのまま貼れる完成プロンプト**に落としたものです。
各プロンプトは独立して成立するので、1つずつコピーして画像生成に投げてください。

---

## 使い方

### 1. 生成の順番

**`01. clear_day` を最初に作り、これをマスターにします。**
残り9枚は、マスターを **img2img / 画像編集モード**に入力して、
「構図を維持したまま天候と光だけ変える」形で派生させてください。
10枚を独立生成すると構図がズレ、端末で切り替わった瞬間に破綻して見えます。

img2img が使えない場合は各プロンプトを単独で使えますが、
**山の稜線・川の流路・城の位置が10枚で揃っているか**を必ず目視確認してください。

> **座標は最新のレイアウト（上下2枚の窓）に追従済みです。**
> UIを2枚の窓へ集約したため、**高さ19%〜35%と52%〜69%が完全に見える見せ場**です。
> 可読性のため中〜暗に保つ帯は **35%〜52%** です。

### 2. 出力サイズ

- **縦長**で、できるだけ**大きく**（長辺1024px以上）生成してください
- 縦横比は **366:430（約0.85:1）** が理想。指定できない場合は **4:5 または 3:4** を選ぶ
- 正方形でも構いません。`npm run normalize` が**中央を切り出して**366×430に整えます
  （縦に潰れることはありません。切り出した範囲はログに出ます）

### 3. 生成後

> ⚠ **このドキュメントのコマンドを貼るときは `#` から始まる行を含めないでください。**
> macOSのzshは対話シェルで `#` をコメントとして扱わないため、
> `command not found: #` になったり、`#` 以降が引数として渡されて失敗します。
> 以下のコード枠には実行できる行だけを載せています。

まず10枚を **`art/backgrounds-src/` フォルダ**へ、下のファイル名で置きます。
そのうえで次の2つを順に実行します。

```sh
npm run normalize
npm run assets
```

- `npm run normalize` … 366×430へ整え、色数と時刻バンドの明るさを検証します
- `npm run assets` … プレビュー画像を再生成します

ファイル名は厳守してください（テーマキーと一致させる必要があります）。

| # | ファイル名 |
|---|---|
| 01 | `clear_day.png` |
| 02 | `partly_cloudy_day.png` |
| 03 | `cloudy_day.png` |
| 04 | `rain.png` |
| 05 | `thunder.png` |
| 06 | `snow.png` |
| 07 | `fog.png` |
| 08 | `clear_night.png` |
| 09 | `cloudy_night.png` |
| 10 | `unknown.png` |

### 4. 全プロンプトに共通する重要ルール（なぜそう書いてあるか）

| ルール | 理由 |
|---|---|
| **高さ35%〜52%を中〜暗トーンに保つ** | ここに白い巨大な時刻数字が**覆いなしで**乗る。明るいと読めない |
| 高さ19%〜35%と52%〜69%に見せ場を置く | **完全に見える2つの帯**。ここが絵の主役 |
| 太陽・月を描かない | 最上段の天候アイコンと二重になる |
| 空は上部15%だけ、平坦に | ここは天候アイコンと日付のパネルが乗る |
| 城は右側（幅70%〜100%） | 時刻の右マージンと開放部で大きく見える |
| 文字・数字・記号を入れない | 実際のUI文字と衝突する |

---

## 01. clear_day.png ← まずこれを作る（マスター）

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: a peaceful fantasy valley seen from a hilltop on a bright clear summer midday.
Vivid saturated blue sky, lush emerald forest and meadow. The most colorful and
inviting image of the set.

Vertical layout, as fractions of image height:
- 0%-19%: vivid saturated blue sky. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  crisp white snow caps, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. dense dark green coniferous pine forest, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, clearly readable in silhouette.
- 69%-100%: foreground of lush sunlit emerald meadow.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Strong aerial perspective: far elements pale, desaturated and blue-shifted; near
  elements dark and saturated.
- Light source fixed at the upper right: highlights on upper-right faces, shadows on
  lower-left faces.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 02. partly_cloudy_day.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop, on a hazier day with drifting clouds.
Softer daylight, slightly muted greens, with subtle shade patches cast across the
meadow. Chunky white cumulus clouds with dithered highlights on top and grey undersides.

Vertical layout, as fractions of image height:
- 0%-19%: hazy blue sky containing chunky white cumulus clouds. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  modest snow caps, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. dense coniferous pine forest, slightly muted in color, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, clearly readable in silhouette.
- 69%-100%: foreground of green meadow with patches in cloud shadow.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Strong aerial perspective: far elements pale, desaturated and blue-shifted; near
  elements dark and saturated.
- Light source fixed at the upper right: highlights on upper-right faces, shadows on
  lower-left faces.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 03. cloudy_day.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop, fully overcast. Flat diffuse daylight,
low contrast, no visible sun. Heavy grey-blue cloud cover. Desaturated muted greens
and subdued mountains. A quiet, still, slightly melancholy mood.

Vertical layout, as fractions of image height:
- 0%-19%: solid overcast grey-blue cloud cover. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  subdued low-contrast peaks, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. coniferous pine forest in muted desaturated green, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, clearly readable in silhouette.
- 69%-100%: foreground of dull green meadow under flat diffuse light.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far elements pale, desaturated and blue-shifted; near elements
  dark. Contrast overall is deliberately low.
- Diffuse light with no strong direction, but keep any faint highlights upper-right.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 04. rain.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop in steady rain. Dark blue-grey and moody.
Diagonal light-blue rain streaks scattered evenly across the whole image. Low dark
storm clouds. The castle windows glow warm amber against the gloom. Wet darkened
ground, and a swollen river.

Vertical layout, as fractions of image height:
- 0%-19%: dark low storm clouds. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  dark hazy peaks behind the rain, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. dark rain-soaked coniferous pine forest, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, its windows glowing warm amber, clearly readable in silhouette.
- 69%-100%: foreground of dark wet green meadow with a muddy path.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far elements paler and hazier; near elements dark and saturated.
- Light source fixed at the upper right, but heavily overcast and dim.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 05. thunder.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop during a violent night thunderstorm.
Very dark navy, dramatic and ominous. Bruised dark storm clouds, diagonal rain streaks,
and one bright jagged yellow lightning bolt striking down from the clouds, faintly
illuminating the mountain peaks. The castle windows glow warm amber.

Vertical layout, as fractions of image height:
- 0%-19%: bruised near-black storm clouds with ONE bright jagged yellow lightning bolt. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  very dark peaks faintly rimmed by the lightning flash, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. near-black coniferous pine forest, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, its windows glowing warm amber, clearly readable in silhouette.
- 69%-100%: foreground of very dark wet grass.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far elements slightly paler and hazier; near elements near-black.
- Overall very dark and high-drama, but with only ONE bright accent: the lightning.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 06. snow.png ← 時刻の可読性がいちばん危ないテーマ

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop during quiet snowfall. Cold pale
blue-grey, hushed and still. Snow blanketing the meadow and the forest canopy, pine
trees dusted white, a pale half-frozen river. Small white snowflake pixels drifting.

Vertical layout, as fractions of image height:
- 0%-19%: cold pale blue-grey overcast snow sky. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  pale desaturated peaks whose bright white snow caps belong HERE, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. coniferous pine forest with dark green boughs dusted in white, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower and a snow-covered roof, clearly readable in silhouette.
- 69%-100%: foreground of clean white snow blanket with soft blue shadows.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far mountains pale and desaturated; near forest dark.
- Light source fixed at the upper right, but heavily overcast and diffuse.
- Snow shadows are cool blue, never grey-brown.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 07. fog.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop, swallowed by thick fog. Desaturated
grey-green, mysterious and flattened. Horizontal translucent fog bands sweeping across
the mountains and the forest at several heights. Very low contrast, distant peaks
barely visible, depth almost erased.

Vertical layout, as fractions of image height:
- 0%-19%: featureless pale grey-green haze instead of sky. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  peaks almost dissolved into the fog, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. coniferous pine forest fading into grey, layered by fog bands, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, half-veiled in fog, clearly readable in silhouette.
- 69%-100%: foreground of muted grey-green meadow, the clearest part of the image.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
  Fog is depicted with dithered bands and flat pale color, never with blurring.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective pushed to the extreme: distance rapidly washes out to pale grey.
- Diffuse light with no strong direction.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 08. clear_night.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop on a clear night. Deep dark navy,
tranquil and inviting. Scattered small white stars in the sky. The castle windows glow
warm amber and two small braziers flank its gate, the only warm lights in a cold
landscape. Deep dark forest silhouette, and a river catching pale highlights.

Vertical layout, as fractions of image height:
- 0%-19%: deep dark navy sky with scattered small white stars. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  dark blue-grey peaks faintly catching starlight, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. near-black coniferous pine forest silhouette, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, windows glowing warm amber, two small braziers flanking the gate, clearly readable in silhouette.
- 69%-100%: foreground of very dark blue-green grass under starlight.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far mountains slightly lighter and bluer than the near forest.
- The only warm colors in the image are the castle windows and the braziers. Everything
  else is cold blue. This contrast is the point of the image.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 09. cloudy_night.png

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop on an overcast night. Dark slate blue,
heavy and quiet. Drifting dark grey clouds cover most of the sky, with only a few stars
showing through gaps. The castle windows glow warm amber with braziers at the gate.
Very dark forest silhouette.

Vertical layout, as fractions of image height:
- 0%-19%: dark slate-blue sky mostly covered by drifting dark grey clouds. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  dark slate-blue peaks, low in contrast, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. very dark coniferous pine forest silhouette, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, windows glowing warm amber, braziers at the gate, clearly readable in silhouette.
- 69%-100%: foreground of very dark blue-green grass.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far mountains slightly lighter and bluer than the near forest.
- The only warm colors are the castle windows and braziers; everything else is cold.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 10. unknown.png ← 天候取得に失敗したときの控えめな一枚

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: the same fantasy valley from a hilltop at a neutral overcast twilight, at an
ambiguous time of day. Balanced blue-grey tones. Calm, understated and deliberately
unremarkable - this image is the fallback shown when weather data is unavailable, so it
must not suggest any particular weather. No sun, no moon, no rain, no snow, no fog, no
lightning, no dramatic lighting of any kind.

Vertical layout, as fractions of image height:
- 0%-19%: neutral blue-grey twilight sky, plain and even. Flat horizontal bands blended only with checkerboard dithering.
  This strip sits behind the top status row, so keep it plain and low-contrast.
- 19%-35%: FULLY VISIBLE - the primary showcase. A range of distant mountains,
  balanced blue-grey peaks with restrained snow caps, softened by aerial perspective. Put your best detail here.
- 35%-52%: CRITICAL READABILITY BAND - must stay MID-TONE TO DARK in value.
  The huge white clock digits sit directly on top of this strip with no panel behind
  them. Use the shadowed mid-ground valley here. Nothing lighter than a medium grey,
  no bright snow caps, no bright clouds, no bright water.
- 52%-69%: FULLY VISIBLE - the second showcase. coniferous pine forest in muted green, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width,
  on a hill: a small original stone castle with a flagged tower, clearly readable in silhouette.
- 69%-100%: foreground of muted green meadow with a narrow dirt path.

Rendering rules, strict:
- Hard-edged pixel art. NO anti-aliasing, NO blur, NO soft edges, NO smooth gradients.
- All tonal transitions done with visible checkerboard or ordered dithering only.
- Aerial perspective: far elements pale, desaturated and blue-shifted; near elements
  darker and more saturated.
- Even, neutral light with no strong direction and no weather effects at all.
- No black outlines. Form is defined purely by areas of flat color.
- Limited palette, at most 64 colors in total.
- Favor large, calm, readable shapes over fine intricate detail.

Do NOT include: text, letters, numbers, symbols, logos, watermarks, signatures, UI
elements, HUD, frames, borders, characters, people, animals, monsters, the sun, or the
moon. Do not imitate any existing game's specific artwork, characters or tilesets.

Portrait orientation, aspect ratio close to 366:430 (about 0.85:1).
```

---

## 生成後のチェック

`npm run normalize` の出力を見てください。

```
clear_day.png: 366x430, grid 1, 色数 54, 時刻バンド 平均輝度 126 / 明部 0.0%
```

- **明部が5%を超えたら警告が出ます。** その画像は時刻数字が読めない恐れがあります。
  プロンプトを作り直すより、**該当帯を後処理で暗く落とす**方が早く確実です。
- `snow` と `partly_cloudy_day` が特に出やすいので注意してください。

続いて `npm run assets` でプレビューを再生成し、
`docs/preview-390x450.png` などでUIとの重なりを目視確認してください。

実機での確認手順は [実機確認手順](device-testing.md) を参照。
端末上で背景10種を切り替えられるデバッグモードの使い方も載っています。
