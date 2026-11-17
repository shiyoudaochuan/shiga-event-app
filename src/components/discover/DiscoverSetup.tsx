"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { CATEGORIES } from "@/config/categories";
import { searchQuestions, type SearchQuestion } from "@/config/guided-search";
import type { DiscoverPrefs } from "@/lib/discover/storage";

/**
 * 発見モードの初期設定画面。
 *
 * 選択肢は検索ページ（guided-search.ts）と同じものを再利用するので、
 * 検索ページに選択肢を追加すれば、ここにも自動で反映される。
 * 設定は任意。「スキップ」を押せば条件なしで全イベントを見られる。
 */

// 指示書の項目名に合わせた見出しの順番（存在しない ID は自動的に無視される）
const QUESTION_ORDER = ["purpose", "municipality", "when", "language", "fee", "people", "accessibility"];
const QUESTIONS: SearchQuestion[] = QUESTION_ORDER.map((id) => searchQuestions.find((q) => q.id === id)).filter(
  (q): q is SearchQuestion => Boolean(q),
);

type Props = {
  initial: DiscoverPrefs | null;
  onSubmit: (prefs: DiscoverPrefs) => void;
  onCancel?: () => void;
};

export function DiscoverSetup({ initial, onSubmit, onCancel }: Props) {
  // フォームの状態（Python でいう dict / list をそのまま持っているイメージ）
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [answers, setAnswers] = useState<Record<string, string[]>>(initial?.answers ?? {});

  const selectedCount = categories.length + Object.values(answers).reduce((n, v) => n + v.length, 0);

  function toggleCategory(slug: string) {
    setCategories((cur) => (cur.includes(slug) ? cur.filter((c) => c !== slug) : [...cur, slug]));
  }

  function toggleAnswer(q: SearchQuestion, value: string) {
    setAnswers((cur) => {
      const selected = cur[q.id] ?? [];
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : q.multiple
          ? [...selected, value]
          : [value]; // 単一選択の質問は置き換え。もう一度押すと解除できる
      return { ...cur, [q.id]: next };
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // 空の配列は保存しない（URL・LocalStorage を小さく保つ）
    const cleaned = Object.fromEntries(Object.entries(answers).filter(([, v]) => v.length > 0));
    onSubmit({ mode: "set", categories, answers: cleaned });
  }

  function handleSkip() {
    onSubmit({ mode: "skipped", categories: [], answers: {} });
  }

  function handleClear() {
    setCategories([]);
    setAnswers({});
  }

  const basic = QUESTIONS.filter((q) => q.group === "basic");
  const advanced = QUESTIONS.filter((q) => q.group === "advanced");

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5" aria-labelledby="setup-heading">
      <header className="glass animate-rise rounded-[var(--radius-lg)] px-5 py-6 text-center sm:px-8">
        <p className="text-sm font-semibold text-brand-700">✨ イベント発見モード</p>
        <h1 id="setup-heading" className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          あなたに合うチラシから見せます
        </h1>
        <p className="mt-2 text-slate-700">
          気になることを選んでください。<strong>すべて任意</strong>です。あとから変更できます。
        </p>
        <p className="mt-1 text-sm text-slate-600">
          選んだ内容はこの端末のブラウザにだけ保存され、サーバーには送信されません。
        </p>
      </header>

      <ChipGroup
        id="categories"
        title="興味のある分野"
        description="複数選べます。選んだ分野のイベントを先に表示します。"
        options={CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
        selected={categories}
        onToggle={toggleCategory}
        multiple
        delay={60}
      />

      {basic.map((q, i) => (
        <ChipGroup
          key={q.id}
          id={q.id}
          title={q.title}
          description={q.description}
          options={q.options}
          selected={answers[q.id] ?? []}
          onToggle={(v) => toggleAnswer(q, v)}
          multiple={q.multiple}
          delay={120 + i * 60}
        />
      ))}

      {/* 詳細条件は折りたたむ（スマホで縦に長くなりすぎないように） */}
      <details className="glass group rounded-[var(--radius-lg)] open:pb-2">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-bold text-brand-800">
          言語・参加費・交流相手・子連れなどの条件
          <span aria-hidden="true" className="transition-transform duration-200 group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="space-y-4 px-2 pb-2 sm:px-3">
          {advanced.map((q) => (
            <ChipGroup
              key={q.id}
              id={q.id}
              title={q.title}
              description={q.description}
              options={q.options}
              selected={answers[q.id] ?? []}
              onToggle={(v) => toggleAnswer(q, v)}
              multiple={q.multiple}
              flat
            />
          ))}
          <p className="px-3 text-sm text-slate-600">
            ※「交流したい相手」「参加しやすさ」は、現在のイベントデータでは判定できないため並び順には反映されません。
          </p>
        </div>
      </details>

      {/* 操作ボタン。スマホでは画面下に固定し、親指で押しやすくする */}
      <div className="sticky bottom-24 z-30 lg:bottom-4">
        <div className="glass glass-strong flex flex-col gap-1.5 rounded-[var(--radius-lg)] p-2.5 sm:flex-row sm:items-center sm:gap-2 sm:p-3">
          <p className="px-2 text-xs text-slate-700 sm:mr-auto sm:text-sm" aria-live="polite">
            {selectedCount > 0 ? `${selectedCount} 個の条件を選択中` : "条件なし（すべてのイベント）"}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {onCancel ? (
              <button type="button" onClick={onCancel} className="glass glass-btn">
                もどる
              </button>
            ) : (
              <button type="button" onClick={handleSkip} className="glass glass-btn">
                スキップ
              </button>
            )}
            {selectedCount > 0 && (
              <button type="button" onClick={handleClear} className="glass glass-btn hidden sm:inline-flex">
                クリア
              </button>
            )}
            <button type="submit" className="glass-btn-primary whitespace-nowrap px-4 sm:px-6">
              この条件で始める
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

type ChipGroupProps = {
  id: string;
  title: string;
  description: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  multiple: boolean;
  delay?: number;
  /** true のときはガラス板を重ねない（折りたたみの中で使う） */
  flat?: boolean;
};

function ChipGroup({ id, title, description, options, selected, onToggle, multiple, delay = 0, flat }: ChipGroupProps) {
  return (
    <fieldset
      aria-describedby={`help-${id}`}
      className={flat ? "rounded-2xl px-3 py-2" : "glass animate-rise rounded-[var(--radius-lg)] px-5 py-5"}
      style={flat ? undefined : ({ "--rise-delay": `${delay}ms` } as CSSProperties)}
    >
      <legend className={`font-bold text-slate-900 ${flat ? "" : "float-left w-full text-lg"}`}>{title}</legend>
      <p id={`help-${id}`} className="clear-both mb-3 text-sm text-slate-600">
        {description}
        {!multiple && "（1 つ）"}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="glass-chip">
            {/* 見た目はチップ、中身は本物の checkbox（キーボード・読み上げに対応） */}
            <input
              type="checkbox"
              className="sr-only"
              checked={selected.includes(o.value)}
              onChange={() => onToggle(o.value)}
            />
            <span aria-hidden="true" className="text-brand-700">
              {selected.includes(o.value) ? "✓" : "+"}
            </span>
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
