# 公開前チェックリスト

Phase 6（公開準備）で全項目を確認してから一般公開する。現時点（Phase 2 完了）で済んでいる項目には ✅ を付けている。

## A. アクセス制御・RLS
- [x] 匿名ユーザーは `status='published'` のイベントしか取得できない（`rls_check.sql` 1）
- [x] 匿名ユーザーは `event_submissions` を読めない（同 2）
- [x] 匿名ユーザーはイベントを更新できない（同 3）
- [x] ログイン済みの一般ユーザーも非公開データを読めず、自分を管理者にできない（同 4・5）
- [ ] 管理者だけが下書き・掲載依頼を読める（同 6 ― 管理者登録後に実施）
- [ ] 管理画面の全操作でサーバー側の `is_admin()` チェックを通る（Phase 3）
- [ ] ブラウザの開発者ツールから `event_submissions` を直接 `select` して 0 件／エラーになる

## B. 秘密情報
- [x] `.env*` が `.gitignore` に入っている
- [ ] `git log -p | grep -i service_role` で鍵がコミット履歴に無い
- [ ] Vercel の環境変数に `NEXT_PUBLIC_` 付きで service_role を入れていない
- [ ] ソースに Supabase URL 以外の接続情報がハードコードされていない

## C. 入力検証・スパム対策（Phase 4）
- [ ] 掲載依頼フォームはサーバー側でも長さ・形式・URL（https のみ）を検証
- [ ] Cloudflare Turnstile のサイトキー／シークレットが設定され、未設定時は受付を停止する
- [ ] レート制限がサーバー側（DB または Edge）で動く
- [ ] CSRF：Server Actions / Route Handler の Origin 検証が有効

## D. XSS・ヘッダ
- [x] `dangerouslySetInnerHTML` を使っていない（`grep -r dangerouslySetInnerHTML src` が空）
- [x] 外部 URL は `https://` のみ・`rel="noopener noreferrer"`
- [x] `X-Frame-Options` / `nosniff` / `Referrer-Policy` / `Permissions-Policy`
- [ ] Content-Security-Policy（nonce 方式）を導入し、画面が壊れないことを確認

## E. 個人情報保護法への対応（Phase 6）
- [ ] プライバシーポリシーページ：取得する情報（主催者担当者メールのみ）、利用目的、保管期間、削除方法、問い合わせ先
- [ ] お問い合わせ先ページ（運営者名・連絡手段が **確定してから** 記載。架空の情報で埋めない）
- [ ] 主催者の連絡先が公開テーブル・API・画面のどこにも出ないことを確認
- [ ] 承認／拒否から一定期間経過した掲載依頼を削除する運用（または SQL）を決める

## F. バックアップ
- [ ] `supabase db dump` を 1 回実際に実行し、別プロジェクトへ復元できた
- [ ] バックアップの保管場所（暗号化）と頻度（週 1 など）を決めた

## G. 表示・アクセシビリティ
- [ ] iPhone / Android の実機で一覧・詳細・検索を操作
- [ ] キーボードだけで検索→詳細→申込ボタンまで到達できる
- [ ] Lighthouse の Accessibility スコア 90 以上
- [ ] 日本時間で日時が表示される（Vercel のリージョンに関係なく）

## H. 運用
- [ ] 初期管理者を README の手順で登録し、MFA を有効化
- [ ] `last_verified_at` を更新する運用（掲載前に主催者サイトと申込 URL を目視確認）を決めた
- [ ] サンプルデータ（`seed.sql`）が本番 DB に入っていない
- [ ] アプリ名を `src/config/app.ts` で最終決定
