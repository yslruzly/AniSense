# Forecast models

The two models the study names, ARIMA and LSTM, trained on AniSense's monthly retail price records. Training runs on your own computer with free, open-source Python libraries. There is no subscription, no API key, and nothing is sent anywhere. The phone never trains anything: it only shows the results.

| File | What it does |
|---|---|
| `train_forecasts.py` | Trains and tests both models for every variety, then writes the forecasts the app shows and the test report. |
| `import_pdf.py` | Reads the price tables out of `data/raw/Historical-Records-Crops-2021-2026.pdf` into `data/historical-prices.csv`. Only needed when a newer PDF replaces the old one. |
| `REPORT.md` | The test results: each model's error on the last 12 months, per variety, next to the simplest possible forecast. Generated. |
| `requirements.txt` | The Python libraries used. |

## One-time setup

Python 3.11 or newer.

```
python -m venv ml/.venv
ml\.venv\Scripts\python -m pip install -r ml/requirements.txt
```

The `ml/.venv` folder is large and is not committed to git.

## When a new month of prices comes in

1. Add the month as a new row at the bottom of `data/historical-prices.csv`. Leave a cell empty if there is no record for that variety.
2. Rebuild everything that is made from it:

```
npm run prices        src/data/generated/priceHistory.ts   the history the app bundles
npm run forecasts     src/data/generated/forecasts.json    and ml/REPORT.md
npm run seed          supabase/seed.sql          the database's copy
```

3. Run `supabase/seed.sql` in the Supabase SQL Editor, and build a new APK.

Training takes about a minute and gives the same numbers every time it is run on the same data.

## How the models are tested

The last 12 months of each variety are held back. Each model is fitted on the months before them, then asked, month by month, for the next 3 months using only what was known by then. Its answers are compared with what really happened, and with the simplest forecast there is: "next month's price is the same as this month's".

The app uses that result. Each forecast is shown with how far off the model was on average, and where that is more than 20% (`RELIABLE_MAPE` in `src/data/forecast.ts`), the app says the forecast is too uncertain to call and gives no sell-or-wait advice from it.

## What the test showed

Average miss as a percentage of the real price (MAPE), on the last 12 months. The full table is in `REPORT.md`.

| Variety | ARIMA | LSTM | Same as last month |
|---|---|---|---|
| Special Rice | 4.5% | 3.1% | 4.1% |
| Well Milled Rice | 7.4% | 8.8% | 8.5% |
| Native Garlic | 4.8% | 10.7% | 3.1% |
| Red Onion | 28.3% | 51.8% | 33.1% |
| Calamansi | 48.9% | 36.9% | 31.2% |

Rice is forecast well. For garlic and calamansi neither model beats "same as last month". Onion and calamansi are above the app's 20% line, so the app marks them as too uncertain to call.

## Known limits

- **The differencing order (d) is chosen by AIC.** AIC is a sound guide for p and q but not for d, because differencing changes the data the score is computed on. The usual practice is a stationarity test (ADF or KPSS) for d, then AIC for p and q. This should be fixed before the results are published.
- **The LSTM is not tuned.** Its settings (6-month window, 16 units, 400 passes, learning rate 0.01, weight decay 0.0001) were set once to small, common values. No other settings were compared.
- **The LSTM has no dropout.** A weight penalty is used instead. PyTorch's built-in LSTM dropout has no effect on a one-layer network.
- **Both models see only past prices.** Neither can foresee a typhoon, an import decision or a supply problem. They react only after the shocked price is on record.
- **The data is small.** 69 monthly points at most, 46 for calamansi.
- **No seasonal model was tested,** although crop prices follow harvest seasons.

## Libraries

Python 3.13, statsmodels 0.15 (ARIMA), PyTorch 2.14 CPU (LSTM), pandas, numpy, and pypdf for reading the PDF. There is no TensorFlow. The app itself contains no machine-learning library: it reads `src/data/generated/forecasts.json`.

## Where each model is used in the app

| Screen | Model |
|---|---|
| Analytics: the price forecast chart | LSTM |
| Prices: the chart inside each crop | LSTM |
| Analytics: "Sell now or wait?" | ARIMA |
| Home: "Prices in the next 3 months" | ARIMA |
