/**
 * URL の安全性チェック。
 *
 * イベントの申込 URL や情報元 URL は外部から入力される値です。
 * `javascript:alert(1)` のような文字列をそのまま <a href> に入れると XSS になるため、
 * 「https:// で始まる正しい URL」だけをリンクとして出力します。
 * DB 側にも同じ条件の CHECK 制約を置いていて、二重に守っています。
 */
export function isSafeHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/** 表示用にホスト名だけ取り出す（例: https://example.org/path → example.org） */
export function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}
