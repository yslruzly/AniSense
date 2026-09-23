import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, Plus, Minus, X, Check, Search, Pencil, Trash2, ChevronRight, Package, Calendar, Star, MapPin, Phone, ShoppingBag, CreditCard, AlertTriangle, Wheat, Sprout, ArrowUpDown, Camera, ImageOff, LayoutGrid } from "lucide-react";
import { haptic } from "../lib/platform";
import { useLang } from "../i18n";
import { UserRole, CartItem, SellerDetail, TradeIntent, Listing } from "../types";
import { LISTINGS, SELLER_DETAILS } from "../data/marketplace";
import { CROP_FILTER_MAP, CROP_CATEGORIES, CROP_FAMILIES, ALL_RICE_NAMES, RICE_VARIETY_LIST, familyCropNames } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropPhotoFor } from "../data/cropPhotos";
import marketPoster from "../assets/anisense-poster-market.webp";
import sellPoster from "../assets/sell-your-ani.webp";
import { CropEmoji } from "../components/CropEmoji";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";
import { AutoHeight } from "../components/ui/AutoHeight";
import { localISO } from "../components/ui/DateField";
import { EmptyState } from "../components/states";
import { downscaleImage } from "../lib/image";
import { MenuPicker } from "../components/ui/MenuPicker";

// ─── Trade / Marketplace Screen ───────────────────────────────────────────────
export function TradeScreen({ onProfile, onBack, userName = "Juan Dela Cruz", userInitials = "JD", userRole, intent, listings, setListings }: { onProfile: () => void; onBack: () => void; userName?: string; userInitials?: string; userRole?: UserRole; intent?: TradeIntent; listings: Listing[]; setListings: React.Dispatch<React.SetStateAction<Listing[]>> }) {
  const { t, tn, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const [search, setSearch] = useState(intent?.search ?? "");
  // The listing open in the detail sheet. Held by id, so an edit or a cart
  // change shows in the sheet straight away.
  const [openId, setOpenId] = useState<string | null>(null);
  const [category, setCategory] = useState(intent?.category ?? "All Crops");
  // The seller's coarse view of their own market: everything, or one family.
  const [family, setFamily] = useState("All");
  const [variety, setVariety] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<{ crop: string; variety: string; desc: string; pricePerKg: string; kg: string; location: string; photo: string | null }>(
    { crop: "Special Rice", variety: "", desc: "", pricePerKg: "", kg: "", location: "", photo: null });
  const [photoState, setPhotoState] = useState<"idle" | "working" | "failed">("idle");
  const photoInput = useRef<HTMLInputElement>(null);
  const pickListingPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoState("working");
    try {
      const photo = await downscaleImage(file);
      setForm(d => ({ ...d, photo }));
      setPhotoState("idle");
    } catch {
      setPhotoState("failed");
    }
  };

  // ── Cart state ──
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [checkoutDone, setCheckoutDone] = useState(false);
  // Removing is forgiving, and it happens in place. The line turns into a
  // slim "Removed · Undo" strip in the same slot for a few seconds; Undo grows
  // the card back right there, and otherwise the strip folds shut. Nothing
  // jumps to the bottom of the list, and the list never shifts twice.
  const UNDO_MS = 5000;
  const FOLD_MS = 240;
  const [tomb, setTomb] = useState<string[]>([]);      // removed, still undoable
  const [folding, setFolding] = useState<string[]>([]); // strip closing, then gone
  const tombTimers = useRef(new Map<string, number>());
  useEffect(() => () => tombTimers.current.forEach(id => window.clearTimeout(id)), []);

  const forget = (id: string) => {
    window.clearTimeout(tombTimers.current.get(id));
    tombTimers.current.delete(id);
  };
  const commitRemoval = (id: string) => {
    forget(id);
    setFolding(f => [...f, id]);
    window.setTimeout(() => {
      setCart(prev => prev.filter(c => c.listingId !== id));
      setTomb(tb => tb.filter(x => x !== id));
      setFolding(f => f.filter(x => x !== id));
    }, FOLD_MS);
  };
  const removeFromCart = (id: string) => {
    if (tomb.includes(id)) return;
    setTomb(tb => [...tb, id]);
    tombTimers.current.set(id, window.setTimeout(() => commitRemoval(id), UNDO_MS));
  };
  const undoRemove = (id: string) => {
    forget(id);
    setTomb(tb => tb.filter(x => x !== id));
  };
  // Closing the cart settles every pending removal at once; there's no strip
  // to come back to.
  const closeCart = () => {
    setShowCart(false);
    if (tomb.length) {
      tombTimers.current.forEach(t => window.clearTimeout(t));
      tombTimers.current.clear();
      setCart(prev => prev.filter(c => !tomb.includes(c.listingId)));
      setTomb([]);
      setFolding([]);
    }
  };
  const updateCartQty = (id: string, qty: number) => setCart(prev => prev.map(c => c.listingId === id ? { ...c, qty: Math.max(1, Math.min(qty, c.maxKg)) } : c));

  // ── Seller detail state ──
  const [sellerDetail, setSellerDetail] = useState<SellerDetail | null>(null);

  // Both of these sheets are opened BY their data, so clearing the state to
  // close them also empties them. Retaining the last value keeps the panel
  // populated while it slides back out instead of animating a blank card.
  const shownSeller = useRetained(sellerDetail);

  // Sent here from a featured farmer on Home: their listings are already
  // filtered underneath, and their profile slides up over them. Set after
  // mount rather than as initial state, so the sheet arrives instead of
  // simply being there, and the buyer sees where it came from.
  useEffect(() => {
    const s = intent?.seller ? SELLER_DETAILS[intent.seller] : undefined;
    if (s) setSellerDetail(s);
    // Once, on arrival. The intent is fixed for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pendingDelete = useRetained(confirmDelete);

  // When category changes, reset variety
  // The two controls answer each other: picking a crop widens the family
  // back to All, and picking a family drops any single crop. Two filters
  // silently fighting is how a page ends up empty for no visible reason.
  const selectCategory = (cat: string) => { setCategory(cat); setVariety("All"); setFamily("All"); };
  const selectFamily = (fam: string) => { haptic.select(); setFamily(fam); setCategory("All Crops"); setVariety("All"); };

  // ── Cart helpers ──
  // Once a listing is in the cart, the cart owns its quantity: the picker on
  // the card reads and writes the cart line, so there's one number, not two
  // that drift apart.
  // Lines waiting on Undo are already gone as far as totals, the badge and
  // the marketplace buttons are concerned.
  const activeCart = cart.filter(c => !tomb.includes(c.listingId));
  const inCart = (id: string) => activeCart.find(c => c.listingId === id);
  const isInCart = (id: string) => !!inCart(id);
  const getQty = (id: string) => inCart(id)?.qty ?? qtyMap[id] ?? 1;
  const setQty = (id: string, v: number, max: number) => {
    const q = Math.max(1, Math.min(v, max));
    if (isInCart(id)) updateCartQty(id, q);
    else setQtyMap(m => ({ ...m, [id]: q }));
  };
  // The badge counts listings, not kilograms: "3" should mean three things in
  // the cart, not 3 kg of one. Kilograms are shown where they're labelled.
  const cartCount = activeCart.length;
  const cartKg = activeCart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = activeCart.reduce((s, c) => s + c.qty * c.pricePerKg, 0);
  // Distinct sellers, not lines: two listings from one farmer is one call.
  const sellerCount = new Set(activeCart.map(c => c.seller)).size;

  // Adding is idempotent. A listing already in the cart is left as it is, so
  // a second tap (or Buy Now after Add) can never quietly stack the quantity.
  const addToCart = (l: typeof LISTINGS[0]) => {
    const qty = getQty(l.id);
    if (tomb.includes(l.id)) { undoRemove(l.id); return; }
    setCart(prev => prev.some(c => c.listingId === l.id)
      ? prev
      : [...prev, { listingId: l.id, crop: l.crop, variety: l.variety, pricePerKg: l.pricePerKg, qty, seller: l.seller, sellerInitials: l.sellerInitials, location: l.location, maxKg: l.kg, photo: l.photo }]);
  };


  const handleCheckout = () => {
    tombTimers.current.forEach(t => window.clearTimeout(t));
    tombTimers.current.clear();
    setTomb([]);
    setFolding([]);
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
    if (family !== "All") {
      const names = familyCropNames(family);
      if (!names.includes(l.crop) && !names.includes(l.variety)) return false;
    }
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


  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.pricePerKg - b.pricePerKg;
    if (sortBy === "price-desc") return b.pricePerKg - a.pricePerKg;
    if (sortBy === "rating") return b.rating - a.rating;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const openPost = () => {
    setEditId(null);
    setForm({ crop: "Special Rice", variety: "", desc: "", pricePerKg: "", kg: "", location: "", photo: null });
    setPhotoState("idle");
    setFormError("");
    setShowModal(true);
  };

  // Sent here by "Post a harvest" on Home: open the form on arrival.
  useEffect(() => {
    if (intent?.post) openPost();
    // Once, on arrival; the intent is fixed for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (l: typeof LISTINGS[0]) => {
    setEditId(l.id);
    setForm({ crop: l.crop, variety: l.variety, desc: l.desc, pricePerKg: String(l.pricePerKg), kg: String(l.kg), location: l.location, photo: l.photo ?? null });
    setPhotoState("idle");
    setFormError("");
    setShowModal(true);
  };

  const saveForm = () => {
    if (!form.desc.trim()) { setFormError(t("err_desc_required")); return; }
    if (!form.pricePerKg || isNaN(Number(form.pricePerKg)) || Number(form.pricePerKg) <= 0) { setFormError(t("err_valid_price")); return; }
    if (!form.kg || isNaN(Number(form.kg)) || Number(form.kg) <= 0) { setFormError(t("err_valid_qty")); return; }
    if (!form.location.trim()) { setFormError(t("err_loc_required")); return; }

    if (editId) {
      setListings(ls => ls.map(l => l.id === editId ? { ...l, crop: form.crop, variety: form.variety, desc: form.desc, pricePerKg: Number(form.pricePerKg), kg: Number(form.kg), location: form.location, photo: form.photo ?? undefined } : l));
    } else {
      const newListing: typeof LISTINGS[0] = {
        id: Date.now().toString(), crop: form.crop, variety: form.variety, desc: form.desc,
        pricePerKg: Number(form.pricePerKg), kg: Number(form.kg),
        date: localISO(),
        seller: userName, sellerInitials: userInitials, rating: 5.0, location: form.location,
        photo: form.photo ?? undefined,
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
  // The crop's own name ("Onions" under Onions) is what "All" already means,
  // so it isn't offered twice.
  const subVarieties = category !== "All Crops" ? (CROP_FILTER_MAP[category] || []).filter(v => v !== category) : [];
  // "Shallots(Sibuyas Tagalog)" → "Shallots (Sibuyas Tagalog)" on screen.
  const varietyLabel = (v: string) => v.replace(/\s*\(/, " (");

  const openListing = listings.find(l => l.id === openId) ?? null;
  // What the seller in the open profile is selling right now. Read from
  // live state, not the seed data, so a listing just posted or edited
  // appears here as well.
  const sellerListings = shownSeller ? listings.filter(l => l.seller === shownSeller.name) : [];
  // From a profile into one of its listings: the profile leaves first, then
  // the listing arrives. Both sheets share a layer, so opening the second
  // over the first would put it underneath; this reads as a hand-off
  // instead of two panels fighting.
  const openFromProfile = (id: string) => {
    setSellerDetail(null);
    setTimeout(() => setOpenId(id), 180);
  };
  // Keeps the sheet filled while it slides away after openId is cleared.
  const shownListing = useRetained(openListing);
  const avgShown = sorted.length ? Math.round(sorted.reduce((s, l) => s + l.pricePerKg, 0) / sorted.length) : 0;

  // The seller's own photo when they added one; otherwise the stock photo of
  // that crop, so no listing is ever a blank tile.
  const photoOf = (l: { photo?: string; crop: string; variety: string }) => l.photo ?? cropPhotoFor(l.crop, l.variety);

  // "Red" under "Onions" reads as "Red Onions"; "Yellow Corn" under "Corn"
  // already says it; a variety that repeats the crop is said once.
  const titleOf = (l: typeof LISTINGS[0]) => {
    if (!l.variety || l.variety === l.crop) return l.crop;
    const stem = l.crop.toLowerCase().replace(/(es|s)$/, "");
    return l.variety.toLowerCase().includes(stem) ? l.variety : `${l.variety} ${l.crop}`;
  };

  // "Today", "Yesterday", "3 days ago", then a plain date.
  const posted = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((today.getTime() - d.getTime()) / 86_400_000);
    if (days <= 0) return t("mp_today");
    if (days === 1) return t("mp_yesterday");
    if (days < 7) return t("mp_days_ago").replace("{n}", String(days));
    return d.toLocaleDateString(locale, { month: "short", day: "numeric", ...(d.getFullYear() === today.getFullYear() ? {} : { year: "numeric" }) });
  };

  return (
    <div className="screen">
      <Hdr title={t("trade_title")} onBack={onBack}
        extra={userRole === "buyer" ? (
          // Dressed exactly like the alerts bell beside it: same bare button,
          // same glyph size and ink, same badge. Two header icons styled two
          // ways read as two kinds of thing when they're the same kind.
          <button onClick={() => setShowCart(true)} className="notif" aria-label={t("cart_title")}>
            <span className="notif-ico">
              <ShoppingCart size={21} color="var(--text-soft)" />
              {/* Keyed on the count so the badge replays its bump each time the
                  number changes. Adding to cart happens with the cart closed, so
                  this is the only confirmation the tap did anything. */}
              {cartCount > 0 && <span className="nbadge bump" key={cartCount}>{cartCount}</span>}
            </span>
          </button>
        ) : undefined}
      />
      <div className="scroll screen-enter">
        {/* Each side opens on its own poster: buyers on "connect with local
            farmers", farmers on "sell your ani now" — the thing each of them
            came here to do, said once, where a line of copy used to be. The
            header above already names the page. Neither is lazy-loaded: it
            is the first thing on screen. */}
        <figure className={`mp-poster${userRole === "buyer" ? "" : " tall"}`}>
          {userRole === "buyer"
            ? <img src={marketPoster} alt={t("mp_poster_alt")} width={1000} height={562} decoding="async" />
            : <img src={sellPoster} alt={t("mp_poster_sell_alt")} width={1000} height={667} decoding="async" />}
        </figure>

        {userRole !== "buyer" && (
          <button className="mp-sell-btn" onClick={openPost}>
            <Plus size={20} strokeWidth={2.6} /> {t("trade_sell")}
          </button>
        )}

        <div className="search-box">
          <Search size={18} color="var(--text-faint)" />
          <input placeholder={t("trade_search_ph")} value={search} onChange={e => setSearch(e.target.value)} enterKeyHint="search" autoFocus={!!intent?.focusSearch} />
          {search && (
            <button className="pr-clear" onClick={() => setSearch("")} aria-label={t("state_clear_search")}>
              <X size={16} strokeWidth={2.6} />
            </button>
          )}
        </div>

        {/* Filters: the nine crop choices as an even 3 × 3 grid of tiles, all
            visible, all the same size, nothing to swipe. Varieties appear
            under it, in two columns, only once a crop is chosen. */}
        <div className="mp-filters">
          <div className="mp-cats" role="radiogroup" aria-label={t("trade_select_category")}>
            {CROP_CATEGORIES.map(cat => (
              <button key={cat} role="radio" aria-checked={category === cat}
                className={`mp-cat ${category === cat ? "on" : ""}`} onClick={() => selectCategory(cat)}>
                {/* Every tile has an icon, All included, so the nine read
                    as one set. */}
                <span className="mp-cat-ico" aria-hidden="true">
                  {cat === "All Crops" ? <LayoutGrid size={20} strokeWidth={2.2} /> : <CropEmoji crop={cat} size={22} />}
                </span>
                <span className="mp-cat-lbl">{cat === "All Crops" ? t("all") : tn(cat)}</span>
              </button>
            ))}
          </div>
          {subVarieties.length > 0 && (
            <div className="mp-vars" role="radiogroup" aria-label={t("trade_select_variety")} key={category}>
              <button role="radio" aria-checked={variety === "All"} className={`mp-var ${variety === "All" ? "on" : ""}`} onClick={() => setVariety("All")}>
                {t("all")}
              </button>
              {subVarieties.map(v => (
                <button key={v} role="radio" aria-checked={variety === v} className={`mp-var ${variety === v ? "on" : ""}`} onClick={() => setVariety(v)}>
                  {varietyLabel(v)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The count, the going rate for what's shown, and how it's sorted,
            on one line: what the old four-box stat strip was trying to say. */}
        <div className="mp-list-head">
          {/* The two facts as chips: how many, and what they go for. Green
              for the count, gold for money, the same pairing as Home. */}
          {/* A farmer knows their own market; the count and the average were
              facts they did not ask for. In their place, the one cut worth
              making at a glance: what kind of thing am I looking at.
              A buyer keeps the facts — they are shopping, and the average is
              what tells them whether a price is fair. */}
          {userRole === "buyer" ? (
            <span className="mp-facts">
              <span className="mp-fact green"><strong>{sorted.length}</strong> {sorted.length === 1 ? t("trade_listing_one") : t("trade_listings")}</span>
              {sorted.length > 0 && <span className="mp-fact gold">{t("mp_avg")} ₱{avgShown}{t("per_kg_short")}</span>}
            </span>
          ) : (
            <div className="fseg" role="tablist" aria-label={t("mp_family")}>
              {/* The pill is one element that slides between the labels, not
                  a highlight that blinks off one and on the next: the eye
                  follows the move and knows where it came from. It is a CSS
                  transition, so a second tap mid-slide simply retargets it. */}
              <span
                className="fseg-pill"
                aria-hidden="true"
                style={{ transform: `translateX(${["All", ...CROP_FAMILIES].indexOf(family) * 100}%)` }}
              />
              {["All", ...CROP_FAMILIES].map(f => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={family === f}
                  className={`fseg-tab ${family === f ? "on" : ""}`}
                  onClick={() => selectFamily(f)}
                >
                  {t(f === "All" ? "all" : `fam_${f.toLowerCase()}`)}
                </button>
              ))}
            </div>
          )}
          {/* Four options, so a plain menu under the button: the sheet we use
              for long lists was a lot of machinery between a tap and an
              answer, and it misbehaved here. */}
          <MenuPicker
            label={t("mp_sort")}
            icon={<ArrowUpDown size={16} strokeWidth={2.4} aria-hidden="true" />}
            value={sortBy}
            onChange={v => setSortBy(v as typeof sortBy)}
            options={[
              { value: "default", label: t("trade_sort_newest") },
              { value: "price-asc", label: t("trade_sort_price_asc") },
              { value: "price-desc", label: t("trade_sort_price_desc") },
              { value: "rating", label: t("trade_sort_rating") },
            ]}
          />
        </div>

        {sorted.length > 0 ? (
          <div className="mp-grid stagger-list" key={`${category}-${variety}-${sortBy}`}>
            {sorted.map(l => {
              const photo = photoOf(l);
              const mine = l.sellerInitials === userInitials;
              const inC = isInCart(l.id);
              return (
                <article key={l.id} className="mp-card">
                  <button className="mp-card-main" onClick={() => setOpenId(l.id)}
                    aria-label={`${titleOf(l)}, ₱${l.pricePerKg} ${t("per_kg_short")}, ${l.kg} kg, ${l.seller}`}>
                    <span className="mp-card-photo">
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={30} />}
                      {mine
                        ? <span className="mp-mine">{t("mp_your_listing")}</span>
                        : l.photo && <span className="mp-mine"><Camera size={12} strokeWidth={2.4} /> {t("mp_seller_photo")}</span>}
                    </span>
                    <span className="mp-card-body">
                      <span className="mp-card-name">{titleOf(l)}</span>
                      <span className="mp-card-price">₱{l.pricePerKg}<small>{t("per_kg_short")}</small></span>
                      <span className="mp-card-meta">{l.kg} kg · {l.location}</span>
                      <span className="mp-card-seller">
                        {/* The rating is the one number a buyer weighs a
                            stranger by, so it gets the gold chip. */}
                        <span className="mp-rate"><Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" /> {l.rating}</span>
                        <span className="mp-ellipsis">{l.seller}</span>
                      </span>
                    </span>
                  </button>
                  {/* Quick add: one tap from the grid. The tick that replaces
                      the plus is the confirmation, alongside the header badge. */}
                  {userRole === "buyer" && !mine && (
                    <button className={`mp-quick ${inC ? "on" : ""}`}
                      onClick={() => (inC ? setShowCart(true) : addToCart(l))}
                      aria-label={inC ? `${t("cart_in_cart")}. ${t("cart_title")}` : `${t("cart_add")}: ${titleOf(l)}`}>
                      <span className="mp-quick-ico" key={inC ? "in" : "add"}>
                        {inC ? <Check size={20} strokeWidth={2.8} /> : <Plus size={20} strokeWidth={2.8} />}
                      </span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={26} aria-hidden="true" />}
            title={t("trade_no_listings")}
            body={t("state_no_match_body")}
            action={t("state_show_all")}
            onAction={() => { setSearch(""); selectCategory("All Crops"); }}
          />
        )}
      </div>

      {/* ── Listing detail ── */}
      <Sheet open={!!openListing} onClose={() => setOpenId(null)} className="pr-sheet mp-sheet modal-sheet" label={shownListing ? titleOf(shownListing) : t("trade_marketplace")}>
        {shownListing && (() => {
          const l = shownListing;
          const photo = photoOf(l);
          const mine = l.sellerInitials === userInitials;
          const inC = isInCart(l.id);
          const qty = getQty(l.id);
          return (
            <>
              <div className="pr-sheet-hero">
                <span className="pr-sheet-photo">{photo ? <img src={photo} alt="" /> : <CropIcon crop={l.crop} size={40} />}</span>
                <div className="pr-sheet-shade" />
                <div className="pr-sheet-id">
                  {mine && <div className="pr-sheet-group">{t("mp_your_listing")}</div>}
                  <div className="pr-sheet-name">{titleOf(l)}</div>
                </div>
                {/* Says the picture is the real harvest, not a stock photo. */}
                {l.photo && <span className="mp-photo-tag"><Camera size={13} strokeWidth={2.4} /> {t("mp_seller_photo")}</span>}
                <button className="pr-sheet-x" onClick={() => setOpenId(null)} aria-label={t("close")}>
                  <X size={22} strokeWidth={2.4} />
                </button>
              </div>

              <div className="pr-sheet-body">
                <div className="pr-sheet-price">
                  <span className="pr-big">₱{l.pricePerKg}<small>{t("per_kg_short")}</small></span>
                  <span className="mp-avail green"><Package size={15} strokeWidth={2.2} /> {l.kg} {t("trade_kg_available")}</span>
                </div>
                <div className="pr-sheet-sub"><Calendar size={13} strokeWidth={2.2} /> {t("mp_posted")} {posted(l.date)}</div>

                {l.desc && <p className="mp-desc">{l.desc}</p>}

                {/* The seller, as one tappable row: the way to their details. */}
                <button className="mp-seller" onClick={() => setSellerDetail(SELLER_DETAILS[l.sellerInitials] || null)}>
                  <span className="seller-ava">{l.sellerInitials}</span>
                  <span className="mp-seller-who">
                    <span className="mp-seller-name">{l.seller}</span>
                    <span className="mp-seller-meta">
                      <span className="mp-rate"><Star size={12} fill="currentColor" strokeWidth={0} /> {l.rating}</span>
                      <span className="mp-dot">·</span> <MapPin size={13} strokeWidth={2.2} /> <span className="mp-ellipsis">{l.location}</span>
                    </span>
                  </span>
                  <ChevronRight size={18} className="pr-row-chev" aria-hidden="true" />
                </button>

                {mine ? (
                  <div className="listing-btns mp-actions">
                    <button className="btn-details" onClick={() => { setOpenId(null); openEdit(l); }}>
                      <Pencil size={17} strokeWidth={2.2} /> {t("edit")}
                    </button>
                    <button className="btn-details mp-danger" onClick={() => { setOpenId(null); setConfirmDelete(l.id); }}>
                      <Trash2 size={17} strokeWidth={2.2} /> {t("trade_remove")}
                    </button>
                  </div>
                ) : userRole === "buyer" ? (
                  <>
                    {/* How much, and what it comes to, before the buttons that
                        commit to it. Same stepper as the cart. */}
                    <div className="mp-qty">
                      <span className="mp-qty-lbl">{t("mp_how_many")}</span>
                      <div className="qty-step">
                        <button onClick={() => setQty(l.id, qty - 1, l.kg)} disabled={qty <= 1} aria-label={t("cart_less")}>
                          <Minus size={18} strokeWidth={2.6} />
                        </button>
                        <span className="qty-step-val">{qty}<small>kg</small></span>
                        <button onClick={() => setQty(l.id, qty + 1, l.kg)} disabled={qty >= l.kg} aria-label={t("cart_more")}>
                          <Plus size={18} strokeWidth={2.6} />
                        </button>
                      </div>
                      <span className="mp-qty-total">₱{(qty * l.pricePerKg).toLocaleString()}</span>
                    </div>
                    <div className="listing-btns mp-actions">
                      <button className={`add-cart-btn${inC ? " in-cart" : ""}`}
                        onClick={() => (inC ? (setOpenId(null), setShowCart(true)) : addToCart(l))}>
                        <span className="act-lbl" key={inC ? "in" : "add"}>
                          {inC
                            ? <><Check size={18} strokeWidth={2.6} /> {t("cart_in_cart")} <ChevronRight size={16} strokeWidth={2.4} className="act-chev" /></>
                            : <><ShoppingBag size={18} strokeWidth={2.2} /> {t("cart_add")}</>}
                        </span>
                      </button>
                      <button className="buy-now-btn" onClick={() => { addToCart(l); setOpenId(null); setShowCart(true); }}>
                        <CreditCard size={18} strokeWidth={2.2} /> {t("cart_buy_now")}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="listing-btns mp-actions">
                    <button className="btn-call"><Phone size={18} strokeWidth={2.2} /> {t("trade_call_seller")}</button>
                    <button className="btn-details" onClick={() => setSellerDetail(SELLER_DETAILS[l.sellerInitials] || null)}>{t("trade_view_details")}</button>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Sheet>

      {/* Delete confirmation, senior-friendly */}
      <Sheet
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        className="confirm-sheet"
        label={t("trade_remove_title")}
      >
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>🗑️</div>
        <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>{t("trade_remove_title")}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--text-muted)", marginBottom: 26, textAlign: "center", lineHeight: 1.6 }}>{t("trade_remove_sub")}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>← {t("cancel")}</button>
          <button className="btn-danger" onClick={() => pendingDelete && deleteListing(pendingDelete)} style={{ flex: 1 }}>{t("trade_yes_remove")}</button>
        </div>
      </Sheet>

      {/* Post / Edit listing modal, senior-friendly */}
      {(() => {
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
          <Sheet
            open={showModal}
            onClose={() => setShowModal(false)}
            className="post-sheet modal-sheet"
            label={editId ? t("trade_edit_listing") : t("trade_post_title")}
          >
            <>
              {/* Header */}
              <div style={{ background: "var(--tanim)", borderRadius: "24px 24px 0 0", padding: "20px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "#fff" }}>{editId ? `✏️ ${t("trade_edit_listing")}` : t("trade_post_title")}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{editId ? t("trade_edit_listing_sub") : t("trade_post_sub")}</div>
                </div>
                <button className="sheet-x" onClick={() => setShowModal(false)} aria-label={t("close")}>✕</button>
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
                  <div className="crop-pick-grid">
                    {CROP_GROUPS_PICKER.map(g => (
                      <button key={g.label} className={`crop-pick ${selectedGroup.label === g.label ? "on" : ""}`}
                        onClick={() => setForm(d => ({ ...d, crop: g.varieties[0] }))}>
                        <span className="crop-pick-emoji">{g.emoji}</span>
                        <span className="crop-pick-lbl">{tn(g.label)}</span>
                      </button>
                    ))}
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

                {/* ── Step 3: Photo ──
                    Optional, and placed early: it's what buyers look at first.
                    One big target to add; once there, a preview with Change
                    and Remove underneath. */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>3</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("mp_step_photo")}</span>
                  </div>
                  <div style={hintStyle}>{t("mp_step_photo_sub")}</div>
                  <input ref={photoInput} type="file" accept="image/*" hidden
                    onChange={e => { pickListingPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                  {form.photo ? (
                    <div className="mp-photo-pick has">
                      <img src={form.photo} alt="" className="mp-photo-preview" key={form.photo} />
                      <div className="mp-photo-row">
                        <button type="button" className="btn-details" onClick={() => photoInput.current?.click()}>
                          <Camera size={17} strokeWidth={2.2} /> {t("mp_change_photo")}
                        </button>
                        <button type="button" className="btn-details mp-danger" onClick={() => setForm(d => ({ ...d, photo: null }))}>
                          <ImageOff size={17} strokeWidth={2.2} /> {t("mp_remove_photo")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="mp-photo-drop" onClick={() => photoInput.current?.click()} disabled={photoState === "working"}>
                      {photoState === "working"
                        ? <><span className="wid-spin mp-spin" aria-hidden="true" /> {t("mp_photo_working")}</>
                        : <><span className="mp-photo-ico"><Camera size={26} strokeWidth={2} /></span>{t("mp_add_photo")}</>}
                    </button>
                  )}
                  {photoState === "failed" && (
                    <p className="mp-photo-err" role="alert"><AlertTriangle size={16} /> {t("mp_photo_failed")}</p>
                  )}
                </div>

                {/* ── Step 4: Price ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>4</div>
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

                {/* ── Step 5: Quantity ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>5</div>
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

                {/* ── Step 6: Description ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>6</div>
                    <span style={{ fontSize: "var(--fs-body)", fontWeight: 800, color: "var(--text)" }}>{t("trade_step_desc")}</span>
                  </div>
                  <div style={hintStyle}>{t("trade_step_desc_sub")}</div>
                  <textarea placeholder={t("trade_ph_desc")}
                    value={form.desc}
                    onChange={e => setForm(d => ({ ...d, desc: e.target.value }))}
                    rows={3}
                    style={{ ...fieldStyle, resize: "none", lineHeight: 1.6 }} />
                </div>

                {/* ── Step 7: Location ── */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 22, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ background: "var(--tanim)", color: "#fff", borderRadius: 99, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "var(--fs-label)" }}>7</div>
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
                  <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    ← {t("back")}
                  </button>
                  <button className="btn-primary" onClick={saveForm} style={{ flex: 2 }}>
                    {editId ? t("save_changes") : t("trade_post_now")}
                  </button>
                </div>
              </div>
            </>
          </Sheet>
        );
      })()}
      {/* ── Cart Drawer ── */}
      <Sheet
        open={showCart}
        onClose={closeCart}
        className="cart-sheet"
        label={t("cart_title")}
      >
        <>
            {/* Same header as the alerts sheet: title, count, round close. */}
            <div className="cart-sheet-hdr">
              <div>
                <div className="cart-hdr-t">{t("cart_title")}</div>
                <div className="cart-hdr-s">{cartCount} {cartCount !== 1 ? t("cart_items_selected") : t("cart_item_selected")}</div>
              </div>
              <button className="alerts-close" onClick={closeCart} aria-label={t("close")}>
                <X size={22} color="#fff" strokeWidth={2.4} />
              </button>
            </div>

            {/* Items */}
            <div className="modal-sheet cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty cart-face">
                  <div className="cart-empty-ico"><ShoppingCart size={44} color="var(--line-strong)" /></div>
                  <div className="cart-empty-txt">{t("cart_empty_title")}</div>
                  <div className="cart-empty-sub">{t("cart_empty_sub")}</div>
                  {/* An empty state with a way out, not a dead end. */}
                  <button className="cart-empty-btn" onClick={closeCart}>{t("cart_browse")}</button>
                </div>
              ) : (
                cart.map(item => {
                  const photo = photoOf(item);
                  const atMax = item.qty >= item.maxKg;
                  const last = item.qty <= 1;
                  const gone = folding.includes(item.listingId);
                  const undoable = tomb.includes(item.listingId);
                  return (
                    <AutoHeight key={item.listingId} className={`cart-slot ${gone ? "is-empty" : ""}`}>
                      {gone ? null : undoable ? (
                        <div className="cart-tomb cart-face" role="status" key="tomb">
                          <span className="cart-tomb-ico"><Trash2 size={18} strokeWidth={2.2} /></span>
                          <span className="cart-tomb-txt">{t("cart_removed")} <strong>{item.crop}</strong></span>
                          <button onClick={() => undoRemove(item.listingId)}>{t("cart_undo")}</button>
                          <span className="cart-tomb-timer" aria-hidden="true" />
                        </div>
                      ) : (
                        <div className="cart-item cart-face" key="item">
                          <div className="cart-thumb">
                            {photo
                              ? <img src={photo} alt="" loading="lazy" decoding="async" />
                              : <CropIcon crop={item.crop} size={26} />}
                          </div>
                          <div className="cart-item-body">
                            <div className="cart-item-top">
                              <div className="cart-item-name">{item.crop}</div>
                              <div className="cart-item-sum">₱{(item.qty * item.pricePerKg).toLocaleString()}</div>
                            </div>
                            <div className="cart-item-meta">
                              {item.seller} · <MapPin size={13} strokeWidth={2.2} /> {item.location}
                            </div>
                            <div className="cart-item-rate">₱{item.pricePerKg}<span>{t("per_kg_short")}</span></div>

                            <div className="cart-step-row">
                              {/* At 1 kg the minus becomes a bin: one control
                                  for "less" all the way down to "none", and no
                                  red button parked beside every line. */}
                              <div className="qty-step">
                                <button
                                  className={last ? "is-bin" : ""}
                                  aria-label={last ? t("cart_remove") : t("cart_less")}
                                  onClick={() => last ? removeFromCart(item.listingId) : updateCartQty(item.listingId, item.qty - 1)}
                                >
                                  <span className="qty-step-ico" key={last ? "bin" : "minus"}>
                                    {last ? <Trash2 size={17} strokeWidth={2.2} /> : <Minus size={18} strokeWidth={2.6} />}
                                  </span>
                                </button>
                                <span className="qty-step-val">{item.qty}<small>kg</small></span>
                                <button aria-label={t("cart_more")} disabled={atMax} onClick={() => updateCartQty(item.listingId, item.qty + 1)}>
                                  <Plus size={18} strokeWidth={2.6} />
                                </button>
                              </div>
                              {atMax && <span className="cart-step-note">{t("cart_all_avail")}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </AutoHeight>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {/* Stays while any line is listed, even one waiting on Undo, so the
                sheet doesn't collapse under the thumb mid-decision. */}
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-row">
                  <div>
                    <div className="cart-total-lbl">{t("cart_total")}</div>
                    <div className="cart-total-sub">
                      {cartKg} kg · {sellerCount} {sellerCount !== 1 ? t("cart_sellers") : t("cart_seller")}
                    </div>
                  </div>
                  <div className="cart-total-val">₱{cartTotal.toLocaleString()}</div>
                </div>
                {/* Says what happens next, so "Confirm" doesn't read as "pay". */}
                <p className="cart-pay-note">{t("cart_pay_note")}</p>
                <button className="cart-checkout-btn" onClick={handleCheckout} disabled={activeCart.length === 0}>
                  {t("cart_confirm")}
                </button>
              </div>
            )}
        </>
      </Sheet>

      {/* ── Checkout Success ──
          The one place in the app that gets a celebration. It is seen once per
          order, it is the end of a long flow, and the scale-in is what makes
          it read as an arrival rather than a screen that was always there. */}
      <Sheet
        open={checkoutDone}
        onClose={() => setCheckoutDone(false)}
        variant="center"
        className="checkout-card"
        label={t("cart_order_placed")}
      >
        <div className="checkout-pop" style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>{t("cart_order_placed")}</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", lineHeight: 1.6 }}>{t("cart_order_sent")}</div>
        <div style={{ marginTop: 20, padding: "10px 0", background: "var(--tanim-sk)", borderRadius: 10, fontSize: "var(--fs-label)", fontWeight: 700, color: "var(--tanim)" }}>✓ {t("cart_txn_recorded")}</div>
      </Sheet>

      {/* ── Seller Details Modal ── */}
      <Sheet
        open={!!sellerDetail}
        onClose={() => setSellerDetail(null)}
        className="seller-modal-sheet"
        label={shownSeller?.name ?? t("seller_about")}
      >
        {shownSeller && <>

            {/* Hero header */}
            <div className="seller-modal-hero">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div className="seller-modal-ava">{shownSeller.initials}</div>
                  <div className="seller-modal-name">{shownSeller.name}</div>
                  <div className="seller-modal-sub" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} color="rgba(255,255,255,0.7)" />{shownSeller.location}
                  </div>
                </div>
                <button className="sheet-x" onClick={() => setSellerDetail(null)} aria-label={t("close")}>✕</button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="seller-modal-stats">
              {[
                { val: shownSeller.rating.toFixed(1), lbl: t("seller_rating"), ico: <Star size={14} color="var(--gold-text)" fill="var(--gold-text)" /> },
                { val: `${shownSeller.yearsfarming} yrs`, lbl: t("seller_experience"), ico: <Wheat size={14} color="var(--tanim)" /> },
                { val: `${shownSeller.totalSales}+`, lbl: t("seller_sales"), ico: <Package size={14} color="var(--tanim)" /> },
              ].map(s => (
                <div className="sms-item" key={s.lbl}>
                  <div className="sms-val">{s.val}</div>
                  <div className="sms-lbl" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>{s.ico}{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="seller-modal-body">

              {/* What they are selling: the reason most people open a
                  profile at all, so it comes before the contact details. */}
              <div className="sml">
                <div className="sml-head">
                  <span className="sdm-lbl">{t("seller_listings")}</span>
                  <span className="sml-count">{sellerListings.length}</span>
                </div>
                {sellerListings.length === 0 ? (
                  <p className="sml-none">{t("seller_listings_none")}</p>
                ) : (
                  <div className="sml-list">
                    {sellerListings.map(l => {
                      const photo = photoOf(l);
                      return (
                        <button key={l.id} className="sml-row" onClick={() => openFromProfile(l.id)}>
                          <span className="sml-photo">
                            {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={20} />}
                          </span>
                          <span className="sml-body">
                            <span className="sml-name">{titleOf(l)}</span>
                            <span className="sml-meta">{l.kg} {t("trade_kg_available")}</span>
                          </span>
                          <span className="sml-price">₱{l.pricePerKg}<small>{t("per_kg_short")}</small></span>
                          <ChevronRight size={18} strokeWidth={2.4} className="sml-chev" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="sdm-row">
                <div className="sdm-ico"><Phone size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_phone")}</div>
                  <div className="sdm-val">{shownSeller.phone}</div>
                </div>
              </div>

              {/* Location */}
              <div className="sdm-row">
                <div className="sdm-ico"><MapPin size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_location")}</div>
                  <div className="sdm-val">{shownSeller.location}</div>
                </div>
              </div>

              {/* Years of farming */}
              <div className="sdm-row">
                <div className="sdm-ico"><Sprout size={20} color="var(--tanim)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_years")}</div>
                  <div className="sdm-val">{shownSeller.yearsfarming} {t("seller_years_suffix")}</div>
                </div>
              </div>

              {/* Seller rating */}
              <div className="sdm-row">
                <div className="sdm-ico"><Star size={20} color="var(--gold-text)" fill="var(--gold-text)" /></div>
                <div>
                  <div className="sdm-lbl">{t("seller_rating")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={16} color="var(--gold-text)" fill={i <= Math.round(shownSeller.rating) ? "var(--gold-text)" : "none"} />
                    ))}
                    <span className="sdm-val">{shownSeller.rating.toFixed(1)}</span>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)" }}>/ 5.0</span>
                  </div>
                </div>
              </div>

              {/* Crops */}
              <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1px solid var(--paper-alt)" }}>
                <div className="sdm-lbl" style={{ marginBottom: 8 }}>{t("seller_crops_sold")}</div>
                <div className="sdm-crops">
                  {shownSeller.crops.map(c => (
                    <span key={c} className="sdm-crop-tag">{c}</span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="sdm-bio">
                <div className="sdm-lbl" style={{ marginBottom: 6 }}>{t("seller_about")}</div>
                {shownSeller.bio}
              </div>

            </div>

            {/* Footer: call button */}
            <div className="seller-modal-footer">
              <button className="call-seller-btn">
                <Phone size={20} color="#fff" /> {t("seller_call")} {shownSeller.name.split(" ")[0]}
              </button>
            </div>

        </>}
      </Sheet>

    </div>
  );
}
