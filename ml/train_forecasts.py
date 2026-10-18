"""Trains the two forecasting models on the price records and writes what the
app shows.

    ml/.venv/Scripts/python ml/train_forecasts.py

Reads   data/historical-prices.csv      monthly retail prices, one column per variety
Writes  src/data/generated/forecasts.json       per variety: ARIMA's next 3 months, LSTM's next 12
        ml/REPORT.md                    how well each model did, for the study

Two models per variety, the two the study names, each for its own range:

  ARIMA   short term, the next 3 months: the sell-or-wait advice.
          statsmodels. The order (p, d, q) is picked by AIC on the training
          months; the likely range is the model's own 80% interval.
  LSTM    long term, the next 12 months: the year's price outlook.
          PyTorch. One small LSTM layer that reads the last 6 months and
          gives the next one; later months are forecast one step at a time,
          each from the ones before. The likely range comes from how far off
          it was on the test months, widening the further ahead it looks.

Both work on the logarithm of the price, so a forecast can never go below
zero and a 10% move counts the same at ₱50 as at ₱350.

How they are tested: the last 12 months are held back. Each model is fitted
on the months before them, then asked, month by month, for its own range
ahead (ARIMA 3 months, LSTM 12) using only what was known by then. Its
answers are compared with what happened, and with the simplest forecast there
is ("the price stays where it is") over the same range, so the report says
honestly whether a model beats doing nothing. The LSTM's 12 months are also
scored in parts (1 to 3, 4 to 6, 7 to 12 months ahead), since a forecast
gets less sure the further it looks.

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
OUT = ROOT / "src" / "data" / "generated" / "forecasts.json"
REPORT = ROOT / "ml" / "REPORT.md"

ARIMA_HORIZON = 3  # months ahead: short term, the sell-or-wait advice
LSTM_HORIZON = 12  # months ahead: long term, the year's outlook
TEST_MONTHS = 12   # held back for testing
MIN_MONTHS = TEST_MONTHS + 24   # fewer on record (a variety just given prices on the admin website): no forecast yet
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
def rolling(y: np.ndarray, n_train: int, predict, horizon: int) -> np.ndarray:
    """For each month from the last training month on, forecast the next
    `horizon` months from what was known then. Returns rows of (steps ahead,
    forecast, actual), as logs, for the months that have happened."""
    rows = []
    for origin in range(n_train - 1, len(y) - 1):
        f = predict(y[:origin + 1], horizon)
        for h in range(horizon):
            target = origin + 1 + h
            if target < len(y):
                rows.append((h + 1, f[h], y[target]))
    return np.array(rows)


def within(rows: np.ndarray, first: int, last: int) -> np.ndarray:
    """The test forecasts made `first` to `last` months ahead."""
    return rows[(rows[:, 0] >= first) & (rows[:, 0] <= last)]


def spread(rows: np.ndarray, horizon: int) -> np.ndarray:
    """How far off, in logs, a forecast is likely to be at 1 to `horizon`
    months ahead: the test misses, scaled by the square root of how far
    ahead each was, as a price's uncertainty grows. Steady even where the
    test had only one forecast that far ahead."""
    h, miss = rows[:, 0], rows[:, 1] - rows[:, 2]
    sigma = float(np.sqrt(np.mean(miss ** 2 / h)))
    return sigma * np.sqrt(np.arange(1, horizon + 1))


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
    result = {"generated": date.today().isoformat(), "horizons": {"arima": ARIMA_HORIZON, "lstm": LSTM_HORIZON}, "testMonths": TEST_MONTHS, "crops": {}}
    report = []
    skipped = []

    for crop in df.columns:
        s = df[crop]
        if s.first_valid_index() is None:
            continue
        s = s.loc[s.first_valid_index():s.last_valid_index()]
        if len(s) < MIN_MONTHS:
            skipped.append((crop, len(s)))
            print(f"{crop:18} {len(s)} month{'' if len(s) == 1 else 's'}  skipped: a forecast needs {MIN_MONTHS} months on record")
            continue
        filled = [m for m, v in s.items() if pd.isna(v)]
        # A month with no record inside the series is bridged with a straight
        # line between its neighbours, for training only. The app never shows
        # a bridged month as a price.
        price = s.interpolate(method="linear").to_numpy(dtype=float)
        y = np.log(price)
        n, n_train = len(y), len(y) - TEST_MONTHS
        last = s.index[-1]

        # Test: fitted on the training months only, never refitted. Each model
        # over its own range; "the price stays where it is" over both.
        order = arima_order(y[:n_train])
        arima_train = arima_fit(y[:n_train], order)
        r_arima = rolling(y, n_train, lambda hist, k: arima_train.apply(hist, refit=False).forecast(k), ARIMA_HORIZON)
        lstm_train = Lstm(y[:n_train])
        r_lstm = rolling(y, n_train, lstm_train.forecast, LSTM_HORIZON)
        r_naive = rolling(y, n_train, lambda hist, k: np.repeat(hist[-1], k), LSTM_HORIZON)

        # The forecasts the app shows: fitted again on every month on record.
        fc = arima_fit(y, order).get_forecast(ARIMA_HORIZON)
        ci = fc.conf_int(alpha=0.2)
        arima_points = points(next_months(last, ARIMA_HORIZON), fc.predicted_mean, ci[:, 0], ci[:, 1])

        mid = Lstm(y).forecast(y, LSTM_HORIZON)
        sd = spread(r_lstm, LSTM_HORIZON)
        lstm_points = points(next_months(last, LSTM_HORIZON), mid, mid - Z80 * sd, mid + Z80 * sd)

        a, l = scores(r_arima), scores(r_lstm)
        nv_short, nv_long = scores(within(r_naive, 1, ARIMA_HORIZON)), scores(r_naive)
        # The LSTM over the near months too, to set it beside ARIMA, and in
        # parts, since a year ahead is harder than next month.
        bands = {f"{f}-{t}": scores(within(r_lstm, f, t)) for f, t in ((1, 3), (4, 6), (7, 12))}
        result["crops"][crop] = {
            "months": int(n), "from": s.index[0], "to": last, "filled": filled,
            "arima": {"order": list(order), "horizon": ARIMA_HORIZON, **a, "forecast": arima_points},
            "lstm": {"window": WINDOW, "horizon": LSTM_HORIZON, **l, "byHorizon": {k: v["mape"] for k, v in bands.items()}, "forecast": lstm_points},
            "naive": {"short": nv_short, "long": nv_long},
        }
        report.append(dict(crop=crop, n=n, start=s.index[0], last=last, filled=filled, order=order, a=a, l=l,
                           nv_short=nv_short, nv_long=nv_long, bands=bands, ap=arima_points, lp=lstm_points))
        print(f"{crop:18} {n} months  ARIMA{order} 1-{ARIMA_HORIZON} mo MAPE {a['mape']}% (same price {nv_short['mape']}%)  "
              f"LSTM 1-{LSTM_HORIZON} mo MAPE {l['mape']}% (same price {nv_long['mape']}%)  by part {[v['mape'] for v in bands.values()]}")

    if not report:
        raise SystemExit(f"No variety has {MIN_MONTHS} months of prices on record, so there is nothing to forecast.")
    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")

    pct = lambda v: f"{v:.1f}%"
    beats = lambda m, base: "✓" if m < base else ""
    lines = [
        "# Forecast models: test results",
        "",
        "Generated by `ml/train_forecasts.py` from `data/historical-prices.csv`. Do not edit by hand.",
        "",
        f"- **Two models, two ranges.** ARIMA forecasts the short term, the next {ARIMA_HORIZON} months: the app's sell-or-wait advice. LSTM forecasts the long term, the next {LSTM_HORIZON} months: the app's price outlook.",
        f"- **Data:** monthly retail prices per kilo. The last {TEST_MONTHS} months of each variety were held back for testing.",
        f"- **Test:** each model was fitted on the earlier months, then asked at every step for its own range ahead ({ARIMA_HORIZON} months for ARIMA, {LSTM_HORIZON} for LSTM), using only what was known by then. The errors are over all of those forecasts together.",
        "- **MAE:** the average miss, in pesos per kilo. **RMSE:** the same, with big misses counted more heavily. **MAPE:** the average miss as a percentage of the real price.",
        "- **Same price** is the simplest forecast there is: the price stays where it is. A model is only useful where it beats it over the same range (✓).",
        "",
        f"## Short term: ARIMA, 1 to {ARIMA_HORIZON} months ahead",
        "",
        "| Variety | Months on record | Model | MAE (₱) | RMSE (₱) | MAPE | Beats same price |",
        "|---|---|---|---|---|---|---|",
    ]
    for r in report:
        name, a, nv, l3 = NAMES.get(r["crop"], r["crop"]), r["a"], r["nv_short"], r["bands"]["1-3"]
        lines.append(f"| {name} | {r['n']} ({r['start']} to {r['last']}) | ARIMA{r['order']} | {a['mae']:.2f} | {a['rmse']:.2f} | {pct(a['mape'])} | {beats(a['mape'], nv['mape'])} |")
        lines.append(f"| | | LSTM, the same {ARIMA_HORIZON} months | {l3['mae']:.2f} | {l3['rmse']:.2f} | {pct(l3['mape'])} | {beats(l3['mape'], nv['mape'])} |")
        lines.append(f"| | | Same price | {nv['mae']:.2f} | {nv['rmse']:.2f} | {pct(nv['mape'])} | |")
    lines += ["", f"## Long term: LSTM, 1 to {LSTM_HORIZON} months ahead", "",
              f"| Variety | MAPE, all {LSTM_HORIZON} months | 1 to 3 ahead | 4 to 6 ahead | 7 to 12 ahead | Same price, all {LSTM_HORIZON} | Beats same price |",
              "|---|---|---|---|---|---|---|"]
    for r in report:
        name, l, nv, b = NAMES.get(r["crop"], r["crop"]), r["l"], r["nv_long"], r["bands"]
        lines.append(f"| {name} | {pct(l['mape'])} | {pct(b['1-3']['mape'])} | {pct(b['4-6']['mape'])} | {pct(b['7-12']['mape'])} | {pct(nv['mape'])} | {beats(l['mape'], nv['mape'])} |")
    lines += ["", f"With {TEST_MONTHS} months held back, the test has {TEST_MONTHS} forecasts one month ahead but only one {LSTM_HORIZON} months ahead, so the far end of the LSTM's range is the least tested part of it."]

    lines += ["", f"## ARIMA: the next {ARIMA_HORIZON} months", "", "Fitted on every month on record. The range is where the price is expected to land 8 times out of 10.", "",
              "| Variety | " + " | ".join(p["month"] for p in report[0]["ap"]) + " |", "|---|" + "---|" * ARIMA_HORIZON]
    cell = lambda p: f"₱{p['price']:.2f} (₱{p['lower']:.2f} to ₱{p['upper']:.2f})"
    for r in report:
        lines.append(f"| {NAMES.get(r['crop'], r['crop'])} | " + " | ".join(cell(p) for p in r["ap"]) + " |")
    marks = [2, 5, 8, 11]   # 3, 6, 9 and 12 months ahead
    lines += ["", f"## LSTM: the next {LSTM_HORIZON} months", "", "Every month is in the app; here every third. The range is where the price is expected to land 8 times out of 10.", "",
              "| Variety | " + " | ".join(report[0]["lp"][k]["month"] for k in marks) + " |", "|---|" + "---|" * len(marks)]
    for r in report:
        lines.append(f"| {NAMES.get(r['crop'], r['crop'])} | " + " | ".join(cell(r["lp"][k]) for k in marks) + " |")
    gaps = [(NAMES.get(r["crop"], r["crop"]), r["filled"]) for r in report if r["filled"]]
    lines += ["", "## Notes", ""]
    for name, f in gaps:
        lines.append(f"- {name} has no record for {', '.join(f)}. For training only, that month was bridged with a straight line between its neighbours.")
    short = [(NAMES.get(r["crop"], r["crop"]), r["n"], r["start"]) for r in report if r["n"] < 60]
    for name, n, start in short:
        lines.append(f"- {name} has records only from {start} ({n} months), so its models learned from less and its results are less certain.")
    for crop, n in skipped:
        lines.append(f"- {NAMES.get(crop, crop)} has {n} month{'' if n == 1 else 's'} of prices on record, not yet the {MIN_MONTHS} a forecast needs, so it has none.")
    lines.append(f"- Settings: ARIMA order chosen by AIC over p, q = 0 to 3 and d = 0 or 1, on log prices. LSTM: 1 layer, {HIDDEN} units, window {WINDOW}, {EPOCHS} epochs, Adam (learning rate 0.01), seed {SEED}, on standardised log prices.")
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} and {REPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
