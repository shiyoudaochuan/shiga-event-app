import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { getDictionary } from "@/lib/i18n";
import { getUpcomingEvents } from "@/lib/events/repository";
import { EventList } from "@/components/EventList";
import { CorkBoard } from "@/components/CorkBoard";
import { SampleDataNotice } from "@/components/SampleDataNotice";

// 最新のイベント情報を取得するため、毎回サーバーで描画する
export const dynamic = "force-dynamic";

/**
 * トップページ＝「みんなの掲示板」。
 *
 * 主役は中央のコルクボード。その上に小さなガラスのパネルを 1 枚だけ置き、
 * 「発見モード」「検索」への導線をまとめる（メニューを並べすぎない）。
 * 全ページ共通の導線はヘッダー / スマホ下部タブバーにある。
 */
export default async function HomePage() {
  const t = getDictionary();
  const { events, source } = await getUpcomingEvents();
  const isSample = source === "sample";

  return (
    <div className="space-y-6">
      {/* タイトルと導線（ガラスのパネル） */}
      <section
        aria-labelledby="hero-heading"
        className="glass animate-rise flex flex-col gap-4 rounded-[var(--radius-lg)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6"
      >
        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-700">📌 みんなの掲示板</p>
          <h1 id="hero-heading" className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {APP_CONFIG.name}
          </h1>
          <p className="mt-1.5 text-slate-700">{t.common.appTagline}</p>
        </div>

        {/* スマホでは 2 つを横並びの大きなボタンに、PC では右側にまとめる */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
          <Link href="/discover" className="glass-btn-primary whitespace-nowrap px-4 sm:px-6">
            <span aria-hidden="true">✨</span>
            1枚ずつ見る
          </Link>
          <Link href="/search" className="glass glass-btn min-h-12 whitespace-nowrap px-4 sm:px-5">
            <span aria-hidden="true">🔍</span>
            条件で探す
          </Link>
        </div>
      </section>

      {/* サンプルデータの場合は注意書きを表示 */}
      {isSample && <SampleDataNotice />}

      {/* イベント掲示板 */}
      <section aria-labelledby="list-heading">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 id="list-heading" className="text-xl font-bold text-slate-900">
            {t.event.listHeading}
          </h2>
          <p className="glass rounded-full px-3 py-0.5 text-sm font-semibold text-slate-700">
            {t.search.resultCount(events.length)}
          </p>
        </div>

        <CorkBoard>
          {/* 検索せず、イベント一覧をそのまま表示 */}
          <EventList events={events} filtered={false} isSample={isSample} />
        </CorkBoard>
      </section>
    </div>
  );
}
