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

コマンドはすべてリポジトリの一番上で実行する。文字盤は `--` のあとに名前（`faces/` の下のフォルダ名）で選ぶ。

```
npm install
npm run check
```

- `npm run check` は `tests/` の単体テスト（Node の `node --test`）。`tests/shared/` が共通部品、`tests/<文字盤>/` が文字盤ごと。計算だけを確かめ、画面の見た目は確かめられない
- `shared/` を変えたら、それを使う**すべての文字盤**をビルドして確かめる
- 絵（背景・数字・プレビュー）を変えた時は、`faces/<文字盤>/tools/generate-assets.mjs` を直して `npm run assets -- <文字盤>` を実行し、できた PNG（`assets/`・`docs/preview-*.png`）もコミットする。PNG を直接描き換えない
- 文字盤の見た目は `faces/<文字盤>/docs/preview-*.png` で確認し、PR の「確認」に書く
- `npm run build -- <文字盤>` で `faces/<文字盤>/dist/` に `.zab`（文字盤のファイル）ができることを確かめる
  - ビルドの道具は、最初に Zepp のサーバー（`upload-cdn.zepp.com`）から端末の一覧を取りにいく。クラウドの作業環境では、ネットワーク設定でこの接続が止められていることがある。その時はビルドできなかったと PR に書く
- Zepp OS Simulator・実機で確かめられなかった時は、その文字盤の README の「既知の制限」に書く

実機・Simulator で見る時（ユーザーの PC で）：

```
npm run dev -- <文字盤>
```

- Simulator を先に起動し、対象の端末（例：Bip 6・390×450）を選ぶ。Sensors で時刻・バッテリー・天気を切り替えて見る
- 実機は `npm run preview -- <文字盤>` → Zepp アプリの Developer Mode の Scan で QR を読む（手順は各文字盤の README の「実機インストール」）
- 見る所：通常表示・AOD（画面オフ時の表示）・12/24時間・摂氏/華氏・天気の同期・設定の変更

## デプロイ

- `main` へのマージで自動で出ていくものはない（GitHub Actions なし）。このリポジトリでは **`main` へのマージを「本番公開」として扱う**
- ストアへの公開は、文字盤ごとにユーザーが手で行う：`npm run assets -- <文字盤> && npm run check && npm run build -- <文字盤>` → `faces/<文字盤>/dist/` の `.zab` を Zepp Console にアップロード（手順は各文字盤の README の「公開・提出」）
- ストアに出す前に、その文字盤の `app.json` の `version`（`code` と `name`）を上げる

## 新しい文字盤を足す時

1. `faces/<新しい名前>/` を作る。名前は英小文字とハイフン（例：`ocean-clock`）。今ある文字盤をコピーして始めてよい
2. `app.json` の `appId` は**文字盤ごとに別の番号**にする（Zepp Console で新しく作った値）。コピー元と同じ番号のままにしない。`appName` も変える
3. 保存のキー名（`hmFS.SysProSetInt` など）は、ほかの文字盤と重ならない名前にする（例：`<文字盤名>_preset`）
4. 天気・電池・時刻の数字など、使い回せるものは `shared/` から読み込む（`import ... from '../../../shared/...'`）。1つの文字盤でしか使わないものは、その文字盤のフォルダに置く
5. `tests/<新しい名前>/` にテストを足す
6. ルートの `README.md` の「文字盤」の表と、`docs/PRODUCT.md`・`docs/UI_RULES.md` に1節ずつ足す

## 変更の時に必ずやること

- 座標・大きさは各文字盤の `watchface/layout.js`、色・文字の大きさは `watchface/theme.js` にまとめる。`watchface/index.js` に数値を直接書き足さない
- 絵の色を変えたら、`watchface/theme.js` と `tools/generate-assets.mjs` の色がそろっているか見る
- `shared/` の部品は、特定の文字盤の色・座標・ファイルを読み込まない（画面の幅などは引数で受け取る）
- 保存のキー名・設定の並び順など、各文字盤の「変えてはいけないもの」は `docs/CURRENT_TASK.md` を見る
- 設定項目・天気コードの対応・ファイル構成を変えたら、その文字盤の README と `docs/` も直す
- 秒ごとのタイマーやアニメーションは足さない（電池のため。分ごと・電池の変化・文字盤に戻った時だけ更新する）
