import type { Event } from "@/lib/types";
import { recommendEvents } from "@/lib/events/recommend";

/**
 * 発見モードで表示する順番（デッキ）を作る。
 *
 * 並べ替え・絞り込みは既存の検索ロジック recommendEvents() をそのまま再利用する
 * （検索ページと結果がずれないように、ここでは書き換えない）。
 * そのうえで「興味のある分野」に一致するイベントを前に出す。
 *
 * 条件が厳しすぎて 0 件になった場合は、全イベントを開催日順で見せる
 * （発見モードで「何も出ない」体験を避けるため）。
 */
export function buildDeck(
  events: Event[],
  answers: Record<string, string[]>,
  categories: string[],
): { deck: Event[]; relaxed: boolean } {
  const ranked = recommendEvents(events, answers).map((r) => r.event);
  const relaxed = ranked.length === 0 && events.length > 0;
  const base = relaxed ? events : ranked;

  if (categories.length === 0) return { deck: base, relaxed };

  // 安定ソート：分野が一致するものを前へ。それ以外の順番は recommendEvents の結果を保つ
  const deck = [...base].sort(
    (a, b) => Number(categories.includes(b.category)) - Number(categories.includes(a.category)),
  );
  return { deck, relaxed };
}
