import { APP_CONFIG } from "@/config/app";
import { getDictionary } from "@/lib/i18n";
import { getUpcomingEvents } from "@/lib/events/repository";
import { applyFilter, hasActiveFilter, parseFilter } from "@/lib/events/filter";
import { SearchForm } from "@/components/SearchForm";
import { EventList } from "@/components/EventList";
import { SampleDataNotice } from "@/components/SampleDataNotice";

/**
 * トップページ＝イベント一覧＋検索。
 *
 * サーバーコンポーネントなので、この関数はサーバー上でだけ実行されます。
 * Supabase への問い合わせもサーバーで行い、ブラウザには完成した HTML だけが届きます。
 * （anon key は NEXT_PUBLIC_ なのでブラウザに渡っても構いませんが、
 *   問い合わせ自体をサーバーで済ませる方が表示が速く、構造も単純です）
 *
 * 検索条件は URL クエリ（searchParams）から受け取ります。
 * Next.js 15 では searchParams が Promise なので await が必要です。
 */

// 検索条件や「今日」の日付で結果が変わるため、毎回サーバーで描画する
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const t = getDictionary();
  const filter = parseFilter(await searchParams);

  const { events: upcoming, source } = await getUpcomingEvents();
  const events = applyFilter(upcoming, filter);
  const isSample = source === "sample";

  return (
    <div className="space-y-6">
      <section aria-labelledby="hero-heading" className="rounded-2xl bg-brand-50 px-5 py-6">
        <h1 id="hero-heading" className="text-2xl font-bold text-brand-800 sm:text-3xl">
          {APP_CONFIG.name}
        </h1>
        <p className="mt-2 text-slate-700">{t.common.appTagline}</p>
      </section>

      {isSample && <SampleDataNotice />}

      <SearchForm filter={filter} />

      <section aria-labelledby="list-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="list-heading" className="text-xl font-bold">
            {t.event.listHeading}
          </h2>
          <p className="text-sm text-slate-600" aria-live="polite">
            {t.search.resultCount(events.length)}
          </p>
        </div>
        <EventList events={events} filtered={hasActiveFilter(filter)} isSample={isSample} />
      </section>
    </div>
  );
}
