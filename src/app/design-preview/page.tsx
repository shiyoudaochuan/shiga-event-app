import Link from "next/link";

export const metadata = { title: "デザイン比較プレビュー" };

const DESIGNS = [
  {
    href: "/design-preview/a",
    key: "A",
    name: "Premium Glassmorphism",
    nick: "Lakeglass — 夜明け前の琵琶湖",
    font: "Zen Kaku Gothic New ＋ Instrument Serif Italic",
    swatches: ["#070e1c", "#142546", "#5eead4", "#a597ff", "#ffc66d"],
    point: "深い藍の背景にオーロラの光。掲示板をガラスケースに収め、ガラスの操作パネルを重ねて奥行きを出す。",
  },
  {
    href: "/design-preview/b",
    key: "B",
    name: "Editorial Bulletin Board",
    nick: "The Shiga Bulletin — 地域新聞の一面",
    font: "しっぽり明朝 B1 ＋ Archivo（可変幅・圧縮体）",
    swatches: ["#f3eee3", "#171513", "#c8372a", "#1d3557", "#c4a273"],
    point: "明朝の大見出し、圧縮体の大きな日付、罫線と目次。チラシは3種類の型で組み、単調な羅列を避ける。",
  },
  {
    href: "/design-preview/c",
    key: "C",
    name: "Playful Community",
    nick: "Tsunagaru Park — 色とりどりの公民館",
    font: "M PLUS Rounded 1c ＋ Fredoka",
    swatches: ["#fff7e8", "#2a2140", "#ffc93c", "#ff6f59", "#2ec4a6", "#4f8ff7"],
    point: "太い輪郭線とずらした影のソフトな立体。多言語のあいさつシール、色とりどりの画鋲、弾む操作感。",
  },
];

/** 3 案の入口。本番の画面には影響しない比較用ページ */
export default function DesignPreviewIndex() {
  return (
    <div className="min-h-full bg-neutral-100 px-4 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Design comparison</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">しが つながるイベント — 3つのデザイン案</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          トップページ（掲示板・発見モードの入口・各ページへの導線）を、3つの方向性で描き分けました。
          表示データは本番と同じ取得処理を使っています。リンク先は既存の本番ページです。
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {DESIGNS.map((d) => (
            <li key={d.key}>
              <Link href={d.href} className="group block h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="text-5xl font-black text-neutral-300 transition group-hover:text-neutral-900">{d.key}</span>
                <span className="mt-2 block text-lg font-black">{d.name}</span>
                <span className="block text-sm text-neutral-500">{d.nick}</span>
                <span className="mt-4 flex gap-1.5" aria-hidden="true">
                  {d.swatches.map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                  ))}
                </span>
                <span className="mt-4 block text-sm leading-relaxed text-neutral-700">{d.point}</span>
                <span className="mt-3 block text-xs text-neutral-500">書体：{d.font}</span>
                <span className="mt-5 inline-block text-sm font-bold">プレビューを開く →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
