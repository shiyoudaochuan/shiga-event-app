import { APP_CONFIG } from "@/config/app";
import { getDictionary } from "@/lib/i18n";

/**
 * フッター。
 * プライバシーポリシー・お問い合わせは Phase 6 で実ページに差し替える。
 * 運営者名などは決まるまで「設定待ち」と表示し、架空の情報は入れない（仕様 6-6）。
 */
export function Footer() {
  const t = getDictionary();
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">{APP_CONFIG.name}</p>
        <p className="mt-1">{t.common.footerNote}</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <li>
            {t.common.privacyPolicy} {t.common.pendingSetup}
          </li>
          <li>
            {t.common.contact} {t.common.pendingSetup}
          </li>
        </ul>
        <p className="mt-4">
          {t.common.submitEventLink}：{t.common.submitEventComingSoon}
        </p>
      </div>
    </footer>
  );
}
