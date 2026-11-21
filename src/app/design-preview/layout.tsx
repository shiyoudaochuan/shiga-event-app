import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PreviewBar } from "./_shared/PreviewBar";

export const metadata: Metadata = {
  title: "デザイン比較プレビュー",
  // 比較用の一時ページなので検索エンジンに載せない
  robots: { index: false, follow: false },
};

/**
 * デザイン比較プレビュー専用のレイアウト。
 *
 * 本番のヘッダー・フッター（ルートレイアウト）を書き換えずに分離するため、
 * 画面全体を覆う固定レイヤー（z-[60]）の中に各案を描画する。
 * 本番の画面・コンポーネントには一切変更を加えていない。
 */
export default function DesignPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden overscroll-contain bg-white" data-preview-scroller>
      <PreviewBar />
      {children}
    </div>
  );
}
