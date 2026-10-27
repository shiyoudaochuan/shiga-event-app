import type { Event } from "@/lib/types";
import { APP_CONFIG } from "@/config/app";
import { createAnonClient } from "@/lib/supabase/client";
import { EVENT_SELECT, rowToEvent, type EventRow } from "@/lib/supabase/mappers";
import { SAMPLE_EVENTS } from "./sample-data";
import { upcomingPublished, sortByStart } from "./filter";

/**
 * イベントの取得口（リポジトリ）。
 *
 * 画面（page.tsx）はこのファイルの関数だけを呼びます。
 * データの出どころが Supabase なのかサンプルなのかは、ここで吸収します。
 *
 *   画面 ──▶ repository.ts ──▶ Supabase（.env.local あり）
 *                         └──▶ sample-data.ts（.env.local なし）
 *
 * 将来 AI 翻訳や別の DB に変えるときも、変更はこのファイルに閉じ込められます。
 */

export type DataSource = "supabase" | "sample";

export interface EventListResult {
  events: Event[];
  source: DataSource;
}

/**
 * 公開中・開催予定のイベントを開始日順で返す。
 * 終了済み・下書き・非公開は含まない（DB 側の RLS でも published 以外は返らない）。
 */
export async function getUpcomingEvents(): Promise<EventListResult> {
  const supabase = createAnonClient();
  if (!supabase) {
    return { events: sortByStart(upcomingPublished(SAMPLE_EVENTS)), source: "sample" };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  // 終了時刻が未定のイベントは「開始から 1 日」は表示する（filter.ts の isFinished と同じ猶予）
  const graceIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    // 「end_at が今以降」または「end_at が無く start_at が 1 日前以降」。PostgREST の or() 構文
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${graceIso})`)
    .order("start_at", { ascending: true })
    .limit(APP_CONFIG.maxListItems);

  if (error) {
    // 接続情報の誤りや RLS の設定漏れをここで検知。エラー内容に鍵は含まれない
    console.error("[events] Supabase からの取得に失敗しました:", error.message);
    throw new Error("イベント情報の取得に失敗しました");
  }

  const events = (data as unknown as EventRow[]).map(rowToEvent);
  // DB 側で絞っているが、念のためアプリ側でも同じ条件を適用（二重チェック）
  return { events: sortByStart(upcomingPublished(events)), source: "supabase" };
}

/**
 * ID でイベントを 1 件取得。公開中のもののみ。見つからなければ null。
 * 終了済みでも URL を直接開けば見られる（主催者が共有した URL が切れないように）。
 */
export async function getPublishedEventById(id: string): Promise<Event | null> {
  // UUID 形式か sample-xxxx 形式以外は問い合わせずに弾く（不要な DB アクセスを減らす）
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(id)) return null;

  const supabase = createAnonClient();
  if (!supabase) {
    return SAMPLE_EVENTS.find((e) => e.id === id && e.status === "published") ?? null;
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    // UUID でない文字列を渡すと Postgres が型エラーを返す → 「見つからない」として扱う
    if (error.code === "22P02") return null;
    console.error("[events] Supabase からの取得に失敗しました:", error.message);
    throw new Error("イベント情報の取得に失敗しました");
  }
  return data ? rowToEvent(data as unknown as EventRow) : null;
}

export function currentDataSource(): DataSource {
  return createAnonClient() ? "supabase" : "sample";
}
