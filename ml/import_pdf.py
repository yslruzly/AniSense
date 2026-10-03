"""Reads the price records out of the PDF and writes data/historical-prices.csv.

    ml/.venv/Scripts/python ml/import_pdf.py

The PDF (data/raw/Historical-Records-Crops-2021-2026.pdf) holds
monthly retail prices, one table per year: a row per variety, a column per month, and a dash where
nothing was recorded. The CSV has one row per month and one column per
variety, named by the app's crop ids, with an empty cell where the PDF has a
dash. It is the file everything else reads: the app's prices and history
(scripts/build-prices.mjs), the database seed (scripts/build-seed.mjs) and
the forecasts (ml/train_forecasts.py).

When a month's prices are added by hand, add them to the CSV; this script is
only for importing a newer copy of the PDF.
"""

import csv
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "data" / "raw" / "Historical-Records-Crops-2021-2026.pdf"
OUT = ROOT / "data" / "historical-prices.csv"

# The PDF's row names, and the app's id for each (src/data/crops.ts).
VARIETIES = {
    "Rice, Special": "rice-special",
    "Rice, Well Milled": "rice-well-milled",
    "Garlic, Native": "garlic-native",
    "Onion, Red": "onion-red",
    "Calamansi": "cala-regular",
}
DASHES = {"–", "-", "—"}


def main() -> None:
    text = "\n".join(page.extract_text() for page in PdfReader(PDF).pages)
    year = None
    table: dict[str, dict[str, float | None]] = {}   # "2021-01" -> {crop id: price}
    # The text comes out one cell per line, or one table row per line,
    # depending on the PDF. Reading it word by word handles both: a variety's
    # name, then its twelve months.
    cell = re.compile(r"\d+(?:\.\d+)?|[" + "".join(DASHES) + "]")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if re.fullmatch(r"20\d\d", line):
            year = int(line)
            continue
        name = next((n for n in VARIETIES if line == n or line.startswith(n + " ")), None)
        if name is None or year is None:
            continue
        cells = line[len(name):].split()
        while len(cells) < 12 and i < len(lines) and all(cell.fullmatch(c) for c in lines[i].split()):
            cells += lines[i].split()
            i += 1
        if len(cells) != 12 or not all(cell.fullmatch(c) for c in cells):
            sys.exit(f"{year} {name}: expected 12 months, found {len(cells)}: {cells}")
        for m, c in enumerate(cells, start=1):
            price = None if c in DASHES else float(c)
            table.setdefault(f"{year}-{m:02d}", {})[VARIETIES[name]] = price
    if not table:
        sys.exit(f"No price rows found in {PDF.name}")

    ids = list(VARIETIES.values())
    months = sorted(table)
    incomplete = [m for m in months if len(table[m]) != len(ids)]
    if incomplete:
        sys.exit(f"Months missing a variety row: {incomplete}")
    # Drop the months at the end that have no record at all (the rest of the
    # current year).
    while months and all(table[months[-1]][i] is None for i in ids):
        months.pop()

    OUT.parent.mkdir(exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["month", *ids])
        for m in months:
            w.writerow([m, *("" if table[m][i] is None else f"{table[m][i]:.2f}" for i in ids)])
    recorded = sum(table[m][i] is not None for m in months for i in ids)
    print(f"{OUT.relative_to(ROOT)}: {len(months)} months ({months[0]} to {months[-1]}), {recorded} prices")


if __name__ == "__main__":
    main()
