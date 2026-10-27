import type { Event, EventStatus, Organizer } from "@/lib/types";

/**
 * DB の行（snake_case）→ アプリの型（camelCase）への変換。
 *
 * Supabase から返ってくる JSON をそのまま画面で使うと、列名を変えたときに
 * 画面のあちこちを直す必要が出ます。変換を 1 か所にまとめておけば、
 * 列を追加・変更したときに直すのはこのファイルと types.ts だけで済みます。
 */

/** supabase/migrations の events テーブルと organizers の結合結果に対応する型 */
export interface EventRow {
  id: string;
  title: string;
  description: string;
  category_slug: string;
  prefecture: string;
  municipality_slug: string;
  venue: string;
  address: string | null;
  start_at: string;
  end_at: string | null;
  registration_deadline: string | null;
  participation_fee: number;
  fee_note: string | null;
  target_audience: string | null;
  supported_languages: string[] | null;
  how_to_apply: string | null;
  registration_url: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  status: string;
  organizer: OrganizerRow | OrganizerRow[] | null;
}

export interface OrganizerRow {
  id: string;
  organization_name: string;
  website_url: string | null;
}

const STATUSES: EventStatus[] = ["draft", "published", "cancelled", "unpublished"];

function toStatus(value: string): EventStatus {
  return (STATUSES as string[]).includes(value) ? (value as EventStatus) : "unpublished";
}

function toOrganizer(row: OrganizerRow | OrganizerRow[] | null): Organizer | null {
  // Supabase の結合は 1:1 でも配列で返る場合があるので両方に対応
  const r = Array.isArray(row) ? row[0] : row;
  if (!r) return null;
  return { id: r.id, name: r.organization_name, websiteUrl: r.website_url };
}

export function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category_slug,
    prefecture: row.prefecture,
    municipality: row.municipality_slug,
    venue: row.venue,
    address: row.address,
    startAt: row.start_at,
    endAt: row.end_at,
    registrationDeadline: row.registration_deadline,
    participationFee: Number(row.participation_fee ?? 0),
    feeNote: row.fee_note,
    targetAudience: row.target_audience,
    supportedLanguages: row.supported_languages ?? [],
    organizer: toOrganizer(row.organizer),
    howToApply: row.how_to_apply,
    registrationUrl: row.registration_url,
    sourceUrl: row.source_url,
    lastVerifiedAt: row.last_verified_at,
    status: toStatus(row.status),
  };
}

/** SELECT に使う列指定。organizer は organizers テーブルを結合して取得 */
export const EVENT_SELECT =
  "id, title, description, category_slug, prefecture, municipality_slug, venue, address, " +
  "start_at, end_at, registration_deadline, participation_fee, fee_note, target_audience, " +
  "supported_languages, how_to_apply, registration_url, source_url, last_verified_at, status, " +
  "organizer:organizers ( id, organization_name, website_url )";
