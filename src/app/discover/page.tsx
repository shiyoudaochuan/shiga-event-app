import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/events/repository";
import { DiscoverClient } from "@/components/discover/DiscoverClient";
import { SampleDataNotice } from "@/components/SampleDataNotice";

export const metadata: Metadata = {
  title: "イベント発見",
  description: "イベントのチラシを 1 枚ずつ見て、気になるものをお気に入りに保存できます。",
};

export const dynamic = "force-dynamic";

/**
 * イベント発見モード。
 * データ取得はサーバー（このファイル）で行い、操作部分はクライアントコンポーネントに渡す。
 */
export default async function DiscoverPage() {
  const { events, source } = await getUpcomingEvents();
  const isSample = source === "sample";

  return (
    <div className="space-y-5">
      {isSample && <SampleDataNotice compact />}
      <DiscoverClient events={events} isSample={isSample} />
    </div>
  );
}
