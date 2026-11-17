import type { CSSProperties } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { getDictionary } from "@/lib/i18n";

/** チラシの傾き。規則的になりすぎないよう 4 パターンを順番に使う */
const TILTS = ["-rotate-1", "rotate-1", "rotate-[0.4deg]", "-rotate-[0.6deg]"] as const;

type EventListProps = {
  events: Event[];
  filtered: boolean;
  isSample: boolean;
};

/**
 * 掲示板に貼るチラシの一覧。
 *
 * 画鋲（.push-pin）はこの <li> にだけ置く。EventCard 側には置かない（二重画鋲の防止）。
 * 枠は親の <CorkBoard> が持つので、ここでは枠を付けない（二重枠の防止）。
 */
export function EventList({ events, filtered, isSample }: EventListProps) {
  const t = getDictionary();

  return (
    <section aria-label="イベント掲示板" className="w-full">
      {events.length === 0 ? (
        <div role="status" className="paper mx-auto max-w-md rounded-sm px-6 py-10 text-center">
          <p className="text-lg font-bold text-slate-900">
            {filtered ? t.search.noResultTitle : t.search.noUpcomingTitle}
          </p>
          <p className="mt-2 text-slate-600">{filtered ? t.search.noResultBody : t.search.noUpcomingBody}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <li
              key={event.id}
              // 最初の 12 枚だけ少しずつ遅らせて「貼られていく」ように見せる（多すぎると待たされる）
              style={{ "--rise-delay": `${Math.min(index, 11) * 45}ms` } as CSSProperties}
              className="animate-rise relative list-none"
            >
              {/* 傾き・ホバーの動きは内側の div で行う（animate-rise の transform と衝突させないため） */}
              <div className={`group relative h-full transition-transform duration-300 ease-out ${TILTS[index % TILTS.length]} hover:z-10 hover:-translate-y-1 hover:rotate-0 focus-within:z-10 focus-within:rotate-0 motion-reduce:hover:translate-y-0`}>
                {/* 紙を留める画鋲 */}
                <span aria-hidden="true" className="push-pin" />
                <EventCard event={event} isSample={isSample} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
