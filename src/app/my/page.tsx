import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/events/repository";
import { MyBoardClient } from "@/components/my/MyBoardClient";
import { SampleDataNotice } from "@/components/SampleDataNotice";

export const metadata: Metadata = {
  title: "マイ掲示板",
  description: "保存したイベント・参加予定のイベント・おすすめのイベントをまとめて見られます。",
};

export const dynamic = "force-dynamic";

export default async function MyBoardPage() {
  const { events, source } = await getUpcomingEvents();
  const isSample = source === "sample";

  return (
    <div className="space-y-5">
      {isSample && <SampleDataNotice compact />}
      <MyBoardClient events={events} isSample={isSample} />
    </div>
  );
}
