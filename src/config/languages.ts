/**
 * 言語コードの定義。
 *
 * 2 つの用途で共通に使います。
 *  1. UI 表示言語（Phase 5 で言語切替ボタンを有効化）
 *  2. 「イベントで使える言語」（events.supported_languages）
 *
 * 言語を増やすときはここに 1 行足し、UI 用なら src/lib/i18n/dictionaries/ に辞書を追加します。
 */
export const LANGUAGES = [
  { code: "ja", label: "日本語", nativeLabel: "日本語" },
  { code: "easy-ja", label: "やさしい日本語", nativeLabel: "やさしい にほんご" },
  { code: "en", label: "英語", nativeLabel: "English" },
  { code: "vi", label: "ベトナム語", nativeLabel: "Tiếng Việt" },
  { code: "pt", label: "ポルトガル語", nativeLabel: "Português" },
  // 以下はイベント側の「対応言語」として選べるが UI 翻訳はまだ無い言語
  { code: "zh", label: "中国語", nativeLabel: "中文" },
  { code: "ko", label: "韓国語", nativeLabel: "한국어" },
  { code: "tl", label: "タガログ語", nativeLabel: "Tagalog" },
  { code: "es", label: "スペイン語", nativeLabel: "Español" },
  { code: "ne", label: "ネパール語", nativeLabel: "नेपाली" },
  { code: "id", label: "インドネシア語", nativeLabel: "Bahasa Indonesia" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

/** UI の表示言語として選べるもの（Phase 5 で辞書を用意する 5 言語） */
export const UI_LOCALES = ["ja", "easy-ja", "en", "vi", "pt"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];
export const DEFAULT_LOCALE: UiLocale = "ja";

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}

export function languageLabel(code: string): string {
  const l = LANGUAGES.find((x) => x.code === code);
  return l ? l.nativeLabel : code;
}
