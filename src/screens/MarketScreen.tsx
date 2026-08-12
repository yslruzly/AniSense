import { useState } from "react";
import { LayoutDashboard, MapPin, Wheat, TrendingUp, TrendingDown, Search, Clock } from "lucide-react";
import { useLang } from "../i18n";
import { UserRole } from "../types";
import { RICE_VARIETIES, CROP_GROUPS } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";

// ─── Market Screen ────────────────────────────────────────────────────────────
export function MarketScreen({ onProfile, isOffline, lastUpdated, onBack, userInitials = "JD", userRole }: { onProfile: () => void; isOffline: boolean; lastUpdated: string; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, tn } = useLang();
  const ALL_ITEMS = [
    ...RICE_VARIETIES.map(c => ({ ...c, group: "Rice" })),
    ...CROP_GROUPS.flatMap(g => g.varieties.map(v => ({ ...v, group: g.group }))),
  ];
  const categories = ["All", "Rice", ...CROP_GROUPS.map(g => g.group)];
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_ITEMS.filter(c => {
    const matchCat = activeCat === "All" || c.group === activeCat;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const topGainers = [...ALL_ITEMS].sort((a, b) => b.change - a.change).slice(0, 3);
  const topLosers = [...ALL_ITEMS].sort((a, b) => a.change - b.change).slice(0, 3);

  return (
    <div className="screen">
      <Hdr icon={<LayoutDashboard size={20} color="#2e7d4f" />} title={t("market_title")} sub={t("market_sub")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll">
        <div className="hero">
          <div>
            <div className="hero-greet">{t("market_hello")}, {userInitials}! 👋</div>
            <div className="hero-loc" style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} color="rgba(255,255,255,0.85)" /> Nueva Ecija, Philippines</div>
          </div>
          <Wheat size={44} color="rgba(255,255,255,0.85)" />
        </div>

        <div>
          <div className="sec-title">{t("market_dashboard")}</div>
          <div className="sec-sub">{ALL_ITEMS.length} {t("market_tracked")}</div>
        </div>

        <div className="movers-row">
          <div className="movers-col">
            <div className="movers-col-title" style={{ color: "#1f7a49" }}><TrendingUp size={14} /> {t("market_top_gainers")}</div>
            {topGainers.map(c => (
              <div className="mover-item" key={c.id}>
                <span className="mover-item-name">{c.name}</span>
                <span className="mover-item-chg" style={{ color: "#2f9e63" }}>+{c.change}%</span>
              </div>
            ))}
          </div>
          <div className="movers-col">
            <div className="movers-col-title" style={{ color: "#9a3325" }}><TrendingDown size={14} /> {t("market_top_decliners")}</div>
            {topLosers.map(c => (
              <div className="mover-item" key={c.id}>
                <span className="mover-item-name">{c.name}</span>
                <span className="mover-item-chg" style={{ color: "#c74133" }}>{c.change}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="search-box">
          <Search size={16} color="#aa9d8a" />
          <input placeholder={t("market_search_ph")} value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="frow">
          {categories.map(cat => (
            <button key={cat} className={`fchip ${activeCat === cat ? "on" : ""}`} onClick={() => setActiveCat(cat)}>{cat === "All" ? t("all") : tn(cat)}</button>
          ))}
        </div>

        <div className="mkt-list-hdr">
          {filtered.length} {filtered.length === 1 ? t("market_crop_count_one") : t("market_crops_count")}{activeCat !== "All" ? ` ${t("market_in")} ${tn(activeCat)}` : ""}
        </div>

        {filtered.length === 0 && <div className="empty-msg">{t("market_no_match")}</div>}

        {filtered.map(c => (
          <div className={`mkt-row ${c.change >= 0 ? "up" : "down"}`} key={c.id}>
            <div className="mkt-row-ico"><CropIcon crop={c.group} size={20} /></div>
            <div>
              <div className="mkt-row-name">{c.name}</div>
              <div className="mkt-row-unit">{tn(c.group)} · {t("per_kg")}</div>
            </div>
            <div className="mkt-row-right">
              <div className="mkt-row-price">₱{c.pricePerKg}</div>
              <div className="mkt-row-chg" style={{ color: c.change >= 0 ? "#2f9e63" : "#c74133" }}>
                {c.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {c.change >= 0 ? "+" : ""}{c.change}%
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isOffline ? "#152b1e" : "#e6f2e9", border: `1px solid ${isOffline ? "#4d4237" : "#cfe7d6"}`, borderRadius: 10, padding: "9px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOffline ? "#d4553f" : "#2f9e63", flexShrink: 0, animation: isOffline ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: isOffline ? "#faf6ef" : "#1e5c3a" }}>{isOffline ? t("market_offline_cached") : t("market_up_to_date")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={isOffline ? "#aa9d8a" : "#2e7d4f"} />
            <span style={{ fontSize: 12, color: isOffline ? "#aa9d8a" : "#2e7d4f", fontWeight: 500 }}>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
