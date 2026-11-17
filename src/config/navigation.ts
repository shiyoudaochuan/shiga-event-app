/**
 * サイト全体のナビゲーション項目。
 * ヘッダー（PC）と下部タブバー（スマホ）の両方がこの配列を使う。
 */
export const NAV_ITEMS = [
  { href: "/", label: "みんなの掲示板", shortLabel: "掲示板", icon: "📌" },
  { href: "/discover", label: "イベント発見", shortLabel: "発見", icon: "✨" },
  { href: "/my", label: "マイ掲示板", shortLabel: "マイ", icon: "⭐" },
  { href: "/search", label: "イベント検索", shortLabel: "検索", icon: "🔍" },
] as const;

/** 現在のパスがそのナビ項目に属するか（/search/results も「検索」扱い） */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/events/");
  return pathname === href || pathname.startsWith(`${href}/`);
}
