import type { CSSProperties } from "react";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";
import { getUpcomingEvents } from "@/lib/events/repository";
import { EventList } from "@/components/EventList";
import { CorkBoard } from "@/components/CorkBoard";
import { SampleDataNotice } from "@/components/SampleDataNotice";
import { GREETINGS } from "@/config/greetings";
import { categoryLabel } from "@/config/categories";
import { categoryColor } from "@/config/category-colors";
import { municipalityLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { tokyoDateParts } from "@/lib/format";

// 最新のイベント情報を取得するため、毎回サーバーで描画する
export const dynamic = "force-dynamic";

/** 掲示板の下に置く、各ページへの入口 */
const ENTRANCES = [
  { emoji: "🎲", title: "1枚ずつ見る", body: "上にスワイプで保存、下でスキップ！", href: "/discover", bg: "#fff3c4", shadow: "#ffc93c" },
  { emoji: "⭐", title: "マイ掲示板", body: "お気に入りと参加予定をまとめてチェック。", href: "/my", bg: "#d9f7ef", shadow: "#2ec4a6" },
  { emoji: "🔍", title: "条件で探す", body: "目的・地域・言語・日時から選ぶだけ。", href: "/search", bg: "#e3ecff", shadow: "#4f8ff7" },
];

/**
 * トップページ＝「みんなの掲示板」。
 * 上：あいさつシールと見出し、発見モードのチラシ（次に開催されるイベント）
 * 中：主役の掲示板
 * 下：各ページへの入口
 */
export default async function HomePage() {
  const t = getDictionary();
  const { events, source } = await getUpcomingEvents();
  const isSample = source === "sample";
  const next = events[0];

  return (
    <div className="relative">
      {/* 背景の飾り（PC のみ。スマホでは本文に重なるため出さない） */}
      <svg aria-hidden="true" className="animate-float pointer-events-none absolute -top-2 right-[4%] hidden w-20 md:block" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#ffc93c" stroke="#2a2140" strokeWidth="5" />
      </svg>
      <svg aria-hidden="true" className="animate-float pointer-events-none absolute right-[46%] top-64 hidden w-11 md:block" style={{ animationDelay: "-3s" }} viewBox="0 0 100 100">
        <path d="M50 5 L61 39 L97 39 L68 60 L79 95 L50 74 L21 95 L32 60 L3 39 L39 39 Z" fill="#ff9ec7" stroke="#2a2140" strokeWidth="5" strokeLinejoin="round" />
      </svg>

      {/* ============ ヒーロー ============ */}
      <section aria-labelledby="hero-heading" className="grid items-center gap-10 pb-12 pt-2 lg:grid-cols-[1.1fr_1fr] lg:pb-16 lg:pt-8">
        <div>
          <ul className="animate-pop flex flex-wrap gap-2" aria-label="いろいろな言語のあいさつ">
            {GREETINGS.map((g) => (
              <li key={g.text} lang={g.lang} className="sticker text-sm" style={{ "--sticker-bg": g.bg, "--r": g.r } as CSSProperties}>
                {g.text}
              </li>
            ))}
          </ul>
          <h1 id="hero-heading" className="animate-pop mt-6 text-[2.4rem] font-extrabold leading-[1.25] sm:text-[3.3rem] xl:text-[3.9rem]" style={{ "--d": "80ms" } as CSSProperties}>
            {/* 和文は文節ごとに inline-block にして、変な位置で改行されないようにする */}
            <span className="inline-block">今週は、</span>
            <span className="inline-block">
              <span className="marker">だれと</span>
            </span>
            <br />
            <span className="inline-block">つながる？</span>
          </h1>
          <p className="animate-pop mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-soft" style={{ "--d": "160ms" } as CSSProperties}>
            {t.common.appTagline}。日本語教室、国際交流、くらしの相談まで、だれでも参加できるイベントを集めました。
          </p>
          <div className="animate-pop mt-8 grid grid-cols-2 gap-3 sm:flex" style={{ "--d": "240ms" } as CSSProperties}>
            <Link href="/discover" className="btn btn-primary px-3 sm:px-6">
              🎲 1枚ずつ見る
            </Link>
            <Link href="/search" className="btn px-3 sm:px-6">
              🔍 条件で探す
            </Link>
          </div>
        </div>

        {/* 次に開催されるイベント（発見モードの入口） */}
        {next && <NextUpCard event={next} />}
      </section>

      {isSample && (
        <div className="mb-8">
          <SampleDataNotice />
        </div>
      )}

      {/* ============ 掲示板 ============ */}
      <section aria-labelledby="list-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="list-heading" className="text-3xl font-extrabold sm:text-4xl">
            <span aria-hidden="true">📌 </span>
            {t.event.listHeading}
          </h2>
          <p className="rounded-full border-[2.5px] border-ink bg-sky px-4 py-1 font-display font-semibold text-white shadow-[3px_3px_0_var(--color-ink)]">
            {t.search.resultCount(events.length)}
          </p>
        </div>

        <CorkBoard>
          <EventList events={events} filtered={false} isSample={isSample} />
        </CorkBoard>
      </section>

      {/* ============ 入口 ============ */}
      <nav aria-label="ページへの入口" className="mt-16">
        <ul className="grid gap-5 md:grid-cols-3">
          {ENTRANCES.map((c, i) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="surface surface-link block h-full p-6"
                style={{ "--surface-bg": c.bg, "--surface-shadow": c.shadow, "--hover-rot": i % 2 ? "0.6deg" : "-0.6deg" } as CSSProperties}
              >
                <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl border-[2.5px] border-ink bg-white text-2xl">
                  {c.emoji}
                </span>
                <span className="mt-4 block text-xl font-extrabold">{c.title}</span>
                <span className="mt-1 block text-sm font-medium text-ink-soft">{c.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** ヒーロー右側：カードの束（いちばん上が次に開催されるイベント） */
function NextUpCard({ event }: { event: Event }) {
  const date = tokyoDateParts(event.startAt);
  const color = categoryColor(event.category);
  return (
    <div className="animate-pop relative mx-auto w-full max-w-[22rem] pr-6 sm:pr-0" style={{ "--d": "200ms" } as CSSProperties}>
      <div className="relative h-[21rem]">
        <div aria-hidden="true" className="surface absolute inset-0" style={{ "--surface-bg": "#d9f7ef", transform: "translate(22px, 14px) rotate(6deg)" } as CSSProperties} />
        <div aria-hidden="true" className="surface absolute inset-0" style={{ "--surface-bg": "#ffe1da", transform: "translate(11px, 7px) rotate(3deg)" } as CSSProperties} />
        <Link
          href="/discover"
          className="surface surface-link absolute inset-0 flex flex-col p-6"
          style={{ "--surface-bg": color.paper, "--hover-rot": "-2deg" } as CSSProperties}
          aria-label={`発見モードで見る：${event.title}`}
        >
          <span className="flex items-start justify-between gap-3">
            <span className="date-tile h-[4.5rem] w-16 shadow-[3px_3px_0_var(--color-ink)]">
              <span>
                <span className="block text-xs font-semibold text-coral">{date.weekdayEn}</span>
                <span className="block text-4xl font-bold">{date.day}</span>
                <span className="block text-xs font-semibold">{date.month}月</span>
              </span>
            </span>
            <span className="tag" style={{ "--tag-bg": color.accent } as CSSProperties}>
              {categoryLabel(event.category)}
            </span>
          </span>
          <span className="mt-1 font-display text-xs font-semibold uppercase tracking-wider text-ink-soft">Next up</span>
          <span className="mt-1 text-xl font-extrabold leading-snug">{event.title}</span>
          <span className="mt-2 text-sm font-medium text-ink-soft">
            📍 {municipalityLabel(event.municipality)} / {event.venue}
          </span>
          <span className="mt-auto flex flex-wrap gap-1.5">
            {event.supportedLanguages.slice(0, 3).map((l) => (
              <span key={l} className="tag">
                {languageLabel(l)}
              </span>
            ))}
          </span>
        </Link>
      </div>
      {/* 押せない飾りのボタンは置かない（誤解を招くため）。代わりに案内文 */}
      <p className="mt-10 text-center text-sm font-bold text-ink-soft">👆 カードを押すと、1枚ずつ見るモードが始まります</p>
    </div>
  );
}
