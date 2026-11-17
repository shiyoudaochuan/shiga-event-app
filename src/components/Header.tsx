"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_CONFIG } from "@/config/app";
import { NAV_ITEMS, isNavActive } from "@/config/navigation";
import { getDictionary } from "@/lib/i18n";
import { languageLabel, DEFAULT_LOCALE } from "@/config/languages";

/**
 * 全ページ共通のヘッダー（ガラスのフローティングナビゲーション）。
 *
 * - PC（lg = 1024px 以上）：上部に浮かぶ横長のガラス板に、ロゴ・4 つの導線・言語表示
 * - スマホ・タブレット：上部はロゴと言語だけにしてすっきりさせ、導線は親指が届く「下部タブバー」へ
 *
 * 現在のページを強調するため usePathname() を使う → クライアントコンポーネント。
 * 言語切替は Phase 5 で有効化するまで「準備中」と明示し、押せるように見せない。
 */
export function Header() {
  const t = getDictionary();
  const pathname = usePathname() ?? "/";

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="glass mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-[var(--radius-xl)] px-3 py-2 sm:px-4">
          <Link href="/" className="flex min-h-11 items-center gap-2 rounded-full pr-2 font-bold text-brand-800">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-lg text-white shadow-md ring-2 ring-white/70"
            >
              ◎
            </span>
            <span className="whitespace-nowrap text-base leading-tight sm:text-lg">{APP_CONFIG.name}</span>
          </Link>

          {/* PC 用ナビ */}
          <nav aria-label="メインメニュー" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition duration-200 ${
                        active
                          ? "bg-white/90 text-brand-800 shadow-sm ring-1 ring-brand-600/25"
                          : "text-slate-700 hover:-translate-y-0.5 hover:bg-white/70"
                      }`}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 言語切替：Phase 5 で <select> に置き換える。今は現在の言語だけ表示 */}
          <span
            className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full bg-white/60 px-3 text-sm text-slate-700 ring-1 ring-slate-900/10"
            title={t.common.languageSwitcherComingSoon}
            aria-label={`${t.common.languageSwitcher}: ${languageLabel(DEFAULT_LOCALE)}`}
          >
            🌐 {languageLabel(DEFAULT_LOCALE)}
          </span>
        </div>
      </header>

      {/* スマホ用：画面下部のタブバー（ヘッダーの外に置く。backdrop-filter を持つ要素の中に
          position: fixed を置くと、画面ではなくその要素基準で固定されてしまうため） */}
      <nav
        aria-label="メインメニュー（スマホ）"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <ul className="glass glass-strong mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[var(--radius-xl)] p-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-semibold transition duration-200 ${
                    active ? "bg-brand-600 text-white shadow-md" : "text-slate-700 active:bg-white/80"
                  }`}
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    {item.icon}
                  </span>
                  <span className="mt-1">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
