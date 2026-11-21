/**
 * カテゴリごとの色（チラシの紙色・画鋲の色・アクセント）。
 *
 * 掲示板を見たときに「同じ種類のイベントは同じ色」と直感的に分かるようにする。
 * slug は categories.ts と一致させる。未知の slug は default を使う。
 */
export type CategoryColor = {
  /** チラシの紙色（淡い色。濃いぶどう色の文字で 7:1 以上） */
  paper: string;
  /** 画鋲の色 */
  pin: string;
  /** ラベルなど小さな面に使う色 */
  accent: string;
};

const COLORS: Record<string, CategoryColor> = {
  "japanese-class": { paper: "#fff3c4", pin: "#ff6f59", accent: "#ffc93c" },
  "cultural-exchange": { paper: "#e3ecff", pin: "#ffc93c", accent: "#9cc0ff" },
  career: { paper: "#efe7ff", pin: "#2ec4a6", accent: "#c7b6ff" },
  education: { paper: "#e6f7d9", pin: "#8a6cff", accent: "#b7e59a" },
  "life-consultation": { paper: "#d9f7ef", pin: "#4f8ff7", accent: "#8fe3cf" },
  health: { paper: "#ffe1da", pin: "#4f8ff7", accent: "#ffb3a6" },
  family: { paper: "#ffe6f2", pin: "#8a6cff", accent: "#ffbcd9" },
  "disaster-community": { paper: "#fff0d6", pin: "#ff6f59", accent: "#ffd28a" },
  volunteer: { paper: "#ffe6f2", pin: "#2ec4a6", accent: "#ffbcd9" },
  other: { paper: "#ffffff", pin: "#ff9ec7", accent: "#e5e1ee" },
};

const DEFAULT: CategoryColor = COLORS.other;

export function categoryColor(slug: string): CategoryColor {
  return COLORS[slug] ?? DEFAULT;
}

/** チラシを少しずつ傾けるための角度（規則的になりすぎないよう 6 パターン） */
export const FLYER_TILTS = ["-2deg", "1.5deg", "-1deg", "2.2deg", "-1.6deg", "1deg"] as const;
