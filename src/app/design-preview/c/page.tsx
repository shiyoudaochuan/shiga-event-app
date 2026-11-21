import type { CSSProperties } from "react";
import Link from "next/link";
import { Fredoka, M_PLUS_Rounded_1c } from "next/font/google";
import { getPreviewData, PREVIEW_NAV } from "../_shared/data";
import "./design-c.css";

/*
  Design C — Playful Community「Tsunagaru Park」
  書体：M PLUS Rounded 1c（和文・丸ゴシック）＋ Fredoka（欧文・数字の丸み）
  配色：クリーム地 × ぶどう色の輪郭 × ひまわり・コーラル・ミント・空・ぶどう
*/
const jp = M_PLUS_Rounded_1c({ weight: ["400", "500", "700", "800"], subsets: ["latin"], preload: false, variable: "--font-c-jp" });
const latin = Fredoka({ subsets: ["latin"], variable: "--font-c-latin" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Design C — Playful Community" };

// カテゴリごとの色（チラシの紙色と画鋲の色）
const PALETTE = [
  { paper: "#fff3c4", pin: "#ff6f59", shadow: "#ffc93c" },
  { paper: "#d9f7ef", pin: "#4f8ff7", shadow: "#2ec4a6" },
  { paper: "#ffe1da", pin: "#8a6cff", shadow: "#ff6f59" },
  { paper: "#e3ecff", pin: "#ffc93c", shadow: "#4f8ff7" },
  { paper: "#efe7ff", pin: "#2ec4a6", shadow: "#8a6cff" },
  { paper: "#ffe6f2", pin: "#4f8ff7", shadow: "#ff9ec7" },
];
const TILT = ["-2deg", "1.5deg", "-1deg", "2.2deg", "-1.6deg", "1deg"];

// 外国人住民向けサービスらしさ：多言語のあいさつシール
const GREETINGS = [
  { t: "こんにちは", bg: "#ffc93c", r: "-4deg" },
  { t: "Hello!", bg: "#d9f7ef", r: "3deg" },
  { t: "Xin chào", bg: "#ffe1da", r: "-2deg" },
  { t: "Olá!", bg: "#e3ecff", r: "5deg" },
  { t: "你好", bg: "#efe7ff", r: "-3deg" },
  { t: "Kumusta", bg: "#ffe6f2", r: "2deg" },
];

export default async function DesignC() {
  const { events, total, isSample } = await getPreviewData(6);
  const lead = events[0];

  return (
    <div className={`dC ${jp.variable} ${latin.variable}`} style={{ fontFamily: "var(--font-c-jp), sans-serif" }}>
      {/* 背景の形（装飾） */}
      <svg aria-hidden="true" className="c-shape c-float hidden md:block" style={{ top: 120, right: "6%", width: 90 }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#ffc93c" stroke="#2a2140" strokeWidth="5" />
      </svg>
      <svg aria-hidden="true" className="c-shape" style={{ top: 520, left: "-30px", width: 140 }} viewBox="0 0 140 60">
        <path d="M5 30 Q 25 5 45 30 T 85 30 T 125 30" fill="none" stroke="#2ec4a6" strokeWidth="9" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" className="c-shape c-float hidden md:block" style={{ top: 380, right: "44%", width: 46, animationDelay: "-3s" }} viewBox="0 0 100 100">
        <path d="M50 5 L61 39 L97 39 L68 60 L79 95 L50 74 L21 95 L32 60 L3 39 L39 39 Z" fill="#ff9ec7" stroke="#2a2140" strokeWidth="5" strokeLinejoin="round" />
      </svg>

      {/* ============ header ============ */}
      <header className="relative z-20 px-3 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="flex min-h-12 items-center gap-2.5">
            <span aria-hidden="true" className="c-round grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-[var(--c-ink)] bg-[var(--c-coral)] text-xl font-bold text-white shadow-[3px_3px_0_var(--c-ink)]">
              ∞
            </span>
            <span className="text-lg font-extrabold leading-tight">
              しが<span className="text-[var(--c-coral)]"> つながる</span>
              <span className="block text-xs font-bold text-[var(--c-ink-2)]">イベント</span>
            </span>
          </Link>
          <nav aria-label="メインメニュー" className="hidden lg:block">
            <ul className="flex items-center gap-1.5 rounded-full border-[2.5px] border-[var(--c-ink)] bg-white p-1.5 shadow-[4px_4px_0_var(--c-ink)]">
              {PREVIEW_NAV.map((n, i) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={i === 0 ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-extrabold transition ${
                      i === 0 ? "bg-[var(--c-sun)]" : "hover:bg-[var(--c-cream)]"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span className="c-btn min-h-11 px-4 text-sm" style={{ "--c-bg": "#fff" } as CSSProperties}>
            🌏 日本語
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-36 sm:px-6 lg:pb-20">
        {/* ============ hero ============ */}
        <section className="grid items-center gap-10 pb-14 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <ul className="c-pop flex flex-wrap gap-2" aria-label="いろいろな言語のあいさつ">
              {GREETINGS.map((g) => (
                <li key={g.t} className="c-sticker c-round text-sm" style={{ "--c-bg": g.bg, "--r": g.r } as CSSProperties}>
                  {g.t}
                </li>
              ))}
            </ul>
            <h1 className="c-pop mt-6 text-[2.5rem] font-extrabold leading-[1.25] sm:text-[3.4rem] xl:text-[4rem]" style={{ "--d": "80ms" } as CSSProperties}>
              <span className="inline-block">今週は、</span>
              <span className="inline-block">
                <span className="c-marker">だれと</span>
              </span>
              <br />
              <span className="inline-block">つながる？</span>
            </h1>
            <p className="c-pop mt-5 max-w-md text-[1.05rem] leading-relaxed text-[var(--c-ink-2)]" style={{ "--d": "160ms" } as CSSProperties}>
              日本語教室、料理の交流会、子育てサロン。滋賀のまちで開かれる、だれでも参加できるイベントを集めました。
            </p>
            <div className="c-pop mt-8 grid grid-cols-2 gap-3 sm:flex" style={{ "--d": "240ms" } as CSSProperties}>
              <Link href="/discover" className="c-btn px-3 sm:px-6" style={{ "--c-bg": "var(--c-sun)" } as CSSProperties}>
                🎲 1枚ずつ見る
              </Link>
              <Link href="/search" className="c-btn px-3 sm:px-6">
                🔍 条件で探す
              </Link>
            </div>
          </div>

          {/* 発見モードのカード */}
          {lead && (
            <div className="c-pop relative mx-auto w-full max-w-[22rem]" style={{ "--d": "200ms" } as CSSProperties}>
              <div className="relative h-[21rem]">
              <div aria-hidden="true" className="c-card absolute inset-0" style={{ background: "#d9f7ef", transform: "translate(22px, 14px) rotate(6deg)" }} />
              <div aria-hidden="true" className="c-card absolute inset-0" style={{ background: "#ffe1da", transform: "translate(11px, 7px) rotate(3deg)" }} />
              <Link href={lead.href} className="c-card absolute inset-0 flex flex-col p-6" style={{ background: "#fff3c4", "--c-hover-rot": "-2deg" } as CSSProperties}>
                <span className="flex items-start justify-between">
                  <span className="c-round rounded-2xl border-[2.5px] border-[var(--c-ink)] bg-white px-3 py-1 text-center leading-none shadow-[3px_3px_0_var(--c-ink)]">
                    <span className="block text-xs font-semibold text-[var(--c-coral)]">{lead.weekdayEn}</span>
                    <span className="block text-4xl font-bold">{lead.day}</span>
                    <span className="block text-xs font-semibold">{lead.month}月</span>
                  </span>
                  <span className="rounded-full border-2 border-[var(--c-ink)] bg-[var(--c-mint)] px-3 py-0.5 text-xs font-extrabold text-[var(--c-ink)]">{lead.category}</span>
                </span>
                <span className="mt-5 text-xl font-extrabold leading-snug">{lead.title}</span>
                <span className="mt-2 text-sm font-medium text-[var(--c-ink-2)]">📍 {lead.place}</span>
                <span className="mt-auto flex flex-wrap gap-1.5">
                  {lead.languages.slice(0, 3).map((l) => (
                    <span key={l} className="rounded-full border-2 border-[var(--c-ink)] bg-white px-2.5 text-xs font-bold">
                      {l}
                    </span>
                  ))}
                </span>
              </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-5">
                <Link href="/discover" aria-label="スキップ" className="c-fab" style={{ "--c-bg": "#fff" } as CSSProperties}>
                  ✕
                </Link>
                <Link href="/discover" aria-label="保存" className="c-fab text-white" style={{ "--c-bg": "var(--c-coral)", width: "5rem", height: "5rem" } as CSSProperties}>
                  ♥
                </Link>
                <Link href="/my" aria-label="マイ掲示板" className="c-fab" style={{ "--c-bg": "var(--c-sun)" } as CSSProperties}>
                  ★
                </Link>
              </div>
            </div>
          )}
        </section>

        {isSample && (
          <p className="mb-8 inline-block rounded-2xl border-2 border-dashed border-[var(--c-ink)] bg-white px-4 py-2 text-sm font-bold">
            🧪 いま表示しているのはサンプル（架空）のイベントです
          </p>
        )}

        {/* ============ board ============ */}
        <section aria-labelledby="c-board">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="c-board" className="text-3xl font-extrabold sm:text-4xl">
              📌 みんなの掲示板
            </h2>
            <p className="c-round rounded-full border-[2.5px] border-[var(--c-ink)] bg-[var(--c-sky)] px-4 py-1 font-bold text-white shadow-[3px_3px_0_var(--c-ink)]">
              {total} events
            </p>
          </div>

          <div className="c-board">
            <ul className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e, i) => {
                const p = PALETTE[i % PALETTE.length];
                return (
                  <li key={e.id} className="c-flyer-wrap c-pop list-none" style={{ "--d": `${120 + i * 60}ms` } as CSSProperties}>
                    <article className="c-flyer flex flex-col p-5 pt-6" style={{ "--c-paper": p.paper, "--c-pin": p.pin, transform: `rotate(${TILT[i % TILT.length]})` } as CSSProperties}>
                      <span aria-hidden="true" className="c-pin" />
                      <p className="flex items-center justify-between gap-2">
                        <span className="rounded-full border-2 border-[var(--c-ink)] bg-white px-2.5 text-xs font-extrabold">{e.category}</span>
                        {e.isFree && <span className="c-round rotate-6 rounded-full bg-[var(--c-coral)] px-2 text-xs font-bold text-white">FREE</span>}
                      </p>
                      <h3 className="mt-3 text-lg font-extrabold leading-snug">
                        <Link href={e.href} className="after:absolute after:inset-0">
                          {e.title}
                        </Link>
                      </h3>
                      <p className="mt-auto flex items-center gap-3 pt-4">
                        <span className="c-round grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[2.5px] border-[var(--c-ink)] bg-white leading-none">
                          <span className="text-center">
                            <span className="block text-[0.6rem] font-semibold text-[var(--c-coral)]">{e.weekdayEn}</span>
                            <span className="block text-2xl font-bold">{e.day}</span>
                          </span>
                        </span>
                        <span className="text-sm font-semibold leading-snug text-[var(--c-ink-2)]">
                          {e.month}月{e.day}日 · {e.time}
                          <br />
                          {e.municipality}
                        </span>
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ============ actions ============ */}
        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            { e: "🎲", t: "1枚ずつ見る", d: "上にスワイプで保存、下でスキップ！", href: "/discover", bg: "#fff3c4", sh: "#ffc93c" },
            { e: "⭐", t: "マイ掲示板", d: "お気に入りと参加予定をまとめてチェック。", href: "/my", bg: "#d9f7ef", sh: "#2ec4a6" },
            { e: "🔍", t: "条件で探す", d: "目的・地域・言語・日時から選ぶだけ。", href: "/search", bg: "#e3ecff", sh: "#4f8ff7" },
          ].map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className="c-card c-pop block p-6"
              style={{ background: c.bg, "--c-shadow": c.sh, "--d": `${i * 80}ms`, "--c-hover-rot": i % 2 ? "0.8deg" : "-0.8deg" } as CSSProperties}
            >
              <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl border-[2.5px] border-[var(--c-ink)] bg-white text-2xl">
                {c.e}
              </span>
              <span className="mt-4 block text-xl font-extrabold">{c.t}</span>
              <span className="mt-1 block text-sm font-medium text-[var(--c-ink-2)]">{c.d}</span>
            </Link>
          ))}
        </section>
      </main>

      {/* ============ mobile tab bar ============ */}
      <nav aria-label="メインメニュー（スマホ）" className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[26px] border-[2.5px] border-[var(--c-ink)] bg-white p-1.5 shadow-[4px_4px_0_var(--c-ink)]">
          {PREVIEW_NAV.map((n, i) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-[20px] text-[0.72rem] font-extrabold ${i === 0 ? "border-2 border-[var(--c-ink)] bg-[var(--c-sun)]" : ""}`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {["📌", "🎲", "⭐", "🔍"][i]}
                </span>
                {n.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
