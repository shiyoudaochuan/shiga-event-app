/**
 * イベントカテゴリの一覧。
 *
 * - `slug` は DB の categories.slug と一致させます（URL クエリにもこの値を使う）。
 * - 追加・変更は「この配列」と「supabase/migrations の categories INSERT」の 2 か所。
 *   将来は DB の categories テーブルだけを正とし、この配列は削除してもよい設計です。
 * - 表示名は多言語化の対象なので i18n の辞書キーで持ちます（label は日本語の既定値）。
 */
export const CATEGORIES = [
  { slug: "japanese-class", label: "日本語教室・日本語学習" },
  { slug: "cultural-exchange", label: "国際交流・文化交流" },
  { slug: "career", label: "就職・キャリア支援" },
  { slug: "education", label: "進学・教育支援" },
  { slug: "life-consultation", label: "生活相談・行政手続き" },
  { slug: "health", label: "医療・健康" },
  { slug: "family", label: "子育て・家庭支援" },
  { slug: "disaster-community", label: "防災・地域生活" },
  { slug: "volunteer", label: "ボランティア募集" },
  { slug: "other", label: "その他" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORIES.some((c) => c.slug === value);
}

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
