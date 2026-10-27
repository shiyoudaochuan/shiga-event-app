import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

/**
 * サーバーコンポーネント用の Supabase クライアント（匿名ユーザー権限）。
 *
 * - 一般利用者はログインしないので、セッション（Cookie）は一切持ちません。
 *   persistSession: false にして、ブラウザに何も保存しない設定にしています。
 * - この anon クライアントで見えるのは RLS が許可した行（published のイベント等）だけです。
 *   たとえ `.from("event_submissions").select()` を書いても、DB 側で 0 件が返ります。
 * - 管理者用のクライアント（ログイン済み／service_role）は Phase 3 で別ファイルに作ります。
 */
export function createAnonClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
