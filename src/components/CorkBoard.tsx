import type { ReactNode } from "react";

/**
 * コルクボード（木枠つき）。
 *
 * 掲示板の「枠」はこのコンポーネントだけが持つ。
 * EventList / EventCard には枠を付けないことで、以前の「二重枠」問題を防いでいる。
 */
export function CorkBoard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="cork-board" role={label ? "region" : undefined} aria-label={label}>
      {children}
    </div>
  );
}
