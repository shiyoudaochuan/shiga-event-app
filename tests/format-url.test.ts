import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateTimeRange, formatFee, formatTime, toTokyoDateString } from "@/lib/format";
import { hostnameOf, isSafeHttpUrl } from "@/lib/url";
import { rowToEvent, type EventRow } from "@/lib/supabase/mappers";

test("日時は日本時間で表示される", () => {
  const iso = "2030-01-10T01:05:00.000Z"; // JST 10:05
  assert.equal(toTokyoDateString(iso), "2030-01-10");
  assert.equal(formatTime(iso), "10:05");
  assert.match(formatDate(iso), /2030\/01\/10/);
  assert.equal(formatDateTimeRange(iso, "2030-01-10T03:00:00Z").endsWith("10:05〜12:00"), true);
  assert.equal(formatDateTimeRange(iso, null).endsWith("10:05〜"), true);
  assert.match(formatDateTimeRange(iso, "2030-01-11T03:00:00Z"), /2030\/01\/10.*10:05 〜 2030\/01\/11.*12:00/);
  assert.equal(toTokyoDateString("not a date"), "");
});

test("参加費の表示", () => {
  assert.equal(formatFee(0, null), "無料");
  assert.equal(formatFee(0, "飲食は有料"), "無料（飲食は有料）");
  assert.equal(formatFee(1500, "資料代"), "1,500円（資料代）");
});

test("URL は https のみ安全と判定する（XSS 対策）", () => {
  assert.equal(isSafeHttpUrl("https://example.org/a?b=c"), true);
  assert.equal(isSafeHttpUrl("http://example.org"), false);
  assert.equal(isSafeHttpUrl("javascript:alert(1)"), false);
  assert.equal(isSafeHttpUrl("data:text/html,hi"), false);
  assert.equal(isSafeHttpUrl(""), false);
  assert.equal(isSafeHttpUrl(null), false);
  assert.equal(isSafeHttpUrl("not a url"), false);
  assert.equal(hostnameOf("https://example.org/path"), "example.org");
});

test("DB 行 → Event 型への変換", () => {
  const row: EventRow = {
    id: "u1",
    title: "T",
    description: "D",
    category_slug: "career",
    prefecture: "shiga",
    municipality_slug: "otsu",
    venue: "V",
    address: null,
    start_at: "2030-01-10T01:00:00Z",
    end_at: null,
    registration_deadline: null,
    participation_fee: 500,
    fee_note: null,
    target_audience: null,
    supported_languages: null,
    how_to_apply: null,
    registration_url: null,
    source_url: null,
    last_verified_at: null,
    status: "weird",
    organizer: [{ id: "o", organization_name: "Org", website_url: null }],
  };
  const e = rowToEvent(row);
  assert.equal(e.category, "career");
  assert.equal(e.participationFee, 500);
  assert.deepEqual(e.supportedLanguages, []);
  assert.equal(e.organizer?.name, "Org");
  assert.equal(e.status, "unpublished"); // 想定外の status は安全側に倒す
});
