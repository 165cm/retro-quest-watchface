# 実機確認手順

Amazfit Bip 6 実機で Pixel Wayfarer Face を確認する手順です。
背景10種を端末上で切り替えられる**デバッグモード**の使い方も含みます。

---

## 0. 前提

| 必要なもの | 備考 |
|---|---|
| Amazfit Bip 6 実機 | Zeppアプリとペアリング済み |
| スマートフォン | Zeppアプリ（iOS / Android） |
| PC | Node.js 18以上（動作確認は20.18.1） |
| Zepp開発者アカウント | `zeus preview` / `zeus build` で必要 |

PC・スマホ・端末が**同じネットワーク**にあると安定します。

---

## 1. ローカル準備（PCでの作業）

> **結論から:** すべてのコマンドは
> **`package.json` がある一番上のフォルダ（リポジトリのルート）** で実行します。
> このプロジェクトなら `retro-quest-watchface` フォルダの直下です。
>
> `npm run ...` は実は中のフォルダ（`watchface/` など）から実行しても動きます
> （npmが自動で上へ`package.json`を探しに行くため）。
> ただし `node tools/...` のように直接実行するコマンドは
> **ルートでないと失敗する**ので、常にルートにいる習慣にしてください。

以下、ターミナルを触ったことがない前提で順に進めます。

### 1-1. ターミナルを開く

| OS | 開き方 |
|---|---|
| macOS | Launchpad →「ターミナル」（Terminal）を検索して起動 |
| Windows | スタートメニュー →「PowerShell」を検索して起動 |

以降の「コマンド」は、この黒い画面に打って **Enter** を押します。

### 1-2. Node.js が入っているか確認する

```sh
node -v
npm -v
```

`v20.18.1` のようにバージョンが出れば入っています。

- **バージョンが出ない／command not found** の場合は
  [Node.js公式サイト](https://nodejs.org/)から **LTS版** をインストールしてください。
  インストール後、ターミナルを一度閉じて開き直してから再確認します。
- **`v18` より古い場合** は LTS版へ更新してください（`npm run check` のテスト実行に必要です）。

### 1-3. プロジェクトを手元に持ってくる（初回だけ）

まず、置き場所にしたいフォルダへ移動します。ここでは書類フォルダを例にします。

```sh
cd ~/Documents
```

> `cd` は「フォルダを移動する」コマンドです。
> Windowsでも `cd ~/Documents` で同じ場所へ移動できます。

次にプロジェクトをダウンロード（クローン）します。

```sh
git clone https://github.com/165cm/retro-quest-watchface.git
```

`git clone` でエラーが出る場合はGitが入っていません。
[Git公式サイト](https://git-scm.com/downloads)からインストールしてください。

> **すでにクローン済みの人はこの手順は不要です。** 1-4へ進んでください。

### 1-4. 作業フォルダへ移動する ← ここが「どのフォルダか」の答え

```sh
cd ~/Documents/retro-quest-watchface
```

**このフォルダが作業場所です。** 以降のコマンドはすべてここで実行します。

すでにクローン済みで場所が分からない場合は、Finder / エクスプローラーで
`retro-quest-watchface` フォルダを探し、**フォルダをターミナルにドラッグ&ドロップ**すると
パスが入力されます（`cd ` と半角スペースを打ってからドラッグ）。

### 1-5. 正しいフォルダにいるか確認する

```sh
pwd
ls
```

- `pwd` は今いる場所を表示します。末尾が `/retro-quest-watchface` になっていればOKです。
- `ls` でファイル一覧が出ます。**次の3つが見えていれば正解**です。

```
package.json    app.json    watchface
```

Windowsで `ls` が使えない場合は `dir` を使ってください。

> `package.json` が見えない場合は場所が違います。
> `watchface` や `tools` の中にいるなら `cd ..` で1つ上に戻れます。

### 1-6. ブランチを切り替える（重要）

この文字盤デザインの変更は **`main` ではなく専用のブランチ**に入っています。
クローンした直後は `main` なので、切り替えないと古い状態のままです。

```sh
git fetch origin
git checkout claude/watch-face-design-refresh-02erxv
```

確認します。

```sh
git branch --show-current
```

`claude/watch-face-design-refresh-02erxv` と表示されればOKです。

### 1-7. 依存パッケージをインストールする（初回と、更新時）

```sh
npm install
```

初回は1〜3分かかります。`node_modules` フォルダが作られますが、触る必要はありません。
警告（`npm warn deprecated ...`）がたくさん出ますが、**エラーでなければ問題ありません**。

最後に脆弱性の件数と、npmからの提案が表示されます。

```
46 vulnerabilities (3 low, 7 moderate, 34 high, 2 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force
```

> ### ⚠️ `npm audit fix --force` は実行しないでください
>
> **Zeus CLI が動かなくなり、ビルドできなくなります。**
>
> これらの警告は Zeus CLI 1.9.3 が内部で抱えている古い依存に起因するもので、
> 本プロジェクトのコードが原因ではありません。`--force` は依存を破壊的に
> 更新するため、CLIの互換性が壊れます。
>
> `npm audit fix`（`--force` なし）も、`package.json` の `overrides` で
> 意図的に固定しているバージョンを動かす可能性があるため避けてください。
>
> 文字盤は端末上で動くもので、ここで警告が出ている依存は
> **開発時のビルドツールのみ**が使うものです。成果物には含まれません。

### 1-8. アセットを生成してテストする

```sh
npm run assets
npm run check
```

期待される出力:

```
Generated original pixel assets in assets/bip-6/images
```

```
# tests 15
# pass 15
# fail 0
```

`fail 0` になっていればOKです。`npm run check` には
**選択可能な全テーマに背景と天候アイコンの実ファイルがあるか**のチェックも含まれます。
ここが落ちる場合、端末で背景が表示されません。

### 1-9. 見た目を確認する（任意）

`docs/` フォルダにプレビュー画像が生成されています。ダブルクリックで開けます。

- `docs/preview-390x450.png` — 晴れ
- `docs/preview-night-390x450.png` — 夜
- `docs/preview-rain-390x450.png` — 雨

### 1-10. ビルドする

Zepp開発者アカウントへのログインが必要です（初回のみ）。

```sh
npx zeus login
```

ブラウザが開くのでログインします。続いてビルドします。

```sh
npm run build
```

成功すると `dist/` フォルダに `.zab` ファイルができます。

> `zeus build` は起動時にデバイス一覧を取得するためネットワークへ接続します。
> オフライン環境やプロキシ配下では `Updating devices, waiting ...` で
> AxiosError（405など）が出て停止します。その場合はネットワークを見直してください。

### よくある間違い

| 出たメッセージ | 原因 | 対処 |
|---|---|---|
| `npm error code ENOENT` / `Could not read package.json` | **リポジトリの外**で実行している | 1-4・1-5でルートへ移動 |
| `Missing script: "assets"` | 別のプロジェクトのフォルダにいる | 同上 |
| `Cannot find package 'pngjs'` | `npm install` 未実行 | 1-7を実施 |
| `command not found: npm` | Node.js未インストール | 1-2を実施 |
| `command not found: git` | Git未インストール | 1-3のリンクからインストール |
| 変更が反映されていない | ブランチが `main` のまま | 1-6を実施 |
| `zeus: command not found` | `npx` を付けていない | `npx zeus login` と書く |
| `art/backgrounds-src が見つかりません` | `npm run normalize` をルート以外で実行 | ルートへ移動して再実行 |
| `command not found: #` | 説明用のコメント行を一緒に貼った | `#` で始まる行は貼らない（下記参照） |
| `エラー: 入力が見つかりません: #` | 同上。`#` 以降が引数として渡された | 同上 |

> ### `#` から始まる行を貼らないでください
>
> macOSのzshは**対話シェルで `#` をコメントとして扱いません**
> （`interactivecomments` が既定で無効）。そのため解説記事などから
>
> ```
> npm run normalize   # 正規化する
> ```
>
> のようにコピーすると、`#` 以降が**コメントではなく引数**として渡され失敗します。
> このドキュメントのコード枠には**実行できる行だけ**を載せてあるので、
> 枠の中身をそのまま貼れば問題ありません。

### 2回目以降の作業

一度セットアップすれば、次回からはこれだけです。

```sh
cd ~/Documents/retro-quest-watchface
git pull origin claude/watch-face-design-refresh-02erxv
npm run check
```

---

## 2. Simulatorで先に確認する（実機不要・推奨）

実機に入れる前にSimulatorでレイアウトを確認すると、往復が速くなります。

1. Zepp OS Simulator を起動する
2. デバイスとして **Bip 6 / 390×450** を選択する
3. PCで `npm run dev` を実行する（Simulatorへ接続してホットリロード）
4. Simulatorの **Sensors** パネルで以下を切り替えて確認する
   - **Time** — 12時間制／24時間制、`9:05`（1桁時）と`10:38`（2桁時）
   - **Battery** — 100% / 68% / 45% / 15% / 0%（HPゲージの色が緑→黄→赤へ変わる）
   - **Weather** — index を変えて背景と天候アイコンが連動するか

公式手順: [Simulator](https://docs.zepp.com/docs/guides/tools/simulator/interface/)

> Simulatorはシステムフォントの字幅が実機と完全一致しない場合があります。
> **日付とHPラベルの間隔**は実機で最終確認してください（§5参照）。

---

## 3. 実機へインストール

### 3-1. Developer Modeを有効にする

スマホのZeppアプリで:

1. **プロフィール** → **設定** → **バージョン情報** を開く
2. 画面上部の **Zeppロゴを7回タップ**する
3. Developer Mode が有効になる

### 3-2. QRコードで転送する

PCで:

```sh
npm run preview
```

1. ターゲット選択で **Bip 6** を選ぶ
2. ターミナル（またはブラウザ）にQRコードが表示される

スマホで:

3. Zeppアプリの **Developer Mode** → **Scan** を開く
4. QRコードを読み取る
5. 文字盤が端末へ転送される

### 3-3. 端末で文字盤を適用する

1. Bip 6 の設定 → 文字盤 → **Pixel Wayfarer Face** を選択
2. 通常表示が出ることを確認する

公式手順: [Zepp App Developer Mode](https://docs.zepp.com/docs/v2/guides/tools/zepp-app/) /
[Zeus CLI](https://docs.zepp.com/docs/guides/tools/cli/overview/)

---

## 4. デバッグモードで背景10種を確認する

実際の天気を待たずに全テーマを端末で確認できます。
切り替えは**Zeppアプリの文字盤設定画面**から行います。

### 4-1. 設定画面を開く

1. Zeppアプリ → **プロフィール** → **Amazfit Bip 6**
2. **文字盤設定**（Watchface settings）→ **Pixel Wayfarer Face**
3. 2つのセクションが表示される
   - **Message preset** — TACTIC/MODEの文言
   - **Background preview (debug)** — 背景の強制切り替え ← これを使う

### 4-2. 全テーマを自動で巡回する

**`Cycle all themes (every 3s)`** を選びます。

- 3秒ごとに背景と天候アイコンが切り替わり、**30秒で10種を一周**します
- 文字盤が画面に出ている間だけ動きます（消灯・他画面では停止）
- 巡回順は `clear_day → partly_cloudy_day → cloudy_day → rain → thunder →
  snow → fog → clear_night → cloudy_night → unknown`

腕を上げたまま30秒眺めれば全テーマを一巡できます。

### 4-3. 1つのテーマに固定する

テーマ名のボタン（`Clear Day`、`Rain`、`Snow` など）を選ぶと固定表示になります。
時刻の可読性をじっくり見たいテーマ（特に **Snow** と **Partly Cloudy Day**）は
固定して確認してください。

### 4-4. 通常に戻す

**`Off — follow real weather`** を選ぶと実際の天気に連動する通常動作へ戻ります。

> ⚠ デバッグ指定は端末側にも保存されるため、**Offに戻すまで実際の天気を無視し続けます。**
> 確認が終わったら必ずOffへ戻してください。

### 4-5. 反映されないとき

設定はZeppアプリ → BLE → 端末の経路で届きます。反映されない場合:

- スマホと端末のBluetooth接続を確認する
- 文字盤を一度別のものに変えて戻す（`resume_call`で再取得されます）
- Zeppアプリを再起動する

---

## 5. 確認チェックリスト

### レイアウト・可読性

- [ ] 最上段: 天候アイコン・日付・HPゲージ・パーセントが重なっていない
- [ ] **日付とHPラベルの間隔**（システムフォントの字幅が想定と違わないか）
- [ ] 時刻が全10テーマで読める（`Cycle`で一周させる）
- [ ] **Snow / Partly Cloudy Day** で白い時刻数字が背景に埋もれていない
- [ ] TACTICタブと本文ボックスが1枚のウィンドウに見える（継ぎ目に線が出ていない）
- [ ] 半透明パネル（alpha 185）越しに背景が見えて、かつ文字が読める
- [ ] 気温3列（L / NOW / H）の区切り線と数字の位置が揃っている
- [ ] 四隅の金色ドットが切れていない

### 機能

- [ ] 12時間制で **AM/PM** が表示され、時刻数字と重なっていない
- [ ] 1桁時（`9:05`）と2桁時（`10:38`）の両方で中央寄せが崩れない
- [ ] 日付が `M/D DDD` 形式（曜日は英語大文字）
- [ ] 気温 L / NOW / H が実際の天気の値になっている
- [ ] 摂氏／華氏の切り替えに追従する
- [ ] バッテリー残量でHPゲージの分割数と色が変わる（緑→黄→赤）
- [ ] Message preset を変えると TACTIC の文言が変わる
- [ ] 天候が変わると背景と天候アイコンが**両方**切り替わる（Off時）

### AOD・省電力

- [ ] AOD（常時表示）で時刻・日付・低輝度HPのみ表示される
- [ ] AODに天候・装飾・コピーが出ていない
- [ ] `Cycle` 中に消灯 → 復帰しても巡回が暴走しない
- [ ] `Off` に戻した後、秒単位の更新が止まっている（電池の異常消費がない）

### 通常運用へ戻す

- [ ] **Background preview を `Off` に戻した**
- [ ] 半日〜1日使ってバッテリー消費が想定内

---

## 6. ストア提出前の注意

デバッグ機能は `.zab` に含まれます。提出前に判断してください。

- 一般ユーザーに見せたくない場合は、`setting/index.js` の
  **Background preview (debug)** セクションを削除する
  （`watchface/debug-theme.js` の `resolveDisplayTheme` は
  既定値0で通常動作するため、設定UIを消すだけで無効化できます）
- そのまま「背景を手動で選べる機能」として残すのも可。その場合は
  ラベルから `(debug)` を外し、説明文を整えてください

その他の提出手順は [README](../README.md) の「公開・提出」を参照してください。

---

## トラブルシュート

| 症状 | 対処 |
|---|---|
| `zeus build` が `Updating devices, waiting ...` で止まる | ネットワーク／プロキシを確認。Zeppのサーバーへ到達できる必要があります |
| `npm run preview` でログインを求められる | `npx zeus login` を実行 |
| QRを読んでも転送されない | Developer Modeが有効か、端末がペアリング済みかを確認 |
| 背景が真っ黒／出ない | `npm run check` の資産チェックが通るか確認。`assets/bip-6/images/backgrounds/` と `weather/` に10ファイルずつ必要です |
| 背景が引き伸ばされて汚い | 背景PNGが366×430ちょうどか確認（`npm run normalize` が検証します） |
| 設定を変えても端末に反映されない | §4-5参照 |
| 時刻が背景に埋もれる | `npm run normalize` の明部チェックを確認。詳細は [背景画像 生成指示書](background-image-gen-brief.md) §2 |
