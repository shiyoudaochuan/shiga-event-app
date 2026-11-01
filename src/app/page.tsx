import { APP_CONFIG } from "@/config/app";
import { getDictionary } from "@/lib/i18n";
import { getUpcomingEvents } from "@/lib/events/repository";
import { EventList } from "@/components/EventList";
import { SampleDataNotice } from "@/components/SampleDataNotice";

// 最新のイベント情報を取得するため、毎回サーバーで描画する
export const dynamic = "force-dynamic";

export default async function HomePage() {

  // 画面に表示する文章を取得
  const t = getDictionary();

  // イベント情報を取得
  const { events, source } = await getUpcomingEvents();

  // サンプルデータかどうか確認
  const isSample = source === "sample";

  return (
    <div className="space-y-6">

      {/* アプリのタイトル */}
      <section
        aria-labelledby="hero-heading"
        className="rounded-2xl bg-brand-50 px-5 py-6"
      >
        <h1
          id="hero-heading"
          className="text-2xl font-bold text-brand-800 sm:text-3xl"
        >
          {APP_CONFIG.name}
        </h1>

        <p className="mt-2 text-slate-700">
          {t.common.appTagline}
        </p>
      </section>

      {/* サンプルデータの場合は注意書きを表示 */}
      {isSample && <SampleDataNotice />}

      {/* イベント掲示板 */}
      <section aria-labelledby="list-heading">

        <div className="mb-4 flex items-baseline justify-between">

          <h2
            id="list-heading"
            className="text-xl font-bold"
          >
            {t.event.listHeading}
          </h2>

          <p className="text-sm text-slate-600">
            {t.search.resultCount(events.length)}
          </p>

        </div>

        {/* 検索せず、イベント一覧をそのまま表示 */}
        <EventList
          events={events}
          filtered={false}
          isSample={isSample}
        />

      </section>

    </div>
  );
}