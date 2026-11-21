import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

/** 404 ページ。存在しない／非公開のイベント URL を開いたときに表示 */
export default function NotFound() {
  const t = getDictionary();
  return (
    <div className="surface px-6 py-12 text-center">
      <h1 className="text-2xl font-extrabold">{t.event.notFoundTitle}</h1>
      <p className="mt-2 text-ink-soft">{t.event.notFoundBody}</p>
      <Link href="/" className="btn btn-primary mt-6">
        {t.common.backToList}
      </Link>
    </div>
  );
}
