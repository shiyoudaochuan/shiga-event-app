import type { CSSProperties } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "./EventCard";
import { getDictionary } from "@/lib/i18n";
import { categoryColor, FLYER_TILTS } from "@/config/category-colors";

type EventListProps = {
  events: Event[];
  filtered: boolean;
  isSample: boolean;
};

/**
 * 掲示板に貼るチラシの一覧。
 *
 * 画鋲（.pin）はこの <li> にだけ置く。EventCard 側には置かない（二重画鋲の防止）。
 * 外枠は親の <CorkBoard> が持つので、ここでは付けない（二重枠の防止）。
 * 紙色と画鋲の色はカテゴリごとに変える（config/category-colors.ts）。
 */
export function EventList({ events, filtered, isSample }: EventListProps) {
  const t = getDictionary();

  return (
    <section aria-label="イベント掲示板" className="w-full">
      {events.length === 0 ? (
        <div role="status" className="flyer mx-auto max-w-md px-6 py-10 text-center" style={{ "--tilt": "-1deg" } as CSSProperties}>
          <span aria-hidden="true" className="pin" />
          <p className="text-lg font-extrabold">{filtered ? t.search.noResultTitle : t.search.noUpcomingTitle}</p>
          <p className="mt-2 text-ink-soft">{filtered ? t.search.noResultBody : t.search.noUpcomingBody}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => {
            const color = categoryColor(event.category);
            return (
              <li
                key={event.id}
                // 最初の 12 枚だけ少しずつ遅らせて「貼られていく」ように見せる（多すぎると待たされる）
                style={
                  {
                    "--d": `${Math.min(index, 11) * 55}ms`,
                    "--paper": color.paper,
                    "--pin": color.pin,
                    "--tilt": FLYER_TILTS[index % FLYER_TILTS.length],
                  } as CSSProperties
                }
                className="flyer-hover animate-pop relative list-none"
              >
                <span aria-hidden="true" className="pin" />
                <EventCard event={event} isSample={isSample} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
