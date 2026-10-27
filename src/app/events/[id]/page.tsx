import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedEventById, currentDataSource } from "@/lib/events/repository";
import { getDictionary } from "@/lib/i18n";
import { Badge } from "@/components/Badge";
import { SampleDataNotice } from "@/components/SampleDataNotice";
import { categoryLabel } from "@/config/categories";
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

  const isSample = currentDataSource() === "sample";
  const registrationUrl = isSafeHttpUrl(event.registrationUrl) ? event.registrationUrl : null;
  const sourceUrl = isSafeHttpUrl(event.sourceUrl) ? event.sourceUrl : null;
  const organizerUrl = isSafeHttpUrl(event.organizer?.websiteUrl) ? event.organizer?.websiteUrl : null;

  return (
    <article className="space-y-6">
      <nav aria-label="パンくず">
        <Link href="/" className="inline-flex min-h-11 items-center text-brand-800 underline">
          ← {t.common.backToList}
        </Link>
      </nav>

      {isSample && <SampleDataNotice />}

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {isSample && <Badge tone="warning">{t.sample.badge}</Badge>}
          <Badge tone="brand">{categoryLabel(event.category)}</Badge>
          {event.participationFee === 0 && <Badge tone="success">{t.common.free}</Badge>}
        </div>
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{event.title}</h1>
      </header>

      {/* 申込ボタンは最初に目に入る位置に置く（スマホで最重要の行動） */}
      {registrationUrl && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand-600 px-6 text-base font-bold text-white hover:bg-brand-700 sm:w-auto"
          >
            {t.event.registrationButton} ↗
          </a>
          <p className="mt-2 text-sm text-slate-600">{t.event.externalLinkNote}</p>
        </div>
      )}

      <section aria-labelledby="info-heading" className="rounded-xl border border-slate-200 bg-white p-5">
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
                  <a href={organizerUrl} target="_blank" rel="noopener noreferrer" className="text-brand-800 underline">
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
              <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="break-all text-brand-800 underline">
                {registrationUrl}
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label={t.event.sourceUrl}>
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-800 underline">
                {hostnameOf(sourceUrl)} ↗
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label={t.event.lastVerified}>{event.lastVerifiedAt ? formatDate(event.lastVerifiedAt) : "—"}</Row>
        </dl>
      </section>

      <section aria-labelledby="desc-heading" className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 id="desc-heading" className="text-lg font-bold">
          {t.event.description}
        </h2>
        {/* whitespace-pre-line で改行を保持。HTML としては解釈しない */}
        <p className="mt-3 whitespace-pre-line text-slate-800">{event.description}</p>
      </section>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </>
  );
}
