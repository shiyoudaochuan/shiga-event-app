import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";

/**
 * 全ページ共通のレイアウト。
 * <html lang> は Phase 5 で表示言語に合わせて切り替える。
 */
export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const t = getDictionary();
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only-focusable fixed left-2 top-2 z-50 rounded bg-white px-3 py-2 font-bold text-brand-800 shadow">
          {t.common.skipToContent}
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
