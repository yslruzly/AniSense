import { useLang } from "../../i18n";
import { PricePoint } from "../../types";

// ─── Price Chart ──────────────────────────────────────────────────────────────
export function PriceChart({ data }: { data: PricePoint[] }) {
  const { tn } = useLang();
  const W = 300, H = 110, P = { t: 8, r: 8, b: 18, l: 26 };
  const all = data.flatMap(d => [d.rice, d.corn, d.vegetables]);
  const min = Math.min(...all) - 4, max = Math.max(...all) + 4;
  const x = (i: number) => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + ((max - v) / (max - min)) * (H - P.t - P.b);
  const path = (k: keyof Omit<PricePoint, "day">) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[k])}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        {[30, 45, 60].map(t => (
          <g key={t}>
            <line x1={P.l} y1={y(t)} x2={W - P.r} y2={y(t)} stroke="#e9e0d2" strokeWidth="1" strokeDasharray="4 4" />
            <text x={P.l - 3} y={y(t) + 3} fontSize="9" fill="#aa9d8a" textAnchor="end">{t}</text>
          </g>
        ))}
        <path d={path("rice")} fill="none" stroke="#2f9e63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path("corn")} fill="none" stroke="#d19b27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path("vegetables")} fill="none" stroke="#5c86b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <text key={d.day} x={x(i)} y={H - 3} fontSize="9" fill="#aa9d8a" textAnchor="middle">{d.day}</text>
        ))}
      </svg>
      <div className="legend">
        {[["#2f9e63", "Rice"], ["#d19b27", "Corn"], ["#5c86b8", "Vegetables"]].map(([c, l]) => (
          <span key={l} className="leg-item"><span className="leg-dot" style={{ background: c }} /> {tn(l)}</span>
        ))}
      </div>
    </div>
  );
}
