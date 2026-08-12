import { useState } from "react";
import { Bot } from "lucide-react";
import { useLang } from "../../i18n";
import { LSTM_DATA } from "../../data/forecast";
import { CropIcon } from "../icons";
import { LSTMChart } from "../charts/LSTMChart";

// ─── LSTM Forecast Section ────────────────────────────────────────────────────
export function LSTMForecast() {
  const { t, tn } = useLang();
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const crops = Object.keys(LSTM_DATA);
  const data = LSTM_DATA[selectedCrop];
  const futurePts = data.series.filter(d => d.actual === null);
  const next7 = futurePts[futurePts.length - 1].predicted;
  const todayPx = data.current;
  const changeAmt = (next7 - todayPx).toFixed(1);
  const changePct = (((next7 - todayPx) / todayPx) * 100).toFixed(1);
  const trendColor = data.trend === "up" ? "#2e7d4f" : data.trend === "down" ? "#c74133" : "#b97d10";
  const trendArrow = data.trend === "up" ? "↗" : data.trend === "down" ? "↘" : "→";
  const trendLabel = data.trend === "up" ? t("ana_uptrend") : data.trend === "down" ? t("ana_downtrend") : t("ana_stable");

  return (
    <div className="card">
      {/* Header */}
      <div className="lstm-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="lstm-badge" style={{ display: "flex", alignItems: "center", gap: 4 }}><Bot size={12} color="#b9a5e2" /> LSTM AI</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t("ana_forecast")}</span>
        </div>
      </div>

      {/* Crop selector tabs */}
      <div className="lstm-crop-tabs">
        {crops.map(c => (
          <button key={c} className={`lstm-tab ${selectedCrop === c ? "on" : ""}`} onClick={() => setSelectedCrop(c)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <CropIcon crop={c} size={13} /> {tn(c)}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="lstm-summary">
        <div className="lstm-sum-item">
          <div className="lstm-sum-val">₱{todayPx}</div>
          <div className="lstm-sum-lbl">{t("ana_today_price")}</div>
        </div>
        <div className="lstm-sum-item">
          <div className="lstm-sum-val" style={{ color: trendColor }}>₱{next7.toFixed(1)}</div>
          <div className="lstm-sum-lbl">{t("ana_day7")}</div>
        </div>
        <div className="lstm-sum-item">
          <div className="lstm-sum-val" style={{ color: trendColor }}>{trendArrow} {Math.abs(Number(changePct))}%</div>
          <div className="lstm-sum-lbl">{t("ana_change7")}</div>
        </div>
      </div>

      {/* Chart */}
      <LSTMChart series={data.series} />

      {/* Chart legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 6, marginBottom: 12, justifyContent: "center" }}>
        {([["#2e7d4f", "Actual Price", t("ana_actual")], ["#6d4bb8", "LSTM Prediction", t("ana_pred")], ["#e2d8f2", "Confidence Band", t("ana_band")]] as const).map(([c, l, label]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#82735f" }}>
            <span style={{ width: 10, height: 10, borderRadius: l === "Confidence Band" ? 2 : "50%", background: c, display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>

      {/* 7-day scrollable forecast cards */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("ana_outlook")}</div>
      <div className="lstm-forecast-row">
        <div className="lstm-day-card now">
          <div className="lstm-day-lbl">TODAY</div>
          <div className="lstm-day-price">₱{todayPx}</div>
          <div className="lstm-day-dot" style={{ color: "#b9a5e2" }}>●</div>
        </div>
        {futurePts.map((pt) => {
          const diff = pt.predicted - todayPx;
          const isUp = diff >= 0;
          return (
            <div key={pt.day} className="lstm-day-card future">
              <div className="lstm-day-lbl">{pt.day}</div>
              <div className="lstm-day-price">₱{pt.predicted.toFixed(1)}</div>
              <div className="lstm-day-dot" style={{ color: isUp ? "#2e7d4f" : "#c74133", fontSize: 10 }}>{isUp ? "▲" : "▼"}</div>
            </div>
          );
        })}
      </div>

      {/* Trend pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ background: trendColor + "18", color: trendColor, fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 99, border: `1px solid ${trendColor}33` }}>
          {trendArrow} {trendLabel} · {changeAmt >= "0" ? "+" : ""}{changeAmt} {t("ana_over7")}
        </span>
      </div>

      {/* Disclaimer */}
      <div className="lstm-note" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Bot size={14} color="#6d4bb8" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{t("ana_lstm_note")}</span>
      </div>
    </div>
  );
}
