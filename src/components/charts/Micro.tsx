// ─── Micro data viz ───────────────────────────────────────────────────────────
// Small marks that sit inside a stat tile. A figure in a plain box tells you a
// value; these tell you the shape it came from, which is the difference between
// a dashboard you read and one you scan.
//
// Everything here is decorative: the figure beside the mark carries the meaning,
// so all of it is aria-hidden and none of it is the only way to get the number.
// Sized in px rather than the type ramp because these are artwork, not text.

/** How many of a set are up. 20 dots for "15 of 20 crops rose today". */
export function DotRow({ total, filled, size = 7, gap = 4 }: {
  total: number; filled: number; size?: number; gap?: number;
}) {
  const cols = Math.min(total, 10);
  return (
    <span className="mv-dots" aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`mv-dot ${i < filled ? "on" : ""}`}
          style={{ width: size, height: size }} />
      ))}
    </span>
  );
}

/** A month's trend under a total. Flat line when there is nothing yet. */
export function Sparkline({ values, width = 96, height = 26, tone = "var(--tanim)" }: {
  values: number[]; width?: number; height?: number; tone?: string;
}) {
  const pts = values.length >= 2 ? values : [0, 0];
  const max = Math.max(...pts), min = Math.min(...pts);
  const span = max - min || 1;
  const x = (i: number) => (i / (pts.length - 1)) * width;
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  const line = pts.map((v, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const lastX = x(pts.length - 1), lastY = y(pts[pts.length - 1]);

  return (
    <svg className="mv-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      fill="none" aria-hidden="true" focusable="false">
      <path d={area} fill={tone} opacity=".12" />
      <path d={line} stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* The endpoint is the value you actually care about, so it gets a dot. */}
      <circle cx={lastX} cy={lastY} r="2.8" fill={tone} />
    </svg>
  );
}

/** One value against a ceiling: listings filled, share of spend. */
export function MiniBar({ value, max, tone = "var(--tanim)", height = 7 }: {
  value: number; max: number; tone?: string; height?: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <span className="mv-bar" aria-hidden="true" style={{ height }}>
      <span className="mv-bar-fill" style={{ width: `${pct}%`, background: tone }} />
    </span>
  );
}

/** A rating or completion out of a whole, read at a glance. */
export function Ring({ value, max = 5, size = 34, tone = "var(--tanim)" }: {
  value: number; max?: number; size?: number; tone?: string;
}) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="3.5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="3.5"
        strokeLinecap="round" strokeDasharray={`${(c * pct).toFixed(1)} ${c.toFixed(1)}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}
