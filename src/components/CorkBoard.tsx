import type { ReactNode } from "react";

/**
 * 掲示板（太枠つきのコルクボード）。
 *
 * 掲示板の「枠」はこのコンポーネントだけが持つ。
 * EventList / EventCard には外枠を付けないことで、以前の「二重枠」問題を防いでいる。
 */
export function CorkBoard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="board" role={label ? "region" : undefined} aria-label={label}>
      {children}
    </div>
  );
}
