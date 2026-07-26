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

## 1. ローカル準備

```sh
npm install
npm run assets     # 数字・記号・天候アイコン・プレビューを生成
npm run check      # 純粋ロジックのテスト（15件）
```

`npm run check` には**選択可能な全テーマに背景と天候アイコンの実ファイルが
存在するか**のチェックも含まれます。ここが落ちる場合、端末で背景が出ません。

次にビルドが通ることを確認します。

```sh
npx zeus login     # 初回のみ。ブラウザでZepp開発者アカウントにログイン
npm run build      # dist/ に .zab を生成
```

> `zeus build` は起動時にデバイス一覧を取得するためネットワークへ接続します。
> オフライン環境やプロキシ配下では `Updating devices, waiting ...` で
> AxiosError（405など）が出て停止します。その場合はネットワークを見直してください。

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
