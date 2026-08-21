import { useState } from "react";
import { EmptyState, ErrorState, SkeletonList } from "../components/states";
import { useResource } from "../hooks/useResource";
import { fetchPrices } from "../services/prices";
import { LayoutDashboard, MapPin, Wheat, TrendingUp, TrendingDown, Search, Clock } from "lucide-react";
import { useLang } from "../i18n";
import { UserRole } from "../types";
import { RICE_VARIETIES, CROP_GROUPS } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropPhoto } from "../data/cropPhotos";

// ─── Market Screen ────────────────────────────────────────────────────────────
export function MarketScreen({ onProfile, isOffline, lastUpdated, onBack, userInitials = "JD", userRole }: { onProfile: () => void; isOffline: boolean; lastUpdated: string; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, tn } = useLang();
  // Prices now arrive through a resource, so this screen has a real loading
  // path, a real failure path, and a real offline path instead of assuming
  // the data is simply present.
  const prices = useResource(fetchPrices, []);
  const ALL_ITEMS = prices.data ?? [];
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
      <Hdr icon={<LayoutDashboard size={20} color="var(--tanim)" />} title={t("market_title")} sub={t("market_sub")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll screen-enter">
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

        {prices.status === "ready" && <div className="movers-row">
          <div className="movers-col">
            <div className="movers-col-title" style={{ color: "var(--tanim)" }}><TrendingUp size={14} /> {t("market_top_gainers")}</div>
            {topGainers.map(c => (
              <div className="mover-item" key={c.id}>
                <span className="mover-item-name">{c.name}</span>
                <span className="mover-item-chg" style={{ color: "var(--tanim)" }}>+{c.change}%</span>
              </div>
            ))}
          </div>
          <div className="movers-col">
            <div className="movers-col-title" style={{ color: "var(--error)" }}><TrendingDown size={14} /> {t("market_top_decliners")}</div>
            {topLosers.map(c => (
              <div className="mover-item" key={c.id}>
                <span className="mover-item-name">{c.name}</span>
                <span className="mover-item-chg" style={{ color: "var(--error)" }}>{c.change}%</span>
              </div>
            ))}
          </div>
        </div>}

        <div className="search-box">
          <Search size={16} color="var(--text-faint)" />
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

        {prices.showSkeleton && <SkeletonList rows={6} label={t("state_loading_prices")} />}

        {prices.status === "error" && (
          <ErrorState
            title={t("state_error_title")}
            body={t("state_error_body")}
            retryLabel={t("state_retry")}
            onRetry={prices.reload}
          />
        )}

        {prices.status === "ready" && filtered.length === 0 && (
          <EmptyState
            icon={<Search size={26} aria-hidden="true" />}
            title={t("state_no_match_title")}
            body={t("state_no_match_body")}
            action={search ? t("state_clear_search") : undefined}
            onAction={search ? () => setSearch("") : undefined}
          />
        )}

        {prices.status === "ready" && filtered.map(c => (
          <div className="mkt-row" key={c.id}>
            <div className="mkt-row-ico">
              {cropPhoto(c.id)
                ? <img src={cropPhoto(c.id)} alt="" loading="lazy" decoding="async" />
                : <CropIcon crop={c.group} size={20} />}
            </div>
            <div>
              <div className="mkt-row-name">{c.name}</div>
              <div className="mkt-row-unit">{tn(c.group)}</div>
            </div>
            <div className="mkt-row-right">
              <div className="mkt-row-price">₱{c.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span></div>
              <div className="mkt-row-chg" style={{ color: c.change >= 0 ? "var(--tanim)" : "var(--error)" }}>
                {c.change >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />} {c.change >= 0 ? "+" : ""}{c.change}%
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isOffline ? "var(--ink)" : "var(--tanim-sk)", border: `1px solid ${isOffline ? "var(--text-soft)" : "var(--tanim-sk)"}`, borderRadius: 10, padding: "9px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isOffline ? "var(--error)" : "var(--tanim)", flexShrink: 0, animation: isOffline ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ fontSize: "var(--fs-label)", fontWeight: 600, color: isOffline ? "var(--paper)" : "var(--tanim-deep)" }}>{isOffline ? t("market_offline_cached") : t("market_up_to_date")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={isOffline ? "var(--text-faint)" : "var(--tanim)"} />
            <span style={{ fontSize: "var(--fs-label)", color: isOffline ? "var(--text-faint)" : "var(--tanim)", fontWeight: 500 }}>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
