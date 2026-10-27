import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { getDictionary } from "@/lib/i18n";

/**
 * イベントカードの一覧。0 件のときは状況に応じた案内を出す（仕様 2-2）。
 *  - filtered=true : 検索条件に合うものが無い → 条件を減らす提案
 *  - filtered=false: そもそも登録が無い → お待ちください
 */
export function EventList({ events, filtered, isSample }: { events: Event[]; filtered: boolean; isSample: boolean }) {
  const t = getDictionary();

  if (events.length === 0) {
    return (
      <div role="status" className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <p className="text-lg font-bold">{filtered ? t.search.noResultTitle : t.search.noUpcomingTitle}</p>
        <p className="mt-2 text-slate-600">{filtered ? t.search.noResultBody : t.search.noUpcomingBody}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <li key={event.id} className="list-none">
          <EventCard event={event} isSample={isSample} />
        </li>
      ))}
    </ul>
  );
}
