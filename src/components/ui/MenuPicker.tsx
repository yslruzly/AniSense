import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { haptic } from "../../lib/platform";

// ─── Menu picker ──────────────────────────────────────────────────────────────
// A short list of choices that drops out of its own button: four sort orders,
// not eighty-nine barangays. A full-height sheet is the right answer for a
// long list you have to search; for four options it is a lot of machinery
// between a tap and an answer.
//
// Deliberately plain: a button, a list under it, and it closes on a choice, a
// tap outside, or Escape.

export type MenuOption = { value: string; label: string };

export function MenuPicker({ value, options, onChange, icon, label }: {
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="menu-pick" ref={wrap}>
      <button
        type="button"
        className="pick-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => { haptic.select(); setOpen(o => !o); }}
      >
        {icon}
        <span className="pick-field-val">{current.label}</span>
        <ChevronDown size={18} strokeWidth={2.4} className="pick-field-arrow" aria-hidden="true" />
      </button>

      {open && (
        // Scales out of its own top-right corner, where the button is: a menu
        // should look like it came from the thing that opened it.
        <div className="menu-pop" role="menu" aria-label={label}>
          {options.map(o => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className={`menu-row ${on ? "on" : ""}`}
                onClick={() => { haptic.select(); onChange(o.value); setOpen(false); }}
              >
                <span>{o.label}</span>
                {on && <Check size={18} strokeWidth={2.8} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
