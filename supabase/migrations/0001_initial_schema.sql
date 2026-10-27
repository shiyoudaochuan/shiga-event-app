-- =============================================================================
-- 0001_initial_schema.sql
-- テーブル定義（Phase 2）
--
-- 適用方法：
--   A) Supabase ダッシュボード > SQL Editor にこのファイルの内容を貼り付けて Run
--   B) Supabase CLI:  supabase db push   （supabase link 済みの場合）
--
-- ポイント
--  - 日時はすべて timestamptz（UTC で保存し、表示時に日本時間へ変換）
--  - URL 列は https:// のみ許可する CHECK 制約（javascript: 等を DB で排除）
--  - 個人情報は event_submissions.contact_email だけ。公開テーブルには置かない
-- =============================================================================

-- ---------- 共通：updated_at を自動更新するトリガー関数 ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- 公開状態 ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_status') then
    create type public.event_status as enum ('draft', 'published', 'cancelled', 'unpublished');
  end if;
end$$;

-- ---------- 地域マスタ（都道府県＋市町） ----------
-- 他府県へ拡張するときは行を追加するだけ。src/config/municipalities.ts と slug を揃える
create table if not exists public.municipalities (
  slug        text primary key,
  prefecture  text not null,              -- 例: 'shiga'
  name_ja     text not null,
  sort_order  integer not null default 0,
  constraint municipalities_slug_format check (slug ~ '^[a-z0-9-]{1,40}$')
);

-- ---------- カテゴリマスタ ----------
create table if not exists public.categories (
  slug        text primary key,
  name_ja     text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  constraint categories_slug_format check (slug ~ '^[a-z0-9-]{1,40}$')
);

-- ---------- 主催団体（公開情報のみ） ----------
create table if not exists public.organizers (
  id                 uuid primary key default gen_random_uuid(),
  organization_name  text not null,
  description        text,
  website_url        text,
  prefecture         text,
  municipality_slug  text references public.municipalities(slug) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint organizers_name_len check (char_length(organization_name) between 1 and 200),
  constraint organizers_website_https check (website_url is null or website_url ~ '^https://')
);
-- ※ 担当者メールなどの連絡先は、このテーブルには絶対に追加しないこと（匿名で SELECT 可能なため）

drop trigger if exists organizers_set_updated_at on public.organizers;
create trigger organizers_set_updated_at
  before update on public.organizers
  for each row execute function public.set_updated_at();

-- ---------- イベント本体 ----------
create table if not exists public.events (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  description            text not null,
  category_slug          text not null references public.categories(slug),
  prefecture             text not null default 'shiga',
  municipality_slug      text not null references public.municipalities(slug),
  venue                  text not null,
  address                text,
  start_at               timestamptz not null,
  end_at                 timestamptz,
  registration_deadline  timestamptz,
  participation_fee      integer not null default 0,      -- 円。0 = 無料
  fee_note               text,
  target_audience        text,
  supported_languages    text[] not null default '{ja}',  -- 言語コード配列
  organizer_id           uuid references public.organizers(id) on delete set null,
  how_to_apply           text,
  registration_url       text,
  source_url             text,
  status                 public.event_status not null default 'draft',
  last_verified_at       date,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint events_title_len        check (char_length(title) between 1 and 200),
  constraint events_description_len  check (char_length(description) between 1 and 5000),
  constraint events_fee_nonnegative  check (participation_fee >= 0),
  constraint events_end_after_start  check (end_at is null or end_at >= start_at),
  constraint events_registration_https check (registration_url is null or registration_url ~ '^https://'),
  constraint events_source_https       check (source_url is null or source_url ~ '^https://')
);

create index if not exists events_status_start_idx on public.events (status, start_at);
create index if not exists events_municipality_idx on public.events (municipality_slug);
create index if not exists events_category_idx     on public.events (category_slug);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- イベント翻訳 ----------
create table if not exists public.event_translations (
  id                      uuid primary key default gen_random_uuid(),
  event_id                uuid not null references public.events(id) on delete cascade,
  language_code           text not null,            -- 'easy-ja', 'en', 'vi', 'pt' ...
  translated_title        text not null,
  translated_description  text not null,
  is_machine_translated   boolean not null default false,  -- 将来の AI 翻訳用フラグ
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint event_translations_unique unique (event_id, language_code),
  constraint event_translations_lang_format check (language_code ~ '^[a-z]{2,8}(-[a-z]{2,8})?$')  -- 'en', 'easy-ja' など
);

drop trigger if exists event_translations_set_updated_at on public.event_translations;
create trigger event_translations_set_updated_at
  before update on public.event_translations
  for each row execute function public.set_updated_at();

-- ---------- 掲載依頼（非公開） ----------
-- 主催者がフォームから送る内容。担当者メールを含むため、匿名ユーザーには一切見せない。
-- INSERT は Phase 4 でサーバー側（service_role）からのみ行う。
create table if not exists public.event_submissions (
  id                     uuid primary key default gen_random_uuid(),
  organization_name      text not null,
  event_title            text not null,
  event_description      text not null,
  start_at               timestamptz not null,
  end_at                 timestamptz,
  venue                  text not null,
  municipality_slug      text references public.municipalities(slug),
  participation_fee      integer not null default 0,
  fee_note               text,
  target_audience        text,
  supported_languages    text[] not null default '{ja}',
  registration_url       text,
  source_url             text,
  contact_email          text not null,                    -- ★ 個人情報。非公開
  submission_status      text not null default 'pending',  -- pending / approved / rejected
  admin_note             text,
  published_event_id     uuid references public.events(id) on delete set null,
  reviewed_by            uuid,                              -- auth.users.id
  reviewed_at            timestamptz,
  created_at             timestamptz not null default now(),

  constraint submissions_status_values check (submission_status in ('pending', 'approved', 'rejected')),
  constraint submissions_title_len check (char_length(event_title) between 1 and 200),
  constraint submissions_desc_len  check (char_length(event_description) between 1 and 5000),
  constraint submissions_email_format check (contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint submissions_registration_https check (registration_url is null or registration_url ~ '^https://'),
  constraint submissions_source_https       check (source_url is null or source_url ~ '^https://')
);

create index if not exists submissions_status_idx on public.event_submissions (submission_status, created_at);

-- ---------- 管理者 ----------
-- auth.users の id と管理者権限を結びつける。
-- 行を追加できるのは service_role（SQL Editor または サーバー側処理）だけ。
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'admin',
  note        text,                                  -- 「初期管理者」などのメモ（個人名は書かない）
  created_at  timestamptz not null default now(),
  constraint admins_role_values check (role in ('admin'))
);

-- ---------- マスタデータ投入 ----------
insert into public.municipalities (slug, prefecture, name_ja, sort_order) values
  ('otsu',        'shiga', '大津市',   10),
  ('hikone',      'shiga', '彦根市',   20),
  ('nagahama',    'shiga', '長浜市',   30),
  ('omihachiman', 'shiga', '近江八幡市', 40),
  ('kusatsu',     'shiga', '草津市',   50),
  ('moriyama',    'shiga', '守山市',   60),
  ('ritto',       'shiga', '栗東市',   70),
  ('koka',        'shiga', '甲賀市',   80),
  ('yasu',        'shiga', '野洲市',   90),
  ('konan',       'shiga', '湖南市',  100),
  ('takashima',   'shiga', '高島市',  110),
  ('higashiomi',  'shiga', '東近江市', 120),
  ('maibara',     'shiga', '米原市',  130),
  ('hino',        'shiga', '日野町',  140),
  ('ryuo',        'shiga', '竜王町',  150),
  ('aisho',       'shiga', '愛荘町',  160),
  ('toyosato',    'shiga', '豊郷町',  170),
  ('kora',        'shiga', '甲良町',  180),
  ('taga',        'shiga', '多賀町',  190),
  ('shiga-all',   'shiga', '滋賀県内全域・オンライン', 900)
on conflict (slug) do nothing;

insert into public.categories (slug, name_ja, sort_order) values
  ('japanese-class',     '日本語教室・日本語学習', 10),
  ('cultural-exchange',  '国際交流・文化交流',     20),
  ('career',             '就職・キャリア支援',     30),
  ('education',          '進学・教育支援',         40),
  ('life-consultation',  '生活相談・行政手続き',   50),
  ('health',             '医療・健康',             60),
  ('family',             '子育て・家庭支援',       70),
  ('disaster-community', '防災・地域生活',         80),
  ('volunteer',          'ボランティア募集',       90),
  ('other',              'その他',                100)
on conflict (slug) do nothing;
