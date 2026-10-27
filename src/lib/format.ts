import { APP_CONFIG } from "@/config/app";

/**
 * 日付・金額の表示用フォーマッタ。
 *
 * DB には UTC で保存されているので、表示時に必ず Asia/Tokyo に変換します。
 * サーバーコンポーネントで実行されるため、Vercel のサーバーが海外リージョンでも
 * 日本時間で表示されます（toLocaleString に timeZone を渡しているのがポイント）。
 */

const TZ = APP_CONFIG.timeZone;

function fmt(iso: string, options: Intl.DateTimeFormatOptions, locale = "ja-JP"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { timeZone: TZ, ...options }).format(d);
}

/** 2026/11/03（火） */
export function formatDate(iso: string, locale = "ja-JP"): string {
  return fmt(iso, { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }, locale);
}

/** 14:00 */
export function formatTime(iso: string, locale = "ja-JP"): string {
  return fmt(iso, { hour: "2-digit", minute: "2-digit", hour12: false }, locale);
}

/**
 * 開始〜終了をまとめて 1 行にする。
 *  - 同じ日: 2026/11/03（火） 14:00〜16:00
 *  - 日をまたぐ: 2026/11/03（火） 14:00 〜 2026/11/04（水） 12:00
 *  - 終了未定: 2026/11/03（火） 14:00〜
 */
export function formatDateTimeRange(startIso: string, endIso: string | null, locale = "ja-JP"): string {
  const start = `${formatDate(startIso, locale)} ${formatTime(startIso, locale)}`;
  if (!endIso) return `${start}〜`;
  const sameDay = toTokyoDateString(startIso) === toTokyoDateString(endIso);
  if (sameDay) return `${start}〜${formatTime(endIso, locale)}`;
  return `${start} 〜 ${formatDate(endIso, locale)} ${formatTime(endIso, locale)}`;
}

/** ISO 日時 → 日本時間での YYYY-MM-DD（検索の日付比較に使う） */
export function toTokyoDateString(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // en-CA ロケールは YYYY-MM-DD 形式を返す
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** 参加費の表示。0 → 無料、1000 → 1,000円。補足があれば続けて表示 */
export function formatFee(fee: number, note: string | null, freeLabel = "無料"): string {
  const base = fee === 0 ? freeLabel : `${fee.toLocaleString("ja-JP")}円`;
  return note ? `${base}（${note}）` : base;
}
