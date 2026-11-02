import type { Event } from "@/lib/types";

import { categoryLabel } from "@/config/categories";
import { municipalityLabel } from "@/config/municipalities";
import { searchQuestions } from "@/config/guided-search";

// ========================================
// 1. 型定義
// ========================================

// 利用者が選択した検索条件
export type SearchAnswers = Record<string, string[]>;

// スコアが付いたイベント
export type ScoredEvent = {
  event: Event;
  score: number;
};

// ========================================
// 2. 参加目的に関連するキーワード
// ========================================

const PURPOSE_KEYWORDS: Record<string, string[]> = {
  learn_japanese: [
    "日本語",
    "会話練習",
    "ことば",
  ],

  make_friends: [
    "友達",
    "友だち",
    "交流会",
    "おしゃべり",
  ],

  local_exchange: [
    "国際交流",
    "地域交流",
    "交流会",
  ],

  culture: [
    "文化",
    "祭り",
    "フェスティバル",
    "料理",
  ],

  hobby: [
    "スポーツ",
    "趣味",
    "体験",
    "ワークショップ",
  ],

  daily_life: [
    "生活相談",
    "暮らし",
    "住まい",
  ],

  administrative: [
    "在留",
    "行政手続",
    "ビザ",
    "法律相談",
  ],

  work: [
    "就職",
    "仕事",
    "就労",
    "キャリア",
  ],

  parenting: [
    "子育て",
    "親子",
    "育児",
  ],

  education: [
    "学校",
    "教育",
    "進学",
    "学習支援",
  ],

  health: [
    "医療",
    "健康",
    "病院",
  ],

  disaster: [
    "防災",
    "災害",
    "避難",
  ],

  volunteer: [
    "ボランティア",
    "地域活動",
    "社会貢献",
  ],
};

// ========================================
// 3. 開催日時の条件を確認
// ========================================

function matchesWhen(
  startAt: string,
  when: string | undefined
): boolean {

  if (!when || when === "soon") {
    return true;
  }

  const date = new Date(startAt);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  // 日本時間で曜日と時刻を取得
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find(
    (part) => part.type === "weekday"
  )?.value;

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value
  );

  const isWeekend =
    weekday === "Sat" || weekday === "Sun";

  if (when === "weekend") {
    return isWeekend;
  }

  if (when === "weekday_day") {
    return !isWeekend && hour >= 9 && hour < 17;
  }

  if (when === "weekday_evening") {
    return !isWeekend && hour >= 17 && hour < 23;
  }

  return true;
}

// ========================================
// 4. 参加目的との関連性を計算
// ========================================

function calculateScore(
  event: Event,
  purposes: string[]
): number {

  const title = event.title.toLowerCase();

  const category = categoryLabel(
    event.category
  ).toLowerCase();

  const description = event.description.toLowerCase();

  return purposes.reduce((total, purpose) => {

    const keywords = PURPOSE_KEYWORDS[purpose] ?? [];

    const bestScore = keywords.reduce(
      (highest, keyword) => {

        if (title.includes(keyword)) {
          return Math.max(highest, 4);
        }

        if (category.includes(keyword)) {
          return Math.max(highest, 3);
        }

        if (description.includes(keyword)) {
          return Math.max(highest, 1);
        }

        return highest;
      },
      0
    );

    return total + bestScore;

  }, 0);
}

// ========================================
// 5. 検索・おすすめランキング
// ========================================

export function recommendEvents(
  events: Event[],
  answers: SearchAnswers
): ScoredEvent[] {

  const purposes = answers.purpose ?? [];
  const municipalities = answers.municipality ?? [];
  const languages = answers.language ?? [];

  const when = answers.when?.[0];

  const freeOnly = (answers.fee ?? []).includes(
    "free"
  );

  // 既存の自治体名と照合するため、
  // 検索画面の表示名も取得
  const selectedMunicipalityNames =
    searchQuestions
      .find((question) => question.id === "municipality")
      ?.options.filter((option) =>
        municipalities.includes(option.value)
      )
      .map((option) => option.label) ?? [];

  // 必須条件で絞り込み
  const filtered = events.filter((event) => {

    const matchesMunicipality =
      municipalities.length === 0 ||
      municipalities.includes(String(event.municipality)) ||
      selectedMunicipalityNames.includes(
        municipalityLabel(event.municipality)
      );

    const matchesLanguage =
      languages.length === 0 ||
      event.supportedLanguages.some((language) =>
        languages.includes(String(language))
      );

    const matchesFee =
      !freeOnly || event.participationFee === 0;

    const matchesDate = matchesWhen(
      event.startAt,
      when
    );

    return (
      matchesMunicipality &&
      matchesLanguage &&
      matchesFee &&
      matchesDate
    );
  });

  // 各イベントの関連性を計算
  const scored = filtered.map((event) => ({
    event,
    score: calculateScore(event, purposes),
  }));

  // 関連性の高い順に並べ替え
  return scored.sort((a, b) => {

    const dateDifference =
      new Date(a.event.startAt).getTime() -
      new Date(b.event.startAt).getTime();

    // 「できるだけ近いうち」を選択した場合
    if (when === "soon") {
      return dateDifference || b.score - a.score;
    }

    // 通常は関連性を優先
    return b.score - a.score || dateDifference;
  });
}