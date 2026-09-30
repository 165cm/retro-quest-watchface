# いまの状態（CURRENT_TASK）

最終更新：2026-09-30（Claude）。**作業を始める時・終えた時に更新する。**

## いまの目標

2つ目の文字盤「SUPER ARBEITER」（ラーメン屋のバイト用）を 10/2 の勤務までに実機に入れて使う。Pixel Wayfarer は実機で確かめてストアに出す。

## 作業中（担当を1行ずつ。同じファイルを同時に触らない）

| 担当 | ブランチ | 内容 | 触るファイル |
|---|---|---|---|
| （なし） | | | |

## 次のタスク（上から優先）

1. SUPER ARBEITER を実機 Bip 6 に入れる（ユーザーの PC で `npm run preview -- super-arbeiter`）。時刻・HP・歩数・日付・曜日・BREAK・AOD と、小さい数字が読めるかを確認する
2. SUPER ARBEITER の `appId`（仮の値 `20260930`）で実機に入れられるか確かめる。だめなら Zepp Console で新しく作った値にする
3. Pixel Wayfarer を実機 Bip 6（または Simulator）で確認する：通常表示・AOD・12/24時間・摂氏/華氏・天気の同期・設定の変更（ユーザーの PC と時計が必要）
4. Pixel Wayfarer の気温の表示を実機で確認する：`faces/pixel-wayfarer/watchface/index.js` で、文字の仮表示（`L --°` など）と数字の画像（`TEXT_IMG`）が同じ場所に重ねて置かれている。重なって見えないか見る
5. Pixel Wayfarer のストア提出（`faces/pixel-wayfarer/README.md`「公開・提出」）

## 最近終わったこと（新しい順）

- 2026-09-30 Codex の再レビュー（参考画像への近さ 72/100）を受けて、SUPER ARBEITER の作り方を変えた：390×450 の完成見本を先に決め、参考画像と同じ構図（時刻の左に HP、右に日付）にし、数字 0〜9 を1字ずつ筆の字形で作り直した（Claude）
- 2026-09-30 Codex のレビュー（PR #5）を受けて、SUPER ARBEITER の躍動感を上げた：時刻の数字を筆のように、下段の数字を大きく、湯気・勢い線・筆の線を追加、靴の絵の欠けを直し、安全領域のテストを強くした（Claude）
- 2026-09-30 2つ目の文字盤「SUPER ARBEITER」（`faces/super-arbeiter/`）を、ユーザーの制作指示書どおりに作った。先に作った「ゆげラーメン」は、ユーザーの判断で消して置き換えた。Pixel Wayfarer の `appId` を Zepp Console の値（1121508）に直し、日曜の曜日が `---` になる不具合を直した（Claude）
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
- 既存作品のキャラクター・名前・ロゴは使わない。SUPER ARBEITER もキャラクターは出さない
- 「生成AIの画像は使わない」は Pixel Wayfarer だけの決めごと。SUPER ARBEITER は、ユーザーから受け取った生成の素材を使ってよい（ユーザー確認済み。由来は README に書く）
- SUPER ARBEITER は「390×450 の完成見本を先に固め、数字 0〜9 を個別の筆文字として作る」作り方にする（ユーザーの指示）。見本は参考画像の構図に合わせる
- SUPER ARBEITER の BREAK は、スマホの設定で入れた休憩の時刻を出す（指示書の「固定・疑似表示でもよい」より一歩進めた。時計での操作はなし）
- PR のマージは squash にそろえる（共通ルールどおり。中央マニュアルの「通常は merge commit」より優先）
- `.github/AGENTS.md` は、中央マニュアルとティアの案内だけを残す短い入口にした。ルールの正本はルートの `AGENTS.md` と `docs/`
- Zeus CLI 1.9.3 の依存の不具合は `package.json` の `overrides` で固定して回避。`npm audit fix --force` は CLI が壊れるので使わない

## 変えてはいけないもの

- 文字盤のフォルダ名（`faces/<名前>/`）。コマンドの名前に使うため
- 文字盤ごとの `appId`（ほかの文字盤と重ねない）

SUPER ARBEITER（`faces/super-arbeiter/`）：

- 保存のキー名：`breakTime`（スマホ）・`sa_break`（時計）
- 時計とスマホのやりとりの名前：`GET_BREAK`・`BREAK_CHANGED`
- `STATUS_PRESETS` の並び順（番号で選ぶため。足す時は末尾）

Pixel Wayfarer（`faces/pixel-wayfarer/`）：

- 保存のキー名：`messagePreset`（スマホ）・`pixel_wayfarer_preset`（時計）
- `COPY_PRESETS` の並び順（番号で保存しているため。足す時は末尾）
- 時計とスマホのやりとりの名前：`GET_MESSAGE_PRESET`・`MESSAGE_PRESET_CHANGED`
- `app.json` の `appId`（`1121508`）・対象端末（`deviceSource` 9765120／9765121／10158337）
- 画面の大きさ 390×450
