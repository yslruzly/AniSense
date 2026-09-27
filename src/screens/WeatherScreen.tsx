import { useEffect, useState } from "react";
import {
  CloudSun, MapPin, Sprout, Droplets, Sun, Cloud, Moon, Zap,
  ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Truck,
} from "lucide-react";
import { useLang } from "../i18n";
import { WEATHER_NOW, WEATHER_HOURLY, WEATHER_FORECAST, WxIcon } from "../data/weather";
import { Hdr } from "../components/layout/Hdr";
import { WeatherIcon } from "../components/icons";
import { useIsNight } from "../hooks/useIsNight";
import { UserRole } from "../types";

// ─── Weather ──────────────────────────────────────────────────────────────────
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

  // The clock on the hero, kept current while the page is open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const clock = now.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

  const w = WEATHER_NOW;
  const cond = (icon: WxIcon, night: boolean) =>
    night && icon === "Sunny" ? t("wx_cond_clear_night") : t(`wx_cond_${icon}`);

  // The longest run of dry days, for the farmer's fieldwork window; the first
  // dry day, for the buyer's trip.
  let bestStart: number | null = null, bestEnd: number | null = null, curStart: number | null = null;
  WEATHER_FORECAST.forEach((f, i) => {
    if (!RAINY.includes(f.icon)) {
      if (curStart === null) curStart = i;
      if (bestStart === null || (i - curStart) > (bestEnd! - bestStart)) { bestStart = curStart; bestEnd = i; }
    } else {
      curStart = null;
    }
  });
  const bestWindow = bestStart !== null
    ? (bestStart === bestEnd ? WEATHER_FORECAST[bestStart].day : `${WEATHER_FORECAST[bestStart].day}–${WEATHER_FORECAST[bestEnd!].day}`)
    : null;
  const rainDay = WEATHER_FORECAST.find(f => RAINY.includes(f.icon));
  const dryDay = WEATHER_FORECAST.find(f => !RAINY.includes(f.icon));

  const stats = [
    { val: `${w.humidity}%`, lbl: t("wx_humidity") },
    { val: `${w.wind}`, unit: "km/h", lbl: t("wx_wind") },
    { val: `${w.rain}%`, lbl: t("wx_rain_chance") },
    { val: `${w.uv}`, unit: t("wx_uv_high"), lbl: t("wx_uv") },
  ];

  return (
    <div className="screen">
      <Hdr icon={<CloudSun size={20} color="var(--tanim)" />} title={t("wx_title")} sub={t(isBuyer ? "wx_sub_buyer" : "wx_sub")} onBack={onBack} />
      <div className="scroll screen-enter">

        {/* 1 ── Now. The same field by day and by night; both pictures stay
            mounted and crossfade, so the 6 PM switch dissolves. */}
        <section className="wx-hero" data-time={isNight ? "night" : "day"} aria-label={`${w.temp}°, ${cond(w.icon, isNight)}`}>
          <span className="wx-bg wx-bg-day" aria-hidden="true" />
          <span className="wx-bg wx-bg-night" aria-hidden="true" />

          <div className="wx-place">
            <MapPin size={14} strokeWidth={2.4} aria-hidden="true" /> Nueva Ecija · {clock}
          </div>

          <div className="wx-main">
            <div className="wx-read">
              <div className="wx-temp">{w.temp}<span className="wx-deg">°</span></div>
              <div className="wx-cond">{cond(w.icon, isNight)}</div>
              <div className="wx-range">
                <span><ArrowUp size={14} strokeWidth={2.6} aria-label={t("wx_high")} />{w.high}°</span>
                <span><ArrowDown size={14} strokeWidth={2.6} aria-label={t("wx_low")} />{w.low}°</span>
              </div>
            </div>
            <SkyArt icon={w.icon} night={isNight} />
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
        </section>

        <div className="wx-stack stagger-list">
          {/* 2 ── The rest of today: time, sky, temperature. Nothing else. */}
          <section className="wx-card" aria-labelledby="wx-hours-t">
            <h2 className="wx-card-t" id="wx-hours-t">{t("wx_next_hours")}</h2>
            <div className="wx-hours">
              {WEATHER_HOURLY.map((h, i) => {
                const at = new Date(now.getTime() + i * 3_600_000);
                const label = i === 0 ? t("wx_now") : at.toLocaleTimeString(locale, { hour: "numeric" });
                return (
                  <div className={`wx-hr ${i === 0 ? "now" : ""}`} key={i}>
                    <span className="wx-hr-t">{label}</span>
                    <WeatherIcon icon={h.icon} size={24} night={isNightHour(at.getHours())} />
                    <span className="wx-hr-temp">{h.temp}°</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3 ── The week: day, sky, what it will be like, high then low. */}
          <section className="wx-card" aria-labelledby="wx-week-t">
            <h2 className="wx-card-t" id="wx-week-t">{t("wx_forecast")}</h2>
            <div className="wx-days">
              {WEATHER_FORECAST.map(f => (
                <div className="wx-day" key={f.day}>
                  <span className="wx-day-n">{f.day}</span>
                  <WeatherIcon icon={f.icon} size={22} />
                  <span className="wx-day-c">{cond(f.icon, false)}</span>
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
                  <div className="wx-best-v">{dryDay.day}</div>
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
              <section className="wx-card" aria-labelledby="wx-adv-t">
                <h2 className="wx-card-t" id="wx-adv-t">{t("wx_advisory")}</h2>
                {[
                  { tone: "tint-green", ico: <CheckCircle size={20} strokeWidth={2.2} />, msg: t("wx_adv_good") },
                  ...(rainDay ? [{ tone: "tint-gold", ico: <AlertTriangle size={20} strokeWidth={2.2} />, msg: `${t("wx_adv_rain")} ${rainDay.day}: ${t("wx_adv_harvest")}` }] : []),
                  { tone: "tint-blue", ico: <Droplets size={20} strokeWidth={2.2} />, msg: t("wx_adv_humidity") },
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
      </div>
    </div>
  );
}
