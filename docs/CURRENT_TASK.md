# いまの状態（CURRENT_TASK）

最終更新：2026-09-30（Claude）。**作業を始める時・終えた時に更新する。**

## いまの目標

2つ目の文字盤「ゆげラーメン」（ラーメン屋のバイト用）を 10/2 の勤務までに実機に入れて使う。Pixel Wayfarer は実機で確かめてストアに出す。

## 作業中（担当を1行ずつ。同じファイルを同時に触らない）

| 担当 | ブランチ | 内容 | 触るファイル |
|---|---|---|---|
| （なし） | | | |

## 次のタスク（上から優先）

1. ゆげラーメンを実機 Bip 6 に入れる（ユーザーの PC で `npm run preview -- yuge-ramen`）。Zepp アプリでシフトの時刻を入れ、木札の文・AOD・歩数・気温・窓の天気を確認する
2. ゆげラーメンの `appId`（仮の値 `20260930`）で実機に入れられるか確かめる。だめなら Zepp Console で新しく作った値にする
3. Pixel Wayfarer を実機 Bip 6（または Simulator）で確認する：通常表示・AOD・12/24時間・摂氏/華氏・天気の同期・設定の変更（ユーザーの PC と時計が必要）
4. Pixel Wayfarer の気温の表示を実機で確認する：`faces/pixel-wayfarer/watchface/index.js` で、文字の仮表示（`L --°` など）と数字の画像（`TEXT_IMG`）が同じ場所に重ねて置かれている。重なって見えないか見る
5. Pixel Wayfarer のストア提出（`faces/pixel-wayfarer/README.md`「公開・提出」）

## 最近終わったこと（新しい順）

- 2026-09-30 2つ目の文字盤「ゆげラーメン」（`faces/yuge-ramen/`）を作った。ユーザーの希望で、キャラクター（ゆげおばけ）はやめ、背景をラーメン屋の店内にした。Pixel Wayfarer の `appId` を Zepp Console の値（1121508）に直し、日曜の曜日が `---` になる不具合を直した（Claude）
- 2026-09-30 リポジトリ名を `zepp-watchfaces` に変えた（ユーザー）
- 2026-09-30 複数の文字盤を1つのリポジトリで作れる形にした（`faces/`・`shared/`・`tools/face.mjs`）（Claude）
- 2026-09-30 共通ルール（165cm/ai-dev-template）を入れ、`docs/` を書いた（Claude）
- 2026-07-26 ドット絵の陰影と RPG 風のウィンドウ枠で見た目を整えた（PR #1）
- 2026-07-25 Bip 6 向けの文字盤を作った

## 大事な決めごと

- 名前は「Pixel Wayfarer Face」。仮の名前「Retro Quest Face」は、似た名前の商標出願が見つかったので使わない（公開前に専門家か公式データベースでもう一度確かめる）
- 絵・数字はすべてコードで作るオリジナル。既存ゲームの素材・公式フォント・生成AIの画像は使わない（権利のため）
- 秒の表示・アニメーションは入れない（電池のため）
- 気温は時計のデータを文字盤の部品に直接つなぐ（JavaScript で値を読まない）
- 文字盤ごとにリポジトリを分けず、1つのリポジトリの `faces/<名前>/` に入れる（リポジトリを増やさないため）。ブランチで文字盤を分けることはしない（ブランチは1タスクごとの一時的なもの）
- 使い回す部品は `shared/` に置き、各文字盤から相対パスで読み込む。ビルドの時に文字盤の中へまとめて入ることを確認済み
- Pixel Wayfarer の Zepp Console の `appId` は `1121508`。以前は `app.json` が開発用の仮値のままで、Console が ZAB を認識しなかった
- ボツ案のブランチ（`claude/watch-face-review-jnj8ut`：JRPG 戦闘画面版）は使わない。直した不具合（appId・日曜）だけ `main` に移した
- 既存作品のキャラクター・名前・ロゴは使わない。ゆげラーメンはキャラクターを出さず、画風の雰囲気だけを参考にしたオリジナル
- PR のマージは squash にそろえる（共通ルールどおり。中央マニュアルの「通常は merge commit」より優先）
- `.github/AGENTS.md` は、中央マニュアルとティアの案内だけを残す短い入口にした。ルールの正本はルートの `AGENTS.md` と `docs/`
- Zeus CLI 1.9.3 の依存の不具合は `package.json` の `overrides` で固定して回避。`npm audit fix --force` は CLI が壊れるので使わない

## 変えてはいけないもの

- 文字盤のフォルダ名（`faces/<名前>/`）。コマンドの名前に使うため
- 文字盤ごとの `appId`（ほかの文字盤と重ねない）

ゆげラーメン（`faces/yuge-ramen/`）：

- 保存のキー名：`shiftEnabled`・`shiftStart`・`shiftEnd`（スマホ）、`yuge_shift_on`・`yuge_shift_start`・`yuge_shift_end`（時計）
- 時計とスマホのやりとりの名前：`GET_SHIFT`・`SHIFT_CHANGED`

Pixel Wayfarer（`faces/pixel-wayfarer/`）：

- 保存のキー名：`messagePreset`（スマホ）・`pixel_wayfarer_preset`（時計）
- `COPY_PRESETS` の並び順（番号で保存しているため。足す時は末尾）
- 時計とスマホのやりとりの名前：`GET_MESSAGE_PRESET`・`MESSAGE_PRESET_CHANGED`
- `app.json` の `appId`（`1121508`）・対象端末（`deviceSource` 9765120／9765121／10158337）
- 画面の大きさ 390×450
