import type { CSSProperties } from "react";
import Link from "next/link";

import type { Metadata } from "next";

import { GuidedSearchForm } from "@/components/GuidedSearchform";

// ページのメタデータ
export const metadata: Metadata = {
  title: "イベントを探す",

  description:
    "滋賀県の外国人住民向けイベントを、目的や地域などの条件から探すページです。",
};

// 検索ページ
export default function SearchPage() {
  return (
    <div className="py-2 sm:py-4">

      <div className="mx-auto max-w-5xl">

        {/* トップページに戻る */}

        <Link
          href="/"
          className="btn btn-sm"
        >
          ← イベント掲示板に戻る
        </Link>

        {/* ページタイトル */}

        <header className="surface animate-pop mb-8 mt-5 px-5 py-8 text-center" style={{ "--surface-bg": "#e3ecff", "--surface-shadow": "var(--color-sky)" } as CSSProperties}>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            🔍 イベントを探す
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-soft">
            あなたの興味や希望に合わせて、
            滋賀県内のイベントを探しましょう。
          </p>

          <p className="mt-2 text-sm text-ink-soft">
            質問に答えるだけで検索条件を設定できます。
          </p>

        </header>

        {/* 選択式検索フォーム */}

        <GuidedSearchForm />

      </div>

    </div>
  );
}