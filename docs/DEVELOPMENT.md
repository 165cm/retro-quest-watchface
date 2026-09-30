# 開発の進め方（Claude Code・Codex 共通）

<!-- 前半（ブランチ〜PRとコミット）は、ひな形 165cm/ai-dev-template と共通。後半（テスト・デプロイ）はリポジトリごとに書く -->

## ブランチと worktree

正本は GitHub のこのリポジトリ。`main` が本番。

- **1タスク＝1ブランチ**。Claude は `claude/…`、Codex は `codex/…` から始める
- 手元で並行して作業する時は、AI ごとに別の worktree（別の作業フォルダ）を使う。同じフォルダを2つのAIに触らせない

```
git fetch origin
git worktree add ../<リポジトリ名>-claude -b claude/<タスク名> origin/main
git worktree add ../<リポジトリ名>-codex  -b codex/<タスク名>  origin/main
```

- 始める前に `docs/CURRENT_TASK.md` の「作業中」に、担当（Claude／Codex）・ブランチ・触るファイルを1行書く。表で相手が触っているファイルは編集しない
- 終わったら、その1行を消して「最近終わったこと」に移す

## PR と公開

1. ブランチで作業 → テスト → コミット → push → PR を作る（`.github/pull_request_template.md` に沿って書く）
2. **ユーザーに「PR #N を本番公開してよいですか？」と確認**。OK が出てからマージ（squash）
3. マージ後、作業ブランチは `origin/main` から作り直す
4. 相互レビュー：片方のAIが作ったPRを、もう片方がレビューしてから公開するとよい（考え方のクセが違うので抜けが見つかりやすい）

## コミット

- Conventional Commits（`feat:` `fix:` `docs:` `refactor:` `test:` など）。本文は日本語で「何を・なぜ」
- 秘密の値・個人情報はコミットしない。秘密の値の設定は、ユーザーに手順（コマンド）を渡して本人にやってもらう
- モデル名をコミット・PR・コードに書かない

---

## テスト

```
npm install
npm run check
```

- `npm run check` は `tests/` の単体テスト（Node の `node --test`）。いまは7件。対象は `watchface/battery.js`・`weather.js`・`copy.js` の計算だけで、画面の見た目は確かめられない
- 絵（背景・数字・プレビュー）を変えた時は、`tools/generate-assets.mjs` を直して `npm run assets` を実行し、できた PNG（`assets/bip-6/images/`・`docs/preview-*.png`）もコミットする。PNG を直接描き換えない
- 文字盤の見た目は `docs/preview-*.png`（390×450）で確認し、PR の「確認」に書く
- `npm run build` で `dist/` に `.zab`（文字盤のファイル）ができることを確かめる。クラウドの作業環境ではネットの制限で失敗することがある。その時は失敗したと PR に書く
- Zepp OS Simulator・実機 Bip 6 で確かめられなかった時は、README の「既知の制限」に書く

実機・Simulator で見る時（ユーザーの PC で）：

```
npm run dev
```

- Simulator を先に起動し、Bip 6（390×450）を選ぶ。Sensors で時刻・バッテリー・天気を切り替えて見る
- 実機は `npm run preview` → Zepp アプリの Developer Mode の Scan で QR を読む（手順は README の「実機インストール」）
- 見る所：通常表示・AOD（画面オフ時の表示）・12/24時間・摂氏/華氏・天気の同期・設定の変更

## デプロイ

- `main` へのマージで自動で出ていくものはない（GitHub Actions なし）。このリポジトリでは **`main` へのマージを「本番公開」として扱う**
- ストアへの公開はユーザーが手で行う：`npm run assets && npm run check && npm run build` → `dist/` の `.zab` を Zepp Console にアップロード（手順は README の「公開・提出」）
- ストアに出す前に、`app.json` の `version`（`code` と `name`）を上げ、`package.json` の `version` もそろえる

## 変更の時に必ずやること

- 座標・大きさは `watchface/layout.js`、色・文字の大きさは `watchface/theme.js` にまとめる。`watchface/index.js` に数値を直接書き足さない
- 絵の色を変えたら、`watchface/theme.js` と `tools/generate-assets.mjs` の色がそろっているか見る
- メッセージ（`watchface/copy.js` の `COPY_PRESETS`）は、**番号（並び順）で保存されている**。並べ替え・途中への追加・削除をすると、使っている人の選択がずれる。足す時は末尾に足す
- 保存のキー名（`messagePreset`・`pixel_wayfarer_preset`）は変えない
- 設定項目・天気コードの対応・ファイル構成を変えたら、README の該当する所と `docs/` も直す
- 秒ごとのタイマーやアニメーションは足さない（電池のため。分ごと・電池の変化・文字盤に戻った時だけ更新する）
