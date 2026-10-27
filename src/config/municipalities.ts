/**
 * 地域（都道府県・市町）マスタ。
 *
 * 初期段階は滋賀県の全 19 市町。
 * 京都府・大阪府へ広げるときは、この配列に prefecture: "kyoto" などの行を足し、
 * supabase/migrations の municipalities INSERT にも同じ行を追加します。
 * `slug` は DB の municipalities.slug（主キー）と一致させてください。
 */
export const PREFECTURES = [{ code: "shiga", label: "滋賀県" }] as const;

export const MUNICIPALITIES = [
  { slug: "otsu", prefecture: "shiga", label: "大津市" },
  { slug: "hikone", prefecture: "shiga", label: "彦根市" },
  { slug: "nagahama", prefecture: "shiga", label: "長浜市" },
  { slug: "omihachiman", prefecture: "shiga", label: "近江八幡市" },
  { slug: "kusatsu", prefecture: "shiga", label: "草津市" },
  { slug: "moriyama", prefecture: "shiga", label: "守山市" },
  { slug: "ritto", prefecture: "shiga", label: "栗東市" },
  { slug: "koka", prefecture: "shiga", label: "甲賀市" },
  { slug: "yasu", prefecture: "shiga", label: "野洲市" },
  { slug: "konan", prefecture: "shiga", label: "湖南市" },
  { slug: "takashima", prefecture: "shiga", label: "高島市" },
  { slug: "higashiomi", prefecture: "shiga", label: "東近江市" },
  { slug: "maibara", prefecture: "shiga", label: "米原市" },
  { slug: "hino", prefecture: "shiga", label: "日野町" },
  { slug: "ryuo", prefecture: "shiga", label: "竜王町" },
  { slug: "aisho", prefecture: "shiga", label: "愛荘町" },
  { slug: "toyosato", prefecture: "shiga", label: "豊郷町" },
  { slug: "kora", prefecture: "shiga", label: "甲良町" },
  { slug: "taga", prefecture: "shiga", label: "多賀町" },
  // 県内全域・オンライン開催など、特定の市町に属さないイベント用
  { slug: "shiga-all", prefecture: "shiga", label: "滋賀県内全域・オンライン" },
] as const;

export type MunicipalitySlug = (typeof MUNICIPALITIES)[number]["slug"];

export function isMunicipalitySlug(value: string): value is MunicipalitySlug {
  return MUNICIPALITIES.some((m) => m.slug === value);
}

export function municipalityLabel(slug: string): string {
  return MUNICIPALITIES.find((m) => m.slug === slug)?.label ?? slug;
}

export function prefectureLabel(code: string): string {
  return PREFECTURES.find((p) => p.code === code)?.label ?? code;
}
