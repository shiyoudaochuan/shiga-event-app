"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import type { Event } from "@/lib/types";
import { CorkBoard } from "@/components/CorkBoard";
import { Badge } from "@/components/Badge";
import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { formatDateTimeRange } from "@/lib/format";
import { buildDeck } from "@/lib/discover/deck";
import { favorites, going, useDiscoverPrefs, useFavorites, useGoing, useHydrated } from "@/lib/discover/storage";

/**
 * マイ掲示板。3 種類を「タブ」で切り替える。
 *  - お気に入り：発見モードで保存したもの
 *  - 参加予定　：お気に入りとは別の状態（「行く」と決めたもの）
 *  - おすすめ　：希望条件に合い、まだ保存していないもの
 *
 * 保存先はこの端末の LocalStorage のみ（ログイン不要・個人情報なし）。
 */

type TabId = "favorites" | "going" | "recommended";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "favorites", label: "お気に入り", icon: "♥" },
  { id: "going", label: "参加予定", icon: "✅" },
  { id: "recommended", label: "おすすめ", icon: "✨" },
];

export function MyBoardClient({ events, isSample }: { events: Event[]; isSample: boolean }) {
  const hydrated = useHydrated();
  const savedIds = useFavorites();
  const goingIds = useGoing();
  const prefs = useDiscoverPrefs();
  const [tab, setTab] = useState<TabId>("favorites");

  // ID → イベントの対応表（Python の dict に相当）
  const byId = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const lists = useMemo(() => {
    const pick = (ids: string[]) => ids.map((id) => byId.get(id)).filter((e): e is Event => Boolean(e));
    const known = new Set([...savedIds, ...goingIds]);
    const recommended = prefs
      ? buildDeck(events, prefs.answers, prefs.categories)
          .deck.filter((e) => !known.has(e.id))
          .slice(0, 9)
      : [];
    return { favorites: pick(savedIds), going: pick(goingIds), recommended };
  }, [byId, events, savedIds, goingIds, prefs]);

  // 保存したが、すでに終了 / 非公開になったイベントの数
  const missing = hydrated ? savedIds.filter((id) => !byId.has(id)).length : 0;
  const current = hydrated ? lists[tab] : [];

  return (
    <div className="space-y-5">
      <header className="glass animate-rise flex flex-col gap-4 rounded-[var(--radius-lg)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-sm font-semibold text-brand-700">⭐ マイ掲示板</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">わたしのイベント</h1>
          <p className="mt-1 text-sm text-slate-600">この端末のブラウザにだけ保存されています（ログイン不要）。</p>
        </div>
        <Link href="/discover" className="glass-btn-primary shrink-0">
          ✨ イベントを探しに行く
        </Link>
      </header>

      {/* タブ（WAI-ARIA の tablist パターン） */}
      <div role="tablist" aria-label="表示する種類" className="glass grid grid-cols-3 gap-1 rounded-[1.6rem] p-1.5 sm:rounded-full">
        {TABS.map((t) => {
          const count = hydrated ? lists[t.id].length : 0;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls="my-panel"
              onClick={() => setTab(t.id)}
              className={`flex min-h-12 flex-col items-center justify-center rounded-[1.25rem] px-1 text-sm font-bold leading-tight transition duration-200 sm:flex-row sm:gap-1.5 sm:rounded-full sm:text-base ${
                active ? "bg-brand-600 text-white shadow-md" : "text-slate-700 hover:bg-white/70"
              }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                {t.label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/25" : "bg-slate-900/5"}`}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="my-panel" aria-labelledby={`tab-${tab}`}>
        <CorkBoard>
          {!hydrated ? (
            <div className="h-48" aria-busy="true" />
          ) : current.length === 0 ? (
            <EmptyState tab={tab} hasPrefs={Boolean(prefs)} />
          ) : (
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {current.map((event, i) => (
                <li
                  key={event.id}
                  className="animate-rise relative list-none"
                  style={{ "--rise-delay": `${Math.min(i, 8) * 45}ms` } as CSSProperties}
                >
                  <div className={`relative h-full ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                    <span aria-hidden="true" className="push-pin" />
                    <MyFlyer
                      event={event}
                      isSample={isSample}
                      isSaved={savedIds.includes(event.id)}
                      isGoing={goingIds.includes(event.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CorkBoard>
        {tab === "favorites" && missing > 0 && (
          <p className="mt-3 px-1 text-sm text-slate-600">※ 終了または非公開になったイベント {missing} 件は表示していません。</p>
        )}
      </div>
    </div>
  );
}

function MyFlyer({ event, isSample, isSaved, isGoing }: { event: Event; isSample: boolean; isSaved: boolean; isGoing: boolean }) {
  return (
    <article className="paper relative flex h-full flex-col gap-2 rounded-sm p-5 pt-8">
      <div className="flex flex-wrap gap-2">
        {isSample && <Badge tone="warning">サンプル</Badge>}
        <Badge tone="brand">{categoryLabel(event.category)}</Badge>
        {isGoing && <Badge tone="success">参加予定</Badge>}
      </div>
      <h2 className="text-lg font-bold leading-snug">
        <Link href={`/events/${event.id}`} className="text-brand-800 hover:underline">
          {event.title}
        </Link>
      </h2>
      <p className="text-sm text-slate-700">📅 {formatDateTimeRange(event.startAt, event.endAt)}</p>
      <p className="text-sm text-slate-700">
        📍 {municipalityLabel(event.municipality)} / {event.venue}
      </p>

      {/* 保存と参加予定は別々の状態として切り替えられる */}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => favorites.toggle(event.id)}
          aria-pressed={isSaved}
          className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold ring-1 transition ${
            isSaved ? "bg-rose-50 text-rose-700 ring-rose-300" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          {isSaved ? "♥ 保存済み" : "♡ 保存"}
        </button>
        <button
          type="button"
          onClick={() => going.toggle(event.id)}
          aria-pressed={isGoing}
          className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold ring-1 transition ${
            isGoing
              ? "bg-emerald-50 text-emerald-800 ring-emerald-300"
              : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          {isGoing ? "✅ 参加予定" : "＋ 参加予定にする"}
        </button>
      </div>
    </article>
  );
}

function EmptyState({ tab, hasPrefs }: { tab: TabId; hasPrefs: boolean }) {
  const text =
    tab === "favorites"
      ? "まだお気に入りはありません。発見モードでチラシを上にスワイプすると、ここに貼られます。"
      : tab === "going"
        ? "参加予定のイベントはまだありません。お気に入りのチラシで「参加予定にする」を押してください。"
        : hasPrefs
          ? "条件に合う、まだ保存していないイベントはありません。"
          : "発見モードで興味や希望条件を設定すると、おすすめが表示されます。";
  return (
    <div className="paper mx-auto max-w-md rounded-sm px-6 py-8 text-center">
      <p className="text-slate-700">{text}</p>
      <Link href="/discover" className="glass-btn-primary mt-4">
        ✨ 発見モードへ
      </Link>
    </div>
  );
}
