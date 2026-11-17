"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatDateTimeRange, formatFee } from "@/lib/format";

export type SwipeDirection = "up" | "down";

/** これ以上（px）縦に動かして離したら「決定」とみなす */
const THRESHOLD = 90;
/** これ未満の移動なら「タップ」とみなす（指の小さなブレを許容） */
const TAP_SLOP = 8;
/** 飛んでいくアニメーションの長さ（globals.css の --dur-base より少し長め） */
const EXIT_MS = 260;

type Props = {
  event: Event;
  isSample: boolean;
  isSaved: boolean;
  onDecide: (direction: SwipeDirection) => void;
  onOpen: () => void;
};

/**
 * 発見モードのチラシ 1 枚（スワイプ対応）。
 *
 * Pointer Events（マウス・タッチ・ペンを 1 つの API で扱える）で指の動きを追い、
 *  - 上に THRESHOLD 以上 → 保存
 *  - 下に THRESHOLD 以上 → スキップ
 *  - ほとんど動かさずに離す → 詳細を開く（タップ）
 * と判定する。
 *
 * CSS の touch-action: none を「このカードだけ」に付けているので、
 * カードの外では普通に縦スクロールできる（スクロールとの競合を避ける）。
 */
export function SwipeCard({ event, isSample, isSaved, onDecide, onOpen }: Props) {
  // drag: 指を置いている間の移動量。null = 触っていない
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  // exiting: 決定後、画面外へ飛んでいく途中の方向
  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  // start は描画に関係ないので useRef（値を変えても再描画されない）
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (exiting || (e.pointerType === "mouse" && e.button !== 0)) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    // 指が要素の外に出ても move / up を受け取れるようにする
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ dx: 0, dy: 0 });
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!start.current || start.current.id !== e.pointerId) return;
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y });
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!start.current || start.current.id !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;

    const isVertical = Math.abs(dy) > Math.abs(dx);
    if (isVertical && Math.abs(dy) >= THRESHOLD) {
      decide(dy < 0 ? "up" : "down");
    } else if (Math.hypot(dx, dy) < TAP_SLOP) {
      setDrag(null);
      onOpen();
    } else {
      setDrag(null); // 閾値に届かなければ元の位置へ戻る
    }
  }

  function handlePointerCancel() {
    start.current = null;
    setDrag(null);
  }

  function decide(direction: SwipeDirection) {
    setDrag(null);
    setExiting(direction);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => onDecide(direction), reduce ? 0 : EXIT_MS);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }

  // ------------------------------------------------------------
  // 見た目の計算（移動量 → 位置・傾き・ラベルの濃さ）
  // ------------------------------------------------------------
  const dy = drag?.dy ?? 0;
  const dx = drag?.dx ?? 0;
  const saveStrength = Math.min(Math.max(-dy / THRESHOLD, 0), 1); // 0〜1
  const skipStrength = Math.min(Math.max(dy / THRESHOLD, 0), 1);

  let transform = `translate3d(${dx * 0.3}px, ${dy}px, 0) rotate(${dx * 0.03}deg)`;
  if (exiting === "up") transform = "translate3d(0, -120%, 0) rotate(-4deg)";
  if (exiting === "down") transform = "translate3d(0, 120%, 0) rotate(4deg)";

  const summary = event.description.split("\n")[0];

  return (
    // 外側：登場アニメーション用。内側：指の動きに合わせた transform 用
    // （CSS アニメーションの transform はインライン style より優先されるため、要素を分けている）
    <div className="animate-rise absolute inset-0">
    <div
      role="button"
      tabIndex={0}
      aria-label={`${event.title}。Enter キーで詳細を開きます`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className="h-full cursor-grab select-none outline-offset-4 active:cursor-grabbing"
      style={{
        touchAction: "none",
        transform,
        opacity: exiting ? 0 : 1,
        // 指で動かしている間はアニメーションなし（指に吸い付くように）、離したらなめらかに戻る
        transition: drag ? "none" : `transform ${EXIT_MS}ms var(--ease-out), opacity ${EXIT_MS}ms ease`,
      }}
    >
      <article
        className="paper relative flex h-full flex-col overflow-hidden rounded-sm p-4 pt-8 sm:p-5 sm:pt-8"
        style={{
          boxShadow:
            saveStrength > 0
              ? `0 0 0 ${3 * saveStrength}px rgb(244 63 94 / ${0.8 * saveStrength}), var(--paper-shadow-lift)`
              : skipStrength > 0
                ? `0 0 0 ${3 * skipStrength}px rgb(100 116 139 / ${0.8 * skipStrength}), var(--paper-shadow-lift)`
                : "var(--paper-shadow-lift)",
        }}
      >
        <span aria-hidden="true" className="push-pin" />

        {/* スワイプ中に浮かび上がるラベル（視覚的フィードバック） */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 z-20 -translate-x-1/2 -rotate-6 rounded-xl border-4 border-rose-500 bg-white/90 px-4 py-1 text-2xl font-black text-rose-600"
          style={{ opacity: exiting === "up" ? 1 : saveStrength }}
        >
          ♥ 保存
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 rotate-6 rounded-xl border-4 border-slate-500 bg-white/90 px-4 py-1 text-2xl font-black text-slate-600"
          style={{ opacity: exiting === "down" ? 1 : skipStrength }}
        >
          スキップ
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {isSample && <Badge tone="warning">サンプル</Badge>}
          <Badge tone="brand">{categoryLabel(event.category)}</Badge>
          <Badge tone={event.participationFee === 0 ? "success" : "neutral"}>
            {formatFee(event.participationFee, null)}
          </Badge>
          {isSaved && <Badge tone="warning">♥ 保存済み</Badge>}
        </div>

        <h2 className="mt-2 text-lg font-bold leading-snug text-brand-800 sm:mt-3 sm:text-2xl">{event.title}</h2>

        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm text-slate-700">
          <dt aria-label="開催日時">📅</dt>
          <dd className="font-semibold text-slate-900">{formatDateTimeRange(event.startAt, event.endAt)}</dd>
          <dt aria-label="場所">📍</dt>
          <dd>
            {municipalityLabel(event.municipality)} / {event.venue}
          </dd>
          {event.organizer && (
            <>
              <dt aria-label="主催">🏢</dt>
              <dd>{event.organizer.name}</dd>
            </>
          )}
          <dt aria-label="使える言語">🗣</dt>
          <dd>{event.supportedLanguages.map(languageLabel).join(" / ")}</dd>
        </dl>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600 sm:line-clamp-4">{summary}</p>

        <p className="mt-auto pt-3 text-center text-xs font-semibold text-slate-500">タップ / クリックで詳細を見る</p>
      </article>
    </div>
    </div>
  );
}
