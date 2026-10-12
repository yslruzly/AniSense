import React, { useEffect, useRef, useState } from "react";
import { EmptyState, Skeleton, SkeletonMediaRows } from "../components/states";
import { PhilippinePeso, PieChart as PieIcon, CalendarDays, MapPin, Pencil, Trash2, X, ChevronRight, Calendar, Calculator, Receipt, Plus, CheckCircle, AlertTriangle, Sprout, ShoppingCart, Filter, Store, Clock, Check, HandCoins } from "lucide-react";
import { useLang } from "../i18n";
import { Expense, BuyerTransaction } from "../types";
import { useMarket } from "../store/market";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon, ExpenseIcon } from "../components/icons";
import { cropPhotoFor } from "../data/cropPhotos";
import { CropEmoji } from "../components/icons/CropEmoji";
import { PieChart } from "../components/charts/PieChart";
import { MonthlyTrendsChart } from "../components/charts/MonthlyTrendsChart";
import { CropExpenseSummary } from "../components/analytics/CropExpenseSummary";
import { Segmented } from "../components/ui/Segmented";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";
import { DateField, localISO } from "../components/ui/DateField";
import { ProfitCard, estimateFor, spentOn, priceOfCrop } from "../components/expenses/ProfitCard";
import { Sale } from "../lib/sales";
import { costOf, totalSpent } from "../lib/purchases";
import { peso, decimalText } from "../lib/money";
import { haptic } from "../lib/platform";
import { GROW_ART } from "../data/growArt";
import leafMask from "../assets/anisense-leaf-mask.png";
import { PaymentSheet } from "../components/marketplace/PaymentSheet";
import { StarRating } from "../components/ui/StarRating";
import { isNetworkError } from "../lib/cache";

// ─── Expenses Screen ──────────────────────────────────────────────────────────
export function ExpensesScreen({ onProfile, onBack, farmerCrops, userInitials = "JD", isBuyer = false, sales = [] }: { onProfile: () => void; onBack: () => void; farmerCrops: string[]; userInitials?: string; isBuyer?: boolean; sales?: Sale[] }) {
  const { t, tn, lang } = useLang();
  // Expenses and purchases come from the market store: the account's own
  // rows on the database, or the sample data in the demo.
  const market = useMarket();
  // While a real account's first load is on its way, the totals and the
  // lists are drawn in outline: "₱0" and "nothing recorded yet" would both
  // be false until the records are in.
  const busy = market.loadPhase !== "ready";
  const showSkeleton = market.loadPhase === "skeleton";
  const buyerTransactions = market.purchases;
  // The order line whose payment is being written down, by id, so the sheet
  // follows the row if the history is fetched again while it is open.
  const [payingId, setPayingId] = useState<string | null>(null);
  // Ratings. A line can be rated once it is settled on both sides: the farmer
  // confirmed it and the buyer wrote down what they paid. The one that has
  // just become ratable rises in; the one just rated says thank you for a
  // few seconds; one that couldn't be saved says why.
  const settled = (tx: BuyerTransaction) => (tx.status === "confirmed" || tx.status === "completed") && tx.paid !== undefined;
  const [freshRate, setFreshRate] = useState<string | null>(null);
  const [thanked, setThanked] = useState<string | null>(null);
  const [rateError, setRateError] = useState<{ id: string; msg: string } | null>(null);
  const thanksTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(thanksTimer.current), []);
  const rate = async (tx: BuyerTransaction, n: number) => {
    setRateError(null);
    try {
      await market.rateOrder(tx.id, n);
      setThanked(tx.id);
      window.clearTimeout(thanksTimer.current);
      thanksTimer.current = window.setTimeout(() => setThanked(null), 4000);
    } catch (e) {
      setRateError({ id: tx.id, msg: t(isNetworkError(e) ? "err_offline_action" : "ord_save_failed") });
      throw e;
    }
  };
  const firstName = (name: string) => name.split(" ")[0];
  const ICONS: Record<string, string> = { Seeds: "Seeds", Fertilizer: "Fertilizer", Labor: "Labor", Equipment: "Equipment", Irrigation: "Irrigation", Other: "Other" };
  const cats = ["All", "Seeds", "Fertilizer", "Labor", "Equipment", "Irrigation", "Other"];

  const [filter, setFilter] = useState("All");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "by-crop" | "by-date">("all");
  const transactions = market.expenses;
  const [saving, setSaving] = useState(false);
  // Expected harvest per crop, for the estimated profit. Read once from the
  // phone, written back on every change.
  // Expected harvests, kept by the store: on the database for a real
  // account, on this phone in the demo.
  const plans = market.harvestPlans;
  const setPlans = market.setHarvestPlans;
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  // Held so the confirmation still knows which entry it is about while it
  // slides back out — clearing confirmDelete is what closes it.
  const pendingDelete = useRetained(confirmDelete);
  const [form, setForm] = useState(() => ({ description: "", category: "Seeds", amount: "", date: localISO(), crop: farmerCrops[0] || "Rice" }));
  const [formError, setFormError] = useState("");
  // The field that needs an answer: its message sits under it and the form
  // scrolls to it. (formError is the server's answer, said over the button.)
  const [bad, setBad] = useState<null | "amount" | "desc">(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  // Its own state: expanding a crop used to set the Overview crop filter, so
  // Recent Transactions quietly showed one crop after a visit to this tab.
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  // ── Calculator state (single atomic object to avoid stale closure bugs) ──
  const [showCalc, setShowCalc] = useState(false);
  type CalcState = { display: string; prev: string | null; op: string | null; fresh: boolean };
  const [calc, setCalc] = useState<CalcState>({ display: "0", prev: null, op: null, fresh: false });

  const calcPress = (val: string) => {
    setCalc(s => {
      const applyOp = (a: number, op: string, b: number) => {
        const r = op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : b !== 0 ? a / b : 0;
        return parseFloat(r.toFixed(10)).toString();
      };
      if (val === "AC") return { display: "0", prev: null, op: null, fresh: false };
      if (val === "⌫") return { ...s, display: s.display.length > 1 ? s.display.slice(0, -1) : "0" };
      if (val === "%") return { ...s, display: String(parseFloat(s.display) / 100) };
      if (["+", "−", "×", "÷"].includes(val)) {
        // If there's already a pending op and we have a second number, resolve first
        if (s.op && s.prev !== null && !s.fresh) {
          const result = applyOp(parseFloat(s.prev), s.op, parseFloat(s.display));
          return { display: result, prev: result, op: val, fresh: true };
        }
        return { ...s, prev: s.display, op: val, fresh: true };
      }
      if (val === "=") {
        if (!s.prev || !s.op) return s;
        const result = applyOp(parseFloat(s.prev), s.op, parseFloat(s.display));
        return { display: result, prev: null, op: null, fresh: false };
      }
      if (val === ".") {
        if (s.fresh) return { ...s, display: "0.", fresh: false };
        if (s.display.includes(".")) return s;
        return { ...s, display: s.display + "." };
      }
      // Digit
      if (s.fresh || s.display === "0") return { ...s, display: val, fresh: false };
      if (s.display.replace("-", "").length >= 12) return s;
      return { ...s, display: s.display + val };
    });
  };

  // What the calculator would show after "=": a pending "1,200 + 300" counts
  // as 1,500, so Use never takes just the second number by mistake.
  const calcResult = (() => {
    const { prev, op, display, fresh } = calc;
    if (!prev || !op || fresh) return parseFloat(display) || 0;
    const a = parseFloat(prev), b = parseFloat(display);
    const r = op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : b !== 0 ? a / b : 0;
    return parseFloat(r.toFixed(2));
  })();

  // Opens the Add Expense form with the amount already in it. It used to set
  // the amount on a closed form, which the next "Add expense" tap then reset,
  // so the number was silently lost.
  const calcUseResult = () => {
    if (calcResult <= 0) return;
    setShowCalc(false);
    setEditId(null);
    setForm({ description: "", category: "Seeds", amount: String(calcResult), date: localISO(), crop: farmerCrops[0] || "Rice" });
    setFormError("");
    setBad(null);
    setShowModal(true);
  };

  // Filtering logic
  const filtered = transactions.filter(e => {
    const matchCat = filter === "All" || e.category === filter;
    const matchCrop = cropFilter === "All Crops" || e.crop === cropFilter;
    const eDate = new Date(e.date);
    const matchFrom = !dateFrom || eDate >= new Date(dateFrom);
    const matchTo = !dateTo || eDate <= new Date(dateTo);
    return matchCat && matchCrop && matchFrom && matchTo;
  });
  const total = transactions.reduce((s, e) => s + e.amount, 0);
  const thisMonthTotal = (() => {
    const n = new Date();
    return transactions.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
  })();
  const lastMonthTotal = (() => {
    const n = new Date();
    const lm = new Date(n.getFullYear(), n.getMonth() - 1, 1);
    return transactions.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    }).reduce((s, e) => s + e.amount, 0);
  })();
  const momChangePct = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : null;
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  // By-crop breakdown
  const byCrop = farmerCrops.map(crop => {
    const cropTxns = transactions.filter(e => e.crop === crop);
    const amt = cropTxns.reduce((s, e) => s + e.amount, 0);
    return { crop, amt, count: cropTxns.length };
  }).filter(c => c.amt > 0);

  // By-month breakdown
  const byMonth: Record<string, number> = {};
  transactions.forEach(e => {
    const d = new Date(e.date);
    const key = d.toLocaleDateString("en-PH", { year: "numeric", month: "short" });
    byMonth[key] = (byMonth[key] || 0) + e.amount;
  });
  const byMonthArr = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ description: "", category: "Seeds", amount: "", date: localISO(), crop: farmerCrops[0] || "Rice" });
    setFormError("");
    setBad(null);
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({ description: e.description, category: e.category, amount: String(e.amount), date: e.date, crop: e.crop || farmerCrops[0] || "Rice" });
    setFormError("");
    setBad(null);
    setShowModal(true);
  };

  // Saved even with no signal: offline, the entry waits on the phone and
  // goes up by itself when the connection returns. What can still fail is
  // the server turning it down, and then the form stays open and says so.
  // A field that needs an answer: say so under it, bring it into view and
  // put the cursor in it.
  const askFor = (field: "amount" | "desc") => {
    setBad(field);
    haptic.warn();
    const el = (field === "amount" ? amountRef : descRef).current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
    el?.focus({ preventScroll: true });
  };

  const saveForm = async () => {
    if (saving) return;
    setFormError("");
    // In the order the form asks.
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return askFor("amount");
    if (!form.description.trim()) return askFor("desc");
    setBad(null);
    setSaving(true);
    try {
      await market.saveExpense(editId, { description: form.description, category: form.category, amount: Number(form.amount), date: form.date, crop: form.crop });
    } catch {
      setFormError(t("err_expense_failed"));
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteEntry = async (id: string) => {
    try { await market.deleteExpense(id); } catch { /* still listed; the next try can remove it */ }
    setConfirmDelete(null);
  };

  return (
    <div className="screen">
      <Hdr title={t(isBuyer ? "orders_title" : "exp_title")} onBack={onBack} />
      <div className={`scroll screen-enter ${!isBuyer ? "has-dock" : ""}`}>

        {/* ── BUYER: read-only past transactions only ── */}
        {isBuyer && (
          <>
            <div className="exp-hero">
              <div className="exp-total-lbl">{t("exp_total_spent")}</div>
              {busy ? (
                showSkeleton && <Skeleton className="on-ink" w={170} h={36} style={{ margin: "4px auto 0" }} />
              ) : (
                <>
                  <div className="exp-total">{peso(totalSpent(buyerTransactions))}</div>
                  <div style={{ fontSize: "var(--fs-label)", opacity: .7, marginTop: 4 }}>{buyerTransactions.length} {buyerTransactions.length !== 1 ? t("exp_past_txn") : t("exp_past_txn_one")}</div>
                </>
              )}
            </div>
            {/* Purchase history. One idea per line, read left to right:
                what you bought, how much of it, who from; the price and the
                day sit together on the right where a receipt puts them.
                Grouped by month, so the date is said once per group instead
                of being repeated on every row. Under each, where it stands
                with the farmer and the way to write down what was paid: the
                amount on the right is what it cost (lib/purchases.ts), with
                the order's price under it when the two differ. */}
            <div className="card ph-card">
              <div className="ph-head">
                <div className="card-title" style={{ margin: 0 }}>{t("exp_purchase_history")}</div>
                {!busy && (
                  <span className="ph-count">
                    {buyerTransactions.length} {buyerTransactions.length !== 1 ? t("exp_purchases_n") : t("exp_purchase_one")}
                  </span>
                )}
              </div>
              {!busy && buyerTransactions.length > 0 && <p className="ph-note">{t("ph_note")}</p>}
              {busy
                ? (showSkeleton ? <SkeletonMediaRows rows={4} tile={46} label={t("state_loading_records")} /> : null)
                : buyerTransactions.length === 0
                ? <EmptyState
                    icon={<ShoppingCart size={26} aria-hidden="true" />}
                    title={t("state_no_purchases_title")}
                    body={t("state_no_purchases_body")}
                  />
                : (() => {
                  const locale = lang === "tl" ? "fil-PH" : "en-PH";
                  const sorted = [...buyerTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  const groups: { label: string; items: BuyerTransaction[] }[] = [];
                  for (const tx of sorted) {
                    const label = new Date(tx.date).toLocaleDateString(locale, { month: "long", year: "numeric" });
                    const g = groups[groups.length - 1];
                    if (g && g.label === label) g.items.push(tx); else groups.push({ label, items: [tx] });
                  }
                  return (
                    <div className="stagger-list">
                      {groups.map(g => (
                        <section key={g.label} className="ph-group">
                          <h3 className="ph-month">{g.label}</h3>
                          {g.items.map(tx => {
                            const photo = cropPhotoFor(tx.crop, tx.variety);
                            // The variety is the name people use ("Special
                            // Rice"); the crop only adds something when the
                            // variety doesn't already say it ("Well Milled").
                            const title = tx.variety || tn(tx.crop);
                            const saysCrop = tx.variety.toLowerCase().includes(tx.crop.toLowerCase().replace(/(es|s)$/, ""));
                            return (
                              <div className="ph-row" key={tx.id}>
                                <div className="ptx-thumb">
                                  {photo
                                    ? <img src={photo} alt="" loading="lazy" decoding="async" />
                                    : <CropIcon crop={tx.crop} size={22} />}
                                </div>
                                <div className="ph-body">
                                  <div className="ph-title">{title}</div>
                                  <div className="ph-sub">
                                    {!saysCrop && <>{tn(tx.crop)} · </>}{tx.kg} kg · ₱{Math.round(tx.amount / tx.kg)}{t("per_kg_short")}
                                  </div>
                                  <div className="ph-seller">
                                    <Store size={14} strokeWidth={2.2} aria-hidden="true" />
                                    <span>{tx.seller} · {tx.location}</span>
                                  </div>
                                </div>
                                <div className="ph-end">
                                  <div className="ph-amt">{peso(costOf(tx))}</div>
                                  {costOf(tx) !== tx.amount && tx.status !== "cancelled" && (
                                    <div className="ph-was">{t("ph_order_was").replace("{amount}", peso(tx.amount))}</div>
                                  )}
                                  <div className="ph-date">
                                    {new Date(tx.date).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                                  </div>
                                </div>
                                {(tx.status || tx.paid !== undefined) && (
                                  <div className="ph-foot">
                                    {tx.status === "placed"
                                      ? <span className="ph-status is-wait"><Clock size={15} strokeWidth={2.6} aria-hidden="true" /> {t("ph_st_placed")}</span>
                                      : tx.status === "cancelled"
                                        ? <span className="ph-status is-off"><X size={15} strokeWidth={2.6} aria-hidden="true" /> {t("ph_st_cancelled")}</span>
                                        : tx.status
                                          ? <span className="ph-status is-ok"><Check size={15} strokeWidth={2.8} aria-hidden="true" /> {t("ph_st_confirmed")}</span>
                                          : null}
                                    {tx.status !== "cancelled" && (
                                      <button type="button" className={`ph-pay${tx.paid !== undefined ? " is-done" : ""}`} onClick={() => { setFreshRate(null); setPayingId(tx.id); }}
                                        aria-label={`${tx.paid !== undefined ? t("ph_pay_change") : t("ph_pay_record")}: ${title}, ${tx.seller}`}>
                                        {tx.paid !== undefined
                                          ? <><Pencil size={15} strokeWidth={2.4} aria-hidden="true" /> {t("ph_pay_change")}</>
                                          : <><HandCoins size={16} strokeWidth={2.4} aria-hidden="true" /> {t("ph_pay_record")}</>}
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/* Settled on both sides: how was the farmer? Five
                                    stars to tap. Confirmed but not yet paid: a line
                                    saying what comes first. */}
                                {settled(tx) ? (
                                  <div className={`ph-rate${freshRate === tx.id ? " is-new" : ""}${tx.rating ? " is-rated" : ""}`}>
                                    <span className="ph-rate-q" id={`rq-${tx.id}`}>
                                      {t(tx.rating ? "rate_done" : "rate_q").replace("{name}", firstName(tx.seller))}
                                    </span>
                                    <StarRating value={tx.rating ?? 0} labelledBy={`rq-${tx.id}`} onRate={n => rate(tx, n)} />
                                    {thanked === tx.id && <p className="ph-rate-thanks" role="status">{t("rate_thanks")}</p>}
                                    {rateError?.id === tx.id && <p className="ord-err" role="alert">{rateError.msg}</p>}
                                  </div>
                                ) : (tx.status === "confirmed" || tx.status === "completed") && (
                                  <p className="ph-rate-hint">{t("rate_after_pay").replace("{name}", firstName(tx.seller))}</p>
                                )}
                              </div>
                            );
                          })}
                        </section>
                      ))}
                    </div>
                  );
                })()
              }
            </div>
          </>
        )}

        {isBuyer && <PaymentSheet tx={buyerTransactions.find(tx => tx.id === payingId) ?? null} onClose={() => setPayingId(null)}
          onSaved={id => setFreshRate(id)} />}

        {/* ── FARMER: full expense management ── */}
        {!isBuyer && (
          <>
            {/* Hero */}
            <div className="exp-hero" data-tour="exp-month" style={{ textAlign: "left", padding: "20px 18px" }}>
              <div className="exp-total-lbl">{t("exp_total_month")}</div>
              <div className="exp-total" style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                {busy ? (showSkeleton && <Skeleton className="on-ink" w={170} h={36} />) : <>₱{thisMonthTotal.toLocaleString()}</>}
                {!busy && momChangePct !== null && (
                  <span style={{ fontSize: "var(--fs-label)", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: momChangePct <= 0 ? "rgba(255,255,255,0.22)" : "rgba(197,90,58,0.35)" }}>
                    {momChangePct <= 0 ? "▼" : "▲"} {Math.abs(momChangePct)}% {t("exp_vs_last_month")}
                  </span>
                )}
              </div>
            </div>

            {/* Money out is only half of it: what the crops are worth and what
                they actually sold for sit directly under the month's spending. */}
            <ProfitCard transactions={transactions} sales={sales} plans={plans} onPlans={setPlans} farmerCrops={farmerCrops} />

            {/* View mode tabs */}
            <Segmented
              tour="exp-views"
              label={t("exp_overview")}
              value={viewMode}
              onChange={setViewMode}
              options={[
                { id: "all" as const, label: t("exp_overview"), icon: <PieIcon size={17} strokeWidth={2.4} /> },
                { id: "by-crop" as const, label: t("exp_by_crop"), icon: <Sprout size={17} strokeWidth={2.4} /> },
                { id: "by-date" as const, label: t("exp_by_month"), icon: <CalendarDays size={17} strokeWidth={2.4} /> },
              ]}
            />

            {/* ═══ OVERVIEW TAB ═══ */}
            {viewMode === "all" && (
              <>
                {/* Pie chart */}
                <div className="card" data-tour="exp-chart">
                  <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{t("exp_breakdown")}</div>
                  <PieChart transactions={transactions} />
                </div>

                {/* Crop specialization summary */}
                <div className="card">
                  <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>{t("exp_by_specialization")}</div>
                  <CropExpenseSummary transactions={transactions} farmerCrops={farmerCrops} />
                </div>

                {/* Monthly stacked chart */}
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)" }}>{t("exp_monthly_breakdown")}</div>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)" }}>{t("exp_per_crop_stacked")}</span>
                  </div>
                  <MonthlyTrendsChart transactions={transactions} farmerCrops={farmerCrops} />
                </div>

                {/* Recent transactions */}
                <div className="card" data-tour="exp-list">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)" }}>{t("exp_recent")}</div>
                    {!busy && <span className="ph-count">{filtered.length} {t("exp_items")}</span>}
                  </div>
                  {busy
                    ? (showSkeleton ? <SkeletonMediaRows rows={5} tile={44} label={t("state_loading_records")} /> : null)
                    : filtered.length === 0
                    ? (transactions.length === 0
                        /* Never recorded anything; this is onboarding, so it
                           explains what the screen is for and starts them off. */
                        ? <EmptyState
                            icon={<PhilippinePeso size={26} aria-hidden="true" />}
                            title={t("state_no_expenses_title")}
                            body={t("state_no_expenses_body")}
                            action={t("state_add_first_expense")}
                            onAction={openAdd}
                          />
                        /* Has data, filtered it away: a dead end unless we
                           hand back the way out. Reusing the copy above would
                           tell a farmer with 40 records that he has none. */
                        : <EmptyState
                            icon={<Filter size={26} aria-hidden="true" />}
                            title={t("state_no_filtered_exp_title")}
                            body={t("state_no_filtered_exp_body")}
                            action={t("state_show_all")}
                            onAction={() => { setFilter("All"); setCropFilter("All Crops"); }}
                          />
                      )
                    : (() => {
                      // Newest first, grouped by month: the date is said once
                      // per group, and each row only needs the day.
                      const locale = lang === "tl" ? "fil-PH" : "en-PH";
                      const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                      const groups: { label: string; items: Expense[] }[] = [];
                      for (const e of sorted) {
                        const label = new Date(e.date).toLocaleDateString(locale, { month: "long", year: "numeric" });
                        const g = groups[groups.length - 1];
                        if (g && g.label === label) g.items.push(e); else groups.push({ label, items: [e] });
                      }
                      return (
                        <div className="stagger-list">
                          {groups.map(g => (
                            <section key={g.label} className="ph-group">
                              <h3 className="ph-month">{g.label}</h3>
                              {/* The whole row opens the entry. Edit and delete
                                  used to sit on every line as two 28px squares,
                                  crowding the text and leaving delete one slip
                                  away; both now live inside the entry. */}
                              {g.items.map(e => (
                                <button
                                  key={e.id}
                                  className="ph-row is-tap"
                                  onClick={() => openEdit(e)}
                                  aria-label={`${t("exp_edit_title")}: ${e.description}, ₱${e.amount.toLocaleString()}`}
                                >
                                  <span className="exp-tile"><ExpenseIcon cat={e.category} size={20} color="var(--text-soft)" /></span>
                                  <span className="ph-body">
                                    <span className="ph-title">{e.description}</span>
                                    <span className="ph-sub">{tn(e.category)} · {tn(e.crop)}</span>
                                  </span>
                                  <span className="ph-end">
                                    <span className="ph-amt">₱{e.amount.toLocaleString()}</span>
                                    <span className="ph-date">{new Date(e.date).toLocaleDateString(locale, { month: "short", day: "numeric" })}</span>
                                  </span>
                                  <ChevronRight size={18} className="ph-chev" aria-hidden="true" />
                                </button>
                              ))}
                            </section>
                          ))}
                        </div>
                      );
                    })()
                  }
                </div>
              </>
            )}

            {/* ═══ BY CROP TAB ═══ */}
            {viewMode === "by-crop" && (() => {
              const locale = lang === "tl" ? "fil-PH" : "en-PH";
              const thisYear = new Date().getFullYear();
              const cropsWithData = farmerCrops.filter(c => transactions.some(e => e.crop === c));
              const allCrops = (cropsWithData.length > 0 ? cropsWithData : farmerCrops)
                .map(crop => {
                  const txns = transactions.filter(e => e.crop === crop);
                  return { crop, txns, amt: txns.reduce((s, e) => s + e.amount, 0) };
                })
                // Biggest spend first: the crop that costs most is the one a
                // farmer opens this tab to look at.
                .sort((a, b) => b.amt - a.amt);

              return (
                <div className="mo-list stagger-list">
                  {allCrops.map(({ crop, txns, amt }) => {
                    const share = total > 0 ? amt / total : 0;
                    const pct = Math.round(share * 100);
                    const isOpen = expandedCrop === crop;
                    const sorted = [...txns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const key = crop.replace(/\s+/g, "-").toLowerCase();
                    return (
                      <section key={crop} className={`mo-item ${isOpen ? "open" : ""}`}>
                        {/* Same header as By Month: crop and total, then the
                            count with its share of all spending, then the bar
                            drawn to that share. */}
                        <button
                          className="mo-head"
                          onClick={() => setExpandedCrop(isOpen ? null : crop)}
                          aria-expanded={isOpen}
                          aria-controls={`crop-${key}`}
                          disabled={txns.length === 0}
                        >
                          <span className="mo-top">
                            <span className="mo-name">{tn(crop)}</span>
                            <span className="mo-total">₱{amt.toLocaleString()}</span>
                          </span>
                          <span className="mo-sub">
                            <span>
                              {txns.length} {txns.length !== 1 ? t("exp_expenses_many") : t("exp_expense_one")}
                              {total > 0 && <> · {pct}%</>}
                            </span>
                            {txns.length > 0 && <ChevronRight size={18} className="mo-chev" aria-hidden="true" />}
                          </span>
                          <span className="mo-bar" aria-hidden="true">
                            <span className="mo-fill" style={{ transform: `scaleX(${share})` }} />
                          </span>
                        </button>

                        <div className="mo-acc" id={`crop-${key}`} role="region" aria-label={tn(crop)} {...(isOpen ? {} : { inert: "" })}>
                          <div className="mo-acc-in">
                            {sorted.map(e => {
                              const d = new Date(e.date);
                              return (
                                <button
                                  key={e.id}
                                  className="ph-row is-tap no-tile"
                                  onClick={() => openEdit(e)}
                                  aria-label={`${t("exp_edit_title")}: ${e.description}, ₱${e.amount.toLocaleString()}`}
                                >
                                  <span className="ph-body">
                                    <span className="ph-title">{e.description}</span>
                                    <span className="ph-sub">{tn(e.category)}</span>
                                  </span>
                                  <span className="ph-end">
                                    <span className="ph-amt">₱{e.amount.toLocaleString()}</span>
                                    {/* The year only when it isn't this one:
                                        short enough to never wrap. */}
                                    <span className="ph-date">
                                      {d.toLocaleDateString(locale, d.getFullYear() === thisYear
                                        ? { month: "short", day: "numeric" }
                                        : { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                  </span>
                                  <ChevronRight size={18} className="ph-chev" aria-hidden="true" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              );
            })()}

            {/* ═══ BY MONTH TAB ═══ */}
            {viewMode === "by-date" && (() => {
              // Keyed by YYYY-MM so sorting never depends on parsing a
              // translated month name; the label is formatted separately.
              const locale = lang === "tl" ? "fil-PH" : "en-PH";
              const monthMap: Record<string, { label: string; total: number; expenses: Expense[] }> = {};
              transactions.forEach(e => {
                const d = new Date(e.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                if (!monthMap[key]) monthMap[key] = { label: d.toLocaleDateString(locale, { year: "numeric", month: "long" }), total: 0, expenses: [] };
                monthMap[key].total += e.amount;
                monthMap[key].expenses.push(e);
              });
              const months = Object.entries(monthMap).sort((a, b) => b[0].localeCompare(a[0]));
              const maxAmt = Math.max(...months.map(([, v]) => v.total), 1);

              return months.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 8 }}>
                  <Calendar size={32} color="var(--line-strong)" />
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)" }}>{t("exp_none")}</span>
                </div>
              ) : (
                <div className="mo-list stagger-list">
                  {months.map(([key, { label, total, expenses: mExps }]) => {
                    const share = total / maxAmt;
                    const isOpen = expandedMonth === key;
                    const sorted = [...mExps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return (
                      <section key={key} className={`mo-item ${isOpen ? "open" : ""}`}>
                        {/* Month header: name and total on one line, count
                            and chevron on the next, the bar underneath. No
                            icons, so nothing competes with the numbers. */}
                        <button
                          className="mo-head"
                          onClick={() => setExpandedMonth(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          aria-controls={`mo-${key}`}
                        >
                          <span className="mo-top">
                            <span className="mo-name">{label}</span>
                            <span className="mo-total">₱{total.toLocaleString()}</span>
                          </span>
                          <span className="mo-sub">
                            <span>{mExps.length} {mExps.length !== 1 ? t("exp_expenses_many") : t("exp_expense_one")}</span>
                            <ChevronRight size={18} className="mo-chev" aria-hidden="true" />
                          </span>
                          {/* Bar length is this month against the biggest
                              month, so the heavy months stand out at a glance. */}
                          <span className="mo-bar" aria-hidden="true">
                            <span className="mo-fill" style={{ transform: `scaleX(${share})` }} />
                          </span>
                        </button>

                        {/* Always mounted, height animated open and shut, so
                            the months below glide instead of jumping. */}
                        <div className="mo-acc" id={`mo-${key}`} role="region" aria-label={label} {...(isOpen ? {} : { inert: "" })}>
                          <div className="mo-acc-in">
                            {sorted.map(e => (
                              <button
                                key={e.id}
                                className="ph-row is-tap no-tile"
                                onClick={() => openEdit(e)}
                                aria-label={`${t("exp_edit_title")}: ${e.description}, ₱${e.amount.toLocaleString()}`}
                              >
                                <span className="ph-body">
                                  <span className="ph-title">{e.description}</span>
                                  <span className="ph-sub">{tn(e.crop)} · {tn(e.category)}</span>
                                </span>
                                <span className="ph-end">
                                  <span className="ph-amt">₱{e.amount.toLocaleString()}</span>
                                  <span className="ph-date">{new Date(e.date).toLocaleDateString(locale, { month: "short", day: "numeric" })}</span>
                                </span>
                                <ChevronRight size={18} className="ph-chev" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              );
            })()}

          </>
        )}
      </div>

      {/* ── Sticky bottom bar (farmer only) ── */}
      {!isBuyer && (
        <div className="screen-dock" data-tour="exp-add">
          <button className="add-btn" onClick={openAdd}>{t("exp_add")}</button>
          <button onClick={() => { setCalc({ display: "0", prev: null, op: null, fresh: false }); setShowCalc(true); }}
            style={{ width: "100%", padding: "11px", background: "var(--tanim-sk)", border: "2px solid var(--line)", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--tanim)", fontFamily: "inherit" }}>
            <Calculator size={16} color="var(--tanim)" /> {t("exp_calculator")}
          </button>
        </div>
      )}

      {/* Calculator modal */}
      <Sheet open={showCalc} onClose={() => setShowCalc(false)} className="calc-sheet" label={t("calc_title")}>
        <>
            <div className="calc-grab" aria-hidden="true" />

            <div className="calc-head">
              <div className="calc-title">
                <span className="calc-title-ico"><Calculator size={18} /></span>
                {t("calc_title")}
              </div>
              <button className="calc-close" onClick={() => setShowCalc(false)} aria-label={t("close")}>
                <X size={20} strokeWidth={2.4} />
              </button>
            </div>

            {/* Display: the running sum in grey, the number big. The number
                shrinks as it grows so it never cuts off, and reads out on
                change for screen readers. */}
            <div className="calc-display">
              <div className="calc-expr">
                {calc.prev && calc.op ? `${parseFloat(calc.prev).toLocaleString("en-PH")} ${calc.op}` : ""}
              </div>
              <div className="calc-num" aria-live="polite" style={{ fontSize: calc.display.length > 11 ? 30 : calc.display.length > 8 ? 38 : 48 }}>
                <small>₱</small>
                {calc.display.endsWith(".") ? `${parseFloat(calc.display).toLocaleString("en-PH")}.` : parseFloat(calc.display).toLocaleString("en-PH", { maximumFractionDigits: 8 })}
              </div>
            </div>

            {/* Keypad: the standard phone-calculator layout, so nobody has to
                look for a key. 0 spans two columns as it does everywhere. */}
            {(() => {
              const keys = [
                "AC", "%", "⌫", "÷",
                "7", "8", "9", "×",
                "4", "5", "6", "−",
                "1", "2", "3", "+",
                "0", ".", "=",
              ];
              const isOp = (k: string) => ["÷", "×", "−", "+"].includes(k);
              const isFunc = (k: string) => ["AC", "%", "⌫"].includes(k);
              const label: Record<string, string> = { "⌫": t("delete"), "AC": "AC" };
              return (
                <div className="calc-pad">
                  {keys.map(k => {
                    const cls = ["calc-key",
                      isOp(k) ? "op" : "", isFunc(k) ? "fn" : "", k === "=" ? "eq" : "",
                      k === "0" ? "span2" : "",
                      isOp(k) && calc.op === k && calc.fresh ? "on" : "",
                    ].filter(Boolean).join(" ");
                    return (
                      // .calc-key carries the press feedback. A keypad is the
                      // one control where a key that does not move under the
                      // thumb is read as a missed tap, and the user presses it
                      // again — which on a calculator means a wrong number.
                      <button key={k} className={cls} onClick={() => calcPress(k)} aria-label={label[k]}>
                        {k}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Use sits under the keypad, in the thumb zone, where the sum ends.
                It carries the amount it will use, and takes a pending sum
                ("1,200 + 300") as its total. */}
            <button className="calc-use" onClick={calcUseResult} disabled={calcResult <= 0}>
              <Receipt size={18} strokeWidth={2.2} />
              {t("calc_use")}{calcResult > 0 && <> · ₱{calcResult.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</>}
            </button>
        </>
      </Sheet>

      {/* Delete confirmation, farmer only */}
      <Sheet
        open={!isBuyer && !!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        className="confirm-sheet sm"
        label={t("exp_delete_title")}
      >
        <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("exp_delete_title")}</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginBottom: 20 }}>{t("exp_delete_sub")}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary sm" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>{t("cancel")}</button>
          <button className="btn-danger sm" onClick={() => pendingDelete && deleteEntry(pendingDelete)} style={{ flex: 1 }}>{t("delete")}</button>
        </div>
      </Sheet>

      {/* Add / Edit expense, farmer only. The same sheet as Post your crops:
          the green header held at the top with the way out, white cards
          for the questions, and the button held at the foot with what the
          cost does to the crop's profit. The amount comes first and largest:
          it's the one thing every expense has, and what's looked for later. */}
      <Sheet
        open={!isBuyer && showModal}
        onClose={() => setShowModal(false)}
        className="exp-sheet modal-sheet"
        label={editId ? t("exp_edit_title") : t("exp_add_title")}
      >
        <header className="sf-head">
          <img className="sf-mark" src={leafMask} alt="" aria-hidden="true" />
          <div className="sf-head-txt">
            <h2 className="sf-title">{editId ? t("exp_edit_title") : t("exp_add_title")}</h2>
            <p className="sf-sub">{editId ? t("exp_edit_sub") : t("exp_add_sub")}</p>
          </div>
          <button type="button" className="sf-x" onClick={() => setShowModal(false)} aria-label={t("close")}>
            <X size={22} strokeWidth={2.4} />
          </button>
        </header>

        <div className="sf-body">
          {/* 1 ── How much: big, the peso sign in the field. */}
          <section className="sf-sec" aria-labelledby="ex-amount-t">
            <h3 className="sf-sec-t" id="ex-amount-t"><span className="sf-n" aria-hidden="true">1</span>{t("ex_sec_amount")}</h3>
            <div className={`sf-field${bad === "amount" ? " bad" : ""}`} onClick={() => amountRef.current?.focus()}>
              <span className="sf-pre" aria-hidden="true">₱</span>
              <input id="ex-amount" ref={amountRef} type="text" inputMode="decimal" autoComplete="off" maxLength={10} placeholder="0"
                value={form.amount} aria-labelledby="ex-amount-t" aria-invalid={bad === "amount" || undefined}
                aria-describedby={bad === "amount" ? "ex-amount-err" : undefined}
                onChange={e => { setForm(d => ({ ...d, amount: decimalText(e.target.value) })); if (bad === "amount") setBad(null); }} />
            </div>
            {bad === "amount" && <p className="sf-err" id="ex-amount-err" role="alert"><AlertTriangle size={16} strokeWidth={2.4} aria-hidden="true" /> {t("err_amount")}</p>}
          </section>

          {/* 2 ── What for: the kind, as six tiles, then the words. */}
          <section className="sf-sec" aria-labelledby="ex-what-t">
            <h3 className="sf-sec-t" id="ex-what-t"><span className="sf-n" aria-hidden="true">2</span>{t("ex_sec_what")}</h3>
            <div className="sf-tiles" role="group" aria-labelledby="ex-what-t">
              {["Seeds", "Fertilizer", "Labor", "Equipment", "Irrigation", "Other"].map(cat => {
                const on = form.category === cat;
                return (
                  <button key={cat} type="button" className={`sf-tile${on ? " on" : ""}`} aria-pressed={on}
                    onClick={() => { haptic.select(); setForm(d => ({ ...d, category: cat })); }}>
                    <span className="sf-tile-ico"><ExpenseIcon cat={cat} size={22} color="currentColor" /></span>
                    <span className="sf-tile-n">{tn(cat)}</span>
                    <span className="sf-tick" aria-hidden="true"><Check size={12} strokeWidth={3.6} /></span>
                  </button>
                );
              })}
            </div>
            <div className="sf-group">
              <label className="sf-lbl" htmlFor="ex-desc">{t("exp_desc_lbl")}</label>
              <div className={`sf-field is-text${bad === "desc" ? " bad" : ""}`} onClick={() => descRef.current?.focus()}>
                <input id="ex-desc" ref={descRef} type="text" autoComplete="off" enterKeyHint="done" placeholder={t("exp_ph_desc")}
                  value={form.description} aria-invalid={bad === "desc" || undefined} aria-describedby={bad === "desc" ? "ex-desc-err" : undefined}
                  onChange={e => { setForm(d => ({ ...d, description: e.target.value })); if (bad === "desc") setBad(null); }} />
              </div>
              {bad === "desc" && <p className="sf-err" id="ex-desc-err" role="alert"><AlertTriangle size={16} strokeWidth={2.4} aria-hidden="true" /> {t("err_desc_required")}</p>}
            </div>
          </section>

          {/* 3 ── Which crop, and when: the farmer's own crops, by their
              drawings; then the day, today and yesterday one tap each. */}
          <section className="sf-sec" aria-labelledby="ex-crop-t">
            <h3 className="sf-sec-t" id="ex-crop-t"><span className="sf-n" aria-hidden="true">3</span>{t("ex_sec_crop")}</h3>
            <div className="sf-group">
              <div className="sf-lbl" id="ex-crop-l">{t("exp_crop")}</div>
              <div className="sf-chips" role="group" aria-labelledby="ex-crop-l">
                {farmerCrops.map(c => {
                  const on = form.crop === c;
                  const art = GROW_ART[c];
                  return (
                    <button key={c} type="button" className={`sf-chip has-pic${on ? " on" : ""}`} aria-pressed={on}
                      onClick={() => { haptic.select(); setForm(d => ({ ...d, crop: c })); }}>
                      <span className="sf-chip-pic" aria-hidden="true">{art ? <img src={art} alt="" draggable={false} /> : <CropIcon crop={c} size={18} />}</span>
                      {tn(c)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="sf-group">
              <div className="sf-lbl">{t("exp_date")}</div>
              <DateField value={form.date} onChange={date => setForm(d => ({ ...d, date }))} />
            </div>
          </section>

          {/* Delete lives here, one step in from the list and well away from
              Save, so it's findable but never the thing a thumb lands on by
              accident. It still asks before erasing anything. */}
          {editId && (
            <button className="exp-del-link" onClick={() => { const id = editId; setShowModal(false); setConfirmDelete(id); }}>
              <Trash2 size={17} strokeWidth={2.2} /> {t("exp_delete_this")}
            </button>
          )}
        </div>

        {/* The foot, held: once there's an amount, what it does to the
            crop's estimated profit (worked out as it's typed, so the cost
            is seen against the harvest it's for), then the button. */}
        <footer className="sf-foot">
          {(() => {
            const amt = Number(form.amount) || 0;
            if (amt <= 0) return null;
            const base = spentOn(transactions.filter(e => e.id !== editId), form.crop);
            const est = estimateFor(form.crop, plans, base + amt);
            return (
              <p className={`pf-preview sf-note ${est === null ? "" : est < 0 ? "neg" : "pos"}`}>
                {est === null
                  ? t(priceOfCrop(form.crop) > 0 ? "pf_set_hint" : "pf_no_price_hint").replace("{crop}", tn(form.crop))
                  : t("pf_after").replace("{crop}", tn(form.crop)).replace("{amount}", `${est < 0 ? "−" : ""}₱${Math.abs(Math.round(est)).toLocaleString("en-PH")}`)}
              </p>
            );
          })()}
          {formError && (
            <p className="sf-err sf-err-save" role="alert"><AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" /> {formError}</p>
          )}
          <button type="button" className="btn-primary sf-post row-center" onClick={saveForm} disabled={saving} aria-busy={saving}>
            {saving ? t("save_saving") : editId ? <><CheckCircle size={18} /> {t("save_changes")}</> : <><Plus size={18} strokeWidth={2.6} /> {t("exp_add_title")}</>}
          </button>
        </footer>
      </Sheet>
    </div>
  );
}
