import { getDictionary } from "@/lib/i18n";

/**
 * サンプルデータ使用中であることを示す注意書き。
 * Supabase 未設定のときだけ表示される（仕様 Step 3「仮データはサンプルであることを明示」）。
 *
 * compact = true のときはスマホで本文を省略し、見出しだけにする
 * （発見モードなど、画面の高さを操作に使いたいページ向け）。
 */
export function SampleDataNotice({ compact = false }: { compact?: boolean }) {
  const t = getDictionary();
  return (
    <div
      role="status"
      className={`rounded-[var(--radius-md)] border-2 border-dashed border-ink bg-white ${compact ? "px-4 py-2 sm:py-3" : "px-5 py-3"}`}
    >
      <p className={`font-extrabold ${compact ? "text-sm sm:text-base" : ""}`}>🧪 {t.sample.noticeTitle}</p>
      <p className={`mt-1 text-sm text-ink-soft ${compact ? "hidden sm:block" : ""}`}>{t.sample.noticeBody}</p>
    </div>
  );
}
