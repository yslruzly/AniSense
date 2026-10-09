import { useState } from "react";

// ─── Kilos, typed ─────────────────────────────────────────────────────────────
// The number between a stepper's − and +: tap it and type, for the buyer who
// wants 25 kg and would otherwise press + twenty-four times. It looks like a
// small field (a white well with a ring, green when it is being typed in),
// so it reads as something to tap. The number pad comes up, and the number
// already there is selected, so the first digit replaces it.
//
// Whole kilos, 1 up to what the seller has. Each digit takes effect as it is
// typed, so the line's total keeps up; more than the seller has becomes what
// they have, at once, and the screen's "That's all the seller has" says why.
// An empty box (or a 0) changes nothing, and is put back when the field is
// left. Done on the keyboard closes it.

export function QtyField({ value, max, onChange, label }: {
  value: number;
  max: number;
  onChange: (kg: number) => void;
  /** What the field asks, for a screen reader: "How many kilos?" */
  label: string;
}) {
  // What is being typed, while the field is in use; the value otherwise.
  const [draft, setDraft] = useState<string | null>(null);
  const digits = String(Math.max(1, max)).length;

  const type = (raw: string) => {
    const typed = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, digits);
    const n = Number(typed);
    if (!typed) { setDraft(""); return; }
    if (n > max) { setDraft(String(max)); onChange(max); return; }
    setDraft(typed);
    onChange(n);
  };

  return (
    <label className="qty-step-val qty-field">
      <input type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" enterKeyHint="done"
        className="qty-field-inp" aria-label={label}
        style={{ width: `${Math.max(2, digits) + 0.4}ch` }}
        value={draft ?? String(value)}
        onFocus={e => { const el = e.currentTarget; setDraft(String(value)); requestAnimationFrame(() => el.select()); }}
        onChange={e => type(e.target.value)}
        onBlur={() => setDraft(null)}
        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      <small aria-hidden="true">kg</small>
    </label>
  );
}
