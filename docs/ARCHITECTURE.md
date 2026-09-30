# しくみ（ARCHITECTURE）

## 全体

1つのリポジトリに、Zepp OS の文字盤を複数入れている。文字盤ごとに `faces/<名前>/` が1つの Zepp OS プロジェクト（`app.json` から `assets/` まで一式）で、ストアでも別々の文字盤になる。使い回す部品は `shared/` に置き、ビルドの時に各文字盤の中へまとめて入る。

```
リポジトリ
├─ faces/<文字盤>/   … Zepp OS プロジェクト（文字盤ごと）
│     └─ watchface/ など ──import──▶ shared/（共通部品）
├─ tests/            … shared/ と文字盤ごとのテスト
└─ tools/face.mjs    … 名前を指定して faces/<文字盤>/ の中で Zeus CLI を動かす
```

1つの文字盤の中は、次の3つの部分に分かれる（Pixel Wayfarer の例）。

```
スマホの Zepp アプリ
  ├─ 設定画面          setting/index.js   … ひとことを6種類から選ぶ
  │      │ Settings Storage（キー messagePreset）
  │      ▼
  └─ Side Service      app-side/index.js  … 選ばれた番号を時計へ送る
         │ Bluetooth（ZML の request / call）
         ▼
時計（Amazfit Bip 6・390×450）
  └─ 文字盤            watchface/index.js … 描画と更新。番号は時計の中にも保存
```

- 公開URL：なし（ストア未公開）
- 絵の素材は各文字盤の `tools/generate-assets.mjs` が PNG を作る。時計の中では画像を読むだけ

## ファイルの役割

### リポジトリ全体

| ファイル・フォルダ | 役割 |
|---|---|
| `package.json` | 依存パッケージと npm のコマンド（全文字盤で共通。`node_modules` も1つ） |
| `tools/face.mjs` | `npm run build -- <文字盤>` などを受けて、`faces/<文字盤>/` の中で Zeus CLI・素材づくりを動かす |
| `shared/weather.js` | 天気コード → 背景の種類、昼夜の判定、今日の天気の取り出し |
| `shared/battery.js` | 電池の%を0〜100にそろえる、HPのマス数・色・表示文字 |
| `shared/date.js` | 曜日の名前を引く。`getDay()` が 0=日曜 でも 7=日曜 でも正しく引ける |
| `shared/time-sprites.js` | 時刻を数字の画像で並べ、画面の真ん中にそろえる（画面の幅は引数で受け取る） |
| `tests/shared/` | 共通部品のテスト |
| `tests/<文字盤>/` | 文字盤ごとのテスト |
| `AGENTS.md`・`CLAUDE.md`・`docs/` | AI と開発のルール（正本）。`.github/AGENTS.md` は中央マニュアル・作品ティアの案内だけ |

### 文字盤：`faces/pixel-wayfarer/`

| ファイル・フォルダ | 役割 |
|---|---|
| `app.json` | アプリの設定。対象端末（Bip 6 の3種類）・API の版・appId・3つの部分の場所 |
| `app.js` | アプリ全体の入口（ログを出すだけ） |
| `watchface/index.js` | 文字盤の本体。部品を作り、時刻・電池・天気・ひとことを更新する |
| `watchface/layout.js` | 画面の座標・大きさ（390×450）。通常表示と AOD の両方 |
| `watchface/theme.js` | 色・文字の大きさ |
| `watchface/copy.js` | ひとことの6種類（`COPY_PRESETS`）と番号のチェック |
| `watchface/aod.js` | AOD（画面オフ時）の表示を作る |
| `setting/index.js` | Zepp アプリの中の設定画面 |
| `app-side/index.js` | Side Service。設定の番号を時計に渡す |
| `tools/generate-assets.mjs` | 背景10枚・数字・記号・プレビュー画像を作る（`npm run assets -- pixel-wayfarer`） |
| `assets/bip-6/images/` | 時計に入る画像（backgrounds／digits／preview.png） |
| `docs/preview-*.png` | README 用のプレビュー（昼・夜・雨） |
| `README.md` | この文字盤の説明・天気コードの表・既知の制限・提出手順 |

### 文字盤：`faces/yuge-ramen/`（ゆげラーメン）

| ファイル・フォルダ | 役割 |
|---|---|
| `app.json` | アプリの設定。appId は仮の値（`20260930`） |
| `watchface/index.js` | 文字盤の本体。分ごとに時刻・日付・天気（背景）・シフトを、電池の変化で電池を更新する |
| `watchface/shift.js` | シフトの残り時間と木札の文を決める計算（テストあり） |
| `watchface/layout.js`・`theme.js` | 座標・大きさ／色・文字の大きさ |
| `watchface/aod.js` | AOD の表示（時刻・日付・シフトの残り） |
| `setting/index.js` | Zepp アプリの設定画面（シフトのオン／オフ・はじまり・おわり） |
| `setting/keys.js` | 設定の保存キーと、読み取り（設定画面と Side Service で共通） |
| `app-side/index.js` | Side Service。シフトの設定を時計に渡す |
| `tools/generate-assets.mjs` | 数字・背景（ラーメン屋の店内・天気ごとに10枚）・小物をすべて SVG で描き、`@resvg/resvg-js` で PNG にする |
| `docs/preview-*.png` | README 用のプレビュー（シフト中・おわったあと・夜・雨） |

## データ

### Pixel Wayfarer

| どこ | キー | 中身 |
|---|---|---|
| スマホ（Settings Storage） | `messagePreset` | 選んだひとことの番号（文字列 `"0"`〜`"5"`） |
| 時計（`hmFS.SysProSetInt`） | `pixel_wayfarer_preset` | 同じ番号の控え。スマホとつながらない時に使う |

- 番号は `COPY_PRESETS` の並び順。範囲外・変な値は 0（`TACTIC / SAFETY FIRST`）になる
- 時計とスマホのやりとり：文字盤が起動時に `GET_MESSAGE_PRESET` を問い合わせる。設定が変わると Side Service から `MESSAGE_PRESET_CHANGED` が届く

### ゆげラーメン

| どこ | キー | 中身 |
|---|---|---|
| スマホ（Settings Storage） | `shiftEnabled` | `'true'`／`'false'` |
| スマホ（Settings Storage） | `shiftStart`・`shiftEnd` | `'11:15'` のような時刻 |
| 時計（`hmFS.SysProSetInt`） | `yuge_shift_on` | 1＝オン、2＝オフ（0 は保存なし） |
| 時計（`hmFS.SysProSetInt`） | `yuge_shift_start`・`yuge_shift_end` | 0時からの分＋1（0 は保存なし） |

- 何も保存されていない時は 11:15〜17:00・オン
- 時計とスマホのやりとり：文字盤が起動時に `GET_SHIFT` を問い合わせる。設定が変わると Side Service から `SHIFT_CHANGED` が届く
- 歩数・いまの気温は、文字盤の部品 `TEXT_IMG` に時計のデータ（`STEP`・`WEATHER_CURRENT`）を直接つないでいる

## 時計から読む値（センサー）

- 時刻：`Time`（分ごとの通知・12/24時間の設定）
- 電池：`Battery`（変化の通知）
- 天気：`hmSensor.id.WEATHER` の予報から今日の天気コード・日の出・日の入り（`shared/weather.js`）
- 気温（最低・現在・最高）：Pixel Wayfarer では、文字盤の部品 `TEXT_IMG` に時計のデータ（`WEATHER_LOW`／`WEATHER_CURRENT`／`WEATHER_HIGH`）を直接つないでいる。JavaScript からは値を読んでいない

天気コードと背景の対応は `faces/pixel-wayfarer/README.md` の「天候コード変換」の表を参照。

## 外部サービス・環境変数

- 環境変数・秘密の値：なし
- ビルドの道具：Zeus CLI 1.9.3（`@zeppos/zeus-cli`）。`package.json` の `overrides` で一部の依存の版を固定している。ビルドの時に Zepp のサーバー（`upload-cdn.zepp.com`）から端末の一覧を取る
- ライブラリ：`@zeppos/zml`（時計とスマホのやりとり）、`pngjs`（Pixel Wayfarer の画像を作る時だけ）、`@resvg/resvg-js`（ゆげラーメンの SVG を PNG にする時だけ）
- 公開先：Zepp Console（ストア）。`appId` は文字盤ごとに Zepp Console の値を使う
