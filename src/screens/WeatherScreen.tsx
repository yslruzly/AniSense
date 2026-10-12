import { useEffect, useState } from "react";
import {
  CloudSun, CloudOff, MapPin, Sprout, Droplets, Sun, Cloud, Moon, Zap,
  ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Truck, RotateCw,
} from "lucide-react";
import { useLang } from "../i18n";
import { WxIcon } from "../types";
import { Hdr } from "../components/layout/Hdr";
import { WeatherIcon } from "../components/icons";
import { useIsNight } from "../hooks/useIsNight";
import { UserRole } from "../types";
import { useWeather } from "../store/weather";
import { hoursFrom, daysFrom, isWetDay, whenSaid, WeatherDay } from "../services/weather";
import { Skeleton } from "../components/states";

// ─── Weather ──────────────────────────────────────────────────────────────────
// The forecast is Open-Meteo's (services/weather.ts), for the farmer's own
// town, or for a buyer, Nueva Ecija.
//
// Read top to bottom the way the question is asked: what is it like now,
// what is the rest of today doing, how does the week go, and what does that
// mean for me — the field for a farmer, the trip to collect for a buyer.
//
// Kept deliberately plain: one number big, everything else small and quiet,
// no boxes inside boxes. The two cards at the foot carry the colour.
//
// Motion (a page opened a few times a day, so an entrance, never a delay):
//   · the sky drifts, slowly, so the picture reads as weather, not a logo
//   · the temperature settles in from a soft blur, the one number that matters
//   · the cards under the hero cascade in (the app's shared stagger)
// All of it plays once per visit; coming back, the page is simply there.

const RAINY: WxIcon[] = ["LightRain", "Rainy", "Stormy"];
/** The UV index in words, on the WHO's scale. */
const uvWord = (uv: number) =>
  uv <= 2 ? "wx_uv_low" : uv <= 5 ? "wx_uv_moderate" : uv <= 7 ? "wx_uv_high" : uv <= 10 ? "wx_uv_very_high" : "wx_uv_extreme";
const isNightHour = (h: number) => h >= 18 || h < 6;

/** The sky in the hero, drawn from layers so each can move on its own. */
function SkyArt({ icon, night }: { icon: WxIcon; night: boolean }) {
  const celestial = icon === "Sunny" || icon === "PartlyCloudy";
  const cloudy = icon !== "Sunny";
  const rain = RAINY.includes(icon);
  return (
    <div className={`wx-art ${celestial ? "has-sky" : ""} ${cloudy ? "has-cloud" : ""}`} aria-hidden="true">
      {celestial && (night
        ? <Moon className="wx-moon" size={58} strokeWidth={1.5} color="#F6EDC9" fill="#F3E6B5" />
        : <Sun className="wx-sun" size={64} strokeWidth={1.6} color="#FFD76E" fill="#FFC23D" />)}
      {icon === "Cloudy" && <Cloud className="wx-cloud back" size={62} strokeWidth={1.3} color="rgba(255,255,255,.7)" fill="rgba(226,233,238,.78)" />}
      {cloudy && <Cloud className="wx-cloud" size={84} strokeWidth={1.3} color="rgba(255,255,255,.96)" fill="rgba(255,255,255,.93)" />}
      {icon === "Stormy" && <Zap className="wx-bolt" size={30} strokeWidth={1.6} color="#FFE08A" fill="#FFD14A" />}
      {rain && (
        <span className="wx-rain">
          <i /><i /><i /><i />
        </span>
      )}
    </div>
  );
}

export function WeatherScreen({ onBack, userRole }: { onProfile: () => void; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  // A buyer opens this to know whether the drive out to collect will be wet.
  // Planting windows, spraying and fungal disease are not their business, so
  // the farm blocks come off for them and a pick-up day takes their place.
  const isBuyer = userRole === "buyer";
  const isNight = useIsNight();
  const wx = useWeather();
  const w = wx.data;

  // The clock on the hero, kept current while the page is open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const clock = now.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

  const cond = (icon: WxIcon, night: boolean) =>
    night && icon === "Sunny" ? t("wx_cond_clear_night") : t(`wx_cond_${icon}`);

  // From the clock, not from when it was fetched: a forecast saved this
  // morning still starts at this hour, and at today.
  const hours = w ? hoursFrom(w, now, 8) : [];
  const days = w ? daysFrom(w, now, 5) : [];
  const today = days[0];
  const dayName = (d: WeatherDay, long = false) => {
    if (d.date === today?.date) return t("date_today");
    const [y, m, dd] = d.date.split("-").map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString(locale, { weekday: long ? "long" : "short" });
  };

  // The longest run of dry days, for the farmer's fieldwork window; the first
  // dry day, for the buyer's trip. Dry: rain less likely than not.
  let bestStart: number | null = null, bestEnd: number | null = null, curStart: number | null = null;
  days.forEach((f, i) => {
    if (!isWetDay(f)) {
      if (curStart === null) curStart = i;
      if (bestStart === null || (i - curStart) > (bestEnd! - bestStart)) { bestStart = curStart; bestEnd = i; }
    } else {
      curStart = null;
    }
  });
  const bestWindow = bestStart !== null
    ? (bestStart === bestEnd ? dayName(days[bestStart]) : `${dayName(days[bestStart])}–${dayName(days[bestEnd!])}`)
    : null;
  const rainDay = days.find(isWetDay);
  const dryDay = days.find(f => !isWetDay(f));

  const stats = w && today ? [
    { val: `${w.now.humidity}%`, lbl: t("wx_humidity") },
    { val: `${w.now.wind}`, unit: "km/h", lbl: t("wx_wind") },
    { val: `${today.rain}%`, lbl: t("wx_rain_chance") },
    { val: `${today.uv}`, unit: t(uvWord(today.uv)), lbl: t("wx_uv") },
  ] : [];
  // A saved forecast says when it is from, so an old reading is never taken
  // for this minute's.
  const savedAt = wx.fromCache && wx.updatedAt
    ? t("wx_saved_at").replace("{time}", new Date(wx.updatedAt).toLocaleString(locale, { weekday: "short", hour: "numeric", minute: "2-digit" }))
    : "";

  return (
    <div className="screen">
      <Hdr icon={<CloudSun size={20} color="var(--tanim)" />} title={t("wx_title")} sub={t(isBuyer ? "wx_sub_buyer" : "wx_sub")} onBack={onBack} />
      <div className="scroll screen-enter">

        {/* 1 ── Now. The same field by day and by night; both pictures stay
            mounted and crossfade, so the 6 PM switch dissolves. */}
        <section className="wx-hero" data-time={isNight ? "night" : "day"} aria-busy={!w && wx.status === "loading"}
          aria-label={w ? `${w.now.temp}°, ${cond(w.now.icon, isNight)}, ${w.place}` : t("wx_title")}>
          <span className="wx-bg wx-bg-day" aria-hidden="true" />
          <span className="wx-bg wx-bg-night" aria-hidden="true" />

          <div className="wx-place">
            <MapPin size={14} strokeWidth={2.4} aria-hidden="true" /> {w ? w.place : isBuyer ? "Nueva Ecija" : "…"} · {clock}
          </div>
          {savedAt && <div className="wx-saved"><CloudOff size={14} strokeWidth={2.4} aria-hidden="true" /> {savedAt}</div>}

          {w && today ? (
            <>
              <div className="wx-main">
                <div className="wx-read">
                  <div className="wx-temp">{w.now.temp}<span className="wx-deg">°</span></div>
                  <div className="wx-cond">{cond(w.now.icon, isNight)}</div>
                  <div className="wx-range">
                    <span><ArrowUp size={14} strokeWidth={2.6} aria-label={t("wx_high")} />{today.high}°</span>
                    <span><ArrowDown size={14} strokeWidth={2.6} aria-label={t("wx_low")} />{today.low}°</span>
                    <span className="wx-feels">{t("wx_feels").replace("{temp}", String(w.now.feels))}</span>
                  </div>
                </div>
                <SkyArt icon={w.now.icon} night={isNight} />
              </div>

              {/* The four readings in one quiet row: value over label, a hairline
                  above, nothing boxed. */}
              <div className="wx-stats">
                {stats.map(st => (
                  <div className="wx-stat" key={st.lbl}>
                    <span className="wx-stat-v">{st.val}{st.unit && <small> {st.unit}</small>}</span>
                    <span className="wx-stat-l">{st.lbl}</span>
                  </div>
                ))}
              </div>
            </>
          ) : wx.status === "failed" ? (
            // Never fetched, and none to be had now: say so, and the one thing to do.
            <div className="wx-none" role="status">
              <CloudOff size={30} strokeWidth={2} aria-hidden="true" />
              <div className="wx-none-t">{t("wx_none_t")}</div>
              <div className="wx-none-s">{t("wx_none_s")}</div>
              <button type="button" className="wx-retry" onClick={wx.retry}>
                <RotateCw size={17} strokeWidth={2.4} aria-hidden="true" /> {t("state_retry")}
              </button>
            </div>
          ) : (
            // On its way: the reading in outline, its own size, so nothing jumps.
            <div className="wx-main" role="status">
              <span className="sr-only">{t("wx_loading")}</span>
              <div className="wx-read">
                <Skeleton className="on-ink" w={118} h={64} radius={14} />
                <Skeleton className="on-ink" w={140} h={18} style={{ marginTop: 10 }} />
                <Skeleton className="on-ink" w={96} h={14} style={{ marginTop: 10 }} />
              </div>
            </div>
          )}
        </section>

        {w && today && (
          <div className="wx-stack stagger-list">
            {/* 2 ── The rest of today: time, sky, temperature, and the chance
                of rain where there is one worth knowing. */}
            <section className="wx-card" aria-labelledby="wx-hours-t">
              <h2 className="wx-card-t" id="wx-hours-t">{t("wx_next_hours")}</h2>
              <div className="wx-hours">
                {hours.map((h, i) => {
                  const at = new Date(h.time);
                  const label = i === 0 ? t("wx_now") : at.toLocaleTimeString(locale, { hour: "numeric" });
                  return (
                    <div className={`wx-hr ${i === 0 ? "now" : ""}`} key={h.time}>
                      <span className="wx-hr-t">{label}</span>
                      <WeatherIcon icon={h.icon} size={24} night={isNightHour(at.getHours())} />
                      <span className="wx-hr-temp">{h.temp}°</span>
                      <span className="wx-hr-r">{h.rain >= 20 ? `${h.rain}%` : ""}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3 ── The week: day, sky, what it will be like and how likely
                rain is, high then low. */}
            <section className="wx-card" aria-labelledby="wx-week-t">
              <h2 className="wx-card-t" id="wx-week-t">{t("wx_forecast")}</h2>
              <div className="wx-days">
                {days.map(f => (
                  <div className="wx-day" key={f.date}>
                    <span className="wx-day-n">{dayName(f)}</span>
                    <WeatherIcon icon={f.icon} size={22} />
                    <span className="wx-day-c">
                      <span className="wx-day-cn">{cond(f.icon, false)}</span>
                      {f.rain >= 20 && (
                        <span className={`wx-day-r${isWetDay(f) ? " wet" : ""}`}>
                          <Droplets size={12} strokeWidth={2.4} aria-hidden="true" /> {t("wx_rain_pct").replace("{n}", String(f.rain))}
                        </span>
                      )}
                    </span>
                    <span className="wx-day-t"><b>{f.high}°</b> {f.low}°</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4 ── What it means for you. */}
            {isBuyer ? (
              dryDay && (
                <section className="wx-best buyer">
                  <span className="wx-best-ico" aria-hidden="true"><Truck size={22} strokeWidth={2.2} /></span>
                  <div>
                    <div className="wx-best-k">{t("wx_collect_t")}</div>
                    <div className="wx-best-v">{dayName(dryDay, true)}</div>
                    <div className="wx-best-s">{t("wx_collect_s")}</div>
                  </div>
                </section>
              )
            ) : (
              <>
                {bestWindow && (
                  <section className="wx-best">
                    <span className="wx-best-ico" aria-hidden="true"><Sprout size={22} strokeWidth={2.2} /></span>
                    <div>
                      <div className="wx-best-k">{t("wx_best_window")}</div>
                      <div className="wx-best-v">{bestWindow}</div>
                      <div className="wx-best-s">{t("wx_best_window_sub")}</div>
                    </div>
                  </section>
                )}
                {/* Only what the forecast says: no rain for the next few
                    days, or rain coming and when; damp air when it is damp. */}
                <section className="wx-card" aria-labelledby="wx-adv-t">
                  <h2 className="wx-card-t" id="wx-adv-t">{t("wx_advisory")}</h2>
                  {[
                    ...(!days.slice(0, 3).some(isWetDay) ? [{ tone: "tint-green", ico: <CheckCircle size={20} strokeWidth={2.2} />, msg: t("wx_adv_good") }] : []),
                    ...(rainDay ? [{ tone: "tint-gold", ico: <AlertTriangle size={20} strokeWidth={2.2} />, msg: t("wx_adv_rain").replace("{when}", whenSaid(rainDay.date, now, t, locale)) }] : []),
                    ...(w.now.humidity >= 80 ? [{ tone: "tint-blue", ico: <Droplets size={20} strokeWidth={2.2} />, msg: t("wx_adv_humidity") }] : []),
                  ].map(a => (
                    <div className={`wx-adv ${a.tone}`} key={a.msg}>
                      <span className="hm-ico" aria-hidden="true">{a.ico}</span>
                      <span className="wx-adv-t">{a.msg}</span>
                    </div>
                  ))}
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
