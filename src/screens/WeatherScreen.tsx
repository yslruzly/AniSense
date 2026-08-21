import { CloudSun, MapPin, Sprout, Droplets, Wind, AlertTriangle, CheckCircle } from "lucide-react";
import { useLang } from "../i18n";
import { WEATHER_FORECAST } from "../data/weather";
import { Hdr } from "../components/layout/Hdr";
import { WeatherIcon } from "../components/icons";

// ─── Weather Screen ───────────────────────────────────────────────────────────
export function WeatherScreen({ onProfile, onBack, userInitials = "JD" }: { onProfile: () => void; onBack: () => void; userInitials?: string }) {
  const { t } = useLang();
  const RAIN_ICONS = ["Rainy", "Stormy", "LightRain"];

  // Find the longest run of consecutive good-weather days for a planting-window insight
  let bestStart: number | null = null, bestEnd: number | null = null, curStart: number | null = null;
  WEATHER_FORECAST.forEach((f, i) => {
    const isGood = !RAIN_ICONS.includes(f.icon);
    if (isGood) {
      if (curStart === null) curStart = i;
      if (bestStart === null || (i - curStart) > (bestEnd! - bestStart)) { bestStart = curStart; bestEnd = i; }
    } else {
      curStart = null;
    }
  });
  const bestWindowLabel = bestStart !== null
    ? (bestStart === bestEnd ? WEATHER_FORECAST[bestStart].day : `${WEATHER_FORECAST[bestStart].day}–${WEATHER_FORECAST[bestEnd!].day}`)
    : null;
  const rainDay = WEATHER_FORECAST.find(f => RAIN_ICONS.includes(f.icon));

  return (
    <div className="screen">
      <Hdr icon={<CloudSun size={20} color="var(--tanim)" />} title={t("wx_title")} sub={t("wx_sub")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll screen-enter">
        <div className="wx-hero">
          <div className="wx-ico"><CloudSun size={52} color="rgba(255,255,255,0.95)" /></div>
          <div className="wx-temp">28°C</div>
          <div className="wx-cond">{t("wx_partly_cloudy")}</div>
          <div className="wx-loc" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><MapPin size={12} color="rgba(255,255,255,0.7)" /> Nueva Ecija, PH</div>
        </div>

        {bestWindowLabel && (
          <div className="adv-banner" style={{ background: "var(--tanim-sk)", border: "1px solid var(--line)" }}>
            <Sprout size={18} color="var(--tanim-deep)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div className="adv-banner-txt" style={{ color: "var(--tanim-deep)" }}>{t("wx_best_window")}: {bestWindowLabel}</div>
              <div className="adv-banner-sub" style={{ color: "var(--tanim-deep)" }}>{t("wx_best_window_sub")}</div>
            </div>
          </div>
        )}

        <div className="g2">
          {[
            { icon: <Droplets size={20} color="var(--tanim)" />, val: "72%", lbl: t("wx_humidity") },
            { icon: <Wind size={20} color="var(--tanim)" />, val: "14 km/h", lbl: t("wx_wind") },
            { icon: <CloudSun size={20} color="var(--tanim-deep)" />, val: "35%", lbl: t("wx_rain_chance") },
            { icon: <AlertTriangle size={20} color="var(--gold-text)" />, val: t("wx_uv_high"), lbl: t("wx_uv") },
          ].map(({ icon, val, lbl }) => (
            <div key={lbl} className="card">
              <div className="stat-ico">{icon}</div>
              <div className="stat-val">{val}</div>
              <div className="stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">{t("wx_forecast")}</div>
          <div className="fc-row">
            {WEATHER_FORECAST.map(f => (
              <div key={f.day} className="fc-item">
                <div className="fc-day">{f.day}</div>
                <div className="fc-ico"><WeatherIcon icon={f.icon} size={20} /></div>
                <div className="fc-hi">{f.high}°</div>
                <div className="fc-lo">{f.low}°</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">{t("wx_advisory")}</div>
          {[
            { cls: "adv-good", icon: <CheckCircle size={14} color="var(--tanim-deep)" />, msg: t("wx_adv_good") },
            ...(rainDay ? [{ cls: "adv-warn", icon: <AlertTriangle size={14} color="var(--gold-text)" />, msg: `${t("wx_adv_rain")} ${rainDay.day}: ${t("wx_adv_harvest")}` }] : []),
            { cls: "adv-info", icon: <Droplets size={14} color="var(--tanim-deep)" />, msg: t("wx_adv_humidity") },
          ].map(({ cls, icon, msg }) => (
            <div key={msg} className={`adv-item ${cls}`}><span>{icon}</span><span>{msg}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
