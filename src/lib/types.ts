/**
 * アプリ内で使うイベントの型。
 *
 * DB の行（snake_case）とは分けて、画面で扱いやすい camelCase にしています。
 * DB 行 → この型への変換は src/lib/supabase/mappers.ts が担当。
 * サンプルデータ（src/lib/events/sample-data.ts）もこの型で書かれているため、
 * 画面側は「データがどこから来たか」を気にせずに済みます。
 */

/** 公開状態。DB の event_status 型と一致 */
export type EventStatus = "draft" | "published" | "cancelled" | "unpublished";

export interface Organizer {
  id: string;
  name: string;
  websiteUrl: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  /** カテゴリ slug（src/config/categories.ts） */
  category: string;
  /** 都道府県コード（例: "shiga"） */
  prefecture: string;
  /** 市町 slug（src/config/municipalities.ts） */
  municipality: string;
  venue: string;
  address: string | null;
  /** ISO 8601 文字列（UTC）。表示時に日本時間へ変換 */
  startAt: string;
  endAt: string | null;
  registrationDeadline: string | null;
  /** 参加費（円）。0 = 無料 */
  participationFee: number;
  /** 「資料代 500 円」「子ども無料」などの補足 */
  feeNote: string | null;
  targetAudience: string | null;
  /** 言語コードの配列（src/config/languages.ts） */
  supportedLanguages: string[];
  organizer: Organizer | null;
  howToApply: string | null;
  registrationUrl: string | null;
  sourceUrl: string | null;
  /** 管理者が情報元を最後に確認した日（ISO 日付） */
  lastVerifiedAt: string | null;
  status: EventStatus;
}

/** 検索条件。URL クエリ（?q=...&municipality=...）から組み立てる */
export interface EventFilter {
  keyword?: string;
  municipality?: string;
  category?: string;
  /** YYYY-MM-DD。この日に開催中（開始〜終了がこの日を含む）のイベント */
  date?: string;
  fee?: "free" | "paid";
  language?: string;
}
