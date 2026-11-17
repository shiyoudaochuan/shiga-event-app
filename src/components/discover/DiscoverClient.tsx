"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Event } from "@/lib/types";
import { buildDeck } from "@/lib/discover/deck";
import {
  favorites,
  saveDiscoverPrefs,
  useDiscoverPrefs,
  useFavorites,
  useHydrated,
  type DiscoverPrefs,
} from "@/lib/discover/storage";
import { DiscoverSetup } from "./DiscoverSetup";
import { SwipeCard, type SwipeDirection } from "./SwipeCard";

/**
 * 発見モード全体の司令塔。
 *
 * 画面の状態:
 *  1. 希望条件が未設定  → 初期設定画面（DiscoverSetup）
 *  2. 設定済み / スキップ → チラシを 1 枚ずつ表示（SwipeCard）
 *  3. 「条件を変更」     → 初期設定画面を再表示（editing = true）
 */

/** 操作履歴（「元に戻す」に使う）。Python なら dict のリストに相当 */
type HistoryEntry = { index: number; action: "save" | "skip"; eventId: string; wasSaved: boolean };

export function DiscoverClient({ events, isSample }: { events: Event[]; isSample: boolean }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const prefs = useDiscoverPrefs();
  const savedIds = useFavorites();

  const [editing, setEditing] = useState(false);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [message, setMessage] = useState("");

  // 条件が変わったときだけデッキを作り直す（useMemo = 計算結果のキャッシュ）
  const { deck, relaxed } = useMemo(
    () => buildDeck(events, prefs?.answers ?? {}, prefs?.categories ?? []),
    [events, prefs],
  );

  const current = deck[index];
  const next = deck[index + 1];
  const done = index >= deck.length;

  // ------------------------------------------------------------
  // イベントハンドラー
  // ------------------------------------------------------------

  const handleDecision = useCallback(
    (direction: SwipeDirection) => {
      if (!current) return;
      const action = direction === "up" ? "save" : "skip";
      const wasSaved = savedIds.includes(current.id);
      if (action === "save") favorites.add(current.id);
      setHistory((h) => [...h, { index, action, eventId: current.id, wasSaved }]);
      setIndex((i) => i + 1);
      setMessage(action === "save" ? `「${current.title}」をお気に入りに保存しました` : `「${current.title}」をスキップしました`);
    },
    [current, index, savedIds],
  );

  const handleUndo = useCallback(() => {
    const last = history[history.length - 1];
    if (!last) return;
    // 保存を取り消すのは「この操作で新しく保存した」場合だけ
    if (last.action === "save" && !last.wasSaved) favorites.remove(last.eventId);
    setHistory((h) => h.slice(0, -1));
    setIndex(last.index);
    setMessage("直前の操作を取り消しました");
  }, [history]);

  const openDetail = useCallback(() => {
    if (current) router.push(`/events/${current.id}`);
  }, [current, router]);

  function handleSetupSubmit(p: DiscoverPrefs) {
    saveDiscoverPrefs(p);
    setEditing(false);
    setIndex(0);
    setHistory([]);
    setMessage("");
    window.scrollTo({ top: 0 });
  }

  // PC 向けキーボード操作：↑ 保存 / ↓ スキップ / Enter 詳細 / U・Backspace 元に戻す
  useEffect(() => {
    if (!hydrated || !prefs || editing) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleDecision("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDecision("down");
      } else if (e.key === "u" || e.key === "U" || e.key === "Backspace") {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hydrated, prefs, editing, handleDecision, handleUndo]);

  // ------------------------------------------------------------
  // 描画
  // ------------------------------------------------------------

  // LocalStorage を読む前（サーバー描画・初回描画）は枠だけ出す
  if (!hydrated) {
    return <div className="glass mx-auto h-96 max-w-md animate-pulse rounded-[var(--radius-lg)]" aria-busy="true" />;
  }

  if (!prefs || editing) {
    return (
      <DiscoverSetup initial={prefs} onSubmit={handleSetupSubmit} onCancel={prefs ? () => setEditing(false) : undefined} />
    );
  }

  const progress = deck.length === 0 ? 0 : Math.min(index, deck.length) / deck.length;
  const conditionCount = prefs.categories.length + Object.values(prefs.answers).reduce((n, v) => n + v.length, 0);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* ---------- 中央：チラシと操作ボタン ---------- */}
      <section aria-labelledby="discover-heading" className="mx-auto w-full max-w-md">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h1 id="discover-heading" className="text-xl font-bold text-slate-900">
            ✨ イベント発見
          </h1>
          <button type="button" onClick={() => setEditing(true)} className="glass glass-btn min-h-10 px-4 text-sm lg:hidden">
            ⚙ 条件
          </button>
        </div>

        {/* 進み具合 */}
        <div className="mb-4 flex items-center gap-3 px-1">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-white/60 ring-1 ring-slate-900/5"
            role="progressbar"
            aria-label="見たチラシの割合"
            aria-valuemin={0}
            aria-valuemax={deck.length}
            aria-valuenow={Math.min(index, deck.length)}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-teal-500 transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums text-slate-700">
            {Math.min(index + 1, deck.length)} / {deck.length}
          </span>
        </div>

        {relaxed && (
          <p className="glass mb-4 rounded-[var(--radius-md)] px-4 py-2 text-sm text-slate-700">
            条件にぴったり合うイベントがなかったため、すべてのイベントを表示しています。
          </p>
        )}

        {/* チラシ（スワイプ領域）。高さを固定し、下の操作ボタンの位置がずれないようにする */}
        <div className="relative h-[22rem] sm:h-[28rem]">
          {done ? (
            <DeckFinished savedCount={savedIds.length} onRestart={() => { setIndex(0); setHistory([]); }} />
          ) : (
            <>
              {next && (
                // 次のチラシを少しだけ後ろに見せて「束」になっている感じを出す
                <div aria-hidden="true" className="absolute inset-0 translate-y-3 scale-[0.95] opacity-70">
                  <div className="paper h-full rounded-sm" />
                </div>
              )}
              {current && (
                <SwipeCard
                  key={current.id}
                  event={current}
                  isSample={isSample}
                  isSaved={savedIds.includes(current.id)}
                  onDecide={handleDecision}
                  onOpen={openDetail}
                />
              )}
            </>
          )}
        </div>

        {/* 操作ボタン（スワイプの代わり） */}
        <div className="mt-4 grid grid-cols-4 items-center gap-2 sm:mt-5">
          <RoundButton label="元に戻す" icon="↶" onClick={handleUndo} disabled={history.length === 0} small />
          <RoundButton label="スキップ" icon="↓" onClick={() => handleDecision("down")} disabled={done} tone="skip" />
          <RoundButton label="保存" icon="♥" onClick={() => handleDecision("up")} disabled={done} tone="save" />
          <RoundButton label="詳細" icon="ⓘ" onClick={openDetail} disabled={done} small />
        </div>

        <p className="mt-3 text-center text-sm text-slate-600">
          <span className="md:hidden">上にスワイプで保存・下にスワイプでスキップ・タップで詳細</span>
          <span className="hidden md:inline">↑ 保存 ／ ↓ スキップ ／ U 元に戻す ／ チラシをクリックで詳細</span>
        </p>

        {/* 読み上げソフト向けに操作結果を伝える */}
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
      </section>

      {/* ---------- 右側（PC）：情報パネル ---------- */}
      <aside className="glass hidden rounded-[var(--radius-lg)] p-5 lg:block" aria-label="発見モードの情報">
        <h2 className="font-bold text-slate-900">いまの条件</h2>
        <p className="mt-1 text-sm text-slate-700">
          {prefs.mode === "skipped" || conditionCount === 0 ? "条件なし（すべてのイベント）" : `${conditionCount} 個の条件で表示中`}
        </p>
        <button type="button" onClick={() => setEditing(true)} className="glass glass-btn mt-3 w-full text-sm">
          ⚙ 条件を変更する
        </button>

        <hr className="my-5 border-white/80" />

        <h2 className="font-bold text-slate-900">お気に入り</h2>
        <p className="mt-1 text-sm text-slate-700">{savedIds.length} 件保存しています</p>
        <Link href="/my" className="glass-btn-primary mt-3 w-full text-sm">
          ⭐ マイ掲示板を見る
        </Link>

        <hr className="my-5 border-white/80" />

        <h2 className="font-bold text-slate-900">キーボード操作</h2>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-slate-700">
          <dt><Kbd>↑</Kbd></dt><dd>お気に入りに保存</dd>
          <dt><Kbd>↓</Kbd></dt><dd>今回はスキップ</dd>
          <dt><Kbd>U</Kbd></dt><dd>元に戻す</dd>
          <dt><Kbd>Enter</Kbd></dt><dd>詳細（チラシにフォーカス時）</dd>
        </dl>
      </aside>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md bg-white/80 px-1.5 py-0.5 font-sans text-xs font-bold text-slate-800 ring-1 ring-slate-900/10">{children}</kbd>;
}

function RoundButton({
  label,
  icon,
  onClick,
  disabled,
  tone,
  small,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "save" | "skip";
  small?: boolean;
}) {
  const toneClass =
    tone === "save"
      ? "text-rose-600 ring-2 ring-rose-300/70"
      : tone === "skip"
        ? "text-slate-700 ring-2 ring-slate-300/70"
        : "text-slate-700";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`glass glass-btn mx-auto flex-col gap-0 rounded-full p-0 disabled:pointer-events-none disabled:opacity-40 ${
        small ? "h-14 w-14" : "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
      } ${toneClass}`}
    >
      <span aria-hidden="true" className={small ? "text-lg leading-none" : "text-2xl leading-none"}>
        {icon}
      </span>
      <span className="mt-0.5 text-[0.7rem] font-bold leading-none text-slate-700">{label}</span>
    </button>
  );
}

function DeckFinished({ savedCount, onRestart }: { savedCount: number; onRestart: () => void }) {
  return (
    <div className="glass animate-rise flex h-full flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] p-6 text-center">
      <p className="text-4xl" aria-hidden="true">🎉</p>
      <p className="text-lg font-bold text-slate-900">すべてのチラシを見ました</p>
      <p className="text-sm text-slate-700">お気に入り：{savedCount} 件</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link href="/my" className="glass-btn-primary">⭐ マイ掲示板へ</Link>
        <button type="button" onClick={onRestart} className="glass glass-btn">最初から見る</button>
      </div>
    </div>
  );
}
