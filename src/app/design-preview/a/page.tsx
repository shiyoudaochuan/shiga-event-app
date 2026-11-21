import type { CSSProperties } from "react";
import Link from "next/link";
import { Instrument_Serif, Zen_Kaku_Gothic_New } from "next/font/google";
import { getPreviewData, PREVIEW_NAV } from "../_shared/data";
import "./design-a.css";

/*
  Design A — Premium Glassmorphism「Lakeglass」
  書体：Zen Kaku Gothic New（和文・端正で細身）＋ Instrument Serif Italic（欧文の差し色）
  配色：夜の湖の藍 × ティール × バイオレット × 琥珀
*/
const jp = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700", "900"], subsets: ["latin"], preload: false, variable: "--font-a-jp" });
const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-a-serif" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Design A — Premium Glassmorphism" };

const TILT = ["-1.6deg", "1.2deg", "-0.6deg", "1.8deg", "-1.1deg", "0.7deg"];

export default async function DesignA() {
  const { events, total, isSample } = await getPreviewData(6);
  const lead = events[0];

  return (
    <div className={`dA ${jp.variable} ${serif.variable}`} style={{ fontFamily: "var(--font-a-jp), sans-serif" }}>
      <div aria-hidden="true" className="a-aurora" style={{ width: 520, height: 380, top: -120, right: -80, background: "#7c6cf2" }} />
      <div aria-hidden="true" className="a-aurora" style={{ width: 460, height: 340, top: 360, left: -160, background: "#14b8a6", animationDelay: "-6s" }} />
      <div aria-hidden="true" className="a-horizon" />

      {/* ============ header ============ */}
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
        <div className="a-glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-1.5 pl-2 pr-2 sm:pl-3">
          <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-full pr-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-black text-[#06121f]"
              style={{ background: "conic-gradient(from 200deg, #5eead4, #a597ff, #ffc66d, #5eead4)" }}
            >
              ◎
            </span>
            <span className="text-[0.95rem] font-bold tracking-wide">しが つながるイベント</span>
          </Link>
          <nav aria-label="メインメニュー" className="hidden lg:block">
            <ul className="flex gap-1">
              {PREVIEW_NAV.map((n, i) => (
                <li key={n.href}>
                  <Link href={n.href} className="a-navlink" aria-current={i === 0 ? "page" : undefined}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span className="inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold text-[var(--a-text-2)] ring-1 ring-white/15">
            日本語 ▾
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:pb-20">
        {/* ============ hero ============ */}
        <section className="grid items-end gap-10 pb-12 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
          <div>
            <p className="a-eyebrow a-in">Shiga · Community Board</p>
            <h1 className="a-in mt-5 text-[2.4rem] font-black leading-[1.1] tracking-tight sm:text-[3.4rem] xl:text-[4.4rem]" style={{ "--d": "80ms" } as CSSProperties}>
              {/* 和文は文節ごとに inline-block にして、変な位置で改行されないようにする */}
              <span className="inline-block">湖のほとりで、</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-[#5eead4] via-[#c7d2fe] to-[#ffc66d] bg-clip-text text-transparent">
                だれかと<wbr />出会う。
              </span>
            </h1>
            <p className="a-display a-in mt-4 text-2xl text-[var(--a-text-2)] sm:text-3xl" style={{ "--d": "160ms" } as CSSProperties}>
              Shiga, quietly connected.
            </p>
            <p className="a-in mt-6 max-w-md leading-loose text-[var(--a-text-2)]" style={{ "--d": "240ms" } as CSSProperties}>
              日本語教室、国際交流、くらしの相談。滋賀に住む外国人のための地域イベントを、一枚の掲示板に。
            </p>
            <div className="a-in mt-8 flex flex-wrap gap-3" style={{ "--d": "320ms" } as CSSProperties}>
              <Link href="/discover" className="a-btn a-btn-primary">
                ✦ 1枚ずつ見る
              </Link>
              <Link href="/search" className="a-btn a-btn-ghost a-glass">
                条件で探す →
              </Link>
            </div>
          </div>

          {/* 発見モードのプレビュー：ガラスのカードが重なる */}
          {lead && (
            <div className="a-in relative mx-auto w-full max-w-sm" style={{ "--d": "260ms" } as CSSProperties}>
              <div className="relative h-[22rem]">
                <div aria-hidden="true" className="a-stack-card a-glass" style={{ transform: "translate(18px, 18px) rotate(5deg)", opacity: 0.5 }} />
                <div aria-hidden="true" className="a-stack-card a-glass" style={{ transform: "translate(9px, 9px) rotate(2.5deg)", opacity: 0.75 }} />
                <Link href={lead.href} className="a-stack-card a-glass a-sheen flex flex-col p-6">
                  <span className="a-eyebrow">Next up · {lead.category}</span>
                  <span className="mt-5 flex items-baseline gap-2">
                    <span className="a-display text-7xl leading-none text-white">{lead.day}</span>
                    <span className="text-sm font-bold text-[var(--a-text-2)]">
                      {lead.month}月 · {lead.weekday} · {lead.time}
                    </span>
                  </span>
                  <span className="mt-4 text-xl font-bold leading-snug">{lead.title}</span>
                  <span className="mt-2 text-sm text-[var(--a-text-2)]">{lead.place}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5">
                    {lead.languages.slice(0, 3).map((l) => (
                      <span key={l} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-[var(--a-text-2)] ring-1 ring-white/10">
                        {l}
                      </span>
                    ))}
                  </span>
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-5">
                <Link href="/discover" aria-label="スキップ" className="a-round a-glass text-[var(--a-text-2)]">
                  ↓
                </Link>
                <Link href="/discover" aria-label="保存" className="a-round a-glass text-[#ffb4c6]" style={{ width: "4.8rem", height: "4.8rem" }}>
                  ♥
                </Link>
                <Link href="/my" aria-label="マイ掲示板" className="a-round a-glass text-[var(--a-amber)]">
                  ★
                </Link>
              </div>
            </div>
          )}
        </section>

        {isSample && (
          <p className="a-glass mb-8 rounded-2xl px-4 py-2.5 text-sm text-[var(--a-amber)]">⚠ 表示中のイベントはサンプル（架空）です</p>
        )}

        {/* ============ board ============ */}
        <section aria-labelledby="a-board">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="a-eyebrow">The Board</p>
              <h2 id="a-board" className="mt-2 text-3xl font-black sm:text-4xl">
                みんなの掲示板
              </h2>
            </div>
            <p className="text-sm text-[var(--a-text-2)]">
              開催予定 <span className="a-display text-3xl text-white">{total}</span> 件
            </p>
          </div>

          <div className="a-vitrine a-glass">
            <div className="a-cork">
              <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((e, i) => (
                  <li key={e.id} className="a-flyer-wrap a-in list-none" style={{ "--d": `${200 + i * 70}ms` } as CSSProperties}>
                    <article className="a-flyer" style={{ transform: `rotate(${TILT[i % TILT.length]})` }}>
                      <span aria-hidden="true" className="a-pin" />
                      <p className="flex items-center justify-between text-xs font-bold text-[#0f766e]">
                        <span>{e.category}</span>
                        <span className={e.isFree ? "text-[#b45309]" : "text-slate-500"}>{e.fee}</span>
                      </p>
                      <h3 className="text-lg font-bold leading-snug">
                        <Link href={e.href} className="after:absolute after:inset-0">
                          {e.title}
                        </Link>
                      </h3>
                      <p className="mt-auto flex items-baseline gap-2 border-t border-dashed border-slate-300 pt-2 text-sm text-slate-600">
                        <span className="a-display text-3xl leading-none text-[#0c1830]">{e.day}</span>
                        <span>
                          {e.month}月 {e.weekday} · {e.time}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">{e.place}</p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ============ trio ============ */}
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { t: "1枚ずつ、じっくり。", d: "上にスワイプで保存、下でスキップ。", href: "/discover", k: "Discover" },
            { t: "わたしの掲示板", d: "お気に入りと参加予定を、この端末だけに。", href: "/my", k: "My board" },
            { t: "条件から探す", d: "目的・地域・言語・日時から選ぶだけ。", href: "/search", k: "Search" },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="a-glass a-sheen group rounded-[var(--a-r-md)] p-6 transition hover:-translate-y-1">
              <span className="a-display text-xl text-[var(--a-teal)]">{c.k}</span>
              <span className="mt-2 block text-lg font-bold">{c.t}</span>
              <span className="mt-1 block text-sm text-[var(--a-text-2)]">{c.d}</span>
              <span className="mt-5 inline-block text-[var(--a-text-2)] transition group-hover:translate-x-1 group-hover:text-white">→</span>
            </Link>
          ))}
        </section>
      </main>

      {/* ============ mobile dock ============ */}
      <nav aria-label="メインメニュー（スマホ）" className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <ul className="a-glass mx-auto grid max-w-sm grid-cols-4 rounded-full bg-[#0c1830]/70 p-1.5">
          {PREVIEW_NAV.map((n, i) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`flex min-h-12 flex-col items-center justify-center rounded-full text-[0.7rem] font-bold ${
                  i === 0 ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]" : "text-[var(--a-text-2)]"
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {["◎", "✦", "★", "⌕"][i]}
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
