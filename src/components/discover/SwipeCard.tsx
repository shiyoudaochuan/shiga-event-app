"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { categoryLabel } from "@/config/categories";
import { categoryColor } from "@/config/category-colors";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatDateTimeRange, formatFee, tokyoDateParts } from "@/lib/format";

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
  // 見た目の計算（移動量 → 位置・傾き・スタンプの濃さ・影）
  // ------------------------------------------------------------
  const dy = drag?.dy ?? 0;
  const dx = drag?.dx ?? 0;
  const saveStrength = Math.min(Math.max(-dy / THRESHOLD, 0), 1); // 0〜1
  const skipStrength = Math.min(Math.max(dy / THRESHOLD, 0), 1);

  let transform = `translate3d(${dx * 0.3}px, ${dy}px, 0) rotate(${dx * 0.03}deg)`;
  if (exiting === "up") transform = "translate3d(0, -120%, 0) rotate(-6deg)";
  if (exiting === "down") transform = "translate3d(0, 120%, 0) rotate(6deg)";

  const summary = event.description.split("\n")[0];
  const color = categoryColor(event.category);
  const date = tokyoDateParts(event.startAt);
  // スワイプ量に応じて影の色と大きさを変える（上＝コーラル／下＝グレー）
  const shadowColor = saveStrength > 0 ? "var(--color-coral)" : skipStrength > 0 ? "#9a93ab" : "var(--color-ink)";
  const shadowSize = 6 + 6 * Math.max(saveStrength, skipStrength);

  return (
    // 外側：登場アニメーション用。内側：指の動きに合わせた transform 用
    // （CSS アニメーションの transform はインライン style より優先されるため、要素を分けている）
    <div className="animate-pop absolute inset-0">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${event.title}。Enter キーで詳細を開きます`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className="relative h-full cursor-grab select-none rounded-[var(--radius-lg)] active:cursor-grabbing"
        style={{
          touchAction: "none",
          transform,
          opacity: exiting ? 0 : 1,
          // 指で動かしている間はアニメーションなし（指に吸い付くように）、離したら「ぽよん」と戻る
          transition: drag ? "none" : `transform ${EXIT_MS}ms var(--ease-pop), opacity ${EXIT_MS}ms ease`,
        }}
      >
        {/* 画鋲は紙の外にはみ出すので、overflow-hidden の article の外に置く */}
        <span aria-hidden="true" className="pin" style={{ "--pin": color.pin } as CSSProperties} />
        <article
          className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[3px] border-ink p-5 pt-6"
          style={{ background: color.paper, boxShadow: `${shadowSize}px ${shadowSize}px 0 ${shadowColor}` }}
        >
          {/* スワイプ中に浮かび上がるスタンプ（視覚的フィードバック） */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 -rotate-6 whitespace-nowrap rounded-2xl border-[3px] border-ink bg-coral px-5 py-1 text-2xl font-extrabold shadow-[4px_4px_0_var(--color-ink)]"
            style={{ opacity: exiting === "up" ? 1 : saveStrength }}
          >
            ♥ 保存！
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-12 left-1/2 z-20 -translate-x-1/2 rotate-6 whitespace-nowrap rounded-2xl border-[3px] border-ink bg-white px-5 py-1 text-2xl font-extrabold shadow-[4px_4px_0_var(--color-ink)]"
            style={{ opacity: exiting === "down" ? 1 : skipStrength }}
          >
            ✕ スキップ
          </span>

          <div className="flex items-start gap-3">
            <span className="date-tile h-[4.25rem] w-14 shadow-[3px_3px_0_var(--color-ink)]" aria-hidden="true">
              <span>
                <span className="block text-[0.65rem] font-semibold text-coral">{date.weekdayEn}</span>
                <span className="block text-3xl font-bold">{date.day}</span>
                <span className="block text-[0.65rem] font-semibold">{date.month}月</span>
              </span>
            </span>
            <div className="ml-auto flex flex-wrap justify-end gap-1.5">
              {isSample && <Badge tone="warning">サンプル</Badge>}
              <span className="tag" style={{ "--tag-bg": color.accent } as CSSProperties}>
                {categoryLabel(event.category)}
              </span>
              <Badge tone={event.participationFee === 0 ? "success" : "neutral"}>{formatFee(event.participationFee, null)}</Badge>
              {isSaved && <Badge tone="warning">♥ 保存済み</Badge>}
            </div>
          </div>

          <h2 className="mt-3 text-lg font-extrabold leading-snug sm:text-2xl">{event.title}</h2>

          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm font-medium">
            <dt aria-label="開催日時">📅</dt>
            <dd className="font-bold">{formatDateTimeRange(event.startAt, event.endAt)}</dd>
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

          <p className="mt-2 line-clamp-1 text-sm text-ink-soft sm:line-clamp-3">{summary}</p>

          <p className="mt-auto pt-2 text-center text-xs font-bold text-ink-soft">👆 タップ / クリックで詳細を見る</p>
        </article>
      </div>
    </div>
  );
}
