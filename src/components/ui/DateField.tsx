import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";

// ─── Date field ───────────────────────────────────────────────────────────────
// Replaces <input type="date">, whose browser picker shows "12/01/2025" (is
// that 12 January or 1 December?), has 30px days and up/down month arrows.
//
// Most expenses are logged the day they happen or the day after, so those two
// are one tap each. Anything else opens a calendar inline, in the form, with
// big days; picking one closes it again. The chosen date is always spelled
// out in full underneath, so there's nothing to decode.

/** Today as YYYY-MM-DD in local time. toISOString() is UTC, which in the
 *  Philippines (UTC+8) turns anything before 8 AM into yesterday. */
export function localISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const parse = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function DateField({ value, onChange, allowFuture = false }: { value: string; onChange: (iso: string) => void; allowFuture?: boolean }) {
  const { t, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const todayISO = localISO();
  const yesterdayISO = localISO(addDays(new Date(), -1));
  const selected = value ? parse(value) : new Date();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  // Which way the month grid should slide in: from the side of the arrow.
  const [dir, setDir] = useState<"prev" | "next" | null>(null);

  const isOther = value !== todayISO && value !== yesterdayISO;
  const now = new Date();
  const atLatestMonth = !allowFuture && view.getFullYear() === now.getFullYear() && view.getMonth() === now.getMonth();

  const pick = (iso: string) => { haptic.select(); onChange(iso); setOpen(false); };
  const toggleCalendar = () => {
    haptic.select();
    if (!open) { setView(new Date(selected.getFullYear(), selected.getMonth(), 1)); setDir(null); }
    setOpen(o => !o);
  };
  const step = (n: number) => {
    setDir(n < 0 ? "prev" : "next");
    setView(v => new Date(v.getFullYear(), v.getMonth() + n, 1));
  };

  // Monday-first weeks feel foreign here; PH calendars start on Sunday.
  const firstDow = view.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: "short" }));

  return (
    <div className="df">
      <div className="df-chips" role="radiogroup" aria-label={t("exp_date")}>
        <button type="button" role="radio" aria-checked={value === todayISO}
          className={`df-chip ${value === todayISO ? "on" : ""}`} onClick={() => pick(todayISO)}>
          {t("date_today")}
        </button>
        <button type="button" role="radio" aria-checked={value === yesterdayISO}
          className={`df-chip ${value === yesterdayISO ? "on" : ""}`} onClick={() => pick(yesterdayISO)}>
          {t("date_yesterday")}
        </button>
        <button type="button" role="radio" aria-checked={isOther} aria-expanded={open}
          className={`df-chip ${isOther ? "on" : ""} ${open ? "open" : ""}`} onClick={toggleCalendar}>
          <CalendarDays size={17} strokeWidth={2.2} />
          {isOther ? selected.toLocaleDateString(locale, { month: "short", day: "numeric" }) : t("date_other")}
        </button>
      </div>

      {/* Spelled out, weekday included, so "12/01" is never a question. */}
      <p className="df-full" aria-live="polite">
        {selected.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className={`df-acc ${open ? "open" : ""}`} {...(open ? {} : { inert: "" })}>
        <div className="df-acc-in">
          <div className="df-cal">
            <div className="df-head">
              <button type="button" className="df-nav" onClick={() => step(-1)} aria-label={t("date_prev_month")}>
                <ChevronLeft size={22} strokeWidth={2.4} />
              </button>
              <div className="df-title" aria-live="polite">
                {view.toLocaleDateString(locale, { month: "long", year: "numeric" })}
              </div>
              <button type="button" className="df-nav" onClick={() => step(1)} disabled={atLatestMonth} aria-label={t("date_next_month")}>
                <ChevronRight size={22} strokeWidth={2.4} />
              </button>
            </div>
            <div className="df-week" aria-hidden="true">
              {weekdays.map((w, i) => <span key={i}>{w}</span>)}
            </div>
            {/* Keyed on the month so the new grid slides in from the side
                of the arrow that was tapped. */}
            <div className={`df-grid ${dir ? `from-${dir}` : ""}`} key={`${view.getFullYear()}-${view.getMonth()}`} role="grid">
              {cells.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const iso = localISO(d);
                const future = !allowFuture && iso > todayISO;
                return (
                  <button
                    type="button" key={iso}
                    className={`df-day ${iso === value ? "on" : ""} ${iso === todayISO ? "today" : ""}`}
                    disabled={future}
                    aria-pressed={iso === value}
                    aria-label={d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    onClick={() => pick(iso)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
