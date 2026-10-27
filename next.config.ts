import type { NextConfig } from "next";

/**
 * Next.js の設定ファイル。
 *
 * ここでは「全ページに付けるセキュリティ用 HTTP ヘッダ」を定義しています。
 * - X-Frame-Options: 他サイトの <iframe> に埋め込まれるのを防ぐ（クリックジャッキング対策）
 * - X-Content-Type-Options: ブラウザが Content-Type を勝手に推測するのを防ぐ
 * - Referrer-Policy: 外部リンクを開いたとき、検索条件付き URL などを相手サイトに送らない
 * - Permissions-Policy: 位置情報・カメラ等を使わないことを宣言（仕様 6-1「位置情報を取らない」）
 *
 * Content-Security-Policy は Next.js のインラインスクリプトと相性があるため、
 * Phase 6（公開準備）で nonce 方式を導入する予定。
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // サーバーで使う X-Powered-By ヘッダを消す（使用技術を無駄に公開しない）
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
