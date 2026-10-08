import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { Sale } from "../../lib/sales";
import { peso } from "../../lib/money";

// ─── My farm at a glance ──────────────────────────────────────────────────────
// Four numbers the farmer can check against their own notebook: years on the
// land, what they sold this month, what is on sale now, and every sale so
// far. Each is worked out from their own records; none is made up. (Their
// rating, from the stars buyers give, is on the profile buyers see.)
//
// Set like a ledger page rather than a row of badges: a 2 × 2 grid split by
// hairlines, the label first and quiet, the number large in ink, and a short
// line under it saying what the number is made of.

const yearsOf = (experience: string) => {
  const n = parseInt(experience, 10);
  return Number.isFinite(n) ? n : 0;
};

export function FarmStats({ experience, sales }: { experience: string; sales: Sale[] }) {
  const { t } = useLang();
  const { listings, isMine } = useMarket();

  const years = yearsOf(experience);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = sales.filter(s => s.date.startsWith(month));
  const mine = listings.filter(isMine);
  const kgListed = mine.reduce((sum, l) => sum + l.kg, 0);
  const sum = (list: Sale[]) => list.reduce((acc, s) => acc + s.amount, 0);
  const count = (n: number) => n === 0 ? t("fs_none_yet") : n === 1 ? t("fs_one_sale") : t("fs_n_sales").replace("{n}", String(n));

  const stats = [
    { lbl: t("fs_years"), val: String(years), sub: years ? t("fs_since").replace("{year}", String(new Date().getFullYear() - years)) : t("fs_years_add") },
    { lbl: t("fs_month"), val: peso(sum(thisMonth)), sub: count(thisMonth.length) },
    { lbl: t("fs_listed"), val: String(mine.length), sub: mine.length ? t("fs_kg").replace("{kg}", kgListed.toLocaleString("en-PH")) : t("fs_nothing_listed") },
    { lbl: t("fs_total"), val: peso(sum(sales)), sub: count(sales.length) },
  ];

  return (
    <dl className="fstat">
      {stats.map(s => (
        <div key={s.lbl} className="fstat-cell">
          <dt className="fstat-lbl">{s.lbl}</dt>
          <dd className="fstat-val">{s.val}</dd>
          <dd className="fstat-sub">{s.sub}</dd>
        </div>
      ))}
    </dl>
  );
}
