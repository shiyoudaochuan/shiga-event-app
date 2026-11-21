import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedEventById, currentDataSource } from "@/lib/events/repository";
import { getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/Badge";
import { SampleDataNotice } from "@/components/SampleDataNotice";
import { categoryLabel } from "@/config/categories";
import { categoryColor } from "@/config/category-colors";
import { municipalityLabel, prefectureLabel } from "@/config/municipalities";
import { languageLabel } from "@/config/languages";
import { formatDate, formatDateTimeRange, formatFee } from "@/lib/format";
import { hostnameOf, isSafeHttpUrl } from "@/lib/url";

/**
 * イベント詳細ページ（仕様 2-4）。
 *
 * セキュリティ上のポイント：
 *  - 説明文は React がそのまま文字列として描画する（HTML として解釈しない）ので、
 *    <script> を含む説明文が登録されていても実行されない。
 *  - 申込 URL・情報元 URL は isSafeHttpUrl() を通ったものだけ <a href> に出す。
 *  - 外部リンクには rel="noopener noreferrer" を付け、開いた先からこのページを操作できないようにする。
 *  - 非公開イベントは repository が null を返すので notFound() になる（DB の RLS でも返らない）。
 */

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublishedEventById(id);
  return { title: event ? event.title : getDictionary().event.notFoundTitle };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const t = getDictionary();
  const { id } = await params;
  const event = await getPublishedEventById(id);
  if (!event) notFound();
  // チラシと同じ紙色をヘッダーに使い、掲示板から来たときに「同じ紙」だと分かるようにする
  const color = categoryColor(event.category);

 const isSample = currentDataSource() === "sample";

 const registrationUrl = isSafeHttpUrl(event.registrationUrl)
  ? event.registrationUrl
  : null;

 const sourceUrl = isSafeHttpUrl(event.sourceUrl)
  ? event.sourceUrl
  : null;

  // 主催団体のWebサイトURLを取得
  const organizerUrl = isSafeHttpUrl(event.organizer?.websiteUrl)
  ? event.organizer?.websiteUrl
  : null;

  // 日本時間を基準に、イベント開催までの日数を計算する
  const DAY_MS = 24 * 60 * 60 * 1000;
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

const eventStart = new Date(event.startAt).getTime();
const now = Date.now();

const daysUntil = Number.isFinite(eventStart)
  ? Math.floor((eventStart + JST_OFFSET_MS) / DAY_MS)
    - Math.floor((now + JST_OFFSET_MS) / DAY_MS)
  : null;

  return (
    <article className="space-y-6">
      <nav aria-label="パンくず">
        <Link href="/" className="btn btn-sm">
          ← {t.common.backToList}
        </Link>
      </nav>

      {isSample && <SampleDataNotice />}

      <header className="surface space-y-3 p-6 sm:p-8" style={{ "--surface-bg": color.paper } as CSSProperties}>
        <div className="flex flex-wrap gap-2">
          {isSample && <Badge tone="warning">{t.sample.badge}</Badge>}
          <Badge>{categoryLabel(event.category)}</Badge>
          {event.participationFee === 0 && <Badge tone="success">{t.common.free}</Badge>}
        </div>
        <h1 className="text-2xl font-extrabold leading-snug sm:text-4xl">{event.title}</h1>
        {/* イベント開催までの残り日数 */}
{daysUntil !== null && (
  <div className="mt-3">

    <p className="inline-block -rotate-1 rounded-full border-[2.5px] border-ink bg-sun px-4 py-1.5 text-sm font-extrabold shadow-[3px_3px_0_var(--color-ink)]">

      {daysUntil > 0
        ? `📅 開催まであと${daysUntil}日`
        : daysUntil === 0
          ? "🎉 本日開催！"
          : "開催日を過ぎたイベントです"}

    </p>

  </div>
)}
      </header>

      {/* 申込ボタンは最初に目に入る位置に置く（スマホで最重要の行動） */}
      {registrationUrl && (
        <div className="surface p-5" style={{ "--surface-bg": "#fff3c4", "--surface-shadow": "var(--color-sun)" } as CSSProperties}>
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent w-full sm:w-auto"
          >
            {t.event.registrationButton} ↗
          </a>
          <p className="mt-2 text-sm text-ink-soft">{t.event.externalLinkNote}</p>
        </div>
      )}

      <section aria-labelledby="info-heading" className="surface p-5 sm:p-6">
        <h2 id="info-heading" className="sr-only">
          {t.event.detailHeading}
        </h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-[10rem_1fr]">
          <Row label={t.event.dateTime}>{formatDateTimeRange(event.startAt, event.endAt)}</Row>
          <Row label={t.event.area}>
            {prefectureLabel(event.prefecture)} {municipalityLabel(event.municipality)}
          </Row>
          <Row label={t.event.venue}>{event.venue}</Row>
          {event.address && <Row label={t.event.address}>{event.address}</Row>}
          {event.organizer && (
            <Row label={t.event.organizer}>
              {event.organizer.name}
              {organizerUrl && (
                <>
                  {" "}
                  <a href={organizerUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-coral decoration-2 underline-offset-4">
                    （{t.event.organizerWebsite} ↗）
                  </a>
                </>
              )}
            </Row>
          )}
          <Row label={t.event.targetAudience}>{event.targetAudience ?? "—"}</Row>
          <Row label={t.event.fee}>{formatFee(event.participationFee, event.feeNote, t.common.free)}</Row>
          <Row label={t.event.languages}>{event.supportedLanguages.map(languageLabel).join(" / ")}</Row>
          <Row label={t.event.howToApply}>{event.howToApply ?? "—"}</Row>
          <Row label={t.event.registrationDeadline}>
            {event.registrationDeadline ? formatDateTimeRange(event.registrationDeadline, null).replace(/〜$/, "") : "—"}
          </Row>
          <Row label={t.event.registrationUrl}>
            {registrationUrl ? (
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="break-all font-bold underline decoration-coral decoration-2 underline-offset-4">
                {registrationUrl}
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label={t.event.sourceUrl}>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-coral decoration-2 underline-offset-4">
                {hostnameOf(sourceUrl)} ↗
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label={t.event.lastVerified}>{event.lastVerifiedAt ? formatDate(event.lastVerifiedAt) : "—"}</Row>
        </dl>
      </section>

      <section aria-labelledby="desc-heading" className="surface p-5 sm:p-6">
        <h2 id="desc-heading" className="text-lg font-extrabold">
          {t.event.description}
        </h2>
        {/* whitespace-pre-line で改行を保持。HTML としては解釈しない */}
        <p className="mt-3 whitespace-pre-line">{event.description}</p>
      </section>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-extrabold text-ink-soft">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </>
  );
}
