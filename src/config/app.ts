/**
 * アプリ全体の設定値。
 * 名称を変えたいときはここだけ書き換えれば、ヘッダー・<title>・フッターすべてに反映されます。
 */
export const APP_CONFIG = {
  /** 表示名（仮名称）。将来変更しやすいよう 1 か所に集約 */
  name: "しが つながるイベント",
  /** 英語表記（<html lang> 切替後やメタデータで使用） */
  nameEn: "Shiga Tsunagaru Events",
  /** 1 行説明 */
  tagline: "滋賀県の外国人支援・国際交流イベントをひとつの場所で",
  /** 初期対象の都道府県コード。他府県へ拡張するときは municipalities.ts に行を追加 */
  defaultPrefecture: "shiga",
  /** 表示用タイムゾーン（DB は UTC 保存、表示だけ日本時間） */
  timeZone: "Asia/Tokyo",
  /** 一覧に出す最大件数（初期規模ではページングなしで十分） */
  maxListItems: 200,
} as const;
