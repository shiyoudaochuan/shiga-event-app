import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka, M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/i18n";

/**
 * 書体（Design C）
 * - M PLUS Rounded 1c：和文の丸ゴシック。親しみやすく、小さくても読みやすい
 * - Fredoka：欧文・数字（日付など）の丸み
 * next/font はビルド時にフォントを取り込み、このサイト自身から配信する
 * （閲覧時に Google のサーバーへ通信しない＝利用者の情報を外部に送らない）。
 * 和文フォントは容量が大きいので preload: false（必要な文字の分だけ後から読み込む）。
 */
const rounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-rounded",
});
const fredoka = Fredoka({ subsets: ["latin"], display: "swap", variable: "--font-fredoka" });

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
    <html lang="ja" className={`${rounded.variable} ${fredoka.variable}`}>
      <body className="flex min-h-screen flex-col pb-28 font-sans lg:pb-0">
        <a href="#main" className="sr-only-focusable btn fixed left-2 top-2 z-50">
          {t.common.skipToContent}
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-5 sm:px-6 sm:pt-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
