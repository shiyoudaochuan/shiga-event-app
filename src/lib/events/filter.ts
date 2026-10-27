import type { Event, EventFilter } from "@/lib/types";
import { toTokyoDateString } from "@/lib/format";
import { isCategorySlug } from "@/config/categories";
import { isMunicipalitySlug } from "@/config/municipalities";
import { isLanguageCode } from "@/config/languages";

/**
 * イベントの絞り込みロジック（純粋関数）。
 *
 * ここには React も Supabase も登場しません。
 * 「配列を受け取って、条件に合うものだけ返す」だけなので、tests/ で単体テストできます。
 *
 * なぜ DB 側ではなくアプリ側で絞り込むのか：
 *  - 初期規模（数十〜数百件）では、公開中イベントを一度に取得して絞る方が単純で、
 *    サンプルデータモードと Supabase モードで同じコードを使い回せるため。
 *  - 件数が増えたら repository.ts の Supabase クエリに .eq() / .ilike() を足して
 *    DB 側に移すのが次のステップ（この関数はそのまま二重チェックとして残せる）。
 */

/** URL クエリ（?q=...）を EventFilter に変換する。不正な値は無視して安全側に倒す */
export function parseFilter(params: Record<string, string | string[] | undefined>): EventFilter {
  const pick = (key: string): string | undefined => {
    const v = params[key];
    const s = Array.isArray(v) ? v[0] : v;
    const trimmed = s?.trim();
    return trimmed ? trimmed : undefined;
  };

  const filter: EventFilter = {};

  const q = pick("q");
  if (q) filter.keyword = q.slice(0, 100); // 異常に長い入力は切り捨て

  const municipality = pick("municipality");
  if (municipality && isMunicipalitySlug(municipality)) filter.municipality = municipality;

  const category = pick("category");
  if (category && isCategorySlug(category)) filter.category = category;

  const date = pick("date");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) filter.date = date;

  const fee = pick("fee");
  if (fee === "free" || fee === "paid") filter.fee = fee;

  const language = pick("language");
  if (language && isLanguageCode(language)) filter.language = language;

  return filter;
}

/** 1 つでも条件が指定されているか（「条件をクリア」ボタンの表示判定に使う） */
export function hasActiveFilter(filter: EventFilter): boolean {
  return Object.values(filter).some((v) => v !== undefined);
}

/** キーワード検索の対象文字列をまとめて小文字化 */
function searchableText(event: Event): string {
  return [
    event.title,
    event.description,
    event.venue,
    event.address ?? "",
    event.organizer?.name ?? "",
    event.targetAudience ?? "",
  ]
    .join("\n")
    .toLowerCase();
}

/** 終了済みかどうか。end_at があれば end_at、なければ start_at で判定 */
export function isFinished(event: Event, now: Date): boolean {
  const endIso = event.endAt ?? event.startAt;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return false;
  // 終了時刻が未指定（start_at のみ）の場合は、その日の終わりまで表示したいので 1 日の猶予を持たせる
  const graceMs = event.endAt ? 0 : 24 * 60 * 60 * 1000;
  return end.getTime() + graceMs < now.getTime();
}

/** 公開中 かつ 未終了 のものだけ残す（一覧の基本条件） */
export function upcomingPublished(events: Event[], now = new Date()): Event[] {
  return events.filter((e) => e.status === "published" && !isFinished(e, now));
}

/** 検索条件で絞り込む。複数条件は AND */
export function applyFilter(events: Event[], filter: EventFilter): Event[] {
  const keyword = filter.keyword?.toLowerCase();
  return events.filter((e) => {
    if (filter.municipality && e.municipality !== filter.municipality) return false;
    if (filter.category && e.category !== filter.category) return false;
    if (filter.fee === "free" && e.participationFee !== 0) return false;
    if (filter.fee === "paid" && e.participationFee === 0) return false;
    if (filter.language && !e.supportedLanguages.includes(filter.language)) return false;
    if (filter.date) {
      const startDay = toTokyoDateString(e.startAt);
      const endDay = e.endAt ? toTokyoDateString(e.endAt) : startDay;
      if (filter.date < startDay || filter.date > endDay) return false;
    }
    if (keyword && !searchableText(e).includes(keyword)) return false;
    return true;
  });
}

/** 開始日時の早い順に並べる（元の配列は変更しない） */
export function sortByStart(events: Event[]): Event[] {
  return [...events].sort((a, b) => a.startAt.localeCompare(b.startAt));
}
