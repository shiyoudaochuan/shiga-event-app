import type { CSSProperties, ReactNode } from "react";

/**
 * 小さなラベル（カテゴリ・言語・無料など）。
 * Design C：太い輪郭線のシール。色は用途ごとに分ける（文字はすべてぶどう色で読みやすさを揃える）
 */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}) {
  const tones = {
    neutral: "#ffffff",
    brand: "#dbe7ff",
    success: "#c9f2e6",
    warning: "#ffe08a",
  } as const;
  return (
    <span className="tag" style={{ "--tag-bg": tones[tone] } as CSSProperties}>
      {children}
    </span>
  );
}
