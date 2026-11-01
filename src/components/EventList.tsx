import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { getDictionary } from "@/lib/i18n";

export function EventList({
  events,
  filtered,
  isSample,
}: {
  events: Event[];
  filtered: boolean;
  isSample: boolean;
}) {
  const t = getDictionary();

  return (
    <section
      aria-label="イベント掲示板"
      className="rounded-2xl border-8 border-amber-800 bg-amber-100 p-5 shadow-inner sm:p-8"
    >

      {/* イベントが0件の場合 */}
      {events.length === 0 ? (

        <div
          role="status"
          className="rounded-xl border border-dashed border-amber-400 bg-white px-6 py-10 text-center"
        >
          <p className="text-lg font-bold">
            {filtered
              ? t.search.noResultTitle
              : t.search.noUpcomingTitle}
          </p>

          <p className="mt-2 text-slate-600">
            {filtered
              ? t.search.noResultBody
              : t.search.noUpcomingBody}
          </p>
        </div>

      ) : (

        /* イベントが存在する場合 */
        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

          {events.map((event) => (

            <li
              key={event.id}
              className="list-none transition-transform odd:-rotate-1 even:rotate-1 hover:rotate-0"
            >

              <EventCard
                event={event}
                isSample={isSample}
              />

            </li>

          ))}

        </ul>

      )}

    </section>
  );
}