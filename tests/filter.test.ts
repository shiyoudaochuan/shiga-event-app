/**
 * 絞り込みロジックの単体テスト。
 * 実行: npm test   （node 標準の test runner + tsx）
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Event } from "@/lib/types";
import { applyFilter, hasActiveFilter, isFinished, parseFilter, sortByStart, upcomingPublished } from "@/lib/events/filter";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "e1",
    title: "日本語教室",
    description: "ひらがなから学ぶ",
    category: "japanese-class",
    prefecture: "shiga",
    municipality: "otsu",
    venue: "会場A",
    address: null,
    startAt: "2030-01-10T01:00:00.000Z", // JST 10:00
    endAt: "2030-01-10T03:00:00.000Z",
    registrationDeadline: null,
    participationFee: 0,
    feeNote: null,
    targetAudience: null,
    supportedLanguages: ["ja", "en"],
    organizer: { id: "o1", name: "サンプル団体", websiteUrl: null },
    howToApply: null,
    registrationUrl: null,
    sourceUrl: null,
    lastVerifiedAt: null,
    status: "published",
    ...overrides,
  };
}

test("parseFilter: 正しい値だけ受け取り、不正な値は無視する", () => {
  const f = parseFilter({
    q: "  日本語 ",
    municipality: "otsu",
    category: "not-a-category",
    date: "2030-01-10",
    fee: "free",
    language: "en",
  });
  assert.deepEqual(f, { keyword: "日本語", municipality: "otsu", date: "2030-01-10", fee: "free", language: "en" });
  assert.equal(hasActiveFilter(f), true);
  assert.equal(hasActiveFilter(parseFilter({})), false);
});

test("parseFilter: 配列や異常に長い値も安全に扱う", () => {
  const f = parseFilter({ q: ["a".repeat(500), "b"], date: "2030/01/10", fee: "cheap" });
  assert.equal(f.keyword?.length, 100);
  assert.equal(f.date, undefined);
  assert.equal(f.fee, undefined);
});

test("upcomingPublished: 下書き・終了済みを除外する", () => {
  const now = new Date("2030-01-05T00:00:00Z");
  const events = [
    makeEvent({ id: "ok" }),
    makeEvent({ id: "draft", status: "draft" }),
    makeEvent({ id: "past", startAt: "2029-12-01T01:00:00Z", endAt: "2029-12-01T03:00:00Z" }),
    makeEvent({ id: "no-end-today", startAt: "2030-01-04T10:00:00Z", endAt: null }), // 終了未定は翌日まで表示
  ];
  assert.deepEqual(
    upcomingPublished(events, now).map((e) => e.id),
    ["ok", "no-end-today"],
  );
  assert.equal(isFinished(makeEvent({ endAt: "2030-01-04T23:59:00Z" }), now), true);
});

test("applyFilter: 複数条件は AND で絞り込む", () => {
  const events = [
    makeEvent({ id: "a" }),
    makeEvent({ id: "b", municipality: "hikone", participationFee: 500 }),
    makeEvent({ id: "c", category: "career", supportedLanguages: ["vi"] }),
  ];
  assert.deepEqual(applyFilter(events, { municipality: "otsu" }).map((e) => e.id), ["a", "c"]);
  assert.deepEqual(applyFilter(events, { municipality: "otsu", category: "career" }).map((e) => e.id), ["c"]);
  assert.deepEqual(applyFilter(events, { fee: "paid" }).map((e) => e.id), ["b"]);
  assert.deepEqual(applyFilter(events, { fee: "free" }).map((e) => e.id), ["a", "c"]);
  assert.deepEqual(applyFilter(events, { language: "vi" }).map((e) => e.id), ["c"]);
});

test("applyFilter: キーワードはタイトル・説明・会場・団体名を大文字小文字を無視して検索", () => {
  const events = [makeEvent({ id: "a", title: "Japanese Class" }), makeEvent({ id: "b", organizer: { id: "o", name: "NPO ABC", websiteUrl: null } })];
  assert.deepEqual(applyFilter(events, { keyword: "japanese" }).map((e) => e.id), ["a"]);
  assert.deepEqual(applyFilter(events, { keyword: "abc" }).map((e) => e.id), ["b"]);
  assert.deepEqual(applyFilter(events, { keyword: "存在しない" }), []);
});

test("applyFilter: 日付は日本時間の日付で比較し、複数日イベントも含める", () => {
  const events = [
    makeEvent({ id: "jan10" }), // JST 1/10 10:00-12:00
    makeEvent({ id: "late", startAt: "2030-01-10T14:30:00Z", endAt: null }), // JST 1/10 23:30 → UTC では 1/10
    makeEvent({ id: "multi", startAt: "2030-01-08T01:00:00Z", endAt: "2030-01-12T01:00:00Z" }),
    makeEvent({ id: "utc-trap", startAt: "2030-01-09T15:30:00Z", endAt: null }), // UTC 1/9 だが JST では 1/10 00:30
  ];
  assert.deepEqual(applyFilter(events, { date: "2030-01-10" }).map((e) => e.id).sort(), ["jan10", "late", "multi", "utc-trap"]);
  assert.deepEqual(applyFilter(events, { date: "2030-01-09" }).map((e) => e.id), ["multi"]);
});

test("sortByStart: 開始日時順に並び、元の配列は変更しない", () => {
  const events = [makeEvent({ id: "b", startAt: "2030-02-01T00:00:00Z" }), makeEvent({ id: "a", startAt: "2030-01-01T00:00:00Z" })];
  const sorted = sortByStart(events);
  assert.deepEqual(sorted.map((e) => e.id), ["a", "b"]);
  assert.equal(events[0].id, "b");
});
