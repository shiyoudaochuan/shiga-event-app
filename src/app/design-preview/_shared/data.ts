import { getUpcomingEvents } from "@/lib/events/repository";
import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatFee, formatTime } from "@/lib/format";
import { APP_CONFIG } from "@/config/app";

/**
 * デザイン比較プレビュー用の表示データ。
 *
 * 本番と同じ getUpcomingEvents() から取得し、見た目の比較に必要な文字列へ整形するだけ。
 * 検索・保存などのロジックには一切手を入れない。
 * （_shared フォルダは先頭が "_" なので Next.js のルートにはならない）
 */
export type PreviewEvent = {
  id: string;
  href: string;
  title: string;
  category: string;
  categorySlug: string;
  month: string; // "11"
  day: string; // "20"
  weekday: string; // "金"
  weekdayEn: string; // "FRI"
  time: string; // "10:00–12:00"
  place: string; // "大津市 · 公共施設 会議室"
  municipality: string;
  fee: string; // "無料" / "500円"
  isFree: boolean;
  languages: string[];
  organizer: string | null;
  summary: string;
};

function tokyoParts(iso: string) {
  const d = new Date(iso);
  const get = (opts: Intl.DateTimeFormatOptions, locale = "ja-JP") =>
    new Intl.DateTimeFormat(locale, { timeZone: APP_CONFIG.timeZone, ...opts }).format(d);
  return {
    month: get({ month: "numeric" }).replace("月", ""),
    day: get({ day: "numeric" }).replace("日", ""),
    weekday: get({ weekday: "short" }),
    weekdayEn: get({ weekday: "short" }, "en-US").toUpperCase(),
  };
}

export async function getPreviewData(limit = 7) {
  const { events, source } = await getUpcomingEvents();
  const list: PreviewEvent[] = events.slice(0, limit).map((e) => {
    const p = tokyoParts(e.startAt);
    return {
      id: e.id,
      href: `/events/${e.id}`,
      title: e.title,
      category: categoryLabel(e.category),
      categorySlug: e.category,
      ...p,
      time: e.endAt ? `${formatTime(e.startAt)}–${formatTime(e.endAt)}` : `${formatTime(e.startAt)}〜`,
      place: `${municipalityLabel(e.municipality)} · ${e.venue}`,
      municipality: municipalityLabel(e.municipality),
      fee: formatFee(e.participationFee, null),
      isFree: e.participationFee === 0,
      languages: e.supportedLanguages.map(languageLabel),
      organizer: e.organizer?.name ?? null,
      summary: e.description.split("\n")[0],
    };
  });
  return { events: list, total: events.length, isSample: source === "sample" };
}

/** 本番と同じ導線（リンク先は既存ページ） */
export const PREVIEW_NAV = [
  { href: "/", label: "みんなの掲示板", short: "掲示板", en: "Board" },
  { href: "/discover", label: "イベント発見", short: "発見", en: "Discover" },
  { href: "/my", label: "マイ掲示板", short: "マイ", en: "My board" },
  { href: "/search", label: "イベント検索", short: "検索", en: "Search" },
] as const;
