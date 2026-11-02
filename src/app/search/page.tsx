import Link from "next/link";

import type { Metadata } from "next";

import { GuidedSearchForm } from "@/components/GuidedSearchform";

// ページのメタデータ
export const metadata: Metadata = {
  title: "イベントを探す | しが つながるイベント",

  description:
    "滋賀県の外国人住民向けイベントを、目的や地域などの条件から探すページです。",
};

// 検索ページ
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 sm:px-6">

      <div className="mx-auto max-w-5xl">

        {/* トップページに戻る */}

        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-medium text-blue-800 hover:underline"
        >
          ← イベント掲示板に戻る
        </Link>

        {/* ページタイトル */}

        <header className="mb-10 mt-6 text-center">

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            イベントを探す
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">
            あなたの興味や希望に合わせて、
            滋賀県内のイベントを探しましょう。
          </p>

          <p className="mt-2 text-sm text-slate-500">
            質問に答えるだけで検索条件を設定できます。
          </p>

        </header>

        {/* 選択式検索フォーム */}

        <GuidedSearchForm />

      </div>

    </main>
  );
}