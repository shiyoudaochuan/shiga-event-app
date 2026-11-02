"use client";
import { useRouter } from "next/navigation";

import { useState, type FormEvent } from "react";

import {
  searchQuestions,
  type SearchQuestion,
} from "@/config/guided-search";

// ========================================
// 1. 質問表示用コンポーネント
// ========================================

type QuestionFieldProps = {
  question: SearchQuestion;
  selected: string[];

  onToggle: (
    question: SearchQuestion,
    value: string
  ) => void;
};

function QuestionField({
  question,
  selected,
  onToggle,
}: QuestionFieldProps) {
  return (
    <fieldset
      aria-describedby={`help-${question.id}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <legend className="px-2 text-lg font-bold text-slate-900">
        {question.title}
      </legend>

      <p
        id={`help-${question.id}`}
        className="mb-5 text-sm text-slate-600"
      >
        {question.description}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const checked = selected.includes(option.value);

          return (
            <label
              key={option.value}
              className={`
                flex min-h-12 cursor-pointer items-center
                gap-3 rounded-xl border p-4
                transition-colors

                ${
                  checked
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }
              `}
            >
              <input
                type={
                  question.multiple
                    ? "checkbox"
                    : "radio"
                }
                name={question.id}
                value={option.value}
                checked={checked}
                onChange={() =>
                  onToggle(question, option.value)
                }
                className="h-5 w-5 shrink-0 accent-blue-700"
              />

              <span className="text-sm font-medium">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// ========================================
// 2. 検索フォーム全体
// ========================================

export function GuidedSearchForm() {
    const router = useRouter();
  // 選択された検索条件
  const [answers, setAnswers] =
    useState<Record<string, string[]>>({});

  // 詳細検索の開閉状態
  const [showAdvanced, setShowAdvanced] =
    useState(false);

  // 選択内容の確認画面
  const [showPreview, setShowPreview] =
    useState(false);

  // 基本質問と詳細質問を分離
  const basicQuestions = searchQuestions.filter(
    (question) => question.group === "basic"
  );

  const advancedQuestions = searchQuestions.filter(
    (question) => question.group === "advanced"
  );

  // ========================================
  // 3. 選択肢の更新
  // ========================================

  function toggleOption(
    question: SearchQuestion,
    value: string
  ) {
    setAnswers((previous) => {
      const selected = previous[question.id] ?? [];

      const nextSelected = question.multiple
        ? selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value]
        : [value];

      return {
        ...previous,
        [question.id]: nextSelected,
      };
    });
  }

  // ========================================
  // 4. 検索条件のリセット
  // ========================================

  function clearAnswers() {
    setAnswers({});
    setShowPreview(false);
  }

  // ========================================
  // 5. 選択された条件の集計
  // ========================================

  const selectedCount = Object.values(answers).reduce(
    (total, values) => total + values.length,
    0
  );

  const selectedLabels = searchQuestions.flatMap(
    (question) =>
      question.options
        .filter((option) =>
          (answers[question.id] ?? []).includes(
            option.value
          )
        )
        .map((option) => option.label)
  );

  // ========================================
  // 6. 検索条件の確認
  // ========================================

  function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const params = new URLSearchParams();

  for (const [key, values] of Object.entries(answers)) {

    for (const value of values) {
      params.append(key, value);
    }

  }

  router.push(
    `/search/results?${params.toString()}`
  );
}

  // ========================================
  // 7. 画面の表示
  // ========================================

  return (
    <div className="mx-auto w-full max-w-4xl">

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* 基本的な質問 */}

        <section className="space-y-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              基本の質問
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              希望する条件を選んでください。
              すべて回答する必要はありません。
            </p>
          </div>

          {basicQuestions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              selected={answers[question.id] ?? []}
              onToggle={toggleOption}
            />
          ))}

        </section>

        {/* 詳細検索 */}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <button
            type="button"
            aria-expanded={showAdvanced}
            aria-controls="advanced-search-options"
            onClick={() =>
              setShowAdvanced((previous) => !previous)
            }
            className="flex min-h-12 w-full items-center justify-between gap-3 text-left font-bold text-blue-800"
          >
            <span>
              {showAdvanced
                ? "− 詳しい条件を閉じる"
                : "＋ 詳しい条件を設定する"}
            </span>

            <span aria-hidden="true">
              {showAdvanced ? "▲" : "▼"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="min-h-12 rounded-xl border border-blue-300 px-6 py-3 font-medium text-blue-800 hover:bg-blue-50">
  条件を確認
            </button>

          <div
            id="advanced-search-options"
            hidden={!showAdvanced}
            className="mt-5 space-y-5"
          >
            {advancedQuestions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                selected={answers[question.id] ?? []}
                onToggle={toggleOption}
              />
            ))}
          </div>

        </section>

        {/* 選択状況と操作ボタン */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <p
            aria-live="polite"
            className="mb-4 text-center text-sm text-slate-600"
          >
            現在 {selectedCount} 個の条件を選択しています
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              className="min-h-12 flex-1 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-800"
            >
              選んだ条件を確認する
            </button>

            <button
              type="button"
              onClick={clearAnswers}
              className="min-h-12 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              すべてクリア
            </button>

          </div>

        </section>

      </form>

      {/* 選択した検索条件の確認 */}

      {showPreview && (
        <section
          role="status"
          className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6"
        >
          <h2 className="text-xl font-bold text-blue-900">
            選択した検索条件
          </h2>

          {selectedLabels.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">

              {selectedLabels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-900"
                >
                  {label}
                </span>
              ))}

            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-700">
              条件は選択されていません。
            </p>
          )}

          <p className="mt-5 text-sm text-slate-600">
            現在は検索条件を確認する段階です。
            次の開発STEPで、実際のイベント検索とおすすめ表示を接続します。
          </p>

        </section>
      )}

    </div>
  );
}