import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { Sheet } from "./Sheet";

// ─── Picker field ─────────────────────────────────────────────────────────────
// Replaces <select> for long lists. A native select on a phone is a stack of
// system-sized rows with no search: fine for four options, unusable for the 89
// barangays of Cabanatuan City, and the browser's desktop version is worse —
// a tall, thin list of 14px rows.
//
// This is a full-height sheet instead: a search box, rows at 60px with the
// name at 17px, and a tick on the one already chosen. Nothing is hidden
// behind a scroll the user has to guess at, and every target is thumb-sized.

/** A plain string is its own label; an object separates the two, for lists
 *  whose values are ids ("price-asc") rather than words. */
export type PickerOption = string | { value: string; label: string };

export function PickerField({ value, options, placeholder, title, onChange, disabled, disabledHint, searchPlaceholder, variant = "field", icon }: {
  value: string;
  options: PickerOption[];
  placeholder: string;
  title: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledHint?: string;
  searchPlaceholder?: string;
  /** "field" fills the form row; "pill" is the compact one for a toolbar. */
  variant?: "field" | "pill";
  icon?: React.ReactNode;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const items = options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  const current = items.find(o => o.value === value);

  // Long lists get a search box. A short one doesn't need it, and an empty
  // search box above four options only asks for typing that isn't required.
  const searchable = items.length > 10;
  const q = query.trim().toLowerCase();
  const shown = q ? items.filter(o => o.label.toLowerCase().includes(q)) : items;

  // Open on what's already chosen, rather than at the top of the alphabet.
  useEffect(() => {
    if (!open) { setQuery(""); return; }
    const id = window.setTimeout(() => {
      listRef.current?.querySelector<HTMLElement>('[data-on="true"]')?.scrollIntoView({ block: "center" });
    }, 60);
    return () => window.clearTimeout(id);
  }, [open]);

  const choose = (option: string) => { haptic.select(); onChange(option); setOpen(false); };

  return (
    <>
      <button
        type="button"
        className={`${variant === "pill" ? "pick-pill" : "pick-field"} ${value ? "has" : ""}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-label={variant === "pill" ? `${title}: ${current?.label ?? placeholder}` : undefined}
        onClick={() => { if (!disabled) { haptic.select(); setOpen(true); } }}
      >
        {icon}
        <span className="pick-field-val">{current?.label ?? (disabled ? disabledHint ?? placeholder : placeholder)}</span>
        <ChevronDown size={variant === "pill" ? 18 : 22} strokeWidth={2.4} className="pick-field-arrow" aria-hidden="true" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} className="pick-sheet" label={title}>
        <div className="pick-head">
          <div className="pick-title">{title}</div>
          <button type="button" className="pick-close" onClick={() => setOpen(false)} aria-label={t("close")}>
            <X size={22} color="#fff" strokeWidth={2.4} />
          </button>
        </div>

        {searchable && (
          // Not auto-focused on purpose: the keyboard would cover the list
          // before anyone has seen it, and most people here will scroll.
          <div className="pick-search">
            <Search size={20} color="var(--text-faint)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder ?? t("pick_search")}
              enterKeyHint="search"
              aria-label={searchPlaceholder ?? t("pick_search")}
            />
            {query && (
              <button type="button" className="pick-clear" onClick={() => setQuery("")} aria-label={t("state_clear_search")}>
                <X size={16} strokeWidth={2.6} />
              </button>
            )}
          </div>
        )}

        <div className="pick-list" role="listbox" ref={listRef}>
          {shown.map(option => {
            const on = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={on}
                data-on={on}
                className={`pick-row ${on ? "on" : ""}`}
                onClick={() => choose(option.value)}
              >
                <span>{option.label}</span>
                {on && <Check size={22} strokeWidth={2.8} aria-hidden="true" />}
              </button>
            );
          })}
          {shown.length === 0 && <p className="pick-none">{t("pick_none").replace("{q}", query)}</p>}
        </div>
      </Sheet>
    </>
  );
}
