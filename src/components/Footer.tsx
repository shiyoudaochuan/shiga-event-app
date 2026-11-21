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
    <footer className="mt-14 px-4 pb-6 sm:px-6">
      <div className="surface mx-auto max-w-6xl px-6 py-6 text-sm text-ink-soft">
        <p className="font-extrabold text-ink">
          <span aria-hidden="true">∞ </span>
          {APP_CONFIG.name}
        </p>
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
