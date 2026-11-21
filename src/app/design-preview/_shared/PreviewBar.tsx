"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/design-preview", label: "一覧" },
  { href: "/design-preview/a", label: "A Glass" },
  { href: "/design-preview/b", label: "B Editorial" },
  { href: "/design-preview/c", label: "C Playful" },
];

/**
 * プレビュー切替バー。デザインの外側（最上部）に置き、各案の見た目には混ざらないようにする。
 */
export function PreviewBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="デザイン案の切替（プレビュー専用）"
      className="flex items-center gap-1 overflow-x-auto bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300"
    >
      <span className="mr-2 shrink-0 font-semibold text-neutral-500">PREVIEW</span>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded px-2.5 py-1 font-semibold ${
              active ? "bg-white text-neutral-950" : "hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link href="/" className="ml-auto shrink-0 rounded px-2.5 py-1 hover:bg-neutral-800 hover:text-white">
        本番に戻る ↩
      </Link>
    </nav>
  );
}
