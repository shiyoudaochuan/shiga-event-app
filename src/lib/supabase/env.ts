/**
 * Supabase の接続情報を環境変数から読み取る。
 *
 * NEXT_PUBLIC_ が付いた変数は「ブラウザに渡ってもよい」値です。
 * anon key は RLS によって権限が制限されているので公開しても安全ですが、
 * service_role key は絶対に NEXT_PUBLIC_ を付けてはいけません（Phase 3 で扱う）。
 */
export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

/** 設定があれば返す。無ければ null（＝サンプルデータモード） */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
