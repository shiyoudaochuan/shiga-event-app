import Link from "next/link";
import type { Event } from "@/lib/types";
import { Badge } from "./Badge";
import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatDateTimeRange, formatFee, tokyoDateParts } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

/**
 * 掲示板に貼るチラシ 1 枚。
 *
 * - 紙色・傾きは親（EventList）が CSS 変数 --paper / --tilt で渡す
 * - 画鋲は親の <li> にだけ置く（ここには置かない＝二重画鋲の防止）
 * - タイトルのリンクをカード全体に広げているので、どこを押しても詳細へ移動できる
 */
export function EventCard({ event, isSample = false }: { event: Event; isSample?: boolean }) {
  const t = getDictionary();
  const summary = event.description.split("\n")[0];
  const date = tokyoDateParts(event.startAt);
  const isFree = event.participationFee === 0;

  return (
    <article className="flyer flex flex-col gap-3 p-5 pt-6">
      {/* カテゴリー・料金 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {isSample && <Badge tone="warning">{t.sample.badge}</Badge>}
        <Badge>{categoryLabel(event.category)}</Badge>
        {isFree ? (
          <span className="ml-auto rotate-6 rounded-full bg-coral px-2 font-display text-xs font-semibold text-ink">
            {t.common.free}
          </span>
        ) : (
          <span className="ml-auto text-xs font-extrabold">{formatFee(event.participationFee, null)}</span>
        )}
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-extrabold leading-snug">
        <Link href={`/events/${event.id}`} className="after:absolute after:inset-0 after:content-['']">
          {event.title}
        </Link>
      </h3>

      {/* 説明（1 行目） */}
      <p className="line-clamp-2 text-sm text-ink-soft">{summary}</p>

      {/* 日付タイル ＋ 基本情報 */}
      <div className="mt-auto flex items-start gap-3 border-t-2 border-dashed border-ink/25 pt-3">
        <span className="date-tile h-14 w-14" aria-hidden="true">
          <span>
            <span className="block text-[0.6rem] font-semibold text-coral">{date.weekdayEn}</span>
            <span className="block text-2xl font-bold">{date.day}</span>
          </span>
        </span>
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-sm font-medium">
          <dt aria-hidden="true">📅</dt>
          <dd>
            <span className="sr-only">{t.event.dateTime}:</span>
            {formatDateTimeRange(event.startAt, event.endAt)}
          </dd>
          <dt aria-hidden="true">📍</dt>
          <dd>
            <span className="sr-only">{t.event.area}:</span>
            {municipalityLabel(event.municipality)} / {event.venue}
          </dd>
          {event.organizer && (
            <>
              <dt aria-hidden="true">🏢</dt>
              <dd>
                <span className="sr-only">{t.event.organizer}:</span>
                {event.organizer.name}
              </dd>
            </>
          )}
          <dt aria-hidden="true">🗣</dt>
          <dd>
            <span className="sr-only">{t.event.languages}:</span>
            {event.supportedLanguages.map(languageLabel).join(" / ")}
          </dd>
        </dl>
      </div>
    </article>
  );
}
