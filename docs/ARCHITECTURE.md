# しくみ（ARCHITECTURE）

## 全体

Zepp OS 5.0（API_LEVEL 4.2）の文字盤アプリ。3つの部分がある。

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
- 絵の素材は `tools/generate-assets.mjs` が PNG を作る。時計の中では画像を読むだけ

## ファイルの役割

| ファイル・フォルダ | 役割 |
|---|---|
| `app.json` | アプリの設定。対象端末（Bip 6 の3種類）・API の版・appId・3つの部分の場所 |
| `app.js` | アプリ全体の入口（ログを出すだけ） |
| `watchface/index.js` | 文字盤の本体。部品を作り、時刻・電池・天気・ひとことを更新する |
| `watchface/layout.js` | 画面の座標・大きさ（390×450）。通常表示と AOD の両方 |
| `watchface/theme.js` | 色・文字の大きさ |
| `watchface/weather.js` | 天気コード → 背景の種類、昼夜の判定、今日の天気の取り出し |
| `watchface/battery.js` | 電池の%を0〜100にそろえる、HPのマス数・色・表示文字 |
| `watchface/copy.js` | ひとことの6種類（`COPY_PRESETS`）と番号のチェック |
| `watchface/aod.js` | AOD（画面オフ時）の表示を作る |
| `watchface/time-sprites.js` | 時刻を数字の画像で並べ、真ん中にそろえる |
| `setting/index.js` | Zepp アプリの中の設定画面 |
| `app-side/index.js` | Side Service。設定の番号を時計に渡す |
| `tools/generate-assets.mjs` | 背景10枚・数字・記号・プレビュー画像を作る（`npm run assets`） |
| `assets/bip-6/images/` | 時計に入る画像（backgrounds／digits／preview.png） |
| `docs/preview-*.png` | README 用のプレビュー（昼・夜・雨） |
| `tests/` | 電池・天気・ひとことの単体テスト（`npm run check`） |
| `AGENTS.md`・`CLAUDE.md`・`docs/` | AI と開発のルール（正本）。`.github/AGENTS.md` は中央マニュアル・作品ティアの案内だけ |

## データ

| どこ | キー | 中身 |
|---|---|---|
| スマホ（Settings Storage） | `messagePreset` | 選んだひとことの番号（文字列 `"0"`〜`"5"`） |
| 時計（`hmFS.SysProSetInt`） | `pixel_wayfarer_preset` | 同じ番号の控え。スマホとつながらない時に使う |

- 番号は `COPY_PRESETS` の並び順。範囲外・変な値は 0（`TACTIC / SAFETY FIRST`）になる
- 時計とスマホのやりとり：文字盤が起動時に `GET_MESSAGE_PRESET` を問い合わせる。設定が変わると Side Service から `MESSAGE_PRESET_CHANGED` が届く

## 時計から読む値（センサー）

- 時刻：`Time`（分ごとの通知・12/24時間の設定）
- 電池：`Battery`（変化の通知）
- 天気：`hmSensor.id.WEATHER` の予報から今日の天気コード・日の出・日の入り
- 気温（最低・現在・最高）：文字盤の部品 `TEXT_IMG` に時計のデータ（`WEATHER_LOW`／`WEATHER_CURRENT`／`WEATHER_HIGH`）を直接つないでいる。JavaScript からは値を読んでいない

天気コードと背景の対応は README の「天候コード変換」の表を参照。

## 外部サービス・環境変数

- 環境変数・秘密の値：なし
- ビルドの道具：Zeus CLI 1.9.3（`@zeppos/zeus-cli`）。`package.json` の `overrides` で一部の依存の版を固定している（README「セットアップ」）
- ライブラリ：`@zeppos/zml`（時計とスマホのやりとり）、`pngjs`（画像を作る時だけ）
- 公開先：Zepp Console（ストア）。`app.json` の `appId` は Zepp Console の値を使う
