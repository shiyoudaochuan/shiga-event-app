// 検索の選択肢を表す型
export type SearchOption = {
  value: string;
  label: string;
};

// 1つの質問を表す型
export type SearchQuestion = {
  id: string;
  title: string;
  description: string;

  // 複数選択を許可するか
  multiple: boolean;

  // 基本条件か詳細条件か
  group: "basic" | "advanced";

  // 選択肢の一覧
  options: SearchOption[];
};

// 検索画面で使用する質問一覧
export const searchQuestions: SearchQuestion[] = [

  // ==================================
  // Q1. イベントへの参加目的
  // ==================================
  {
    id: "purpose",
    title: "どんなことをしたいですか？",
    description: "興味のあるものを選んでください。複数選べます。",
    multiple: true,
    group: "basic",

    options: [
      {
        value: "learn_japanese",
        label: "日本語を勉強したい",
      },
      {
        value: "make_friends",
        label: "新しい友達を作りたい",
      },
      {
        value: "local_exchange",
        label: "地域の人と交流したい",
      },
      {
        value: "culture",
        label: "日本や世界の文化を楽しみたい",
      },
      {
        value: "hobby",
        label: "趣味やスポーツを楽しみたい",
      },
      {
        value: "daily_life",
        label: "日本での生活について相談したい",
      },
      {
        value: "administrative",
        label: "在留資格や行政手続について相談したい",
      },
      {
        value: "work",
        label: "仕事や就職について学びたい",
      },
      {
        value: "parenting",
        label: "子育てについて相談・交流したい",
      },
      {
        value: "education",
        label: "学校や子どもの教育について知りたい",
      },
      {
        value: "health",
        label: "健康や医療について知りたい",
      },
      {
        value: "disaster",
        label: "防災について学びたい",
      },
      {
        value: "volunteer",
        label: "ボランティアに参加したい",
      },
    ],
  },

  // ==================================
  // Q2. 開催地域
  // ==================================
  {
    id: "municipality",
    title: "どの地域で参加したいですか？",
    description: "希望する地域を選んでください。",
    multiple: true,
    group: "basic",

    options: [
      { value: "otsu", label: "大津市" },
      { value: "kusatsu", label: "草津市" },
      { value: "moriyama", label: "守山市" },
      { value: "ritto", label: "栗東市" },
      { value: "yasu", label: "野洲市" },
      { value: "konan", label: "湖南市" },
      { value: "koka", label: "甲賀市" },
      { value: "omihachiman", label: "近江八幡市" },
      { value: "higashiomi", label: "東近江市" },
      { value: "hikone", label: "彦根市" },
      { value: "nagahama", label: "長浜市" },
      { value: "maibara", label: "米原市" },
      { value: "takashima", label: "高島市" },
      { value: "hino", label: "日野町" },
      { value: "ryuo", label: "竜王町" },
      { value: "aisho", label: "愛荘町" },
      { value: "toyosa", label: "豊郷町" },
      { value: "kora", label: "甲良町" },
      { value: "taga", label: "多賀町" },
    ],
  },

  // ==================================
  // Q3. 参加したい日時
  // ==================================
  {
    id: "when",
    title: "いつ参加したいですか？",
    description: "参加しやすい時間帯を選んでください。",
    multiple: false,
    group: "basic",

    options: [
      {
        value: "soon",
        label: "できるだけ近いうち",
      },
      {
        value: "weekend",
        label: "土曜日・日曜日",
      },
      {
        value: "weekday_day",
        label: "平日の日中",
      },
      {
        value: "weekday_evening",
        label: "平日の夕方・夜",
      },
    ],
  },

  // ==================================
  // Q4. 交流したい相手
  // ==================================
  {
    id: "people",
    title: "どんな人と交流したいですか？",
    description: "希望する交流相手を選んでください。",
    multiple: true,
    group: "advanced",

    options: [
      {
        value: "japanese",
        label: "日本人と交流したい",
      },
      {
        value: "foreign_residents",
        label: "外国人住民と交流したい",
      },
      {
        value: "same_language",
        label: "同じ言語を話す人と交流したい",
      },
      {
        value: "families",
        label: "親子や家族と交流したい",
      },
      {
        value: "students",
        label: "学生や若い人と交流したい",
      },
    ],
  },

  // ==================================
  // Q5. 使用したい言語
  // ==================================
  {
    id: "language",
    title: "どの言語で参加したいですか？",
    description: "理解しやすい言語を選んでください。",
    multiple: true,
    group: "advanced",

    options: [
      { value: "ja", label: "日本語" },
      { value: "easy_ja", label: "やさしい日本語" },
      { value: "en", label: "英語" },
      { value: "zh", label: "中国語" },
      { value: "vi", label: "ベトナム語" },
      { value: "pt", label: "ポルトガル語" },
      { value: "tl", label: "フィリピノ語" },
      { value: "ne", label: "ネパール語" },
      { value: "id", label: "インドネシア語" },
      { value: "other", label: "その他" },
    ],
  },

  // ==================================
  // Q6. 参加費用
  // ==================================
  {
    id: "fee",
    title: "参加費について",
    description: "希望する条件を選んでください。",
    multiple: false,
    group: "advanced",

    options: [
      {
        value: "free",
        label: "無料のイベントがよい",
      },
      {
        value: "paid_ok",
        label: "有料でも参加したい",
      },
    ],
  },

  // ==================================
  // Q7. 参加しやすさ
  // ==================================
  {
    id: "accessibility",
    title: "参加するときに必要なことはありますか？",
    description: "必要な条件を選んでください。",
    multiple: true,
    group: "advanced",

    options: [
      {
        value: "children",
        label: "子どもと一緒に参加できる",
      },
      {
        value: "beginner",
        label: "初めてでも参加しやすい",
      },
      {
        value: "no_reservation",
        label: "予約なしで参加できる",
      },
      {
        value: "interpreter",
        label: "通訳のサポートがある",
      },
      {
        value: "online",
        label: "オンラインで参加できる",
      },
      {
        value: "wheelchair",
        label: "車いすで参加できる",
      },
      {
        value: "childcare",
        label: "託児サービスがある",
      },
    ],
  },
];