// ─── A peso amount, typed ─────────────────────────────────────────────────────
// One field for money that changed hands: the farmer's "sold it for", the
// buyer's "paid". The ₱ sits inside it, the keyboard is the number pad with a
// point, and whatever is typed is kept to digits and two decimals, so "1,250"
// or "₱900" pasted in still reads as a number.

/** Digits and one point, at most two decimals; anything else typed is dropped. */
export function cleanPeso(s: string): string {
  let v = s.replace(/[^\d.]/g, "");
  const dot = v.indexOf(".");
  if (dot >= 0) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  return v.replace(/^0+(?=\d)/, "");
}

/** The amount typed, or NaN when there is none. */
export const pesoValue = (s: string): number => (s.trim() && s !== "." ? Number(s) : NaN);

/** A whole amount as is, else to the centavo: what the field starts with. */
export const pesoText = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export function PesoField({ id, value, onChange, bad = false, describedBy, autoFocus = false }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  bad?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={`peso-field${bad ? " bad" : ""}`}>
      <span className="peso-field-cur" aria-hidden="true">₱</span>
      <input id={id} className="peso-field-inp" type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done"
        value={value} onChange={e => onChange(cleanPeso(e.target.value))}
        aria-invalid={bad || undefined} aria-describedby={describedBy} autoFocus={autoFocus} />
    </div>
  );
}
