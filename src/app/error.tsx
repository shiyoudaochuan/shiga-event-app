"use client";

import Link from "next/link";

/**
 * 想定外のエラー（Supabase 接続失敗など）が起きたときの画面。
 * エラーの詳細（接続先 URL やスタックトレース）は利用者に見せず、サーバーのログにだけ残す。
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="surface px-6 py-12 text-center">
      <h1 className="text-2xl font-extrabold">表示できませんでした</h1>
      <p className="mt-2 text-ink-soft">しばらくしてからもう一度お試しください。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn btn-primary"
        >
          もう一度読み込む
        </button>
        <Link href="/" className="btn">
          トップへ
        </Link>
      </div>
    </div>
  );
}
