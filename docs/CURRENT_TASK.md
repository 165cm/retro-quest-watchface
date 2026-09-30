# いまの状態（CURRENT_TASK）

最終更新：2026-09-30（Claude）。**作業を始める時・終えた時に更新する。**

## いまの目標

1つのリポジトリで複数の文字盤を作れる形にした。1つ目（Pixel Wayfarer）を実機で確かめてストアに出し、2つ目の文字盤に進む。

## 作業中（担当を1行ずつ。同じファイルを同時に触らない）

| 担当 | ブランチ | 内容 | 触るファイル |
|---|---|---|---|
| （なし） | | | |

## 次のタスク（上から優先）

1. リポジトリ名を変える（ユーザーが GitHub の Settings で行う。名前は1つの文字盤の名前ではなく、まとめた名前に）
2. 2つ目の文字盤のテーマ・対象の時計を決め、`faces/` に足す（手順は `docs/DEVELOPMENT.md` の「新しい文字盤を足す時」）
3. Pixel Wayfarer を実機 Bip 6（または Simulator）で確認する：通常表示・AOD・12/24時間・摂氏/華氏・天気の同期・設定の変更（ユーザーの PC と時計が必要）
4. Pixel Wayfarer の気温の表示を実機で確認する：`faces/pixel-wayfarer/watchface/index.js` で、文字の仮表示（`L --°` など）と数字の画像（`TEXT_IMG`）が同じ場所に重ねて置かれている。重なって見えないか見る
5. Pixel Wayfarer の `appId` を確かめる：`faces/pixel-wayfarer/README.md` の「既知の制限」には「開発用の仮値」とあるが、`app.json` には `10420724` が入っている。Zepp Console の値か確かめ、README をそろえる
6. Pixel Wayfarer のストア提出（`faces/pixel-wayfarer/README.md`「公開・提出」）

## 最近終わったこと（新しい順）

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
- PR のマージは squash にそろえる（共通ルールどおり。中央マニュアルの「通常は merge commit」より優先）
- `.github/AGENTS.md` は、中央マニュアルとティアの案内だけを残す短い入口にした。ルールの正本はルートの `AGENTS.md` と `docs/`
- Zeus CLI 1.9.3 の依存の不具合は `package.json` の `overrides` で固定して回避。`npm audit fix --force` は CLI が壊れるので使わない

## 変えてはいけないもの

- 文字盤のフォルダ名（`faces/<名前>/`）。コマンドの名前に使うため
- 文字盤ごとの `appId`（ほかの文字盤と重ねない）

Pixel Wayfarer（`faces/pixel-wayfarer/`）：

- 保存のキー名：`messagePreset`（スマホ）・`pixel_wayfarer_preset`（時計）
- `COPY_PRESETS` の並び順（番号で保存しているため。足す時は末尾）
- 時計とスマホのやりとりの名前：`GET_MESSAGE_PRESET`・`MESSAGE_PRESET_CHANGED`
- `app.json` の `appId`・対象端末（`deviceSource` 9765120／9765121／10158337）
- 画面の大きさ 390×450
