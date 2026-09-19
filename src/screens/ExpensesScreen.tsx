import React, { useState } from "react";
import { EmptyState } from "../components/states";
import { PhilippinePeso, MapPin, Pencil, Trash2, X, ChevronRight, Calendar, Calculator, Receipt, Plus, CheckCircle, AlertTriangle, Sprout, Tag, Wheat, FlaskConical, User, Tractor, Waves, Package, ShoppingCart, Filter, Store } from "lucide-react";
import { useLang } from "../i18n";
import { Expense, BuyerTransaction } from "../types";
import { EXPENSES } from "../data/expenses";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon, ExpenseIcon } from "../components/icons";
import { cropPhotoFor } from "../data/cropPhotos";
import { CropEmoji } from "../components/CropEmoji";
import { PieChart } from "../components/charts/PieChart";
import { MonthlyTrendsChart } from "../components/charts/MonthlyTrendsChart";
import { CropExpenseSummary } from "../components/analytics/CropExpenseSummary";
import { Segmented } from "../components/ui/Segmented";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";
import { DateField, localISO } from "../components/ui/DateField";

// ─── Expenses Screen ──────────────────────────────────────────────────────────
export function ExpensesScreen({ onProfile, onBack, farmerCrops, userInitials = "JD", isBuyer = false, buyerTransactions = [] }: { onProfile: () => void; onBack: () => void; farmerCrops: string[]; userInitials?: string; isBuyer?: boolean; buyerTransactions?: BuyerTransaction[] }) {
  const { t, tn, lang } = useLang();
  const ICONS: Record<string, string> = { Seeds: "Seeds", Fertilizer: "Fertilizer", Labor: "Labor", Equipment: "Equipment", Irrigation: "Irrigation", Other: "Other" };
  const cats = ["All", "Seeds", "Fertilizer", "Labor", "Equipment", "Irrigation", "Other"];

  const [filter, setFilter] = useState("All");
  const [cropFilter, setCropFilter] = useState("All Crops");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "by-crop" | "by-date">("all");
  const [transactions, setTransactions] = useState([...EXPENSES]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  // Held so the confirmation still knows which entry it is about while it
  // slides back out — clearing confirmDelete is what closes it.
  const pendingDelete = useRetained(confirmDelete);
  const [form, setForm] = useState(() => ({ description: "", category: "Seeds", amount: "", date: localISO(), crop: farmerCrops[0] || "Rice" }));
  const [formError, setFormError] = useState("");
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
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({ description: e.description, category: e.category, amount: String(e.amount), date: e.date, crop: e.crop || farmerCrops[0] || "Rice" });
    setFormError("");
    setShowModal(true);
  };

  const saveForm = () => {
    if (!form.description.trim()) { setFormError(t("err_desc_required")); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setFormError(t("err_amount")); return; }
    if (editId) {
      setTransactions(t => t.map(e => e.id === editId ? { ...e, description: form.description, category: form.category, amount: Number(form.amount), date: form.date, icon: ICONS[form.category], crop: form.crop } : e));
    } else {
      const newEntry: Expense = { id: Date.now().toString(), description: form.description, category: form.category, amount: Number(form.amount), date: form.date, icon: ICONS[form.category], crop: form.crop };
      setTransactions(t => [newEntry, ...t]);
    }
    setShowModal(false);
  };

  const deleteEntry = (id: string) => {
    setTransactions(t => t.filter(e => e.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="screen">
      <Hdr title={t("exp_title")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className={`scroll screen-enter ${!isBuyer ? "has-dock" : ""}`}>

        {/* ── BUYER: read-only past transactions only ── */}
        {isBuyer && (
          <>
            <div className="exp-hero">
              <div className="exp-total-lbl">{t("exp_total_spent")}</div>
              <div className="exp-total">₱{buyerTransactions.reduce((s, tx) => s + tx.amount, 0).toLocaleString()}</div>
              <div style={{ fontSize: "var(--fs-label)", opacity: .7, marginTop: 4 }}>{buyerTransactions.length} {buyerTransactions.length !== 1 ? t("exp_past_txn") : t("exp_past_txn_one")}</div>
            </div>
            {/* Purchase history. One idea per line, read left to right:
                what you bought, how much of it, who from; the price and the
                day sit together on the right where a receipt puts them.
                Grouped by month, so the date is said once per group instead
                of being repeated on every row. */}
            <div className="card ph-card">
              <div className="ph-head">
                <div className="card-title" style={{ margin: 0 }}>{t("exp_purchase_history")}</div>
                <span className="ph-count">
                  {buyerTransactions.length} {buyerTransactions.length !== 1 ? t("exp_purchases_n") : t("exp_purchase_one")}
                </span>
              </div>
              {buyerTransactions.length === 0
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
                                  <div className="ph-amt">₱{tx.amount.toLocaleString()}</div>
                                  <div className="ph-date">
                                    {new Date(tx.date).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                                  </div>
                                </div>
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

        {/* ── FARMER: full expense management ── */}
        {!isBuyer && (
          <>
            {/* Hero */}
            <div className="exp-hero" style={{ textAlign: "left", padding: "20px 18px" }}>
              <div className="exp-total-lbl">{t("exp_total_month")}</div>
              <div className="exp-total" style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                ₱{thisMonthTotal.toLocaleString()}
                {momChangePct !== null && (
                  <span style={{ fontSize: "var(--fs-label)", fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: momChangePct <= 0 ? "rgba(255,255,255,0.22)" : "rgba(197,90,58,0.35)" }}>
                    {momChangePct <= 0 ? "▼" : "▲"} {Math.abs(momChangePct)}% {t("exp_vs_last_month")}
                  </span>
                )}
              </div>
            </div>

            {/* View mode tabs */}
            <Segmented
              label={t("exp_overview")}
              value={viewMode}
              onChange={setViewMode}
              options={[
                { id: "all" as const, label: t("exp_overview") },
                { id: "by-crop" as const, label: t("exp_by_crop") },
                { id: "by-date" as const, label: t("exp_by_month") },
              ]}
            />

            {/* ═══ OVERVIEW TAB ═══ */}
            {viewMode === "all" && (
              <>
                {/* Pie chart */}
                <div className="card">
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
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)" }}>{t("exp_recent")}</div>
                    <span className="ph-count">{filtered.length} {t("exp_items")}</span>
                  </div>
                  {filtered.length === 0
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
        <div className="screen-dock">
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

      {/* Add/Edit modal, farmer only */}
      <Sheet
        open={!isBuyer && showModal}
        onClose={() => setShowModal(false)}
        className="exp-sheet modal-sheet"
        label={editId ? t("exp_edit_title") : t("exp_add_title")}
      >
        <>
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, marginBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--line)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--tanim-sk)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Receipt size={20} color="var(--tanim)" />
                </div>
                <div>
                  <div style={{ fontSize: "var(--fs-body)", fontWeight: 900, color: "var(--text)" }}>{editId ? t("exp_edit_title") : t("exp_add_title")}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginTop: 1 }}>{editId ? t("exp_edit_sub") : t("exp_add_sub")}</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "var(--paper-alt)", border: "none", borderRadius: 12, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="var(--text-soft)" />
              </button>
            </div>

            <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 20 }}>

              {formError && (
                <div style={{ background: "var(--error-sk)", color: "var(--error)", fontSize: "var(--fs-label)", fontWeight: 600, padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}

              {/* Crop */}
              <div>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sprout size={14} color="var(--text-soft)" /> {t("exp_crop")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {farmerCrops.map(c => (
                    <button key={c} onClick={() => setForm(d => ({ ...d, crop: c }))}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: `2px solid ${form.crop === c ? "var(--tanim)" : "var(--line)"}`, background: form.crop === c ? "var(--tanim-sk)" : "var(--paper)", color: form.crop === c ? "var(--tanim)" : "var(--text-muted)", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer" }}>
                      <CropEmoji crop={c} size={16} /> {tn(c)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Pencil size={14} color="var(--text-soft)" /> {t("exp_desc_lbl")}
                </div>
                <input
                  type="text" placeholder={t("exp_ph_desc")}
                  value={form.description}
                  onChange={e => setForm(d => ({ ...d, description: e.target.value }))}
                  style={{ width: "100%", border: "2px solid var(--line)", borderRadius: 12, padding: "13px 14px", fontFamily: "inherit", fontSize: "var(--fs-label)", outline: "none", background: "var(--paper)", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "var(--tanim)"}
                  onBlur={e => e.target.style.borderColor = "var(--line)"}
                />
              </div>

              {/* Amount */}
              <div>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <PhilippinePeso size={14} color="var(--text-soft)" /> {t("exp_amount")}
                </div>
                <input
                  type="number" inputMode="decimal" placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm(d => ({ ...d, amount: e.target.value }))}
                  style={{ width: "100%", border: "2px solid var(--line)", borderRadius: 12, padding: "13px 14px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, outline: "none", background: "var(--paper)", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "var(--tanim)"}
                  onBlur={e => e.target.style.borderColor = "var(--line)"}
                />
              </div>

              {/* Date: its own full-width row now, since the quick picks and
                  the calendar need the room a half-width column couldn't give. */}
              <div>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} color="var(--text-soft)" /> {t("exp_date")}
                </div>
                <DateField value={form.date} onChange={date => setForm(d => ({ ...d, date }))} />
              </div>

              {/* Category */}
              <div>
                <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag size={14} color="var(--text-soft)" /> {t("exp_category")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {([
                    { label: "Seeds", icon: <Wheat size={20} /> },
                    { label: "Fertilizer", icon: <FlaskConical size={20} /> },
                    { label: "Labor", icon: <User size={20} /> },
                    { label: "Equipment", icon: <Tractor size={20} /> },
                    { label: "Irrigation", icon: <Waves size={20} /> },
                    { label: "Other", icon: <Package size={20} /> },
                  ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => {
                    const active = form.category === label;
                    return (
                      <button key={label} onClick={() => setForm(d => ({ ...d, category: label }))}
                        style={{ padding: "10px 6px", borderRadius: 12, border: `2px solid ${active ? "var(--tanim)" : "var(--line)"}`, background: active ? "var(--tanim-sk)" : "var(--paper)", color: active ? "var(--tanim)" : "var(--text-muted)", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <span style={{ color: active ? "var(--tanim)" : "var(--text-faint)" }}>{icon}</span>
                        {tn(label)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
                <button className="btn-secondary sm row-center" onClick={() => setShowModal(false)} style={{ flex: 1, border: "none" }}>
                  <X size={15} color="var(--text-soft)" /> {t("cancel")}
                </button>
                <button className="btn-primary sm row-center" onClick={saveForm} style={{ flex: 2 }}>
                  {editId ? <><CheckCircle size={16} /> {t("save_changes")}</> : <><Plus size={16} /> {t("exp_add_title")}</>}
                </button>
              </div>

              {/* Delete lives here now, one step in from the list and set apart
                  from Save, so it's findable but never the thing a thumb lands
                  on by accident. It still asks before erasing anything. */}
              {editId && (
                <button className="exp-del-link" onClick={() => { const id = editId; setShowModal(false); setConfirmDelete(id); }}>
                  <Trash2 size={17} strokeWidth={2.2} /> {t("exp_delete_this")}
                </button>
              )}

            </div>
        </>
      </Sheet>
    </div>
  );
}
