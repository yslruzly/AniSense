import React, { useState } from "react";
import { EmptyState } from "../components/states";
import { Banknote, MapPin, Pencil, Trash2, X, ChevronRight, Calendar, Calculator, Receipt, Plus, CheckCircle, AlertTriangle, Sprout, Tag, Wheat, FlaskConical, User, Tractor, Waves, Package, ShoppingCart, Filter } from "lucide-react";
import { useLang } from "../i18n";
import { Expense, BuyerTransaction } from "../types";
import { EXPENSES } from "../data/expenses";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon, ExpenseIcon } from "../components/icons";
import { PieChart } from "../components/charts/PieChart";
import { MonthlyTrendsChart } from "../components/charts/MonthlyTrendsChart";
import { CropExpenseSummary } from "../components/analytics/CropExpenseSummary";

// ─── Expenses Screen ──────────────────────────────────────────────────────────
export function ExpensesScreen({ onProfile, onBack, farmerCrops, userInitials = "JD", isBuyer = false, buyerTransactions = [] }: { onProfile: () => void; onBack: () => void; farmerCrops: string[]; userInitials?: string; isBuyer?: boolean; buyerTransactions?: BuyerTransaction[] }) {
  const { t, tn } = useLang();
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
  const [form, setForm] = useState(() => ({ description: "", category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], crop: farmerCrops[0] || "Rice" }));
  const [formError, setFormError] = useState("");
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

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

  const calcUseResult = () => {
    setForm(f => ({ ...f, amount: calc.display }));
    setShowCalc(false);
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
    setForm({ description: "", category: "Seeds", amount: "", date: new Date().toISOString().split("T")[0], crop: farmerCrops[0] || "Rice" });
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
      <Hdr icon={<Banknote size={20} color="var(--tanim)" />} title={t("exp_title")} sub={isBuyer ? t("exp_buyer_sub") : t("exp_sub")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll screen-enter">

        {/* ── BUYER: read-only past transactions only ── */}
        {isBuyer && (
          <>
            <div className="exp-hero">
              <div className="exp-total-lbl">{t("exp_total_spent")}</div>
              <div className="exp-total">₱{buyerTransactions.reduce((s, tx) => s + tx.amount, 0).toLocaleString()}</div>
              <div style={{ fontSize: "var(--fs-label)", opacity: .7, marginTop: 4 }}>{buyerTransactions.length} {buyerTransactions.length !== 1 ? t("exp_past_txn") : t("exp_past_txn_one")}</div>
            </div>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="card-title" style={{ margin: 0 }}>{t("exp_purchase_history")}</div>
                <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)" }}>{buyerTransactions.length} {t("exp_items")}</span>
              </div>
              {buyerTransactions.length === 0
                ? <EmptyState
                    icon={<ShoppingCart size={26} aria-hidden="true" />}
                    title={t("state_no_purchases_title")}
                    body={t("state_no_purchases_body")}
                  />
                : [...buyerTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                  <div className="exp-row" key={tx.id}>
                    <div className="exp-ico" style={{ background: "var(--tanim-sk)" }}>
                      <CropIcon crop={tx.crop} size={17} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="exp-desc">{tn(tx.crop)} · {tx.variety}</div>
                      <div className="exp-meta">{tx.kg} kg · {formatDate(tx.date)}</div>
                      <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--tanim)", color: "#fff", fontSize: "var(--fs-label)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tx.sellerInitials}</div>
                        <span style={{ fontWeight: 600 }}>{tx.seller}</span>
                        <span style={{ color: "var(--text-faint)" }}>·</span>
                        <MapPin size={11} color="var(--text-faint)" />
                        <span style={{ color: "var(--text-faint)" }}>{tx.location}</span>
                      </div>
                    </div>
                    <div className="exp-amt">₱{tx.amount.toLocaleString()}</div>
                  </div>
                ))
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

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {farmerCrops.map(c => (
                  <div key={c} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 99, padding: "4px 12px", fontSize: "var(--fs-label)", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <CropIcon crop={c} size={12} /> {tn(c)}
                  </div>
                ))}
              </div>
            </div>

            {/* View mode tabs */}
            <div style={{ display: "flex", gap: 6, background: "var(--paper-alt)", borderRadius: 12, padding: 4 }}>
              {[["all", t("exp_overview")], ["by-crop", t("exp_by_crop")], ["by-date", t("exp_by_month")]].map(([mode, label]) => (
                <button key={mode} onClick={() => setViewMode(mode as typeof viewMode)}
                  style={{
                    flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer",
                    background: viewMode === mode ? "var(--tanim)" : "transparent", color: viewMode === mode ? "#fff" : "var(--text-muted)",
                    transition: "all 0.15s"
                  }}>
                  {label}
                </button>
              ))}
            </div>

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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)" }}>{t("exp_by_specialization")}</div>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", background: "var(--tanim-sk)", padding: "2px 7px", borderRadius: 99, border: "1px solid var(--tanim-sk)", fontWeight: 600 }}>
                      {farmerCrops.join(" · ")}
                    </span>
                  </div>
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
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)" }}>{filtered.length} {t("exp_items")}</span>
                  </div>
                  {filtered.length === 0
                    ? (transactions.length === 0
                        /* Never recorded anything; this is onboarding, so it
                           explains what the screen is for and starts them off. */
                        ? <EmptyState
                            icon={<Banknote size={26} aria-hidden="true" />}
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
                    : filtered.map(e => (
                      <div className="exp-row" key={e.id}>
                        <div className="exp-ico"><ExpenseIcon cat={e.category} size={17} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="exp-desc">{e.description}</div>
                          <div className="exp-meta">{tn(e.category)} · {formatDate(e.date)}</div>
                          <div style={{ fontSize: "var(--fs-label)", color: "var(--tanim)", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                            <CropIcon crop={e.crop} size={12} /> {tn(e.crop)}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="exp-amt">₱{e.amount.toLocaleString()}</div>
                          <button onClick={() => openEdit(e)} style={{ background: "var(--paper-alt)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} color="var(--tanim)" /></button>
                          <button onClick={() => setConfirmDelete(e.id)} style={{ background: "var(--error-sk)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} color="var(--error)" /></button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </>
            )}

            {/* ═══ BY CROP TAB ═══ */}
            {viewMode === "by-crop" && (() => {
              const [activeCrop, setActiveCrop] = [cropFilter, setCropFilter];
              const cropsWithData = farmerCrops.filter(c => transactions.some(e => e.crop === c));
              const allCrops = cropsWithData.length > 0 ? cropsWithData : farmerCrops;

              return (
                <>
                  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                    {allCrops.map((crop, ci) => {
                      const cropTxns = transactions.filter(e => e.crop === crop);
                      const cropAmt = cropTxns.reduce((s, e) => s + e.amount, 0);
                      const pct = total > 0 ? Math.round((cropAmt / total) * 100) : 0;
                      const isActive = activeCrop === crop;
                      const sorted = [...cropTxns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                      return (
                        <div key={crop} style={{ borderBottom: ci < allCrops.length - 1 ? "1px solid var(--paper-alt)" : "none" }}>

                          {/* ── Summary row (tap to expand) ── */}
                          <button onClick={() => setActiveCrop(isActive ? "All Crops" : crop)}
                            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", fontFamily: "inherit", textAlign: "left" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                              <CropIcon crop={crop} size={15} />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text)" }}>{tn(crop)}</span>
                                <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)", marginLeft: 8 }}>{cropTxns.length} {cropTxns.length !== 1 ? t("exp_expenses_many") : t("exp_expense_one")}</span>
                              </div>
                              <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>₱{cropAmt.toLocaleString()}</span>
                              <ChevronRight size={15} color="var(--text-faint)" style={{ transform: isActive ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                            </div>
                            <div style={{ height: 3, background: "var(--paper-alt)", borderRadius: 99 }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "var(--tanim)", borderRadius: 99 }} />
                            </div>
                          </button>

                          {/* ── Expanded expense list ── */}
                          {isActive && sorted.length > 0 && (
                            <div style={{ borderTop: "1px solid var(--paper-alt)", background: "var(--paper-alt)" }}>
                              {sorted.map((e, idx) => (
                                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: idx < sorted.length - 1 ? "1px solid var(--paper-alt)" : "none" }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <ExpenseIcon cat={e.category} size={14} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                      <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)" }}>{tn(e.category)} · {formatDate(e.date)}</span>
                                    </div>
                                  </div>
                                  <span style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)", flexShrink: 0 }}>₱{e.amount.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* ═══ BY MONTH TAB ═══ */}
            {viewMode === "by-date" && (() => {
              const monthMap: Record<string, { total: number; expenses: Expense[] }> = {};
              transactions.forEach(e => {
                const key = new Date(e.date).toLocaleDateString("en-PH", { year: "numeric", month: "long" });
                if (!monthMap[key]) monthMap[key] = { total: 0, expenses: [] };
                monthMap[key].total += e.amount;
                monthMap[key].expenses.push(e);
              });
              const months = Object.entries(monthMap).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
              const maxAmt = Math.max(...months.map(([, v]) => v.total), 1);

              return months.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: 8 }}>
                  <Calendar size={32} color="var(--line-strong)" />
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)" }}>{t("exp_none")}</span>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                  {months.map(([month, { total, expenses: mExps }], i) => {
                    const pct = Math.round((total / maxAmt) * 100);
                    const isOpen = expandedMonth === month;
                    const sorted = [...mExps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    return (
                      <div key={month} style={{ borderBottom: i < months.length - 1 ? "1px solid var(--paper-alt)" : "none" }}>

                        {/* ── Summary row (tap to expand) ── */}
                        <button onClick={() => setExpandedMonth(isOpen ? null : month)}
                          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", fontFamily: "inherit", textAlign: "left" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <Calendar size={15} color="var(--tanim)" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text)" }}>{month}</span>
                              <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)", marginLeft: 8 }}>{mExps.length} {mExps.length !== 1 ? t("exp_expenses_many") : t("exp_expense_one")}</span>
                            </div>
                            <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>₱{total.toLocaleString()}</span>
                            <ChevronRight size={15} color="var(--text-faint)" style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
                          </div>
                          <div style={{ height: 3, background: "var(--paper-alt)", borderRadius: 99 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "var(--tanim)", borderRadius: 99 }} />
                          </div>
                        </button>

                        {/* ── Expanded expense list ── */}
                        {isOpen && (
                          <div style={{ borderTop: "1px solid var(--paper-alt)", background: "var(--paper-alt)" }}>
                            {sorted.map((e, idx) => (
                              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: idx < sorted.length - 1 ? "1px solid var(--paper-alt)" : "none" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#fff", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <ExpenseIcon cat={e.category} size={14} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                    <CropIcon crop={e.crop} size={11} />
                                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)" }}>{tn(e.crop)} · {tn(e.category)} · {formatDate(e.date)}</span>
                                  </div>
                                </div>
                                <span style={{ fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)", flexShrink: 0 }}>₱{e.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div style={{ height: 80 }} />
          </>
        )}
      </div>

      {/* ── Sticky bottom bar (farmer only) ── */}
      {!isBuyer && (
        <div style={{ padding: "10px 14px 14px", background: "#fff", borderTop: "1px solid var(--paper-alt)", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <button className="add-btn" onClick={openAdd}>{t("exp_add")}</button>
          <button onClick={() => { setCalc({ display: "0", prev: null, op: null, fresh: false }); setShowCalc(true); }}
            style={{ width: "100%", padding: "11px", background: "var(--tanim-sk)", border: "2px solid var(--line)", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--tanim)", fontFamily: "inherit" }}>
            <Calculator size={16} color="var(--tanim)" /> {t("exp_calculator")}
          </button>
        </div>
      )}

      {/* Calculator modal */}
      {showCalc && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 60 }} onClick={() => setShowCalc(false)}>
          <div style={{ background: "var(--text)", borderRadius: "22px 22px 0 0", width: "100%", padding: "0 0 28px 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>

            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--text-soft)" }} />
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--tanim-sk)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calculator size={17} color="var(--tanim)" />
                </div>
                <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--paper)" }}>{t("calc_title")}</span>
              </div>
              <button onClick={() => setShowCalc(false)} style={{ background: "var(--ink)", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={15} color="var(--text-faint)" />
              </button>
            </div>

            {/* Display */}
            <div style={{ margin: "0 16px 12px", background: "var(--ink)", borderRadius: 14, padding: "14px 18px" }}>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", fontFamily: "inherit", minHeight: 16 }}>
                {calc.prev && calc.op ? `${parseFloat(calc.prev).toLocaleString("en-PH")} ${calc.op}` : ""}
              </div>
              <div style={{ fontSize: calc.display.length > 9 ? 24 : 36, fontWeight: 900, color: "var(--paper)", textAlign: "right", letterSpacing: -1, fontFamily: "inherit", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "font-size 0.1s" }}>
                {calc.display.endsWith(".") ? `₱${parseFloat(calc.display).toLocaleString("en-PH")}.` : `₱${parseFloat(calc.display).toLocaleString("en-PH", { maximumFractionDigits: 8 })}`}
              </div>
            </div>

            {/* Use result button */}
            <div style={{ margin: "0 16px 10px" }}>
              <button onClick={calcUseResult}
                style={{ width: "100%", padding: "11px", background: "var(--tanim)", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Receipt size={14} /> {t("calc_use")}
              </button>
            </div>

            {/* Keypad */}
            {(() => {
              const rows = [
                ["AC", "%", "⌫", "÷"],
                ["7", "8", "9", "×"],
                ["4", "5", "6", "−"],
                ["1", "2", "3", "+"],
                ["0", ".", "="],
              ];
              const isOp = (k: string) => ["÷","×","−","+"].includes(k);
              const isEq = (k: string) => k === "=";
              const isFunc = (k: string) => ["AC","%","⌫"].includes(k);
              const activeOp = calc.op;
              return (
                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {rows.map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: row.length === 3 ? "2fr 1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8 }}>
                      {row.map(k => {
                        const active = isOp(k) && activeOp === k;
                        return (
                          <button key={k} onClick={() => calcPress(k)}
                            style={{
                              padding: "18px 0",
                              borderRadius: 14,
                              border: active ? "2px solid var(--tanim-sk)" : "2px solid transparent",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontSize: "var(--fs-body)",
                              fontWeight: 800,
                              background: isEq(k) ? "var(--tanim)" : isOp(k) ? (active ? "var(--tanim-deep)" : "var(--tanim-deep)") : isFunc(k) ? "var(--text-soft)" : "var(--ink)",
                              color: isEq(k) ? "#fff" : isOp(k) ? "var(--tanim-sk)" : isFunc(k) ? "var(--line-strong)" : "var(--paper)",
                              boxShadow: isEq(k) ? "0 4px 12px rgba(11,107,65,0.3)" : "none",
                            }}>
                            {k}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete confirmation, farmer only */}
      {!isBuyer && confirmDelete && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: 24, width: "100%" }}>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("exp_delete_title")}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginBottom: 20 }}>{t("exp_delete_sub")}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 13, background: "var(--paper-alt)", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer" }}>{t("cancel")}</button>
              <button onClick={() => deleteEntry(confirmDelete)} style={{ flex: 1, padding: 13, background: "var(--error)", color: "#fff", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer" }}>{t("delete")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal, farmer only */}
      {!isBuyer && showModal && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 50 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", padding: "0 0 28px 0", width: "100%", maxHeight: "93%", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>

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
                      <CropIcon crop={c} size={14} /> {tn(c)}
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

              {/* Amount + Date side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Banknote size={14} color="var(--text-soft)" /> {t("exp_amount")}
                  </div>
                  <input
                    type="number" placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(d => ({ ...d, amount: e.target.value }))}
                    style={{ width: "100%", border: "2px solid var(--line)", borderRadius: 12, padding: "13px 14px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, outline: "none", background: "var(--paper)", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "var(--tanim)"}
                    onBlur={e => e.target.style.borderColor = "var(--line)"}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-soft)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} color="var(--text-soft)" /> {t("exp_date")}
                  </div>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(d => ({ ...d, date: e.target.value }))}
                    style={{ width: "100%", border: "2px solid var(--line)", borderRadius: 12, padding: "13px 14px", fontFamily: "inherit", fontSize: "var(--fs-label)", outline: "none", background: "var(--paper)", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "var(--tanim)"}
                    onBlur={e => e.target.style.borderColor = "var(--line)"}
                  />
                </div>
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
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "14px", background: "var(--paper-alt)", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer", color: "var(--text-soft)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <X size={15} color="var(--text-soft)" /> {t("cancel")}
                </button>
                <button onClick={saveForm} style={{ flex: 2, padding: "14px", background: "var(--tanim)", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(11,107,65,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {editId ? <><CheckCircle size={16} /> {t("save_changes")}</> : <><Plus size={16} /> {t("exp_add_title")}</>}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
