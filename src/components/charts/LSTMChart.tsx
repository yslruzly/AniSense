import { LSTMPoint } from "../../types";

// ─── LSTM Forecast Chart ──────────────────────────────────────────────────────
export function LSTMChart({ series }: { series: LSTMPoint[] }) {
  const W = 300, H = 110, P = { t: 8, r: 8, b: 18, l: 30 };
  const prices = series.map(d => d.predicted);
  const lowers = series.map(d => d.lower);
  const uppers = series.map(d => d.upper);
  const minV = Math.min(...lowers) - 2;
  const maxV = Math.max(...uppers) + 2;
  const n = series.length;
  const x = (i: number) => P.l + (i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + ((maxV - v) / (maxV - minV)) * (H - P.t - P.b);
  const nowIdx = series.findIndex(d => d.day === "Now");

  // Confidence band path
  const bandPath = [
    ...series.slice(nowIdx).map((d, i) => `${i === 0 ? "M" : "L"} ${x(nowIdx + i)} ${y(d.upper)}`),
    ...series.slice(nowIdx).map((d, i) => `L ${x(nowIdx + series.slice(nowIdx).length - 1 - i)} ${y(series.slice(nowIdx)[series.slice(nowIdx).length - 1 - i].lower)}`),
    "Z"
  ].join(" ");

  // Actual line (past)
  const actualPath = series
    .filter(d => d.actual !== null)
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.actual!)}`)
    .join(" ");

  // Full predicted line
  const predPath = series.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.predicted)}`).join(" ");

  // Y ticks
  const range = maxV - minV;
  const step = range > 20 ? 10 : 5;
  const firstTick = Math.ceil(minV / step) * step;
  const ticks: number[] = [];
  for (let t = firstTick; t <= maxV; t += step) ticks.push(t);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {/* Y grid */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={P.l} y1={y(t)} x2={W - P.r} y2={y(t)} stroke="var(--paper-alt)" strokeWidth="1" />
          <text x={P.l - 3} y={y(t) + 3} fontSize="8.5" fill="var(--text-faint)" textAnchor="end">{t}</text>
        </g>
      ))}

      {/* Vertical "Now" divider */}
      <line x1={x(nowIdx)} y1={P.t} x2={x(nowIdx)} y2={H - P.b} stroke="var(--palay)" strokeWidth="1" strokeDasharray="3 2" />
      <text x={x(nowIdx)} y={P.t - 1} fontSize="8" fill="var(--ink-2)" textAnchor="middle">NOW</text>

      {/* Confidence band (future only) */}
      <path d={bandPath} fill="var(--tanim-sk)" opacity="0.6" />

      {/* Predicted line (full, dashed for future) */}
      <path d={predPath.split("L").slice(0, nowIdx + 1).join("L")} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={"M" + predPath.split("L").slice(nowIdx).join("L")} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Actual line */}
      <path d={actualPath} fill="none" stroke="var(--tanim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots for actual */}
      {series.filter(d => d.actual !== null).map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.actual!)} r="2.5" fill="var(--tanim)" />
      ))}

      {/* X labels: show select labels */}
      {series.map((d, i) => {
        if (!["D-6", "D-3", "Now", "+3", "+7"].includes(d.day)) return null;
        return <text key={d.day} x={x(i)} y={H - 3} fontSize="8.5" fill={d.day === "Now" ? "var(--ink-2)" : "var(--text-faint)"} textAnchor="middle" fontWeight={d.day === "Now" ? "700" : "400"}>{d.day}</text>;
      })}
    </svg>
  );
}
