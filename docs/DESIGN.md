# 設計書（Step 1：要件整理）

アプリ仮名称：**しが つながるイベント**（`src/config/app.ts` で変更可能）

## 1. 全体構成

```
ブラウザ（スマホ / PC）
   │  HTTPS
   ▼
Vercel（Next.js App Router）
   ├─ サーバーコンポーネント … Supabase から「公開済みイベント」だけを取得して HTML を生成
   ├─ Route Handler（Phase 3〜）… 管理者操作・掲載依頼の受付（サーバー側で権限チェック）
   └─ 静的アセット
   │  anon key（公開してよい鍵）/ service_role key（サーバー側のみ・Phase 3〜）
   ▼
Supabase（PostgreSQL + Auth）
   ├─ events / organizers / event_translations … 公開データ（RLS で published のみ匿名閲覧可）
   ├─ event_submissions … 非公開データ（RLS で匿名からの SELECT を完全拒否）
   └─ admins … 管理者判定（RLS で本人行のみ閲覧可、書き込みは不可）
```

設計上のポイント

- **一般利用者はログイン不要・個人情報ゼロ**。Cookie も使わない（検索条件は URL クエリに持つ）。
- **アクセス制御は DB（RLS）で強制**する。画面側のボタン非表示には頼らない。
- Supabase の接続情報が未設定でも、**明示的に「サンプル」と表示したデータ**で画面が動く（学習・レイアウト確認用）。
- 多言語化は最初から `src/lib/i18n/` に UI 文言を集約し、イベント本文は `event_translations` に保存する構造。

## 2. 画面一覧

| # | パス | 画面 | Phase | 内容 |
|---|---|---|---|---|
| 1 | `/` | トップ＝イベント一覧 | 1 | ロゴ、言語切替（Phase 5 で有効化）、検索フォーム、開催予定イベント一覧、掲載依頼リンク |
| 2 | `/events/[id]` | イベント詳細 | 1 | 仕様 2-4 の全項目、申込ボタン、情報元リンク、最終確認日 |
| 3 | `/submit` | 掲載依頼フォーム | 4 | 主催者向け。送信内容は非公開保存 |
| 4 | `/admin/login` | 管理者ログイン | 3 | Supabase Auth（メール＋パスワード、MFA 対応予定） |
| 5 | `/admin` | 管理ダッシュボード | 3 | 掲載依頼の確認・承認・拒否、イベント CRUD、公開切替 |
| 6 | `/privacy` `/contact` | プライバシーポリシー・お問い合わせ | 6 | 運営者情報は「設定待ち」表示 |

Phase 1〜2（今回）で実装したのは 1・2 と、3〜6 の土台（DB・RLS）。

## 3. データベース構造

`supabase/migrations/` に SQL で管理（仕様 11-8）。

| テーブル | 公開範囲 | 役割 |
|---|---|---|
| `municipalities` | 公開 | 都道府県＋市町マスタ。滋賀県 19 市町を初期投入。他府県は行を追加するだけで拡張可 |
| `categories` | 公開 | カテゴリマスタ（10 件）。追加・並び替えは行の追加・`sort_order` 変更で対応 |
| `organizers` | 公開 | 主催団体。**連絡先メールなどの非公開情報はこのテーブルに置かない** |
| `events` | `status = 'published'` のみ公開 | イベント本体。`status` は draft / published / cancelled / unpublished |
| `event_translations` | 親イベントが公開なら公開 | タイトル・説明の翻訳（言語コードごとに 1 行） |
| `event_submissions` | **非公開** | 主催者からの掲載依頼。担当者メールを含むため匿名 SELECT 禁止 |
| `admins` | 本人行のみ | `auth.users.id` と管理者権限の紐づけ。自分で INSERT 不可 |

主要な制約

- URL 列は `https://` で始まるもののみ許可（CHECK 制約）。`javascript:` 等を DB レベルで排除。
- 日時は `timestamptz`（UTC 保存）。表示時に `Asia/Tokyo` へ変換。
- `participation_fee` は円の整数。0 = 無料。補足は `fee_note` に文字列で。
- `supported_languages` は言語コード配列（`ja`, `easy-ja`, `en`, `vi`, `pt`, ...）。

## 4. セキュリティ設計（要点）

| 脅威 | 対策 | 実装場所 |
|---|---|---|
| 非公開データの漏えい | RLS：匿名は `events.status='published'` のみ。`event_submissions` は匿名ポリシーなし＝全拒否 | `0002_rls_policies.sql` |
| 管理者権限の奪取 | `admins` へ INSERT できるのは service_role のみ。判定は `is_admin()`（SECURITY DEFINER） | 同上 |
| XSS | React の自動エスケープ、`dangerouslySetInnerHTML` 不使用、URL は `https://` のみ許可してから `<a>` に出力 | `src/lib/url.ts` |
| SQL インジェクション | Supabase クライアント（パラメータ化）のみ使用。文字列連結の SQL なし | `src/lib/supabase/` |
| クリックジャッキング等 | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ヘッダ | `next.config.ts` |
| 鍵の漏えい | anon key だけをブラウザに渡す。service_role は Phase 3 でサーバー専用環境変数に | `.env.example` |
| スパム・レート制限 | Phase 4 で Turnstile + サーバー側レート制限。未設定なら受付を停止する設計 | （未実装） |

## 5. フォルダ構成

```
src/
  app/                 … ページ（App Router）
    layout.tsx         … 共通レイアウト（ヘッダー・フッター）
    page.tsx           … トップ＝一覧＋検索
    events/[id]/page.tsx … 詳細
  components/          … UI 部品
  config/              … アプリ名・カテゴリ・市町・言語などの設定値
  lib/
    events/            … イベント取得（repository）と絞り込み（filter）
    supabase/          … Supabase 接続と行→型の変換
    i18n/              … UI 文言辞書
    format.ts, url.ts  … 日付・URL ユーティリティ
supabase/
  migrations/          … スキーマと RLS
  seed.sql             … 開発用サンプルデータ
  tests/rls_check.sql  … RLS の手動検証 SQL
tests/                 … ロジックの単体テスト（node:test）
```
