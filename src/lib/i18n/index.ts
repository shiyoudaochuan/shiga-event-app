import { DEFAULT_LOCALE, type UiLocale } from "@/config/languages";
import { ja, type Dictionary } from "./dictionaries/ja";

/**
 * 辞書の取り出し口。
 *
 * Phase 5 で以下のように増やします：
 *   import { en } from "./dictionaries/en";
 *   const dictionaries: Record<UiLocale, Dictionary> = { ja, "easy-ja": easyJa, en, vi, pt };
 *
 * 今は日本語だけなので、どの locale を渡しても ja が返ります。
 */
const dictionaries: Partial<Record<UiLocale, Dictionary>> = { ja };

export function getDictionary(locale: UiLocale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? ja;
}

export type { Dictionary };
