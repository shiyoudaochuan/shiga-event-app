import Link from "next/link";
import { Archivo, Shippori_Mincho_B1 } from "next/font/google";
import { getPreviewData, PREVIEW_NAV } from "../_shared/data";
import "./design-b.css";

/*
  Design B — Editorial Bulletin Board「The Shiga Bulletin」
  書体：しっぽり明朝 B1（見出し・本文の格）＋ Archivo（可変幅。数字と見出しラベルを圧縮体で）
  配色：新聞用紙 × 墨 × 朱 × 湖の藍 × クラフト紙
*/
const serif = Shippori_Mincho_B1({ weight: ["500", "700", "800"], subsets: ["latin"], preload: false, variable: "--font-b-serif" });
const sans = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-b-sans" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Design B — Editorial Bulletin Board" };

const TILT = ["-1.2deg", "0.8deg", "1.6deg", "-0.6deg", "1deg", "-1.8deg"];

export default async function DesignB() {
  const { events, total, isSample } = await getPreviewData(7);
  const [lead, ...rest] = events;
  const today = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date());

  return (
    <div className={`dB ${serif.variable} ${sans.variable}`} style={{ fontFamily: "var(--font-b-serif), serif" }}>
      <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-8 lg:pb-16">
        {/* ============ masthead ============ */}
        <header className="pt-5">
          <div className="b-kicker flex items-center justify-between gap-3 text-[var(--b-ink-2)]">
            <span>Vol. 03 — No. 47</span>
            <span className="hidden sm:inline">{today}</span>
            <span>滋賀県 · Shiga</span>
          </div>
          <div className="b-rule-2 mt-2" />
          <div className="flex flex-col items-start gap-4 py-6 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
            <Link href="/" className="block">
              <span className="b-cond block text-[0.8rem] font-bold uppercase tracking-[0.3em] text-[var(--b-red)]">The Shiga Bulletin</span>
              <span className="b-reveal mt-1 block whitespace-nowrap text-[2.7rem] font-extrabold leading-[1] tracking-[-0.02em] sm:text-[4.5rem] lg:text-[5.6rem]">
                しが つながる<span className="b-dot" />
              </span>
            </Link>
            <nav aria-label="メインメニュー" className="hidden lg:block">
              <ol className="flex gap-5 pb-3">
                {PREVIEW_NAV.map((n, i) => (
                  <li key={n.href} className="flex items-baseline gap-1.5">
                    <span className="b-cond text-xs font-bold text-[var(--b-ink-3)]">0{i + 1}</span>
                    <Link href={n.href} className="b-link whitespace-nowrap text-[0.95rem] font-bold" aria-current={i === 0 ? "page" : undefined}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="b-rule" />
          <p className="b-kicker flex flex-wrap gap-x-6 gap-y-1 py-2 text-[var(--b-ink-2)]">
            <span>滋賀に住む外国人のための地域イベント掲示板</span>
            <span className="text-[var(--b-red)]">今週 {total} 件 掲載</span>
            {isSample && <span>※ 掲載中のイベントはサンプル（架空）です</span>}
          </p>
          <div className="b-rule" />
        </header>

        {/* ============ lead story ============ */}
        {lead && (
          <section aria-labelledby="b-lead" className="grid gap-8 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
            <div className="lg:col-span-3">
              <p className="b-kicker text-[var(--b-red)]">今週の注目 · Lead</p>
              <p className="b-cond mt-3 flex items-start leading-[0.8]">
                <span className="text-[5.5rem] font-black tracking-[-0.04em] sm:text-[9rem]">{lead.day}</span>
                <span className="ml-2 mt-3 text-left">
                  <span className="block text-2xl font-black">{lead.month}月</span>
                  <span className="block text-2xl font-black text-[var(--b-red)]">{lead.weekdayEn}</span>
                </span>
              </p>
              <p className="b-cond mt-4 text-lg font-bold">{lead.time}</p>
            </div>
            <div className="lg:col-span-6 lg:border-x lg:border-[var(--b-rule)] lg:px-10">
              <p className="b-kicker text-[var(--b-ink-3)]">{lead.category}</p>
              <h1 id="b-lead" className="mt-3 text-[1.9rem] font-extrabold leading-[1.3] sm:text-[2.6rem]">
                <Link href={lead.href} className="b-link">
                  {lead.title}
                </Link>
              </h1>
              <p className="b-dropcap mt-6 text-[1.02rem] leading-[2.05] text-[var(--b-ink-2)]">
                {lead.summary} 会場は{lead.place.replace(" · ", "の")}。参加費は{lead.fee}。使える言語：{lead.languages.join("・")}。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={lead.href} className="b-btn b-btn-ink">
                  記事を読む <span aria-hidden="true">→</span>
                </Link>
                <Link href="/discover" className="b-btn">
                  1枚ずつめくる <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
            {/* INDEX：日付順の目次 */}
            <aside className="lg:col-span-3" aria-label="今週の目次">
              <p className="b-kicker border-b border-[var(--b-rule)] pb-2">Index · 目次</p>
              <ol className="mt-1">
                {events.map((e) => (
                  <li key={e.id} className="b-rule-dotted first:border-0">
                    <Link href={e.href} className="b-index-row flex items-baseline py-2.5 text-[0.88rem] leading-snug">
                      <span className="b-cond w-12 shrink-0 font-black">
                        {e.month}.{e.day}
                      </span>
                      <span className="line-clamp-1 font-bold">{e.title.replace("【サンプル】", "")}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link href="/search" className="b-link mt-4 inline-block text-sm font-bold text-[var(--b-red)]">
                条件で探す →
              </Link>
            </aside>
          </section>
        )}

        {/* ============ board ============ */}
        <section aria-labelledby="b-board">
          <div className="b-rule-2" />
          <div className="flex flex-wrap items-end justify-between gap-4 py-5">
            <h2 id="b-board" className="whitespace-nowrap text-3xl font-extrabold sm:text-[2.6rem]">
              みんなの掲示板<span className="b-dot" />
            </h2>
            <p className="b-kicker text-[var(--b-ink-2)]">Pinned this week · 今週の貼り紙</p>
          </div>

          <div className="b-board">
            <ul className="grid items-start gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((e, i) => {
                // 3 種類のチラシの型を順番に使い、単調な羅列を避ける
                const variant = i % 3;
                return (
                  <li key={e.id} className="b-flyer-wrap list-none">
                    <article className="b-flyer flex h-full flex-col" style={{ transform: `rotate(${TILT[i % TILT.length]})` }}>
                      {variant === 1 ? <span aria-hidden="true" className="b-tape" /> : <span aria-hidden="true" className="b-pin" />}
                      {variant === 0 && (
                        <div className="bg-[var(--b-indigo)] px-5 pb-4 pt-6 text-[#f3eee3]">
                          <p className="b-kicker opacity-80">{e.category}</p>
                          <p className="b-cond mt-2 text-6xl font-black leading-none">
                            {e.month}/{e.day}
                            <span className="ml-2 text-xl text-[#ffb3a8]">{e.weekdayEn}</span>
                          </p>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
                        {variant !== 0 && (
                          <p className="b-kicker flex justify-between text-[var(--b-ink-3)]">
                            <span>{e.category}</span>
                            <span className="text-[var(--b-red)]">
                              {e.month}.{e.day} {e.weekdayEn}
                            </span>
                          </p>
                        )}
                        <h3 className={`mt-2 font-extrabold leading-[1.4] ${variant === 2 ? "text-[1.35rem]" : "text-lg"}`}>
                          <Link href={e.href} className="after:absolute after:inset-0">
                            {e.title}
                          </Link>
                        </h3>
                        {(variant === 0 || i === 0) && <p className="mt-3 text-sm leading-relaxed text-[var(--b-ink-2)]">{e.summary}</p>}
                        <dl className="b-cond mt-auto grid grid-cols-[auto_1fr] gap-x-3 border-t border-[var(--b-ink)] pt-3 text-[0.82rem]">
                          <dt className="font-black">TIME</dt>
                          <dd className="font-semibold">{e.time}</dd>
                          <dt className="font-black">AREA</dt>
                          <dd className="font-semibold">{e.municipality}</dd>
                          <dt className="font-black">FEE</dt>
                          <dd className={`font-semibold ${e.isFree ? "text-[var(--b-red)]" : ""}`}>{e.fee}</dd>
                        </dl>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ============ columns ============ */}
        <section className="mt-12 grid gap-0 border-y-[3px] border-[var(--b-rule)] md:grid-cols-3">
          {[
            { n: "01", t: "一枚ずつ、めくって読む。", d: "上にスワイプで保存、下でスキップ。気になる一枚に出会うまで。", href: "/discover", cta: "発見モードへ" },
            { n: "02", t: "わたしの切り抜き帖。", d: "お気に入りと参加予定を、この端末だけにそっと保存。", href: "/my", cta: "マイ掲示板へ" },
            { n: "03", t: "条件から、探す。", d: "目的・地域・日時・言語。質問に答えるだけで絞り込めます。", href: "/search", cta: "検索ページへ" },
          ].map((c, i) => (
            <Link key={c.href} href={c.href} className={`group block p-6 transition-colors hover:bg-[var(--b-paper-2)] ${i > 0 ? "border-t border-[var(--b-rule)] md:border-l md:border-t-0" : ""}`}>
              <span className="b-cond text-5xl font-black text-[var(--b-red)]">{c.n}</span>
              <span className="mt-3 block text-xl font-extrabold">{c.t}</span>
              <span className="mt-2 block text-sm leading-relaxed text-[var(--b-ink-2)]">{c.d}</span>
              <span className="b-kicker mt-5 inline-flex items-center gap-2">
                {c.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </section>

        <footer className="b-kicker flex flex-wrap justify-between gap-2 py-6 text-[var(--b-ink-3)]">
          <span>しが つながるイベント — 個人情報を収集しません</span>
          <span>Printed in Shiga</span>
        </footer>
      </div>

      {/* ============ mobile bar ============ */}
      <nav aria-label="メインメニュー（スマホ）" className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-[var(--b-ink)] bg-[var(--b-paper)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ol className="grid grid-cols-4">
          {PREVIEW_NAV.map((n, i) => (
            <li key={n.href} className={i > 0 ? "border-l border-[var(--b-ink)]" : ""}>
              <Link
                href={n.href}
                className={`flex min-h-14 flex-col items-center justify-center text-[0.78rem] font-bold ${i === 0 ? "bg-[var(--b-ink)] text-[var(--b-paper)]" : ""}`}
              >
                <span className="b-cond text-[0.65rem] font-black opacity-70">0{i + 1}</span>
                {n.short}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
