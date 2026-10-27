import Link from "next/link";
import { APP_CONFIG } from "@/config/app";
import { getDictionary } from "@/lib/i18n";
import { languageLabel, DEFAULT_LOCALE } from "@/config/languages";

/**
 * 全ページ共通のヘッダー。
 * ロゴ（アプリ名）、言語切替（Phase 5 で有効化）、掲載依頼リンク（Phase 4 で有効化）を配置。
 * 未実装の機能は「準備中」と明示し、押せるように見せない。
 */
export function Header() {
  const t = getDictionary();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md font-bold text-brand-800">
          <span aria-hidden="true" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-lg text-white">
            ◎
          </span>
          <span className="text-lg leading-tight sm:text-xl">{APP_CONFIG.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* 言語切替：Phase 5 で <select> に置き換える。今は現在の言語だけ表示 */}
          <span
            className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-3 text-sm text-slate-700"
            title={t.common.languageSwitcherComingSoon}
            aria-label={`${t.common.languageSwitcher}: ${languageLabel(DEFAULT_LOCALE)}`}
          >
            🌐 {languageLabel(DEFAULT_LOCALE)}
          </span>
        </div>
      </div>
    </header>
  );
}
