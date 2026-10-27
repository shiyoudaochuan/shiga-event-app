import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

/** 404 ページ。存在しない／非公開のイベント URL を開いたときに表示 */
export default function NotFound() {
  const t = getDictionary();
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
      <h1 className="text-2xl font-bold">{t.event.notFoundTitle}</h1>
      <p className="mt-2 text-slate-600">{t.event.notFoundBody}</p>
      <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-brand-600 px-6 font-bold text-white">
        {t.common.backToList}
      </Link>
    </div>
  );
}
