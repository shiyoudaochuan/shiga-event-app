/**
 * UI 文言の辞書（日本語）。
 *
 * 画面に出る固定の文章はすべてここに集めます。
 * Phase 5 では easy-ja.ts / en.ts / vi.ts / pt.ts を同じキー構成で追加し、
 * getDictionary(locale) で切り替えます。キーの型は ja.ts から自動生成されるので、
 * 他言語で翻訳漏れがあると TypeScript がエラーで教えてくれます。
 */
export const ja = {
  common: {
    skipToContent: "本文へスキップ",
    appTagline: "滋賀県の外国人支援・国際交流イベントをひとつの場所で",
    languageSwitcher: "言語",
    languageSwitcherComingSoon: "他の言語は準備中です",
    submitEventLink: "イベントを掲載したい方へ",
    submitEventComingSoon: "掲載依頼フォームは準備中です",
    backToList: "イベント一覧へ戻る",
    free: "無料",
    notSet: "未定",
    untranslated: "（日本語のみ）",
    footerNote: "このサイトは利用者の個人情報を収集しません。",
    privacyPolicy: "プライバシーポリシー",
    contact: "お問い合わせ",
    pendingSetup: "（設定待ち）",
  },
  sample: {
    badge: "サンプル",
    noticeTitle: "いま表示しているのはサンプルデータです",
    noticeBody:
      "ここに出ているイベント・団体はすべて架空のもので、実在しません。Supabase の接続設定（.env.local）を行うと、データベースに登録した実際のイベントが表示されます。",
  },
  search: {
    title: "イベントをさがす",
    keyword: "キーワード",
    keywordPlaceholder: "例：日本語、相談、子ども",
    municipality: "地域（市町）",
    allMunicipalities: "すべての地域",
    category: "カテゴリー",
    allCategories: "すべてのカテゴリー",
    date: "開催日",
    fee: "参加費",
    feeAny: "指定なし",
    feeFree: "無料のみ",
    feePaid: "有料のみ",
    language: "使える言語",
    anyLanguage: "指定なし",
    submit: "さがす",
    clear: "条件をクリア",
    resultCount: (n: number) => `${n} 件のイベント`,
    noResultTitle: "条件に合うイベントが見つかりませんでした",
    noResultBody: "キーワードを短くする、地域やカテゴリーを「すべて」に戻すなど、条件を減らして試してみてください。",
    noUpcomingTitle: "開催予定のイベントはまだありません",
    noUpcomingBody: "新しいイベントが登録されるまでお待ちください。",
  },
  event: {
    listHeading: "開催予定のイベント",
    detailHeading: "イベント詳細",
    dateTime: "開催日時",
    area: "開催地域",
    venue: "開催場所",
    address: "住所",
    organizer: "主催団体",
    category: "カテゴリー",
    fee: "参加費",
    languages: "使える言語",
    targetAudience: "対象者",
    howToApply: "参加方法",
    registrationDeadline: "申込締切",
    registrationUrl: "申込ページ",
    registrationButton: "主催者の申込ページを開く",
    sourceUrl: "情報元",
    lastVerified: "最終確認日",
    description: "イベントの内容",
    externalLinkNote: "外部サイトが開きます。申込は主催者のページで行います。このサイトは申込内容を受け取りません。",
    organizerWebsite: "団体のウェブサイト",
    notFoundTitle: "イベントが見つかりませんでした",
    notFoundBody: "URL が間違っているか、イベントが非公開になった可能性があります。",
  },
} as const;

export type Dictionary = typeof ja;
