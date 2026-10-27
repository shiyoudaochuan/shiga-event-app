-- =============================================================================
-- 0002_rls_policies.sql
-- Row Level Security（行レベルセキュリティ）の設定（Phase 2）
--
-- 考え方
--  - RLS を有効にしたテーブルは「ポリシーで明示的に許可された行」しか見えない／触れない。
--    ポリシーが 1 つも無ければ、その操作は全拒否。
--  - anon（ログインしていない一般利用者）と authenticated（ログイン済み）は
--    Supabase が自動で付けるロール。管理者かどうかは admins テーブルで判定する。
--  - service_role はすべての RLS をバイパスする。だからサーバー側だけで使う。
--
-- 検証方法は supabase/tests/rls_check.sql を参照
-- =============================================================================

-- ---------- 管理者判定関数 ----------
-- security definer: 関数の中では admins テーブルの RLS を気にせず読める
-- set search_path = '': 悪意ある同名オブジェクトに差し替えられる攻撃を防ぐ定番の書き方
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- RLS を有効化 ----------
alter table public.municipalities     enable row level security;
alter table public.categories         enable row level security;
alter table public.organizers         enable row level security;
alter table public.events             enable row level security;
alter table public.event_translations enable row level security;
alter table public.event_submissions  enable row level security;
alter table public.admins             enable row level security;

-- ---------- テーブル権限の絞り込み（RLS の前段。二重の守り） ----------
-- Supabase は既定で anon / authenticated に全テーブルの全権限を付けるので、不要な分を取り消す。
revoke all on public.event_submissions from anon;            -- 匿名は何もできない
revoke all on public.admins            from anon;
revoke insert, update, delete on public.admins from authenticated;   -- ログイン済みでも admins は書けない
revoke insert, update, delete on public.municipalities, public.categories,
       public.organizers, public.events, public.event_translations from anon;

-- ---------- municipalities / categories：誰でも閲覧、書き込みは管理者 ----------
drop policy if exists "municipalities: public read" on public.municipalities;
create policy "municipalities: public read" on public.municipalities
  for select to anon, authenticated using (true);
drop policy if exists "municipalities: admin write" on public.municipalities;
create policy "municipalities: admin write" on public.municipalities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- organizers：公開情報のみなので誰でも閲覧、書き込みは管理者 ----------
drop policy if exists "organizers: public read" on public.organizers;
create policy "organizers: public read" on public.organizers
  for select to anon, authenticated using (true);
drop policy if exists "organizers: admin write" on public.organizers;
create policy "organizers: admin write" on public.organizers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- events：公開済みだけ誰でも閲覧。管理者は全行の読み書き ----------
drop policy if exists "events: public read published" on public.events;
create policy "events: public read published" on public.events
  for select to anon, authenticated using (status = 'published');
drop policy if exists "events: admin all" on public.events;
create policy "events: admin all" on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- event_translations：親イベントが公開済みなら閲覧可 ----------
drop policy if exists "translations: public read of published" on public.event_translations;
create policy "translations: public read of published" on public.event_translations
  for select to anon, authenticated using (
    exists (select 1 from public.events e where e.id = event_id and e.status = 'published')
  );
drop policy if exists "translations: admin all" on public.event_translations;
create policy "translations: admin all" on public.event_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- event_submissions：匿名ポリシーなし（＝全拒否）。管理者のみ閲覧・更新・削除 ----------
-- INSERT は Phase 4 でサーバー側 Route Handler が service_role で行う。
-- （anon に insert を許すと、Turnstile やレート制限を素通りして直接 API を叩けてしまうため）
drop policy if exists "submissions: admin read" on public.event_submissions;
create policy "submissions: admin read" on public.event_submissions
  for select to authenticated using (public.is_admin());
drop policy if exists "submissions: admin update" on public.event_submissions;
create policy "submissions: admin update" on public.event_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "submissions: admin delete" on public.event_submissions;
create policy "submissions: admin delete" on public.event_submissions
  for delete to authenticated using (public.is_admin());

-- ---------- admins：自分の行だけ閲覧可。INSERT/UPDATE/DELETE のポリシーは意図的に無し ----------
-- → 行を追加できるのは RLS をバイパスする service_role（SQL Editor）だけ。
--   一般利用者が自分を管理者にすることはできない。
drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());
