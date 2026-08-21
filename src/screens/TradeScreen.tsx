import React, { useState } from "react";
import { ShoppingCart, Plus, Search, Pencil, Trash2, ChevronRight, Package, Calendar, Star, MapPin, Phone, ShoppingBag, CreditCard, AlertTriangle, Wheat, Sprout } from "lucide-react";
import { useLang } from "../i18n";
import { UserRole, CartItem, SellerDetail } from "../types";
import { LISTINGS, SELLER_DETAILS } from "../data/marketplace";
import { CROP_FILTER_MAP, CROP_CATEGORIES, ALL_RICE_NAMES, RICE_VARIETY_LIST } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";

// ─── Trade / Marketplace Screen ───────────────────────────────────────────────
export function TradeScreen({ onProfile, onBack, userInitials = "JD", userRole }: { onProfile: () => void; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, tn } = useLang();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Crops");
  const [variety, setVariety] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [listings, setListings] = useState([...LISTINGS]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ crop: "Special Rice", variety: "", desc: "", pricePerKg: "", kg: "", location: "" });

  // ── Cart state ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [checkoutDone, setCheckoutDone] = useState(false);

  // ── Seller detail state ──
  const [sellerDetail, setSellerDetail] = useState<SellerDetail | null>(null);

  // When category changes, reset variety
  const selectCategory = (cat: string) => { setCategory(cat); setVariety("All"); };

  // ── Cart helpers ──
  const getQty = (id: string) => qtyMap[id] ?? 1;
  const setQty = (id: string, v: number, max: number) => setQtyMap(m => ({ ...m, [id]: Math.max(1, Math.min(v, max)) }));
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.qty * c.pricePerKg, 0);
  const isInCart = (id: string) => cart.some(c => c.listingId === id);

  const addToCart = (l: typeof LISTINGS[0]) => {
    const qty = getQty(l.id);
    setCart(prev => {
      const existing = prev.find(c => c.listingId === l.id);
      if (existing) {
        return prev.map(c => c.listingId === l.id ? { ...c, qty: Math.min(c.qty + qty, l.kg) } : c);
      }
      return [...prev, { listingId: l.id, crop: l.crop, variety: l.variety, pricePerKg: l.pricePerKg, qty, seller: l.seller, sellerInitials: l.sellerInitials, location: l.location, maxKg: l.kg }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.listingId !== id));
  const updateCartQty = (id: string, qty: number) => setCart(prev => prev.map(c => c.listingId === id ? { ...c, qty: Math.max(1, Math.min(qty, c.maxKg)) } : c));

  const handleCheckout = () => {
    setCart([]);
    setShowCart(false);
    setCheckoutDone(true);
    setTimeout(() => setCheckoutDone(false), 3000);
  };

  // Determine which listings to show
  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.crop.toLowerCase().includes(q) || l.seller.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (category === "All Crops") return true;
    if (category === "Rice") {
      const isRice = ALL_RICE_NAMES.has(l.crop) || RICE_VARIETY_LIST.includes(l.crop);
      if (!isRice) return false;
      return variety === "All" || l.crop === variety || l.variety === variety;
    }
    const vars = CROP_FILTER_MAP[category] || [];
    const matchCat = vars.includes(l.crop) || l.crop === category;
    if (!matchCat) return false;
    return variety === "All" || l.crop === variety || l.variety === variety;
  });

  const avgPrice = listings.length ? Math.round(listings.reduce((s, l) => s + l.pricePerKg, 0) / listings.length) : 0;
  const totalKg = listings.reduce((s, l) => s + l.kg, 0);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.pricePerKg - b.pricePerKg;
    if (sortBy === "price-desc") return b.pricePerKg - a.pricePerKg;
    if (sortBy === "rating") return b.rating - a.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const openPost = () => {
    setEditId(null);
    setForm({ crop: "Special Rice", variety: "", desc: "", pricePerKg: "", kg: "", location: "" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (l: typeof LISTINGS[0]) => {
    setEditId(l.id);
    setForm({ crop: l.crop, variety: l.variety, desc: l.desc, pricePerKg: String(l.pricePerKg), kg: String(l.kg), location: l.location });
    setFormError("");
    setShowModal(true);
  };

  const saveForm = () => {
    if (!form.desc.trim()) { setFormError(t("err_desc_required")); return; }
    if (!form.pricePerKg || isNaN(Number(form.pricePerKg)) || Number(form.pricePerKg) <= 0) { setFormError(t("err_valid_price")); return; }
    if (!form.kg || isNaN(Number(form.kg)) || Number(form.kg) <= 0) { setFormError(t("err_valid_qty")); return; }
    if (!form.location.trim()) { setFormError(t("err_loc_required")); return; }

    if (editId) {
      setListings(ls => ls.map(l => l.id === editId ? { ...l, crop: form.crop, variety: form.variety, desc: form.desc, pricePerKg: Number(form.pricePerKg), kg: Number(form.kg), location: form.location } : l));
    } else {
      const newListing: typeof LISTINGS[0] = {
        id: Date.now().toString(), crop: form.crop, variety: form.variety, desc: form.desc,
        pricePerKg: Number(form.pricePerKg), kg: Number(form.kg),
        date: new Date().toISOString().split("T")[0],
        seller: "Juan Dela Cruz", sellerInitials: userInitials, rating: 5.0, location: form.location,
      };
      setListings(ls => [newListing, ...ls]);
    }
    setShowModal(false);
  };

  const deleteListing = (id: string) => {
    setListings(ls => ls.filter(l => l.id !== id));
    setConfirmDelete(null);
  };

  // Varieties for sub-row
  const subVarieties = category !== "All Crops" ? CROP_FILTER_MAP[category] || [] : [];

  return (
    <div className="screen">
      <Hdr icon={<ShoppingCart size={20} color="var(--tanim)" />} title={t("trade_title")} sub="Nueva Ecija" onProfile={onProfile} onBack={onBack} userInitials={userInitials}
        extra={userRole === "buyer" ? (
          <button onClick={() => setShowCart(true)} className="cart-badge-wrap cart-btn-icon">
            <ShoppingCart size={17} color="var(--tanim)" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        ) : undefined}
      />
      <div className="scroll screen-enter">
        <div className="mp-title-row">
          <div>
            <div className="mp-title">{t("trade_marketplace")}</div>
            <div className="mp-sub">{t("trade_sub")}</div>
          </div>
          {userRole !== "buyer" && (
            <button onClick={openPost} style={{ background: "var(--tanim)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, boxShadow: "0 2px 8px rgba(11,107,65,0.25)" }}>
              <Plus size={20} color="#fff" /> {t("trade_sell")}
            </button>
          )}
        </div>

        <div className="search-box" style={{ padding: "13px 16px", borderRadius: 12 }}>
          <Search size={18} color="var(--text-faint)" />
          <input placeholder={t("trade_search_ph")} value={search} onChange={e => setSearch(e.target.value)}
            style={{ fontSize: "var(--fs-label)" }} />
        </div>

        {/* ── Filter Row ── */}
        <div className="mp-filter-row">

          {/* Section label */}
          <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 2 }}>
            {t("trade_select_category")}
          </div>

          {/* Row 1: Crop category grid */}
          <div className="cat-tabs">
            {CROP_CATEGORIES.map(cat => (
              <button key={cat} className={`cat-tab ${category === cat ? "active" : ""}`} onClick={() => selectCategory(cat)}>
                <div className="cat-tab-ico">
                  {cat === "All Crops"
                    ? <Wheat size={20} color={category === cat ? "var(--tanim)" : "var(--text-muted)"} />
                    : <CropIcon crop={cat} size={20} />
                  }
                </div>
                <span>{cat === "All Crops" ? t("all") : tn(cat)}</span>
              </button>
            ))}
          </div>

          {/* Row 2: Variety grid, only when category selected */}
          {subVarieties.length > 0 && (
            <>
              <div style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--text-muted)", marginTop: 4 }}>
                {t("trade_select_variety")} · {tn(category)}
              </div>
              <div className="var-tabs">
                <button className={`var-tab ${variety === "All" ? "active" : ""}`} onClick={() => setVariety("All")}>
                  {t("all")} · {tn(category)}
                </button>
                {subVarieties.map(v => (
                  <button key={v} className={`var-tab ${variety === v ? "active" : ""}`} onClick={() => setVariety(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mp-stats">
          {[
            { v: String(filtered.length), l: t("trade_active_listings") },
            { v: `₱${avgPrice}`, l: t("trade_avg_price") },
            { v: totalKg.toLocaleString(), l: t("trade_total_kg") },
            { v: "4.7", l: t("trade_avg_rating") },
          ].map(s => (
            <div key={s.l} className="mp-stat">
              <div className="mp-stat-val">{s.v}</div>
              <div className="mp-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mp-list-hdr-row">
          <span className="mkt-list-hdr">{sorted.length} {sorted.length === 1 ? t("trade_listing_one") : t("trade_listings")}</span>
          <div className="drop-wrap">
            <select className="drop-sel" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <option value="default">{t("trade_sort_newest")}</option>
              <option value="price-asc">{t("trade_sort_price_asc")}</option>
              <option value="price-desc">{t("trade_sort_price_desc")}</option>
              <option value="rating">{t("trade_sort_rating")}</option>
            </select>
            <ChevronRight size={13} className="drop-arr" style={{ transform: "rotate(90deg)" }} />
          </div>
        </div>

        {sorted.map(l => (
          <div className="listing" key={l.id}>
            <div className="listing-top">
              <div className="listing-crop-row">
                <div className="listing-ico"><CropIcon crop={l.crop} size={26} /></div>
                <div>
                  <div className="listing-name">{l.crop}</div>
                  <div className="listing-var">{l.variety}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div className="listing-price">₱{l.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span></div>
                {l.sellerInitials === userInitials && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(l)} style={{ background: "var(--paper-alt)", border: "2px solid var(--line)", borderRadius: 12, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--tanim)" }}>
                      <Pencil size={15} color="var(--tanim)" /> {t("edit")}
                    </button>
                    <button onClick={() => setConfirmDelete(l.id)} style={{ background: "var(--error-sk)", border: "2px solid var(--error-line)", borderRadius: 12, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--error)" }}>
                      <Trash2 size={15} color="var(--error)" /> {t("trade_remove")}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="listing-desc">{l.desc}</div>
            <div className="listing-meta">
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Package size={12} color="var(--text-faint)" /> {l.kg} {t("trade_kg_available")}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} color="var(--text-faint)" /> {l.date}</span>
            </div>
            <div className="seller-row" onClick={() => setSellerDetail(SELLER_DETAILS[l.sellerInitials] || null)}
              style={{ cursor: "pointer" }}>
              <div className="seller-ava">{l.sellerInitials}</div>
              <div style={{ flex: 1 }}>
                <div className="seller-name">{l.seller}</div>
                <div className="seller-stars">
                  <Star size={13} color="var(--gold-text)" fill="var(--gold-text)" /> {l.rating} {t("trade_rating")}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="seller-loc"><MapPin size={13} color="var(--text-muted)" />{l.location}</div>
                <ChevronRight size={14} color="var(--text-faint)" />
              </div>
            </div>
            {userRole === "buyer" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Quantity picker */}
                <div className="qty-picker-row">
                  <button className="qty-pick-btn" onClick={() => setQty(l.id, getQty(l.id) - 1, l.kg)}>−</button>
                  <div className="qty-pick-val">{getQty(l.id)}</div>
                  <button className="qty-pick-btn" onClick={() => setQty(l.id, getQty(l.id) + 1, l.kg)}>+</button>
                  <span className="qty-pick-unit">kg</span>
                  <span style={{ marginLeft: "auto", fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--tanim)" }}>
                    ₱{(getQty(l.id) * l.pricePerKg).toLocaleString()}
                  </span>
                </div>
                {/* Buttons row */}
                <div className="listing-btns">
                  <button
                    className={`add-cart-btn${isInCart(l.id) ? " in-cart" : ""}`}
                    onClick={() => addToCart(l)}>
                    <ShoppingBag size={17} color={isInCart(l.id) ? "var(--tanim)" : "#fff"} />
                    {isInCart(l.id) ? t("cart_in_cart") : t("cart_add")}
                  </button>
                  <button className="btn-call" onClick={() => { addToCart(l); setShowCart(true); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CreditCard size={17} color="#fff" /> {t("cart_buy_now")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="listing-btns">
                <button className="btn-call" aria-label={t("trade_call_seller")}><Phone size={17} color="#fff" /> {t("trade_call_seller")}</button>
                <button className="btn-details" onClick={() => setSellerDetail(SELLER_DETAILS[l.sellerInitials] || null)}>{t("trade_view_details")}</button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-msg">{t("trade_no_listings")}</div>
        )}
      </div>

      {/* Delete confirmation, senior-friendly */}
      {confirmDelete && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: 28, width: "100%" }}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>{t("trade_remove_title")}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--text-muted)", marginBottom: 26, textAlign: "center", lineHeight: 1.6 }}>{t("trade_remove_sub")}</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: 18, background: "var(--paper-alt)", border: "2px solid var(--line)", borderRadius: 14, fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 800, cursor: "pointer", color: "var(--text-soft)" }}>← {t("cancel")}</button>
              <button onClick={() => deleteListing(confirmDelete)} style={{ flex: 1, padding: 18, background: "var(--error)", color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 800, cursor: "pointer" }}>{t("trade_yes_remove")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Post / Edit listing modal, senior-friendly */}
      {showModal && (() => {
        // Crop groups for visual picker
        const CROP_GROUPS_PICKER = [
          { emoji: "🌾", label: "Rice", varieties: ["Special Rice", "Well Milled", "Regular Milled"] },
          { emoji: "🧅", label: "Onions", varieties: ["Red Onion", "Yellow/White Onion", "Shallots(Sibuyas Tagalog", "Spring Onion"] },
          { emoji: "🍋", label: "Calamansi", varieties: ["Regular Calamansi"] },
          { emoji: "🌽", label: "Corn", varieties: ["Yellow Corn", "White Corn", "Sweet Corn"] },
          { emoji: "🥭", label: "Mango", varieties: ["Carabao Mango", "Indian Mango", "Horse Mango", "Pahutan"] },
          { emoji: "🧄", label: "Garlic", varieties: ["Native Garlic"] },
          { emoji: "🍅", label: "Tomatoes", varieties: ["Diamante Max F1 Tomato", "Platunum F1 Tomato", "Assila F1 Tomato"] },
          { emoji: "🎃", label: "Squash", varieties: ["Kalabasa"] },
        ];
        const selectedGroup = CROP_GROUPS_PICKER.find(g => g.varieties.includes(form.crop)) || CROP_GROUPS_PICKER[0];
        const fieldStyle: React.CSSProperties = { width: "100%", border: "2px solid var(--line-strong)", borderRadius: 12, padding: "16px 14px", fontFamily: "inherit", fontSize: "var(--fs-body)", outline: "none", background: "#fff", color: "var(--text)", boxSizing: "border-box" };
        const labelStyle: React.CSSProperties = { fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text-soft)", marginBottom: 8, display: "block" };
        const hintStyle: React.CSSProperties = { fontSize: "var(--fs-label)", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 };

        return (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
            <div style={{ background: "var(--paper)", borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "93%", overflowY: "auto", paddingBottom: 24 }}>

              {/* Header */}
              <div style={{ background: "var(--tanim)", borderRadius: "24px 24px 0 0", padding: "20px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "#fff" }}>{editId ? `✏️ ${t("trade_edit_listing")}` : t("trade_post_title")}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{editId ? t("trade_edit_listing_sub") : t("trade_post_sub")}</div>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, width: 44, height: 44, cursor: "pointer", fontSize: "var(--fs-title)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
              </div>

              <div style={{ padding: "20px 20px 0" }}>

                {formError && (
                  <div style={{ background: "var(--error-sk)", color: "var(--error)", fontSize: "var(--fs-body)", fontWeight: 700, padding: "14px 16px", borderRadius: 12, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={18} color="var(--error)" /> {formError}
                  </div>
                )}

                {/* ── Step 1: Crop Group ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>1</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_type")}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginBottom: 14 }}>{t("trade_step_type_sub")}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {CROP_GROUPS_PICKER.map(g => {
                      const isActive = selectedGroup.label === g.label;
                      return (
                        <button key={g.label} onClick={() => setForm(d => ({ ...d, crop: g.varieties[0] }))}
                          style={{ background: isActive ? "var(--tanim-sk)" : "var(--paper)", border: isActive ? "2px solid var(--tanim)" : "2px solid var(--line)", borderRadius: 12, padding: "10px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
                          <span style={{ fontSize: "var(--fs-title)" }}>{g.emoji}</span>
                          <span style={{ fontSize: "var(--fs-label)", fontWeight: 700, color: isActive ? "var(--tanim)" : "var(--text-soft)", textAlign: "center", lineHeight: 1.2 }}>{tn(g.label)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 2: Variety ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>2</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_variety")}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginBottom: 14 }}>{t("trade_step_variety_sub")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedGroup.varieties.map(v => {
                      const isActive = form.crop === v;
                      return (
                        <button key={v} onClick={() => setForm(d => ({ ...d, crop: v }))}
                          style={{ background: isActive ? "var(--tanim)" : "var(--paper-alt)", color: isActive ? "#fff" : "var(--text-soft)", border: "none", borderRadius: 99, padding: "10px 16px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer" }}>
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 3: Price ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>3</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_price")}</span>
                  </div>
                  <div style={hintStyle}>{t("trade_step_price_sub")}</div>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--tanim)" }}>₱</span>
                    <input type="number" inputMode="numeric" placeholder={t("trade_ph_price")}
                      value={form.pricePerKg}
                      onChange={e => setForm(d => ({ ...d, pricePerKg: e.target.value }))}
                      style={{ ...fieldStyle, paddingLeft: 36 }} />
                  </div>
                </div>

                {/* ── Step 4: Quantity ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>4</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_qty")}</span>
                  </div>
                  <div style={hintStyle}>{t("trade_step_qty_sub")}</div>
                  <div style={{ position: "relative" }}>
                    <input type="number" inputMode="numeric" placeholder={t("trade_ph_qty")}
                      value={form.kg}
                      onChange={e => setForm(d => ({ ...d, kg: e.target.value }))}
                      style={fieldStyle} />
                    <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: "var(--fs-body)", fontWeight: 700, color: "var(--text-muted)" }}>kg</span>
                  </div>
                </div>

                {/* ── Step 5: Description ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>5</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_desc")}</span>
                  </div>
                  <div style={hintStyle}>{t("trade_step_desc_sub")}</div>
                  <textarea placeholder={t("trade_ph_desc")}
                    value={form.desc}
                    onChange={e => setForm(d => ({ ...d, desc: e.target.value }))}
                    rows={3}
                    style={{ ...fieldStyle, resize: "none", lineHeight: 1.6 }} />
                </div>

                {/* ── Step 6: Location ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 22, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>6</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_loc")}</span>
                  </div>
                  <div style={hintStyle}>{t("trade_step_loc_sub")}</div>
                  <div style={{ position: "relative" }}>
                    <MapPin size={20} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input type="text" placeholder={t("trade_ph_loc")}
                      value={form.location}
                      onChange={e => setForm(d => ({ ...d, location: e.target.value }))}
                      style={{ ...fieldStyle, paddingLeft: 40 }} />
                  </div>
                </div>

                {/* ── Action Buttons ── */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: 18, background: "var(--paper-alt)", border: "2px solid var(--line)", borderRadius: 14, fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 800, cursor: "pointer", color: "var(--text-soft)" }}>
                    ← {t("back")}
                  </button>
                  <button onClick={saveForm}
                    style={{ flex: 2, padding: 18, background: "var(--tanim)", color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(11,107,65,0.3)" }}>
                    {editId ? `✔ ${t("save_changes")}` : `✔ ${t("trade_post_now")}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Cart Drawer ── */}
      {showCart && (
        <div className="cart-drawer" onClick={() => setShowCart(false)}>
          <div className="cart-sheet" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="cart-sheet-hdr">
              <div>
                <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "#fff" }}>🛒 {t("cart_title")}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{cartCount} {cartCount !== 1 ? t("cart_items_selected") : t("cart_item_selected")}</div>
              </div>
              <button onClick={() => setShowCart(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, width: 40, height: 40, cursor: "pointer", color: "#fff", fontSize: "var(--fs-lead)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-ico"><ShoppingCart size={48} color="var(--line-strong)" /></div>
                  <div className="cart-empty-txt">{t("cart_empty_title")}</div>
                  <div className="cart-empty-sub">{t("cart_empty_sub")}</div>
                </div>
              ) : (
                cart.map(item => (
                  <div className="cart-item-row" key={item.listingId}>
                    <div className="cart-item-ico"><CropIcon crop={item.crop} size={22} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="cart-item-name">{item.crop}</div>
                      <div className="cart-item-seller">
                        <span style={{ fontWeight: 700 }}>{item.seller}</span>
                        {" · "}<MapPin size={12} color="var(--text-faint)" style={{ display: "inline" }} /> {item.location}
                      </div>
                      <div className="cart-item-price">₱{item.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span></div>
                      <div className="cart-qty-row">
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.listingId, item.qty - 1)}>−</button>
                        <span className="cart-qty-val">{item.qty}</span>
                        <button className="cart-qty-btn" onClick={() => updateCartQty(item.listingId, item.qty + 1)}>+</button>
                        <span className="cart-qty-unit">kg</span>
                        <span style={{ marginLeft: 8, fontSize: "var(--fs-label)", fontWeight: 800, color: "var(--text)" }}>₱{(item.qty * item.pricePerKg).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.listingId)}>
                      <Trash2 size={14} color="var(--error)" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-row">
                  <div>
                    <div className="cart-total-lbl">{t("cart_total")}</div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--text-faint)" }}>{cartCount} kg {t("cart_across")} {cart.length} {cart.length !== 1 ? t("cart_sellers") : t("cart_seller")}</div>
                  </div>
                  <div className="cart-total-val">₱{cartTotal.toLocaleString()}</div>
                </div>
                <button className="cart-checkout-btn" onClick={handleCheckout}>
                  ✔ {t("cart_confirm")} · ₱{cartTotal.toLocaleString()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout Success ── */}
      {checkoutDone && (
        <div className="checkout-success">
          <div className="checkout-card">
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>{t("cart_order_placed")}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", lineHeight: 1.6 }}>{t("cart_order_sent")}</div>
            <div style={{ marginTop: 20, padding: "10px 0", background: "var(--tanim-sk)", borderRadius: 10, fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--tanim)" }}>✓ {t("cart_txn_recorded")}</div>
          </div>
        </div>
      )}

      {/* ── Seller Details Modal ── */}
      {sellerDetail && (
        <div className="seller-modal-overlay" onClick={() => setSellerDetail(null)}>
          <div className="seller-modal-sheet" onClick={e => e.stopPropagation()}>

            {/* Hero header */}
            <div className="seller-modal-hero">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="seller-modal-ava">{sellerDetail.initials}</div>
                  <div className="seller-modal-name">{sellerDetail.name}</div>
                  <div className="seller-modal-sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} color="rgba(255,255,255,0.7)" />{sellerDetail.location}
                  </div>
                </div>
                <button onClick={() => setSellerDetail(null)}
                  style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, width: 40, height: 40, cursor: "pointer", color: "#fff", fontSize: "var(--fs-lead)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="seller-modal-stats">
              {[
                { val: sellerDetail.rating.toFixed(1), lbl: t("seller_rating"), ico: <Star size={14} color="var(--gold-text)" fill="var(--gold-text)" /> },
                { val: `${sellerDetail.yearsfarming} yrs`, lbl: t("seller_experience"), ico: <Wheat size={14} color="var(--tanim)" /> },
                { val: `${sellerDetail.totalSales}+`, lbl: t("seller_sales"), ico: <Package size={14} color="var(--tanim)" /> },
              ].map(s => (
                <div className="sms-item" key={s.lbl}>
                  <div className="sms-val">{s.val}</div>
                  <div className="sms-lbl" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{s.ico}{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="seller-modal-body">

              {/* Phone */}
              <div className="sdm-row">
                <div className="sdm-ico"><Phone size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_phone")}</div>
                  <div className="sdm-val">{sellerDetail.phone}</div>
                </div>
              </div>

              {/* Location */}
              <div className="sdm-row">
                <div className="sdm-ico"><MapPin size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_location")}</div>
                  <div className="sdm-val">{sellerDetail.location}</div>
                </div>
              </div>

              {/* Years of farming */}
              <div className="sdm-row">
                <div className="sdm-ico"><Sprout size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_years")}</div>
                  <div className="sdm-val">{sellerDetail.yearsfarming} {t("seller_years_suffix")}</div>
                </div>
              </div>

              {/* Seller rating */}
              <div className="sdm-row">
                <div className="sdm-ico"><Star size={20} color="var(--gold-text)" fill="var(--gold-text)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_rating")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={16} color="var(--gold-text)" fill={i <= Math.round(sellerDetail.rating) ? "var(--gold-text)" : "none"} />
                    ))}
                    <span className="sdm-val">{sellerDetail.rating.toFixed(1)}</span>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)" }}>/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* Crops */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid var(--paper-alt)" }}>
                <div className="sdm-lbl" style={{ marginBottom: 8 }}>{t("seller_crops_sold")}</div>
                <div className="sdm-crops">
                  {sellerDetail.crops.map(c => (
                    <span key={c} className="sdm-crop-tag">{c}</span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="sdm-bio">
                <div className="sdm-lbl" style={{ marginBottom: 6 }}>{t("seller_about")}</div>
                {sellerDetail.bio}
              </div>

            </div>

            {/* Footer: call button */}
            <div className="seller-modal-footer">
              <button className="call-seller-btn">
                <Phone size={20} color="#fff" /> {t("seller_call")} {sellerDetail.name.split(" ")[0]}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
