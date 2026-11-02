import Link from "next/link";

import { getUpcomingEvents } from "@/lib/events/repository";

import { recommendEvents } from "@/lib/events/recommend";

import { searchQuestions } from "@/config/guided-search";

import { EventList } from "@/components/EventList";

import { SampleDataNotice } from "@/components/SampleDataNotice";

// ========================================
// 1. 型定義
// ========================================

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

type ResultsPageProps = {
  searchParams: Promise<SearchParams>;
};

// ========================================
// 2. 検索結果ページ
// ========================================

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {

  // URLから検索条件を取得
  const params = await searchParams;

  const answers: Record<string, string[]> = {};

  // 検索条件を安全に読み取る
  for (const question of searchQuestions) {

    const raw = params[question.id];

    const values = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? [raw]
        : [];

    const allowedValues = new Set(
      question.options.map((option) => option.value)
    );

    answers[question.id] = values.filter(
      (value) => allowedValues.has(value)
    );
  }

  // ========================================
  // 3. イベントを取得
  // ========================================

  const { events, source } =
    await getUpcomingEvents();

  const isSample = source === "sample";

  // ========================================
  // 4. 検索・ランキング処理
  // ========================================

  const rankedEvents = recommendEvents(
    events,
    answers
  );

  const results = rankedEvents.map(
    (item) => item.event
  );

  const matchedCount = rankedEvents.filter(
    (item) => item.score > 0
  ).length;

  const hasPurpose =
    (answers.purpose ?? []).length > 0;

  // 現在のデータでは判定できない条件
  const hasPendingConditions =
    (answers.people ?? []).length > 0 ||
    (answers.accessibility ?? []).length > 0;

  // ========================================
  // 5. 画面表示
  // ========================================

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">

      {/* 検索画面に戻る */}

      <Link
        href="/search"
        className="inline-flex min-h-11 items-center font-medium text-blue-800 hover:underline"
      >
        ← 検索条件を変更する
      </Link>

      {/* ページタイトル */}

      <header className="mb-8 mt-6">

        <h1 className="text-3xl font-bold text-slate-900">
          イベント検索結果
        </h1>

        <p className="mt-3 text-slate-600">
          検索条件に合うイベントを表示しています。
        </p>

        <p className="mt-4 text-lg font-semibold text-blue-800">
          {results.length}件のイベントが見つかりました
        </p>

      </header>

      {/* サンプルデータの注意 */}

      {isSample && <SampleDataNotice />}

      {/* 未対応の検索条件について */}

      {hasPendingConditions && (
        <div className="my-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          「交流したい相手」「参加しやすさ」の条件は、
          現在のイベントデータでは確認できないため、
          検索結果への反映を保留しています。
          参加条件は主催者の案内をご確認ください。
        </div>
      )}

      {/* おすすめ度の説明 */}

      {hasPurpose && results.length > 0 && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

          <h2 className="font-bold text-blue-900">
            あなたの希望に近いイベント
          </h2>

          <p className="mt-2 text-sm text-slate-700">
            {matchedCount}件のイベントに、
            参加目的と関連するキーワードが見つかりました。
          </p>

          <p className="mt-2 text-sm text-slate-600">
            キーワードとの関連性をもとに並べています。
            関連性が低いイベントも候補として表示する場合があります。
          </p>

        </div>
      )}

      {/* イベント検索結果 */}

      {results.length > 0 ? (

        <EventList
          events={results}
          filtered={true}
          isSample={isSample}
        />

      ) : (

        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            条件に合うイベントが見つかりませんでした
          </h2>

          <p className="mt-3 text-slate-600">
            地域・日時・料金・言語などの条件を
            変更して再度検索してください。
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            検索条件を変更する
          </Link>

        </section>

      )}

      {/* 掲示板へ戻る */}

      <div className="mt-10 text-center">

        <Link
          href="/"
          className="font-medium text-blue-800 hover:underline"
        >
          ← イベント掲示板に戻る
        </Link>

      </div>

    </main>
  );
}