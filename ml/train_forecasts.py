"""Trains the two forecasting models on the price records and writes what the
app shows.

    ml/.venv/Scripts/python ml/train_forecasts.py

Reads   data/historical-prices.csv      monthly retail prices, one column per variety
Writes  src/data/forecasts.json         the next 3 months, per variety and model
        ml/REPORT.md                    how well each model did, for the study

Two models per variety, the two the study names:

  ARIMA   statsmodels. The order (p, d, q) is picked by AIC on the training
          months; the likely range is the model's own 80% interval.
  LSTM    PyTorch. One small LSTM layer that reads the last 6 months and
          gives the next one; later months are forecast one step at a time.
          The likely range comes from how far off it was on the test months.

Both work on the logarithm of the price, so a forecast can never go below
zero and a 10% move counts the same at ₱50 as at ₱350.

How they are tested: the last 12 months are held back. Each model is fitted
on the months before them, then asked, month by month, for the next 3 using
only what was known by then. Its answers are compared with what happened, and
with the simplest forecast there is ("next month is the same as this one"),
so the report says honestly whether a model beats doing nothing.

Everything here is free and runs on this computer. Nothing is sent anywhere.
"""

import json
import warnings
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from statsmodels.tools.sm_exceptions import ConvergenceWarning
from statsmodels.tsa.arima.model import ARIMA
from torch import nn

ROOT = Path(__file__).resolve().parent.parent
CSV = ROOT / "data" / "historical-prices.csv"
OUT = ROOT / "src" / "data" / "forecasts.json"
REPORT = ROOT / "ml" / "REPORT.md"

HORIZON = 3        # months ahead
TEST_MONTHS = 12   # held back for testing
WINDOW = 6         # months the LSTM reads
HIDDEN = 16
EPOCHS = 400
SEED = 2026
Z80 = 1.2816       # 80% interval

NAMES = {
    "rice-special": "Special Rice",
    "rice-well-milled": "Well Milled Rice",
    "garlic-native": "Native Garlic",
    "onion-red": "Red Onion",
    "cala-regular": "Calamansi",
}

warnings.simplefilter("ignore", ConvergenceWarning)
warnings.filterwarnings("ignore", category=UserWarning, module="statsmodels")
torch.set_num_threads(1)   # the same numbers on every run


# ── ARIMA ─────────────────────────────────────────────────────────────────────
def arima_fit(y: np.ndarray, order: tuple[int, int, int]):
    trend = "c" if order[1] == 0 else "n"
    return ARIMA(y, order=order, trend=trend).fit()


def arima_order(y: np.ndarray) -> tuple[int, int, int]:
    """The (p, d, q) with the lowest AIC on these months."""
    best, best_aic = (0, 1, 0), np.inf
    for d in (0, 1):
        for p in range(4):
            for q in range(4):
                try:
                    aic = arima_fit(y, (p, d, q)).aic
                except Exception:
                    continue
                if np.isfinite(aic) and aic < best_aic - 1e-9:
                    best, best_aic = (p, d, q), aic
    return best


# ── LSTM ──────────────────────────────────────────────────────────────────────
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(1, HIDDEN, batch_first=True)
        self.out = nn.Linear(HIDDEN, 1)

    def forward(self, x):
        h, _ = self.lstm(x)
        return self.out(h[:, -1, :])


class Lstm:
    """Trained on standardised log prices; forecasts one month at a time."""

    def __init__(self, y: np.ndarray):
        torch.manual_seed(SEED)
        self.mean, self.std = float(y.mean()), float(y.std() or 1.0)
        z = (y - self.mean) / self.std
        x = np.stack([z[i:i + WINDOW] for i in range(len(z) - WINDOW)])
        t = z[WINDOW:]
        x = torch.tensor(x, dtype=torch.float32).unsqueeze(-1)
        t = torch.tensor(t, dtype=torch.float32).unsqueeze(-1)
        self.net = Net()
        opt = torch.optim.Adam(self.net.parameters(), lr=0.01, weight_decay=1e-4)
        loss_fn = nn.MSELoss()
        self.net.train()
        for _ in range(EPOCHS):
            opt.zero_grad()
            loss = loss_fn(self.net(x), t)
            loss.backward()
            opt.step()
        self.net.eval()

    def forecast(self, history: np.ndarray, steps: int) -> np.ndarray:
        z = list((history[-WINDOW:] - self.mean) / self.std)
        out = []
        with torch.no_grad():
            for _ in range(steps):
                x = torch.tensor(z[-WINDOW:], dtype=torch.float32).view(1, WINDOW, 1)
                nxt = float(self.net(x))
                z.append(nxt)
                out.append(nxt * self.std + self.mean)
        return np.array(out)


# ── Testing ───────────────────────────────────────────────────────────────────
def rolling(y: np.ndarray, n_train: int, predict) -> np.ndarray:
    """For each month from the last training month on, forecast the next
    HORIZON months from what was known then. Returns the log errors as rows of
    (steps ahead, error), for the months that have happened."""
    rows = []
    for origin in range(n_train - 1, len(y) - 1):
        f = predict(y[:origin + 1], HORIZON)
        for h in range(HORIZON):
            target = origin + 1 + h
            if target < len(y):
                rows.append((h + 1, f[h], y[target]))
    return np.array(rows)


def scores(rows: np.ndarray) -> dict:
    """Errors in pesos, from forecasts and actuals held as logs."""
    pred, actual = np.exp(rows[:, 1]), np.exp(rows[:, 2])
    err = pred - actual
    return {
        "mae": round(float(np.abs(err).mean()), 2),
        "rmse": round(float(np.sqrt((err ** 2).mean())), 2),
        "mape": round(float((np.abs(err) / actual).mean() * 100), 1),
    }


def next_months(last: str, steps: int) -> list[str]:
    y, m = map(int, last.split("-"))
    out = []
    for _ in range(steps):
        m += 1
        if m > 12:
            y, m = y + 1, 1
        out.append(f"{y}-{m:02d}")
    return out


def points(months, mid, lo, hi) -> list[dict]:
    return [{"month": mo, "price": round(float(np.exp(a)), 2), "lower": round(float(np.exp(b)), 2), "upper": round(float(np.exp(c)), 2)}
            for mo, a, b, c in zip(months, mid, lo, hi)]


def main() -> None:
    df = pd.read_csv(CSV, dtype={"month": str}).set_index("month")
    result = {"generated": date.today().isoformat(), "horizon": HORIZON, "testMonths": TEST_MONTHS, "crops": {}}
    report = []

    for crop in df.columns:
        s = df[crop]
        s = s.loc[s.first_valid_index():s.last_valid_index()]
        filled = [m for m, v in s.items() if pd.isna(v)]
        # A month with no record inside the series is bridged with a straight
        # line between its neighbours, for training only. The app never shows
        # a bridged month as a price.
        price = s.interpolate(method="linear").to_numpy(dtype=float)
        y = np.log(price)
        n, n_train = len(y), len(y) - TEST_MONTHS
        last = s.index[-1]
        ahead = next_months(last, HORIZON)

        # Test: fitted on the training months only, never refitted.
        order = arima_order(y[:n_train])
        arima_train = arima_fit(y[:n_train], order)
        r_arima = rolling(y, n_train, lambda hist, k: arima_train.apply(hist, refit=False).forecast(k))
        lstm_train = Lstm(y[:n_train])
        r_lstm = rolling(y, n_train, lstm_train.forecast)
        r_naive = rolling(y, n_train, lambda hist, k: np.repeat(hist[-1], k))

        # The forecast the app shows: fitted again on every month on record.
        fc = arima_fit(y, order).get_forecast(HORIZON)
        ci = fc.conf_int(alpha=0.2)
        arima_points = points(ahead, fc.predicted_mean, ci[:, 0], ci[:, 1])

        mid = Lstm(y).forecast(y, HORIZON)
        # How far off the LSTM was on the test months, at 1, 2 and 3 months ahead.
        sd = np.array([np.sqrt(np.mean((r_lstm[r_lstm[:, 0] == h, 1] - r_lstm[r_lstm[:, 0] == h, 2]) ** 2)) for h in range(1, HORIZON + 1)])
        lstm_points = points(ahead, mid, mid - Z80 * sd, mid + Z80 * sd)

        a, l, nv = scores(r_arima), scores(r_lstm), scores(r_naive)
        result["crops"][crop] = {
            "months": int(n), "from": s.index[0], "to": last, "filled": filled,
            "arima": {"order": list(order), **a, "forecast": arima_points},
            "lstm": {"window": WINDOW, **l, "forecast": lstm_points},
            "naive": nv,
        }
        best = min((("ARIMA", a), ("LSTM", l), ("Same as last month", nv)), key=lambda kv: kv[1]["mape"])[0]
        report.append((crop, n, s.index[0], last, filled, order, a, l, nv, best, arima_points, lstm_points))
        print(f"{crop:18} {n} months  ARIMA{order} MAPE {a['mape']}%  LSTM MAPE {l['mape']}%  same-as-last-month MAPE {nv['mape']}%")

    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Forecast models: test results",
        "",
        "Generated by `ml/train_forecasts.py` from `data/historical-prices.csv`. Do not edit by hand.",
        "",
        f"- **Data:** monthly retail prices per kilo. The last {TEST_MONTHS} months of each variety were held back for testing.",
        f"- **Test:** each model was fitted on the earlier months, then asked for the next {HORIZON} months at every step, using only what was known by then. The errors below are over all of those forecasts (1, 2 and {HORIZON} months ahead together).",
        "- **MAE:** the average miss, in pesos per kilo. **RMSE:** the same, with big misses counted more heavily. **MAPE:** the average miss as a percentage of the real price.",
        "- **Same as last month** is the simplest forecast there is: next month's price equals this month's. A model is only useful where it beats that row.",
        "",
        "## Accuracy on the held-back months",
        "",
        "| Variety | Months | Model | MAE (₱) | RMSE (₱) | MAPE | Best |",
        "|---|---|---|---|---|---|---|",
    ]
    for crop, n, start, last, filled, order, a, l, nv, best, ap, lp in report:
        name = NAMES.get(crop, crop)
        lines.append(f"| {name} | {n} ({start} to {last}) | ARIMA{order} | {a['mae']:.2f} | {a['rmse']:.2f} | {a['mape']:.1f}% | {'✓' if best == 'ARIMA' else ''} |")
        lines.append(f"| | | LSTM (reads {WINDOW} months) | {l['mae']:.2f} | {l['rmse']:.2f} | {l['mape']:.1f}% | {'✓' if best == 'LSTM' else ''} |")
        lines.append(f"| | | Same as last month | {nv['mae']:.2f} | {nv['rmse']:.2f} | {nv['mape']:.1f}% | {'✓' if best == 'Same as last month' else ''} |")
    lines += ["", f"## Forecast for the next {HORIZON} months", "", "Fitted on every month on record. The range is where the price is expected to land 8 times out of 10.", "",
              "| Variety | Model | " + " | ".join(report[0][10][i]["month"] for i in range(HORIZON)) + " |", "|---|---|" + "---|" * HORIZON]
    for crop, n, start, last, filled, order, a, l, nv, best, ap, lp in report:
        name = NAMES.get(crop, crop)
        cell = lambda p: f"₱{p['price']:.2f} (₱{p['lower']:.2f} to ₱{p['upper']:.2f})"
        lines.append(f"| {name} | ARIMA | " + " | ".join(cell(p) for p in ap) + " |")
        lines.append(f"| | LSTM | " + " | ".join(cell(p) for p in lp) + " |")
    gaps = [(NAMES.get(c, c), f) for c, _, _, _, f, *_ in report if f]
    lines += ["", "## Notes", ""]
    for name, f in gaps:
        lines.append(f"- {name} has no record for {', '.join(f)}. For training only, that month was bridged with a straight line between its neighbours.")
    short = [(NAMES.get(c, c), n, start) for c, n, start, *_ in report if n < 60]
    for name, n, start in short:
        lines.append(f"- {name} has records only from {start} ({n} months), so its models learned from less and its results are less certain.")
    lines.append(f"- Settings: ARIMA order chosen by AIC over p, q = 0 to 3 and d = 0 or 1, on log prices. LSTM: 1 layer, {HIDDEN} units, window {WINDOW}, {EPOCHS} epochs, Adam (learning rate 0.01), seed {SEED}, on standardised log prices.")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} and {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
