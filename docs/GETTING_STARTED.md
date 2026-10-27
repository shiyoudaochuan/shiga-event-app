# はじめての起動と GitHub 管理（Mac 向け手順書）

このファイルは「ZIP を受け取ってから、手元で動かして GitHub に置くまで」の手順です。
上から順にやれば OK。途中で止まったら、ターミナルに出たメッセージをそのまま Claude に貼ってください。

---

## 0. 必要なツールを入れる（最初の 1 回だけ）

ターミナル（Launchpad →「その他」→「ターミナル」）を開いて、入っているか確認します。

```bash
node -v    # v20 以上なら OK（例: v22.12.0）
git --version
```

無い／古い場合：

| ツール | 入れ方 |
|---|---|
| Node.js | https://nodejs.org → 「LTS」をダウンロードしてインストール |
| Git | ターミナルで `xcode-select --install`（Apple の開発ツールに同梱） |
| VS Code（エディタ） | https://code.visualstudio.com |
| GitHub アカウント | https://github.com で作成（無料） |

Git を初めて使うときは、名前とメールを登録します（コミット履歴に記録される情報です）。

```bash
git config --global user.name "あなたの名前"
git config --global user.email "GitHub に登録したメール"
```

---

## 1. プロジェクトを手元で動かす

1. ZIP を展開し、フォルダ `shiga-tsunagaru-events` を好きな場所（例：`~/dev/`）に置く。
2. VS Code で「File → Open Folder」からそのフォルダを開く。
3. VS Code 内でターミナルを開く（メニュー「Terminal → New Terminal」）。
4. 依存ライブラリを入れて起動：

```bash
npm install     # 1〜3 分。node_modules フォルダが作られる
npm run dev     # 開発サーバー起動
```

5. ブラウザで http://localhost:3000 を開く。
   黄色の「サンプルデータです」という注意と、架空のイベント一覧が出れば成功です。
   検索フォームで「大津市」「無料のみ」などを選んで動きを確認してみてください。
6. 止めるときはターミナルで `Ctrl + C`。

> `npm install` で赤いエラーが出たら、その全文を Claude に貼ってください。

---

## 2. Git で「記録」を始める

### Git の最低限の考え方

- **リポジトリ**：変更履歴ごと保存されたプロジェクトフォルダ。手元（ローカル）と GitHub（リモート）の 2 か所に置く。
- **コミット**：「ここまでの変更をひとまとめにして記録」する操作。セーブポイントのようなもの。
- **プッシュ**：手元のコミットを GitHub に送る。
- `.gitignore`：記録しないファイルの一覧。`node_modules`（巨大・再生成できる）と `.env.local`（秘密情報）を除外済み。

### 最初のコミット

VS Code のターミナルで：

```bash
git init                      # このフォルダを Git で管理し始める
git add .                     # すべてのファイルを「記録対象」に入れる
git status                    # ← .env.local や node_modules が無いことを目で確認
git commit -m "Phase 1-2: 画面とデータベース基盤"
```

`git status` に `.env.local` が出てきたら絶対にコミットしないでください（今はまだファイル自体を作っていないので出ないはずです）。

---

## 3. GitHub に置く（プッシュ）

### 方法 A：VS Code から（いちばん簡単・推奨）

1. VS Code 左の「ソース管理」アイコン（枝分かれマーク）をクリック。
2. 「Publish Branch」または「Publish to GitHub」ボタンを押す。
3. 初回はブラウザが開いて GitHub へのサインインを求められるので許可する。
4. 「Publish to GitHub **private** repository」を選ぶ（まずは非公開でよい）。
5. 完了すると右下に GitHub のリンクが出る。開いてファイルが並んでいれば成功。

### 方法 B：コマンドで

1. https://github.com/new でリポジトリを作る。名前は `shiga-tsunagaru-events`、Private、**「Add a README」などのチェックは全部オフ**。
2. 表示される「…or push an existing repository」の 3 行をそのまま実行：

```bash
git remote add origin https://github.com/<ユーザー名>/shiga-tsunagaru-events.git
git branch -M main
git push -u origin main
```

パスワードを聞かれたら GitHub のパスワードではなく **Personal Access Token** が必要です。方法 A の方が楽なので、迷ったら A にしてください。

---

## 4. これからの毎日の流れ

```bash
npm run dev                         # 作業開始：起動して確認しながら編集
# ...ファイルを編集...
git add .
git commit -m "何を変えたか短く"      # 例: "検索フォームの文言を修正"
git push                            # GitHub に送る
```

コツ：
- コミットは「小さく・こまめに」。1 機能や 1 修正ごと。
- メッセージは日本語で構いません。あとで読んで分かることが大事。
- 困ったら `git status`（今の状態）と `git log --oneline`（履歴）で現在地を確認。

Phase 3 以降は「ブランチ」（本線を壊さずに実験する枝）も使っていきます。そのときに説明します。

---

## 5. Supabase（データベース）はいつやる？

ここまでの 1〜4 ができたら次のステップです。手順は README の「Supabase の設定方法」にありますが、
**Claude と一緒に画面を見ながら進める**のがおすすめです。「Supabase の設定を始めたい」と言ってください。

---

## 困ったときのチェックリスト

| 症状 | 見るところ |
|---|---|
| `command not found: npm` | Node.js が入っていない → 手順 0 |
| `npm install` が失敗 | エラー全文を Claude へ。Node のバージョンが古いことが多い |
| localhost:3000 が開かない | ターミナルに `Ready` と出ているか。別のアプリが 3000 番を使っていると `3001` になる |
| `git push` で認証エラー | 方法 A（VS Code から）に切り替える |
| 画面が真っ白／赤いエラー | ターミナルとブラウザのエラー文を Claude へ |
