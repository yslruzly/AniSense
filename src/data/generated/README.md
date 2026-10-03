# Generated data

Every file here is written by a script. Do not edit them by hand: change the source, then run the script again.

| File | Written by | From |
|---|---|---|
| `priceHistory.ts` | `npm run prices` (`scripts/build-prices.mjs`) | `data/historical-prices.csv` |
| `forecasts.json` | `npm run forecasts` (`ml/train_forecasts.py`) | `data/historical-prices.csv` |
| `phPlaces.ts`, `phBarangays.json` | `node scripts/build-ph-places.mjs` | The Philippine Standard Geographic Code (psgc.gitlab.io) |
