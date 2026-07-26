# art/backgrounds-src

Image Gen由来の**背景元画像**を置くディレクトリです。ここのファイルは端末へパッケージされません。

## 使い方

1. `docs/background-image-gen-brief.md` に従って背景を生成する
2. 生成した高解像度PNGを、テーマ名でここへ置く
   （`clear_day.png`, `partly_cloudy_day.png`, `cloudy_day.png`, `rain.png`, `thunder.png`,
   `snow.png`, `fog.png`, `clear_night.png`, `cloudy_night.png`, `unknown.png`）
3. 正規化して `assets/` へ出力する

   ```sh
   npm run normalize
   ```

4. プレビューを更新して重なりを目視確認する

   ```sh
   npm run assets
   ```

`npm run normalize` が寸法（366×430）・色数・時刻バンドの輝度を検証し、
問題があれば警告します。判定基準は指示書の§6を参照してください。

## 元画像をコミットするかどうか

高解像度の元画像は1枚あたり数MBになることがあります。判断の目安：

- **コミットする** … 再生成・微調整の再現性を優先する場合（リポジトリは重くなる）
- **コミットしない** … `.gitignore` に `art/backgrounds-src/*.png` を追加し、
  元画像は別途保管する（軽量だが再現性は手元依存になる）

どちらでも `assets/bip-6/images/backgrounds/*.png`（正規化済み・軽量）は必ずコミットしてください。
これが実際に端末へ載る成果物です。
