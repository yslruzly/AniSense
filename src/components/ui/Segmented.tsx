import { haptic } from "../../lib/platform";

// ─── Segmented control ────────────────────────────────────────────────────────
// Three buttons each cross-fading their own background read as three separate
// things that happen to sit next to each other. One thumb that travels between
// them reads as a single control with a position — and the travel itself tells
// you which way you just moved, which a cross-fade cannot.
//
// The thumb is one absolutely-positioned element moved with translateX, so the
// switch costs a single composited layer moving rather than three background
// repaints. Styling lives in appStyles under `.seg`.

export function Segmented<T extends string>({
  value, options, onChange, label,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  const index = Math.max(0, options.findIndex(o => o.id === value));

  return (
    <div className="seg" role="tablist" aria-label={label}>
      <span
        className="seg-thumb"
        aria-hidden="true"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translate3d(${index * 100}%, 0, 0)`,
        }}
      />
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          className="seg-btn"
          onClick={() => { haptic.select(); onChange(o.id); }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
