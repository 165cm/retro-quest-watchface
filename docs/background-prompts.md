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

### 2. 出力サイズ

- **縦長**で、できるだけ**大きく**（長辺1024px以上）生成してください
- 縦横比は **366:430（約0.85:1）** が理想。指定できない場合は **4:5 または 3:4** を選ぶ
- 正方形でも構いません。`npm run normalize` が**中央を切り出して**366×430に整えます
  （縦に潰れることはありません。切り出した範囲はログに出ます）

### 3. 生成後

```sh
# art/backgrounds-src/ に 10枚を下のファイル名で置いてから
npm run normalize   # 366×430へ整え、色数と時刻バンドの明るさを検証
npm run assets      # プレビューを再生成
```

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
| 高さ20%〜37%を中〜暗トーンに保つ | ここに白い巨大な時刻数字が**覆いなしで**乗る。明るいと読めない |
| 太陽・月を描かない | 最上段の天候アイコンと二重になる |
| 空は上部16%だけ、平坦に | ここは日付とHPゲージが乗る |
| 城は右側（幅70%〜100%） | UIパネルの隙間から見える位置 |
| 文字・数字・記号を入れない | 実際のUI文字と衝突する |
| 細密より大きな面 | 画面の大半が半透明パネルの下に隠れる |

---

## 01. clear_day.png ← まずこれを作る（マスター）

```text
Masterpiece pixel art landscape in the style of a classic 16-bit Japanese console RPG
overworld map (Super Famicom era, early 1990s). Hand-placed crisp pixels.

Scene: a peaceful fantasy valley seen from a hilltop on a bright clear summer midday.
Vivid saturated blue sky, lush emerald forest and meadow. The most colorful and
inviting image of the set.

Vertical layout, as fractions of image height:
- 0%-16%: plain blue sky. Flat horizontal color bands blended only with checkerboard
  dithering. Keep this area simple and low-contrast.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only medium or darker blues, greens and greys here. Nothing lighter than a medium
  grey. No white, no bright snow, no bright clouds.
- 35%-46%: the horizon. A range of distant mountains with modest snow caps, rendered
  pale, desaturated and shifted toward blue by aerial perspective. Peaks must NOT rise
  above 37% of the image height.
- 46%-80%: dense dark green coniferous pine forest over rolling hills, and a river
  winding down through a valley catching pale highlights. On the RIGHT side, between
  70% and 100% of the image width, on a hill: a small original stone castle with a
  flagged tower, clearly readable in silhouette.
- 80%-100%: foreground meadow of lush sunlit green grass with patches of lighter and
  darker green suggesting undulation, and a narrow winding dirt path.

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
- 0%-16%: hazy blue sky containing the cumulus clouds. Flat horizontal bands blended
  only with checkerboard dithering. All clouds must stay INSIDE this top band.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only medium or darker blues, greens and greys here. Nothing lighter than a medium
  grey. Absolutely NO clouds and NO bright snow inside this strip.
- 35%-46%: the horizon. A range of distant mountains with modest snow caps, rendered
  pale, desaturated and shifted toward blue by aerial perspective. Peaks must NOT rise
  above 37% of the image height.
- 46%-80%: dense coniferous pine forest over rolling hills, slightly muted in color,
  and a river winding down through a valley. On the RIGHT side, between 70% and 100%
  of the image width, on a hill: a small original stone castle with a flagged tower,
  clearly readable in silhouette.
- 80%-100%: foreground meadow of green grass with patches of lighter and darker green,
  some in cloud shadow, and a narrow winding dirt path.

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
- 0%-16%: solid overcast grey-blue cloud cover filling the sky. Flat horizontal bands
  blended only with checkerboard dithering. Keep it low-contrast, no bright white.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only medium or darker greys, blues and greens here. Nothing lighter than a medium
  grey.
- 35%-46%: the horizon. A range of distant mountains, subdued and low in contrast,
  desaturated and blue-grey from aerial perspective. Peaks must NOT rise above 37% of
  the image height.
- 46%-80%: dense coniferous pine forest over rolling hills in muted desaturated green,
  and a river winding down through a valley reflecting the grey sky. On the RIGHT side,
  between 70% and 100% of the image width, on a hill: a small original stone castle
  with a flagged tower, clearly readable in silhouette.
- 80%-100%: foreground meadow of dull green grass under flat diffuse light, with a
  narrow winding dirt path.

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
- 0%-16%: dark low storm clouds. Flat horizontal bands blended only with checkerboard
  dithering. Keep it dark and low-contrast.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only darker blues and greys here. Nothing lighter than a medium grey. The rain
  streaks may cross this strip but must remain thin.
- 35%-46%: the horizon. A range of distant mountains, dark and hazy behind the rain,
  desaturated blue-grey. Peaks must NOT rise above 37% of the image height.
- 46%-80%: dark rain-soaked coniferous pine forest, and a swollen river winding down
  through a valley. On the RIGHT side, between 70% and 100% of the image width, on a
  hill: a small original stone castle with a flagged tower, its windows glowing warm
  amber, clearly readable in silhouette.
- 80%-100%: foreground meadow of dark wet green grass, and a muddy winding path.

Weather effect: thin diagonal rain streaks in pale blue, evenly distributed over the
entire image, all falling in the same direction.

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
- 0%-16%: bruised near-black storm clouds, with ONE bright jagged yellow lightning
  bolt striking downward. The lightning must stay INSIDE this top band. Flat horizontal
  bands blended only with checkerboard dithering.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only very dark navy, blues and greys here. Nothing lighter than a medium grey.
  NO lightning and NO bright flash inside this strip. The rain streaks may cross it but
  must remain thin.
- 35%-46%: the horizon. A range of distant mountain peaks, very dark, faintly rimmed
  by the lightning flash. Peaks must NOT rise above 37% of the image height.
- 46%-80%: near-black coniferous pine forest, and a river winding down through a
  valley catching a cold pale glint. On the RIGHT side, between 70% and 100% of the
  image width, on a hill: a small original stone castle with a flagged tower, its
  windows glowing warm amber, clearly readable in silhouette.
- 80%-100%: foreground meadow of very dark wet grass, and a muddy winding path.

Weather effect: thin diagonal rain streaks in pale blue, evenly distributed over the
entire image, all falling in the same direction.

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
- 0%-16%: cold pale blue-grey overcast snow sky. Flat horizontal bands blended only
  with checkerboard dithering. Keep it low-contrast.
- 20%-37%: THIS IS THE MOST IMPORTANT CONSTRAINT FOR THIS IMAGE. This horizontal
  strip must stay MID-TONE TO DARK in value. Use the DARK slate-blue flanks of the
  mountains and dark evergreen here. Do NOT put bright white snow, snow caps, bright
  sky or bright clouds anywhere inside this strip. Nothing lighter than a medium grey.
  Snowflakes may cross it but must be sparse and tiny.
- 35%-46%: the horizon. Distant mountains, pale and desaturated blue-grey. Their bright
  white snow caps must sit BELOW 37% of the image height, never above it.
- 46%-80%: coniferous pine forest with dark green boughs dusted in white snow, and a
  pale half-frozen river winding down a valley. On the RIGHT side, between 70% and 100%
  of the image width, on a hill: a small original stone castle with a flagged tower and
  a snow-covered roof, clearly readable in silhouette.
- 80%-100%: foreground meadow blanketed in clean white snow, with a faint winding path
  and soft blue shadows in the drifts. This bottom band is where the bright snow
  belongs.

Weather effect: small white snowflake pixels scattered evenly, sparse rather than dense.

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
- 0%-16%: featureless pale grey-green haze instead of sky. Flat horizontal bands
  blended only with checkerboard dithering.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only medium or darker grey-greens here. Nothing lighter than a medium grey. Keep the
  fog bands crossing this strip on the darker, denser side.
- 35%-46%: the horizon. Distant mountains almost dissolved into the fog, only their
  faintest outlines suggested. Peaks must NOT rise above 37% of the image height.
- 46%-80%: coniferous pine forest fading into grey with distance, its silhouettes
  layered and softened by fog bands. A river winding down a valley, dull and pale.
  On the RIGHT side, between 70% and 100% of the image width, on a hill: a small
  original stone castle with a flagged tower, half-veiled in fog but still readable
  in silhouette.
- 80%-100%: foreground meadow of muted grey-green grass, the clearest part of the
  image, with a narrow winding path disappearing into the murk.

Weather effect: several horizontal translucent fog bands at different heights,
rendered as dithered pale bands, not as blur.

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
- 0%-16%: deep dark navy night sky with scattered small white star pixels of varying
  brightness. Flat horizontal bands blended only with checkerboard dithering.
  NO moon anywhere.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only very dark navy and near-black here. Nothing lighter than a medium grey.
  A few tiny stars are acceptable; no bright masses.
- 35%-46%: the horizon. Distant mountains as dark blue-grey shapes, their snow caps
  only faintly catching starlight. Peaks must NOT rise above 37% of the image height.
- 46%-80%: near-black coniferous pine forest as a deep silhouette, and a river winding
  down a valley catching cold pale highlights. On the RIGHT side, between 70% and 100%
  of the image width, on a hill: a small original stone castle with a flagged tower,
  its windows glowing warm amber, with two small warm braziers flanking the gate,
  clearly readable in silhouette.
- 80%-100%: foreground meadow of very dark blue-green grass under starlight, with a
  narrow winding path.

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
- 0%-16%: dark slate-blue night sky mostly covered by drifting dark grey clouds, with
  a few small white stars visible in the gaps. Flat horizontal bands blended only with
  checkerboard dithering. NO moon anywhere.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only dark slate blues and near-black here. Nothing lighter than a medium grey.
  No cloud highlights inside this strip.
- 35%-46%: the horizon. Distant mountains as dark slate-blue shapes, low in contrast.
  Peaks must NOT rise above 37% of the image height.
- 46%-80%: very dark coniferous pine forest as a heavy silhouette, and a river winding
  down a valley with a dull pale sheen. On the RIGHT side, between 70% and 100% of the
  image width, on a hill: a small original stone castle with a flagged tower, its
  windows glowing warm amber, with two small warm braziers flanking the gate, clearly
  readable in silhouette.
- 80%-100%: foreground meadow of very dark blue-green grass, with a narrow winding path.

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
- 0%-16%: neutral blue-grey twilight sky, plain and even. Flat horizontal bands blended
  only with checkerboard dithering.
- 20%-37%: CRITICAL - this horizontal strip must stay MID-TONE TO DARK in value.
  Only medium or darker blue-greys and greens here. Nothing lighter than a medium grey.
- 35%-46%: the horizon. A range of distant mountains in balanced blue-grey, moderate
  contrast, with restrained snow caps. Peaks must NOT rise above 37% of the image height.
- 46%-80%: coniferous pine forest over rolling hills in muted green, and a river winding
  down through a valley. On the RIGHT side, between 70% and 100% of the image width, on
  a hill: a small original stone castle with a flagged tower, clearly readable in
  silhouette.
- 80%-100%: foreground meadow of muted green grass, with a narrow winding dirt path.

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
