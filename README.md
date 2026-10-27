# しが つながるイベント

在日外国人向けの地域イベント・支援情報掲示板（初期対象：滋賀県）。
自治体・国際交流協会・NPO などに分散している日本語教室・生活相談・国際交流などの情報を一か所に集め、
ログイン不要・個人情報ゼロで検索・閲覧できることを目指しています。

> **現在の状態：Phase 1〜2 完了（画面＋データベース基盤）。**
> 管理者機能・掲載依頼フォーム・多言語 UI はまだ実装されていません。
> 「できていること／できていないこと」は末尾の [実装状況](#実装状況) を見てください。

---

## 使用技術と選んだ理由

| 役割 | 技術 | 理由 |
|---|---|---|
| フロント／サーバー | Next.js 15（App Router）+ React 19 + TypeScript | 1 つのコードベースで画面と API を書ける。サーバーコンポーネントで DB 問い合わせを「サーバー側だけ」に閉じ込められる |
| スタイル | Tailwind CSS v4 | CSS ファイルを増やさず、スマホ優先のレスポンシブを書きやすい |
| DB／認証 | Supabase（PostgreSQL + Auth + RLS） | 無料枠で始められ、**DB 側でアクセス制御（RLS）を強制**できる |
| ホスティング | Vercel | Next.js と相性が良く、GitHub に push するだけで公開できる |
| テスト | Node 標準 `node:test` + tsx | 追加ライブラリなしでロジックの単体テストができる |

依存ライブラリは `@supabase/supabase-js` のみ（他は Next.js / Tailwind / 開発ツール）。

## フォルダ構成

```
src/
  app/                      ページ（App Router）
    layout.tsx              共通レイアウト（ヘッダー・フッター・スキップリンク）
    page.tsx                トップ＝検索フォーム＋イベント一覧
    events/[id]/page.tsx    イベント詳細
    not-found.tsx, error.tsx 404 / エラー画面
    globals.css             Tailwind の読み込みとデザイントークン
  components/               画面部品（EventCard, SearchForm, EventList ...）
  config/                   アプリ名・カテゴリ・市町・言語の定義（★変更が多いのはここ）
  lib/
    types.ts                Event 型
    events/filter.ts        絞り込みロジック（純粋関数・テスト対象）
    events/repository.ts    データ取得口。Supabase or サンプルデータを自動で切り替え
    events/sample-data.ts   サンプルデータ（すべて架空）
    supabase/               Supabase クライアント・行→型変換
    i18n/                   UI 文言辞書（今は ja のみ。Phase 5 で 5 言語に）
    format.ts, url.ts       日本時間フォーマット・URL 安全チェック
supabase/
  migrations/0001_initial_schema.sql   テーブル定義＋マスタデータ
  migrations/0002_rls_policies.sql     RLS（アクセス制御）
  seed.sql                             開発用サンプルデータ（架空）
  tests/rls_check.sql                  RLS の検証 SQL
tests/                      単体テスト
docs/DESIGN.md              設計書（画面一覧・DB・セキュリティ）
docs/PRE_LAUNCH_CHECKLIST.md 公開前チェックリスト
```

### データの流れ

```
page.tsx ──▶ lib/events/repository.ts ──┬─▶ Supabase（.env.local あり）── RLS で published のみ
                                         └─▶ sample-data.ts（.env.local なし）
         ──▶ lib/events/filter.ts（URL クエリの条件で絞り込み）
         ──▶ components/EventList → EventCard
```

---

## ローカル環境での起動方法

必要なもの：Node.js 20 以上（推奨 22）、npm

```bash
npm install
npm run dev
# → http://localhost:3000
```

`.env.local` が無い状態では **サンプルデータモード** で起動します（画面に黄色い注意が出ます）。
レイアウト確認や学習にはこのモードで十分です。

その他のコマンド

```bash
npm test          # ロジックの単体テスト
npm run typecheck # 型チェック
npm run lint      # ESLint
npm run build     # 本番ビルド（Vercel と同じ）
```

---

## Supabase の設定方法

1. https://supabase.com でプロジェクトを作成（リージョンは Tokyo 推奨）。
2. ダッシュボード > **SQL Editor** を開き、次の順番でファイルの内容を貼り付けて Run。
   1. `supabase/migrations/0001_initial_schema.sql`
   2. `supabase/migrations/0002_rls_policies.sql`
   3. （開発用のみ）`supabase/seed.sql` — 本番には入れない
3. **SQL Editor** で `supabase/tests/rls_check.sql` を実行し、「期待」どおりになるか確認。
4. ダッシュボード > Project Settings > **API** から `Project URL` と `anon public` キーをコピー。

> Supabase CLI を使う場合：`supabase link --project-ref <ref>` のあと `supabase db push` で migrations が適用されます。
> 以後 DB を変える時は **新しい migration ファイル**（`0003_xxx.sql`）を追加し、ダッシュボードで直接変更しないでください（仕様 11-8）。

## 環境変数の設定方法

```bash
cp .env.example .env.local
```

| 変数 | 置き場所 | 内容 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Vercel | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Vercel | anon キー。ブラウザに渡ってもよい（RLS で守られる） |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 3 で追加 | **サーバー専用**。`NEXT_PUBLIC_` を付けない。GitHub に上げない |

`.env.local` は `.gitignore` 済みです。`git status` に `.env.local` が出たら設定ミスなので止めてください。

## 管理者アカウントの作成方法（初期管理者の安全な登録手順）

管理画面は Phase 3 で実装しますが、DB 側の仕組みはできています。

1. Supabase ダッシュボード > **Authentication > Users > Add user** でメールアドレスとパスワードを登録（「Auto Confirm User」を ON）。
2. 作成されたユーザーの **UUID** をコピー。
3. **SQL Editor** で次を実行（SQL Editor は service_role 相当なので RLS をバイパスして書き込めます）：
   ```sql
   insert into public.admins (user_id, note) values ('<ここに UUID>', '初期管理者');
   ```
4. `select public.is_admin()` を `rls_check.sql` の 6 番の方法で確認。

**重要**：`admins` テーブルには一般ユーザーが書き込めるポリシーが存在しません。
アプリの画面や API から管理者を追加する機能は意図的に作っていないため、管理者を増やすときも必ずこの手順で行います。
MFA（多要素認証）は Supabase Auth の機能を Phase 3 のログイン画面で有効化します。

## イベント情報の登録方法（Phase 3 の管理画面ができるまで）

Supabase ダッシュボード > **Table Editor > events** で行を追加します。

- `category_slug` と `municipality_slug` は `categories` / `municipalities` テーブルにある値だけ使えます。
- `start_at` / `end_at` は UTC で入ります。日本時間 14:00 なら `05:00+00` と入力するか、`2026-11-03 14:00:00+09` のように `+09` を付けます。
- `status` を `published` にしたものだけが公開されます。まず `draft` で作り、内容を確認してから `published` に変えてください。
- `registration_url` / `source_url` は `https://` で始まらないと保存できません（CHECK 制約）。

---

## セキュリティ上の注意点

実装済み（Phase 1〜2）

- **RLS による強制**：匿名ユーザーが見えるのは `status = 'published'` のイベントだけ。`event_submissions` は権限自体を剥奪。`admins` は自分の行だけ。
- **管理者の自己昇格を防止**：`admins` に書き込みポリシーなし。判定関数 `is_admin()` は `security definer` + `search_path = ''`。
- **XSS**：React の自動エスケープのみ使用。`dangerouslySetInnerHTML` は使わない。外部 URL は `https://` のみ `<a href>` に出力し、`rel="noopener noreferrer"` を付与。
- **不正 URL**：アプリ側（`lib/url.ts`）と DB 側（CHECK 制約）の二重チェック。
- **SQL インジェクション**：supabase-js のパラメータ化クエリのみ。
- **鍵の管理**：anon キーのみブラウザへ。service_role は未使用。`.env*` は Git 管理外。
- **個人情報ゼロ**：一般利用者の Cookie・ストレージ・位置情報を使わない。検索条件は URL クエリのみ。
- **HTTP ヘッダ**：`X-Frame-Options: DENY`、`nosniff`、`Referrer-Policy`、`Permissions-Policy`（`next.config.ts`）。
- **ログ**：エラーログに接続情報や鍵を含めない。エラー画面に詳細を出さない。

未実装（公開前に必要）

- 掲載依頼フォームのボット対策（Cloudflare Turnstile）とサーバー側レート制限 → Phase 4。**未設定なら受付を停止する設計**にします。
- 管理者ログインと MFA → Phase 3。
- CSP（Content-Security-Policy）ヘッダ → Phase 6。
- プライバシーポリシー・お問い合わせページ → Phase 6（運営者情報は「設定待ち」表示のまま）。

## バックアップ・復元方法

Supabase **無料プラン**には自動バックアップ（Point-in-time recovery / Daily backups）が**ありません**（Pro プラン以上）。
そのため次の代替手段を使います。

1. **SQL ダンプ（推奨・無料）**
   ```bash
   # Supabase CLI。接続文字列は Project Settings > Database から
   supabase db dump --db-url "$DATABASE_URL" --data-only -f backup_$(date +%Y%m%d).sql
   ```
   復元：`psql "$DATABASE_URL" -f backup_YYYYMMDD.sql`
   ダンプには `event_submissions.contact_email`（個人情報）が含まれるため、**暗号化したストレージに保管し、公開リポジトリに入れない**こと。
2. **CSV エクスポート**：Table Editor の各テーブル右上「Export to CSV」。管理画面からの CSV 出力は Phase 3 で実装予定。
3. **スキーマ**は `supabase/migrations/` が正本なので、新しいプロジェクトに migrations → ダンプの順で流せば復元できます。

バックアップは週 1 回程度を目安に、`docs/PRE_LAUNCH_CHECKLIST.md` に運用手順として記載しています。

## Vercel での公開方法

1. GitHub にリポジトリを作り push（`.env.local` が含まれていないことを確認）。
2. https://vercel.com で「Add New Project」→ リポジトリを選択。Framework は自動で Next.js と認識されます。
3. **Environment Variables** に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を登録。
4. Deploy。以後は `main` に push するたびに自動デプロイ。
5. Supabase 側：Authentication > URL Configuration の Site URL に Vercel のドメインを設定（Phase 3 のログインで必要）。

## 本番公開前に必要な確認事項

`docs/PRE_LAUNCH_CHECKLIST.md` を参照してください。Phase 3〜6 が終わるまで一般公開はしないでください。

---

## 実装状況

| 項目 | 状態 |
|---|---|
| トップページ／イベント一覧／詳細ページ | ✅ 完了 |
| キーワード・市町・カテゴリ・開催日・無料/有料・言語の複合検索 | ✅ 完了 |
| 0 件時の案内、終了済み・下書きの非表示 | ✅ 完了 |
| レスポンシブ・アクセシビリティ（ラベル、44px タップ、スキップリンク、フォーカス表示） | ✅ 完了（実機確認は未） |
| Supabase 接続・取得・サンプルデータ自動切替 | ✅ 完了（要 .env.local） |
| テーブル定義・マスタ投入・CHECK 制約 | ✅ 完了 |
| RLS（公開／非公開の分離、管理者判定） | ✅ 完了・検証 SQL あり |
| UI 文言の辞書化（多言語化の土台） | ✅ 完了（ja のみ） |
| 言語切替 UI・5 言語辞書・イベント翻訳の表示 | ⬜ Phase 5 |
| 管理者ログイン・イベント CRUD・公開切替・CSV エクスポート | ⬜ Phase 3 |
| 掲載依頼フォーム・Turnstile・レート制限・承認フロー | ⬜ Phase 4 |
| プライバシーポリシー・お問い合わせ・CSP | ⬜ Phase 6 |

### テスト結果（開発環境）

- `tests/` の単体テスト 11 件：**すべて合格**（絞り込み、日付の日本時間変換、URL 安全判定、DB 行変換）。
- `next build` は作成環境で npm レジストリに接続できなかったため**未実行**。手元で `npm install && npm run build` を実行し、エラーが出たら Issue にしてください。
- RLS は `supabase/tests/rls_check.sql` を Supabase 上で実行して確認してください（作成環境に PostgreSQL が無いため未実行）。
