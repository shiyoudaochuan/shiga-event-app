"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "@/config/navigation";
import { getDictionary } from "@/lib/i18n";
import { languageLabel, DEFAULT_LOCALE } from "@/config/languages";

/**
 * 全ページ共通のヘッダー。
 *
 * - PC（lg = 1024px 以上）：ロゴ・太枠の「ピル型」メニュー・言語表示
 * - スマホ・タブレット：上部はロゴと言語だけ。導線は親指が届く「下部タブバー」へ
 *
 * 現在のページを強調するため usePathname() を使う → クライアントコンポーネント。
 * 言語切替は Phase 5 で有効化するまで「準備中」と明示し、押せるように見せない。
 */
export function Header() {
  const t = getDictionary();
  const pathname = usePathname() ?? "/";

  return (
    <>
      <header className="relative z-30 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="flex min-h-12 items-center gap-2.5 rounded-2xl">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-2xl border-[2.5px] border-ink bg-coral font-display text-xl font-bold text-white shadow-[3px_3px_0_var(--color-ink)]"
            >
              ∞
            </span>
            <span className="text-lg font-extrabold leading-tight">
              しが<span className="text-coral"> つながる</span>
              <span className="block text-xs font-bold text-ink-soft">イベント</span>
            </span>
          </Link>

          {/* PC 用ナビ */}
          <nav aria-label="メインメニュー" className="hidden lg:block">
            <ul className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-white p-1.5 shadow-[4px_4px_0_var(--color-ink)]">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-extrabold transition duration-200 ${
                        active ? "bg-sun" : "hover:bg-cream"
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
            className="inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-[2.5px] border-ink bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_var(--color-ink)]"
            title={t.common.languageSwitcherComingSoon}
            aria-label={`${t.common.languageSwitcher}: ${languageLabel(DEFAULT_LOCALE)}`}
          >
            🌏 {languageLabel(DEFAULT_LOCALE)}
          </span>
        </div>
      </header>

      {/* スマホ用：画面下部のタブバー */}
      <nav
        aria-label="メインメニュー（スマホ）"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[26px] border-[2.5px] border-ink bg-white p-1.5 shadow-[4px_4px_0_var(--color-ink)]">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-[20px] text-xs font-extrabold transition duration-200 ${
                    active ? "border-2 border-ink bg-sun" : "active:bg-cream"
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
