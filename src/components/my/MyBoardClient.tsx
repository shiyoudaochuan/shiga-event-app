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
import { categoryColor, FLYER_TILTS } from "@/config/category-colors";
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
      <header className="surface animate-pop flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7" style={{ "--surface-bg": "#d9f7ef", "--surface-shadow": "var(--color-mint)" } as CSSProperties}>
        <div>
          <p className="text-sm font-extrabold text-coral">⭐ マイ掲示板</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">わたしのイベント</h1>
          <p className="mt-1 text-sm font-medium text-ink-soft">この端末のブラウザにだけ保存されています（ログイン不要）。</p>
        </div>
        <Link href="/discover" className="btn btn-primary shrink-0">
          🎲 イベントを探しに行く
        </Link>
      </header>

      {/* タブ（WAI-ARIA の tablist パターン） */}
      <div role="tablist" aria-label="表示する種類" className="grid grid-cols-3 gap-1 rounded-[26px] border-[2.5px] border-ink bg-white p-1.5 shadow-[4px_4px_0_var(--color-ink)] sm:rounded-full">
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
              className={`flex min-h-12 flex-col items-center justify-center rounded-[20px] px-1 text-sm font-extrabold leading-tight transition duration-200 sm:flex-row sm:gap-1.5 sm:rounded-full sm:text-base ${
                active ? "border-2 border-ink bg-sun" : "hover:bg-cream"
              }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                {t.label}
                <span className="rounded-full border-2 border-ink bg-white px-1.5 font-display text-xs tabular-nums">
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
            <ul className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {current.map((event, i) => {
                const color = categoryColor(event.category);
                return (
                  <li
                    key={event.id}
                    className="flyer-hover animate-pop relative list-none"
                    style={
                      {
                        "--d": `${Math.min(i, 8) * 55}ms`,
                        "--paper": color.paper,
                        "--pin": color.pin,
                        "--tilt": FLYER_TILTS[i % FLYER_TILTS.length],
                      } as CSSProperties
                    }
                  >
                    <span aria-hidden="true" className="pin" />
                    <MyFlyer
                      event={event}
                      isSample={isSample}
                      isSaved={savedIds.includes(event.id)}
                      isGoing={goingIds.includes(event.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </CorkBoard>
        {tab === "favorites" && missing > 0 && (
          <p className="mt-4 px-1 text-sm font-medium text-ink-soft">※ 終了または非公開になったイベント {missing} 件は表示していません。</p>
        )}
      </div>
    </div>
  );
}

function MyFlyer({ event, isSample, isSaved, isGoing }: { event: Event; isSample: boolean; isSaved: boolean; isGoing: boolean }) {
  return (
    <article className="flyer flex flex-col gap-2 p-5 pt-6">
      <div className="flex flex-wrap gap-2">
        {isSample && <Badge tone="warning">サンプル</Badge>}
        <Badge>{categoryLabel(event.category)}</Badge>
        {isGoing && <Badge tone="success">参加予定</Badge>}
      </div>
      <h2 className="text-lg font-extrabold leading-snug">
        <Link href={`/events/${event.id}`} className="underline decoration-2 decoration-transparent underline-offset-4 transition hover:decoration-coral">
          {event.title}
        </Link>
      </h2>
      <p className="text-sm font-medium">📅 {formatDateTimeRange(event.startAt, event.endAt)}</p>
      <p className="text-sm font-medium">
        📍 {municipalityLabel(event.municipality)} / {event.venue}
      </p>

      {/* 保存と参加予定は別々の状態として切り替えられる */}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => favorites.toggle(event.id)}
          aria-pressed={isSaved}
          className="btn btn-sm px-3"
          style={{ "--btn-bg": isSaved ? "var(--color-coral)" : "#fff" } as CSSProperties}
        >
          {isSaved ? "♥ 保存済み" : "♡ 保存"}
        </button>
        <button
          type="button"
          onClick={() => going.toggle(event.id)}
          aria-pressed={isGoing}
          className="btn btn-sm px-3"
          style={{ "--btn-bg": isGoing ? "var(--color-mint)" : "#fff" } as CSSProperties}
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
    <div className="flyer relative mx-auto max-w-md px-6 py-8 text-center" style={{ "--tilt": "-1deg" } as CSSProperties}>
      <span aria-hidden="true" className="pin" />
      <p className="font-medium">{text}</p>
      <Link href="/discover" className="btn btn-primary mt-4">
        🎲 発見モードへ
      </Link>
    </div>
  );
}
