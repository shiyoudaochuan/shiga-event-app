import Link from "next/link";
import type { Event } from "@/lib/types";
import { Badge } from "./Badge";
import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatDateTimeRange, formatFee } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

/**
 * 一覧に並ぶイベントカード（仕様 2-1 の項目をすべて表示）。
 * カード全体をリンクにはせず、タイトルだけをリンクにして
 * スクリーンリーダーで「リンクの中に大量のテキスト」にならないようにしている。
 * 代わりに CSS で擬似的にカード全体をクリック可能にする（after: 要素でリンクを広げる）。
 */
export function EventCard({ event, isSample = false }: { event: Event; isSample?: boolean }) {
  const t = getDictionary();
  const summary = event.description.split("\n")[0];

  return (
    <article className="relative flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-600 hover:shadow-md focus-within:border-brand-600">
      <div className="flex flex-wrap items-center gap-2">
        {isSample && <Badge tone="warning">{t.sample.badge}</Badge>}
        <Badge tone="brand">{categoryLabel(event.category)}</Badge>
        {event.participationFee === 0 ? (
          <Badge tone="success">{t.common.free}</Badge>
        ) : (
          <Badge>{formatFee(event.participationFee, null)}</Badge>
        )}
      </div>

      <h3 className="text-lg font-bold leading-snug">
        <Link href={`/events/${event.id}`} className="text-brand-800 after:absolute after:inset-0 after:content-['']">
          {event.title}
        </Link>
      </h3>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-slate-700">
        <dt className="font-semibold text-slate-500">📅</dt>
        <dd>
          <span className="sr-only">{t.event.dateTime}: </span>
          {formatDateTimeRange(event.startAt, event.endAt)}
        </dd>
        <dt className="font-semibold text-slate-500">📍</dt>
        <dd>
          <span className="sr-only">{t.event.area}: </span>
          {municipalityLabel(event.municipality)} / {event.venue}
        </dd>
        {event.organizer && (
          <>
            <dt className="font-semibold text-slate-500">🏢</dt>
            <dd>
              <span className="sr-only">{t.event.organizer}: </span>
              {event.organizer.name}
            </dd>
          </>
        )}
        <dt className="font-semibold text-slate-500">🗣</dt>
        <dd>
          <span className="sr-only">{t.event.languages}: </span>
          {event.supportedLanguages.map(languageLabel).join(" / ")}
        </dd>
      </dl>

      <p className="line-clamp-2 text-sm text-slate-600">{summary}</p>
    </article>
  );
}
