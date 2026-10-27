import Link from "next/link";
import type { EventFilter } from "@/lib/types";
import { CATEGORIES } from "@/config/categories";
import { MUNICIPALITIES, PREFECTURES } from "@/config/municipalities";
import { LANGUAGES } from "@/config/languages";
import { getDictionary } from "@/lib/i18n";
import { hasActiveFilter } from "@/lib/events/filter";

/**
 * 検索フォーム（仕様 2-2 の 6 条件）。
 *
 * JavaScript に依存しない「普通の <form method="get">」です。
 * 送信すると /?q=...&municipality=... という URL になり、page.tsx がそれを読んで絞り込みます。
 * 利点：
 *  - 検索条件を URL で共有できる（「大津市の日本語教室」の URL を友人に送れる）
 *  - Cookie やブラウザストレージを使わない（個人情報ゼロ方針）
 *  - JS が無効でも動く
 */
export function SearchForm({ filter }: { filter: EventFilter }) {
  const t = getDictionary();
  const inputClass =
    "mt-1 block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-brand-600";

  return (
    <form method="get" action="/" role="search" aria-label={t.search.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">{t.search.title}</h2>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="q" className="block font-semibold">
            {t.search.keyword}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filter.keyword ?? ""}
            placeholder={t.search.keywordPlaceholder}
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="municipality" className="block font-semibold">
            {t.search.municipality}
          </label>
          <select id="municipality" name="municipality" defaultValue={filter.municipality ?? ""} className={inputClass}>
            <option value="">{t.search.allMunicipalities}</option>
            {PREFECTURES.map((pref) => (
              <optgroup key={pref.code} label={pref.label}>
                {MUNICIPALITIES.filter((m) => m.prefecture === pref.code).map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block font-semibold">
            {t.search.category}
          </label>
          <select id="category" name="category" defaultValue={filter.category ?? ""} className={inputClass}>
            <option value="">{t.search.allCategories}</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block font-semibold">
            {t.search.date}
          </label>
          <input id="date" name="date" type="date" defaultValue={filter.date ?? ""} className={inputClass} />
        </div>

        <div>
          <label htmlFor="fee" className="block font-semibold">
            {t.search.fee}
          </label>
          <select id="fee" name="fee" defaultValue={filter.fee ?? ""} className={inputClass}>
            <option value="">{t.search.feeAny}</option>
            <option value="free">{t.search.feeFree}</option>
            <option value="paid">{t.search.feePaid}</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block font-semibold">
            {t.search.language}
          </label>
          <select id="language" name="language" defaultValue={filter.language ?? ""} className={inputClass}>
            <option value="">{t.search.anyLanguage}</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel}
                {l.nativeLabel !== l.label ? `（${l.label}）` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-600 px-6 text-base font-bold text-white hover:bg-brand-700"
        >
          🔍 {t.search.submit}
        </button>
        {hasActiveFilter(filter) && (
          <Link href="/" className="inline-flex min-h-12 items-center rounded-lg px-4 font-semibold text-brand-800 underline">
            {t.search.clear}
          </Link>
        )}
      </div>
    </form>
  );
}
