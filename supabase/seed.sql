-- =============================================================================
-- seed.sql — 開発用サンプルデータ
--
-- ★ すべて架空のイベント・団体です。本番環境には投入しないでください。
-- 日付は now() 基準なので、いつ実行しても「開催予定」として表示されます。
-- =============================================================================

insert into public.organizers (id, organization_name, description, website_url, prefecture, municipality_slug) values
  ('11111111-1111-4111-8111-111111111111', '【サンプル】しが国際交流サポート', '架空の団体です。', 'https://example.org', 'shiga', 'otsu'),
  ('22222222-2222-4222-8222-222222222222', '【サンプル】ひこね多文化ネットワーク', '架空の団体です。', null, 'shiga', 'hikone'),
  ('33333333-3333-4333-8333-333333333333', '【サンプル】草津日本語ボランティアの会', '架空の団体です。', 'https://example.org', 'shiga', 'kusatsu')
on conflict (id) do nothing;

insert into public.events
  (title, description, category_slug, municipality_slug, venue, address, start_at, end_at, registration_deadline,
   participation_fee, fee_note, target_audience, supported_languages, organizer_id, how_to_apply, registration_url, source_url, status, last_verified_at)
values
  ('【サンプル】はじめての日本語教室（入門クラス）',
   E'ひらがな・カタカナから始める入門クラスです。\n日本に来たばかりの方も大歓迎。',
   'japanese-class', 'otsu', '大津市内 公共施設 会議室（サンプル）', '滋賀県大津市（サンプル住所）',
   now() + interval '3 days', now() + interval '3 days 2 hours', null,
   0, null, '日本語を勉強したい外国人の方', '{ja,easy-ja,en}', '11111111-1111-4111-8111-111111111111',
   '申込不要', null, 'https://example.org/sample/japanese-class', 'published', current_date),

  ('【サンプル】外国人のための生活相談会',
   E'在留資格、健康保険、住まいなどの困りごとを通訳つきで相談できます。',
   'life-consultation', 'hikone', '彦根市内 市民センター（サンプル）', '滋賀県彦根市（サンプル住所）',
   now() + interval '6 days', now() + interval '6 days 3 hours', now() + interval '5 days',
   0, null, '滋賀県内に住む外国人住民', '{ja,easy-ja,en,vi,pt}', '22222222-2222-4222-8222-222222222222',
   '申込フォームから予約してください', 'https://example.org/sample/consultation', 'https://example.org/sample/consultation', 'published', current_date),

  ('【サンプル】外国人向け就職セミナー',
   E'履歴書の書き方、面接練習、ビジネスマナー。',
   'career', 'nagahama', '長浜市内 産業支援施設（サンプル）', '滋賀県長浜市（サンプル住所）',
   now() + interval '14 days', now() + interval '14 days 3 hours', now() + interval '12 days',
   500, '資料代', '日本で就職を考えている外国人', '{ja,easy-ja,vi}', '11111111-1111-4111-8111-111111111111',
   '事前登録が必要です', 'https://example.org/sample/career', 'https://example.org/sample/career', 'published', current_date),

  ('【サンプル】（下書き）公開前のイベント',
   '一般利用者には見えないことを確認するためのデータ。',
   'other', 'otsu', 'サンプル会場', null,
   now() + interval '5 days', null, null,
   0, null, null, '{ja}', null, null, null, null, 'draft', null),

  ('【サンプル】（終了済み）過去の日本語教室',
   '一覧に出ないことを確認するためのデータ。',
   'japanese-class', 'otsu', 'サンプル会場', null,
   now() - interval '10 days', now() - interval '10 days' + interval '2 hours', null,
   0, null, null, '{ja}', '11111111-1111-4111-8111-111111111111', null, null, null, 'published', null);

-- 翻訳の例（Phase 5 で画面に表示）
insert into public.event_translations (event_id, language_code, translated_title, translated_description)
select id, 'en', '[SAMPLE] Japanese Class for Beginners', 'A beginner class starting from hiragana and katakana. Newcomers welcome.'
from public.events where title = '【サンプル】はじめての日本語教室（入門クラス）'
on conflict (event_id, language_code) do nothing;
