import type { ReactNode } from "react";
import { Megaphone, CheckCircle, AlertTriangle, CloudSun, ChevronRight } from "lucide-react";
import { useLang } from "../../i18n";
import { WeatherDay, localDate, whenSaid } from "../../services/weather";

// ─── Today's Advisory (farmer Home) ───────────────────────────────────────────
// A bulletin, set out the way a notice board is: a deep-blue head that says
// what it is and for which day, then the notices, the one that needs doing
// first at the top. A warning (rain coming,
// so harvest and cover now) is warm gold with its day named; good news
// (conditions to plant) is green. Each says what kind it is in a word above
// it, so the eye sorts them before reading. The last row goes to the full
// forecast, the place to check before acting on it.

type Notice = { tone: "warn" | "good"; ico: ReactNode; kind: string; title: string; sub: string };

export function TodaysAdvisory({ wet, onWeather }: { wet?: WeatherDay; onWeather: () => void }) {
  const { t, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const now = new Date();
  const notices: Notice[] = [
    // Only when the forecast has rain coming, and which day; it leads, since
    // it is the one with a deadline.
    ...(wet ? [{
      tone: "warn" as const, ico: <AlertTriangle size={22} strokeWidth={2.3} />, kind: t("home_adv_kind_rain"),
      title: t("home_adv_rain").replace("{when}", whenSaid(wet.date, now, t, locale)), sub: t("home_adv_rain_sub"),
    }] : []),
    {
      tone: "good", ico: <CheckCircle size={22} strokeWidth={2.3} />, kind: t("home_adv_kind_planting"),
      title: t("home_adv_planting"), sub: t("home_adv_planting_sub"),
    },
  ];

  return (
    <section className="tadv" aria-labelledby="tadv-t">
      <div className="tadv-head">
        <span className="tadv-disc" aria-hidden="true"><Megaphone size={21} strokeWidth={2.3} /></span>
        <div className="tadv-head-txt">
          <h2 className="tadv-t" id="tadv-t">{t("home_advisory")}</h2>
        </div>
        <time className="tadv-date" dateTime={localDate(now)}>
          {now.toLocaleDateString(locale, { month: "short", day: "numeric" })}
        </time>
      </div>

      <ul className="tadv-list">
        {notices.map(n => (
          <li key={n.kind} className={`tadv-row ${n.tone}`}>
            <span className="tadv-ico" aria-hidden="true">{n.ico}</span>
            <span className="tadv-txt">
              <span className="tadv-kind">{n.kind}</span>
              <span className="tadv-row-t">{n.title}</span>
              <span className="tadv-row-s">{n.sub}</span>
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="tadv-more" onClick={onWeather}>
        <CloudSun size={20} strokeWidth={2.3} aria-hidden="true" />
        <span>{t("home_adv_more")}</span>
        <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </section>
  );
}
