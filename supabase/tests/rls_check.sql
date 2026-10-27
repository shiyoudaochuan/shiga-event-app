-- =============================================================================
-- rls_check.sql — RLS が意図どおりに働いているかを SQL Editor で確認する
--
-- 使い方：Supabase ダッシュボード > SQL Editor に貼り付けて Run。
-- 各ブロックは begin〜rollback で囲んであるので、データは変更されません。
-- 「期待」どおりの結果になれば OK。
-- =============================================================================

-- ---------- 1. 匿名ユーザーは published のイベントしか見えない ----------
begin;
  set local role anon;
  select
    count(*)                                   as visible_rows,
    count(*) filter (where status <> 'published') as non_published_visible  -- 期待: 0
  from public.events;
rollback;

-- ---------- 2. 匿名ユーザーは掲載依頼を一切読めない ----------
-- 期待: 「permission denied for table event_submissions」というエラー
-- （revoke により権限自体が無い。エラーになるのが正しい）
begin;
  set local role anon;
  select count(*) from public.event_submissions;
rollback;

-- ---------- 3. 匿名ユーザーはイベントを書き換えられない ----------
-- 期待: permission denied エラー
begin;
  set local role anon;
  update public.events set title = 'hacked' where true;
rollback;

-- ---------- 4. ログイン済み（管理者でない）ユーザーも非公開は見えない ----------
-- 任意の UUID を一般ユーザーとして偽装
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}';
  select public.is_admin() as is_admin;                               -- 期待: false
  select count(*) filter (where status <> 'published') as non_published_visible from public.events;  -- 期待: 0
  select count(*) as submissions_visible from public.event_submissions;  -- 期待: 0（エラーにはならないが 0 行）
rollback;

-- ---------- 5. 一般ユーザーは自分を管理者にできない ----------
-- 期待: permission denied エラー
begin;
  set local role authenticated;
  set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}';
  insert into public.admins (user_id) values ('00000000-0000-4000-8000-000000000000');
rollback;

-- ---------- 6. 管理者は下書きも見える（admins に登録済みの user_id を入れて実行） ----------
-- begin;
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<管理者の user_id>","role":"authenticated"}';
--   select public.is_admin();                                          -- 期待: true
--   select status, count(*) from public.events group by status;       -- 期待: draft も含まれる
-- rollback;
