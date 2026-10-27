import { getDictionary } from "@/lib/i18n";

/**
 * サンプルデータ使用中であることを示す注意書き。
 * Supabase 未設定のときだけ表示される（仕様 Step 3「仮データはサンプルであることを明示」）。
 */
export function SampleDataNotice() {
  const t = getDictionary();
  return (
    <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
      <p className="font-bold">⚠ {t.sample.noticeTitle}</p>
      <p className="mt-1 text-sm">{t.sample.noticeBody}</p>
    </div>
  );
}
