import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { getDictionary } from "@/lib/i18n";

type EventListProps = {
  events: Event[];
  filtered: boolean;
  isSample: boolean;
};

export function EventList({
  events,
  filtered,
  isSample,
}: EventListProps) {
  const t = getDictionary();

  return (
    <section
      aria-label="イベント掲示板"
      className="w-full"
    >
      {events.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-dashed border-amber-500 bg-white px-6 py-10 text-center"
        >
          <p className="text-lg font-bold text-slate-900">
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
        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="relative list-none transition-transform duration-200 odd:-rotate-1 even:rotate-1 hover:z-10 hover:rotate-0 focus-within:z-10 focus-within:rotate-0"
            >
              {/* 紙を留める画鋲 */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border border-red-700 bg-red-500 shadow-md"
              >
                <span
                  className="absolute left-1 top-0.5 h-1.5 w-1.5 rounded-full bg-white/70"
                />
              </span>

              {/* イベント情報を表示するカード */}
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