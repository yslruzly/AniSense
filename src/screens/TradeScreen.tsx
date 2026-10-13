import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, Plus, Minus, X, Check, Search, Pencil, Trash2, ChevronRight, Package, Calendar, Star, MapPin, Phone, AlertTriangle, Wheat, Sprout, ArrowUpDown, Camera, ImageOff, ArrowUp, ArrowDown } from "lucide-react";
import { haptic } from "../lib/platform";
import { useLang, translations } from "../i18n";
import { UserRole, CartItem, SellerDetail, TradeIntent, Listing } from "../types";
import { CROP_FILTER_MAP, CROP_FAMILIES, ALL_RICE_NAMES, RICE_VARIETY_LIST, familyCropNames, FAMILY_GROUPS, CROP_GROUPS, RICE_VARIETIES, CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropPhotoFor, cropGroupPhoto } from "../data/cropPhotos";
import { GROW_ART } from "../data/growArt";
import marketPoster from "../assets/anisense-poster-market.webp";
import sellPoster from "../assets/farmer-market-poster.webp";
import supportPoster from "../assets/support-local-farmers.webp";
import { PosterCarousel } from "../components/home/PosterCarousel";
import { CropEmoji } from "../components/icons/CropEmoji";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";
import { AutoHeight } from "../components/ui/AutoHeight";
import { EmptyState, SkeletonCards } from "../components/states";
import { downscaleImage } from "../lib/image";
import { MenuPicker } from "../components/ui/MenuPicker";
import { Receipt, ReceiptOrder } from "../components/marketplace/Receipt";
import { avatarTone as avaTone } from "../lib/avatar";
import leafMask from "../assets/anisense-leaf-mask.png";
import { AniSenseLogo } from "../components/brand/AniSenseLogo";
import { PickerField } from "../components/ui/PickerField";
import { townsOf } from "../data/locations";
import { QtyField } from "../components/ui/QtyField";
import { useViewer } from "../store/viewer";
import { useMarket, sellerKeyOfDetail } from "../store/market";
import { useOwnHarvest, vsMarket } from "../components/home/FarmerHome";
import { growArtFor } from "../data/growArt";
import { FeaturedFarmersRow } from "../components/marketplace/FeaturedFarmersRow";
import { BackToTop } from "../components/ui/BackToTop";
import { rankOf, ratingText, unrated } from "../lib/rating";
import { FarmerOfTheWeekBadge } from "../components/marketplace/FarmerOfTheWeekBadge";
import { farmerOfTheWeek } from "../lib/featured";
import { orderErrorOf } from "../services/transactions";
import { peso, decimalText } from "../lib/money";

// A farmer's profile is always in English, whatever language the app is set
// to: it is their public card, and it reads the same to every buyer.
const en = (key: keyof typeof translations) => translations[key].en;

// ─── Trade / Marketplace Screen ───────────────────────────────────────────────
export function TradeScreen({ onProfile, onBack, userName = "Juan Dela Cruz", userInitials = "JD", userRole, intent }: { onProfile: () => void; onBack: () => void; userName?: string; userInitials?: string; userRole?: UserRole; intent?: TradeIntent }) {
  const { t, tn, lang } = useLang();
  // Listings, sellers and every change to them go through the market store:
  // the database for a real account, the sample market otherwise.
  const market = useMarket();
  const listings = market.listings;
  // Opening the marketplace is when a buyer wants it current.
  useEffect(() => { void market.refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const [search, setSearch] = useState(intent?.search ?? "");
  /* The green key at the end of the bar puts this keyboard away. */
  const searchRef = useRef<HTMLInputElement>(null);
  // Where "search" takes the eye: the head of the results.
  const resultsRef = useRef<HTMLDivElement>(null);
  // The page itself, for the back-to-top button.
  const scrollRef = useRef<HTMLDivElement>(null);
  // The listing open in the detail sheet. Held by id, so an edit or a cart
  // change shows in the sheet straight away.
  const [openId, setOpenId] = useState<string | null>(null);
  // The filter is two steps, the second inside the first: a family (All,
  // Crops, Vegetables, Fruits), then one crop of that family, or all of it.
  // Home's Crops / Fruits / Vegetables cards open the marketplace already on
  // that family; arriving for one crop opens on that crop's family.
  const [category, setCategory] = useState(intent?.category ?? "All Crops");
  const [family, setFamily] = useState(intent?.family
    ?? CROP_FAMILIES.find(f => (FAMILY_GROUPS[f] ?? []).includes(intent?.category ?? "")) ?? "All");
  const [variety, setVariety] = useState("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  // The post form's field that needs an answer: its message sits under it,
  // and the form scrolls to it. (formError is for the server's answer, said
  // over the Post button where the farmer is looking.)
  const [bad, setBad] = useState<null | "price" | "kg" | "desc" | "loc">(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const kgRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const locRef = useRef<HTMLDivElement>(null);
  // A post or an edit on its way to the server: the button says so and
  // can't be pressed twice.
  const [saving, setSaving] = useState(false);
  const [removeError, setRemoveError] = useState("");
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
  // A farmer's own listings, in one sheet (samples before their first post).
  const [showMine, setShowMine] = useState(false);
  const own = useOwnHarvest();
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [checkoutDone, setCheckoutDone] = useState(false);
  // Checkout on its way, and why it didn't go through if it didn't. The cart
  // is kept on failure: nothing the buyer chose is lost to a bad signal.
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  // What was ordered, kept after the cart empties, so the receipt can show it.
  const [order, setOrder] = useState<ReceiptOrder | null>(null);
  // The farmer's own province and town, read from their profile ("San
  // Ricardo, Talavera, Nueva Ecija"): a listing is placed in one of that
  // province's towns, and starts in theirs ("Talavera").
  const { location: profileLocation } = useViewer();
  const { towns: homeTowns, town: homeTown } = townsOf(profileLocation ?? "");
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
    const s = intent?.seller ? market.sellers[intent.seller] : undefined;
    if (s) setSellerDetail(s);
    // Once, on arrival. The intent is fixed for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pendingDelete = useRetained(confirmDelete);

  // A crop is always one of the chosen family's, so the two never disagree:
  // picking a family starts again at "all of it", and picking a crop keeps
  // the family and starts again at all its varieties.
  const selectCategory = (cat: string) => { haptic.select(); setCategory(cat); setVariety("All"); };
  const selectFamily = (fam: string) => { haptic.select(); setFamily(fam); setCategory("All Crops"); setVariety("All"); };
  const clearFilters = () => { setSearch(""); setFamily("All"); setCategory("All Crops"); setVariety("All"); };

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
  // a second tap can never quietly stack the quantity.
  const addToCart = (l: Listing) => {
    const qty = getQty(l.id);
    if (tomb.includes(l.id)) { undoRemove(l.id); return; }
    setCart(prev => prev.some(c => c.listingId === l.id)
      ? prev
      : [...prev, { listingId: l.id, crop: l.crop, variety: l.variety, pricePerKg: l.pricePerKg, qty, seller: l.seller, sellerInitials: l.sellerInitials, location: l.location, maxKg: l.kg, photo: l.photo }]);
  };


  // The green search key, and the keyboard's own Search key. With nothing
  // typed, it opens the keyboard in the field. With a search typed, the list
  // has already filtered, so it puts the keyboard away and brings the
  // results up to the top of the screen, where they can be seen. It used to
  // only close the keyboard, which from the outside looked like nothing.
  const runSearch = () => {
    haptic.select();
    const field = searchRef.current;
    if (!field) return;
    if (!search.trim()) { field.focus(); return; }
    field.blur();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  const handleCheckout = async () => {
    if (placing || activeCart.length === 0) return;
    // The receipt is written from the cart as it stands at the tap, before
    // the cart is emptied; lines waiting on Undo are not part of the order.
    const lines = [...activeCart];
    setPlacing(true);
    setOrderError("");
    try {
      await market.placeOrder(lines);
    } catch (err) {
      haptic.warn();
      setOrderError(t(`order_err_${orderErrorOf(err)}`));
      setPlacing(false);
      return;
    }
    setPlacing(false);
    haptic.success();
    setOrder({ placed: new Date(), buyer: userName, lines });
    tombTimers.current.forEach(t => window.clearTimeout(t));
    tombTimers.current.clear();
    setTomb([]);
    setFolding([]);
    setCart([]);
    setShowCart(false);
    setCheckoutDone(true);
  };

  // Determine which listings to show
  const q = search.toLowerCase();
  const matchesSearch = (l: typeof listings[number]) =>
    !q || l.crop.toLowerCase().includes(q) || l.seller.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
  const inCategory = (l: typeof listings[number], cat: string) => cat === "Rice"
    ? ALL_RICE_NAMES.has(l.crop) || RICE_VARIETY_LIST.includes(l.crop)
    : (CROP_FILTER_MAP[cat] || []).includes(l.crop) || l.crop === cat;
  const filtered = listings.filter(l => {
    if (!matchesSearch(l)) return false;
    if (family !== "All") {
      const names = familyCropNames(family);
      if (!names.includes(l.crop) && !names.includes(l.variety)) return false;
    }
    if (category === "All Crops") return true;
    if (!inCategory(l, category)) return false;
    return variety === "All" || l.crop === variety || l.variety === variety;
  });
  // How many are for sale under each crop, by the same rules as the list
  // itself (and whatever has been searched), so a crop only goes quiet when
  // the list would really be empty.
  const searched = listings.filter(matchesSearch);
  const countOf = (cat: string) => searched.filter(l => inCategory(l, cat)).length;


  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.pricePerKg - b.pricePerKg;
    if (sortBy === "price-desc") return b.pricePerKg - a.pricePerKg;
    if (sortBy === "rating") return rankOf(b) - rankOf(a);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const openPost = () => {
    setEditId(null);
    setForm({ crop: "Special Rice", variety: "", desc: "", pricePerKg: "", kg: "", location: homeTown, photo: null });
    setPhotoState("idle");
    setFormError("");
    setBad(null);
    setShowModal(true);
  };

  // Sent here from a featured harvest on Home: its details slide up over the
  // marketplace, which is already showing that crop underneath. Set after
  // mount, like a featured farmer's profile, so the sheet arrives rather
  // than simply being there. If the listing has just sold out, nothing opens
  // and the crop's other listings are what the buyer sees.
  useEffect(() => {
    if (intent?.listing) setOpenId(intent.listing);
    // Once, on arrival. The intent is fixed for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sent here by "Post a harvest" on Home: open the form on arrival.
  useEffect(() => {
    if (intent?.post) openPost();
    // Once, on arrival; the intent is fixed for this visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (l: Listing) => {
    setEditId(l.id);
    setForm({ crop: l.crop, variety: l.variety, desc: l.desc, pricePerKg: String(l.pricePerKg), kg: String(l.kg), location: l.location, photo: l.photo ?? null });
    setPhotoState("idle");
    setFormError("");
    setBad(null);
    setShowModal(true);
  };

  // A field that needs an answer: say so under it, bring it into view and
  // put the cursor in it (the keyboard comes up for a number or the words).
  const askFor = (field: "price" | "kg" | "desc" | "loc") => {
    setBad(field);
    haptic.warn();
    const el = { price: priceRef, kg: kgRef, desc: descRef, loc: locRef }[field].current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
    (field === "loc" ? el?.querySelector("button") : el)?.focus({ preventScroll: true });
  };

  const saveForm = async () => {
    if (saving) return;
    setFormError("");
    const positive = (v: string) => !!v && !isNaN(Number(v)) && Number(v) > 0;
    if (!positive(form.pricePerKg)) return askFor("price");
    if (!positive(form.kg)) return askFor("kg");
    if (!form.desc.trim()) return askFor("desc");
    if (!form.location.trim()) return askFor("loc");

    setSaving(true);
    setBad(null);
    try {
      await market.saveListing(editId, {
        crop: form.crop, variety: form.variety, desc: form.desc,
        pricePerKg: Number(form.pricePerKg), kg: Number(form.kg), location: form.location,
        photo: form.photo,
      });
    } catch {
      haptic.warn();
      setFormError(t(navigator.onLine ? "err_post_failed" : "err_offline_action"));
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteListing = async (id: string) => {
    setRemoveError("");
    try {
      await market.deleteListing(id);
    } catch {
      haptic.warn();
      setRemoveError(t(navigator.onLine ? "err_remove_failed" : "err_offline_action"));
      return;
    }
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
  const sellerListings = shownSeller ? listings.filter(l => market.sellerKeyOf(l) === sellerKeyOfDetail(shownSeller)) : [];
  // Whether the open profile is this week's AniSense Farmer of the Week: the
  // same rule Home and Featured farmers use, so the plate is on the profile
  // exactly when it is on their card.
  const shownIsWeek = !!shownSeller && farmerOfTheWeek(market.sellers)?.key === sellerKeyOfDetail(shownSeller);
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

  // The seller's own photo when they added one; otherwise the stock photo of
  // that crop, so no listing is ever a blank tile.
  const photoOf = (l: { photo?: string; crop: string; variety: string }) => l.photo ?? cropPhotoFor(l.crop, l.variety);

  // "Red" under "Onions" reads as "Red Onions"; "Yellow Corn" under "Corn"
  // already says it; a variety that repeats the crop is said once.
  const titleOf = (l: Listing) => {
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
      {/* Back to the top, once the list is a long way down. */}
      <BackToTop scroller={scrollRef} />
      <div className="scroll screen-enter" ref={scrollRef}>
        {/* Each side opens on its own poster: buyers on "connect with local
            farmers", farmers on "marketplace for farmers: sell your harvest,
            reach more buyers" — the thing each of them came here to do, said
            once, where a line of copy used to be. Then, for both, "Support
            our local farmers": the two take turns, as Home's posters do (the
            same banner: dots, a swipe, a tap to see one whole). All 16:9, in
            a frame of that shape. The header above already names the page. */}
        <PosterCarousel className="mp-banner" posters={[
          userRole === "buyer"
            ? { src: marketPoster, alt: t("mp_poster_alt"), width: 1200, height: 675 }
            : { src: sellPoster, alt: t("mp_poster_sell_alt"), width: 1200, height: 675 },
          { src: supportPoster, alt: t("mp_poster_support_alt"), width: 1200, height: 675 },
        ]} />

        {/* A farmer's two ways in: sell something, or see what they are
            already selling. Their own listings used to be found only by
            scrolling the whole market for the "Your listing" tag. */}
        {userRole !== "buyer" && (
          <div className="mp-sell-row">
            <button className="mp-sell-btn" onClick={openPost}>
              <Plus size={20} strokeWidth={2.6} /> {t("trade_sell")}
            </button>
            <button className="mp-mine-btn" onClick={() => setShowMine(true)}
              aria-label={own.mine.length > 0 ? `${t("mp_your_listings")} (${own.mine.length})` : t("mp_your_listings")}>
              {/* The count rides on the box, like the cart's: it costs the button no width. */}
              <span className="mp-mine-ico" aria-hidden="true">
                <Package size={19} strokeWidth={2.4} />
                {own.mine.length > 0 && <span className="mp-mine-n">{own.mine.length}</span>}
              </span>
              {t("mp_your_listings")}
            </button>
          </div>
        )}

        <div className="search-box">
          <Search size={21} strokeWidth={2.4} aria-hidden="true" />
          <input ref={searchRef} placeholder={t("trade_search_ph")} value={search} onChange={e => setSearch(e.target.value)} enterKeyHint="search" autoFocus={!!intent?.focusSearch}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } }} />
          {search && (
            <button className="pr-clear" onClick={() => setSearch("")} aria-label={t("state_clear_search")}>
              <X size={16} strokeWidth={2.6} />
            </button>
          )}
          {/* The same green key as Home's bar. The list has already filtered
              as you typed, so pressing it puts the keyboard away and hands the
              screen back to the results. */}
          <button
            className="search-go"
            aria-label={t("search")}
            onMouseDown={e => e.preventDefault()}
            onClick={runSearch}
          >
            <Search size={20} strokeWidth={2.8} />
          </button>
        </div>

        {/* Filters, one step at a time. First the kind: All, Crops,
            Vegetables or Fruits, four words on one switch. Only then, and
            only for the kind chosen, its crops as a short row of pills: two
            to five choices instead of a wall of eleven tiles before the first
            harvest is in sight. Varieties follow the same way, once a crop
            is chosen. Nothing to swipe: the pills wrap. */}
        <div className="mp-filters">
          <div className="fseg" role="tablist" aria-label={t("mp_family")}>
            {/* The pill is one element that slides between the labels, not a
                highlight that blinks off one and on the next: the eye follows
                the move and knows where it came from. A CSS transition, so a
                second tap mid-slide simply retargets it. */}
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
                {/* Always in English, whichever language the app is set to,
                    like the Crops / Fruits / Vegetables cards on Home: the
                    same four words wherever the market is sorted. */}
                {f}
              </button>
            ))}
          </div>
          {family !== "All" && (
            <div className="mp-crops" role="radiogroup" aria-label={t("trade_select_category")} key={family}>
              <button role="radio" aria-checked={category === "All Crops"} className={`mp-chip all ${category === "All Crops" ? "on" : ""}`} onClick={() => selectCategory("All Crops")}>
                {t("all")}
              </button>
              {(FAMILY_GROUPS[family] ?? []).map(cat => {
                // The crop's own photo (the team's, in assets/crops), round,
                // the same picture as its listings and its price.
                const photo = cropGroupPhoto(cat);
                return (
                  // A crop with nothing for sale right now is quieter, so a
                  // farmer or buyer sees where to tap before tapping.
                  <button key={cat} role="radio" aria-checked={category === cat}
                    className={`mp-chip${category === cat ? " on" : ""}${countOf(cat) === 0 ? " none" : ""}`}
                    onClick={() => selectCategory(cat)}>
                    <span className="mp-chip-ico" aria-hidden="true">
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" draggable={false} /> : <CropIcon crop={cat} size={18} />}
                    </span>
                    {tn(cat)}
                  </button>
                );
              })}
            </div>
          )}
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

        {/* Who grows it, before the harvests: only while browsing everything,
            since a search or a filter means the buyer knows what they want. */}
        {!search.trim() && family === "All" && category === "All Crops" && (
          <FeaturedFarmersRow onOpen={key => setSellerDetail(market.sellers[key] ?? null)} />
        )}

        {/* While nobody has posted yet: the harvests below are samples, said
            once, plainly, where the list starts. */}
        {market.showingSamples && (
          <p className="mp-sample-note" role="note"><Sprout size={18} strokeWidth={2.4} aria-hidden="true" /> {t("mp_samples_note")}</p>
        )}

        {/* How the list is sorted, at the head of the list it sorts. */}
        <div className="mp-list-head" ref={resultsRef}>
          {/* Four options, so a plain menu under the button: the sheet we use
              for long lists was a lot of machinery between a tap and an
              answer, and it misbehaved here. */}
          <MenuPicker
            align="end"
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

        {/* While a real account's first load is on its way: cards in the
            list's own shape, never "no listings", which would be false. */}
        {market.loadPhase !== "ready" ? (
          market.loadPhase === "skeleton" ? <SkeletonCards count={6} label={t("state_loading_listings")} /> : null
        ) : sorted.length > 0 ? (
          <div className="mp-grid stagger-list" key={`${family}-${category}-${variety}-${sortBy}`}>
            {sorted.map(l => {
              const photo = photoOf(l);
              const mine = market.isMine(l);
              const inC = isInCart(l.id);
              return (
                <article key={l.id} className="mp-card">
                  <button className="mp-card-main" onClick={() => setOpenId(l.id)}
                    aria-label={`${titleOf(l)}, ${peso(l.pricePerKg)} ${t("per_kg_short")}, ${l.kg} kg, ${l.seller}`}>
                    <span className="mp-card-photo">
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={30} />}
                      {mine
                        ? <span className="mp-mine">{t("mp_your_listing")}</span>
                        : l.sample
                          ? <span className="mp-mine is-sample">{t("mp_sample")}</span>
                          : l.photo && <span className="mp-mine"><Camera size={12} strokeWidth={2.4} /> {t("mp_seller_photo")}</span>}
                    </span>
                    <span className="mp-card-body">
                      <span className="mp-card-name">{titleOf(l)}</span>
                      <span className="mp-card-price">{peso(l.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                      <span className="mp-card-meta">{l.kg} kg · {l.location}</span>
                      <span className="mp-card-seller">
                        {/* The rating is the one number a buyer weighs a
                            stranger by, so it gets the gold chip. */}
                        <span className="mp-rate"><Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" /> {ratingText(l, t("rating_new"))}</span>
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
            onAction={clearFilters}
          />
        )}
      </div>

      {/* ── Your listings ── A farmer's own harvests, a card each: the
          picture, what it is, its price, the kilos left and when it went up,
          and how the price stands against the market. The card opens the
          listing (Edit, Remove) once this sheet has gone, so one sheet leaves
          before the next arrives; the red bin beside it removes it straight
          from here, after the same "Remove listing?" as everywhere, and the
          list closes up under it. Before their first post, the sample ones,
          tagged and only to read: no bin, nothing to open. */}
      <Sheet open={showMine} onClose={() => setShowMine(false)} className="cart-sheet yl-sheet" label={t("mp_your_listings")}>
        <div className="cart-sheet-hdr">
          <div>
            <div className="cart-hdr-t">
              {t("mp_your_listings")}
              {own.samples && <span className="ph-sample">{t("mp_sample")}</span>}
            </div>
            <div className="cart-hdr-s">
              {own.shown.length > 0
                ? t("fh_summary")
                    .replace("{n}", own.shown.length === 1 ? t("fh_listing_one") : t("fh_listings_n").replace("{n}", String(own.shown.length)))
                    .replace("{kg}", own.shown.reduce((sum, l) => sum + l.kg, 0).toLocaleString())
                : t("fh_empty_t")}
            </div>
          </div>
          <button className="alerts-close" onClick={() => setShowMine(false)} aria-label={t("close")}>
            <X size={22} color="#fff" strokeWidth={2.4} />
          </button>
        </div>
        <div className="modal-sheet cart-body yl-body">
          {own.samples && (
            <p className="mp-sample-note" role="note"><Package size={18} strokeWidth={2.4} aria-hidden="true" /> {t("fh_samples_note")}</p>
          )}
          {own.shown.length > 0 ? (
            <ul className="yl-list">
              {own.shown.map(l => {
                const vs = vsMarket(l);
                const art = l.photo ? undefined : growArtFor(l.crop);
                const pic = l.photo || art;
                const name = titleOf(l);
                const body = (
                  <>
                    <span className={`yl-ph${art ? " is-art" : ""}`}>
                      {pic ? <img src={pic} alt="" loading="lazy" decoding="async" draggable={false} /> : <CropIcon crop={l.crop} size={24} />}
                    </span>
                    <span className="yl-txt">
                      <span className="yl-name">{name}</span>
                      <span className="yl-price">{peso(l.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                      <span className="yl-meta">{l.kg.toLocaleString()} {t("fh_left")} · {posted(l.date)}</span>
                      {vs && (
                        <span className={`yl-vs ${vs.dir}`}>
                          {vs.dir === "up" && <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />}
                          {vs.dir === "down" && <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />}
                          {vs.dir === "same" ? t("fh_at") : `${peso(Math.abs(vs.diff))} ${vs.dir === "up" ? t("fh_above") : t("fh_below")}`}
                        </span>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={l.id} className={`yl-card${l.sample ? " is-sample" : ""}`}>
                    {l.sample ? (
                      <div className="yl-main">{body}</div>
                    ) : (
                      <>
                        <button type="button" className="yl-main" onClick={() => { setShowMine(false); window.setTimeout(() => setOpenId(l.id), 200); }}>
                          {body}
                          <ChevronRight size={18} strokeWidth={2.4} className="yl-chev" aria-hidden="true" />
                        </button>
                        <button type="button" className="yl-del" onClick={() => { haptic.select(); setConfirmDelete(l.id); }} aria-label={`${t("trade_remove")}: ${name}`}>
                          <Trash2 size={20} strokeWidth={2.2} />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Package size={26} aria-hidden="true" />} title={t("fh_empty_t")} body={t("fh_empty_s")} />
          )}
          <button className="mp-sell-btn yl-post" onClick={() => { setShowMine(false); window.setTimeout(openPost, 200); }}>
            <Plus size={20} strokeWidth={2.6} /> {t("fh_post")}
          </button>
        </div>
      </Sheet>

      {/* ── Listing detail ── */}
      <Sheet open={!!openListing} onClose={() => setOpenId(null)} className="pr-sheet mp-sheet modal-sheet" label={shownListing ? titleOf(shownListing) : t("trade_marketplace")}>
        {shownListing && (() => {
          const l = shownListing;
          const photo = photoOf(l);
          const mine = market.isMine(l);
          const inC = isInCart(l.id);
          const qty = getQty(l.id);
          // Who to ring for Call Now. A sample farmer is nobody's phone.
          const seller = market.sellers[market.sellerKeyOf(l)];
          const tel = seller && !seller.sample ? seller.phone.replace(/[^\d+]/g, "") : "";
          return (
            <>
              <div className="pr-sheet-hero">
                <span className="pr-sheet-photo">{photo ? <img src={photo} alt="" /> : <CropEmoji crop={l.crop} size={44} />}</span>
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
                  <span className="pr-big">{peso(l.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                  <span className="mp-avail green"><Package size={15} strokeWidth={2.2} /> {l.kg} {t("trade_kg_available")}</span>
                </div>
                <div className="pr-sheet-sub"><Calendar size={13} strokeWidth={2.2} /> {t("mp_posted")} {posted(l.date)}</div>

                {l.desc && <p className="mp-desc">{l.desc}</p>}

                {/* The seller, as one tappable row: the way to their details. */}
                <button className="mp-seller" onClick={() => setSellerDetail(market.sellers[market.sellerKeyOf(l)] || null)}>
                  <span className="seller-ava" style={{ background: avaTone(l.seller) }}>{l.sellerInitials}</span>
                  <span className="mp-seller-who">
                    <span className="mp-seller-name">{l.seller}</span>
                    <span className="mp-seller-meta">
                      <span className="mp-rate"><Star size={12} fill="currentColor" strokeWidth={0} /> {ratingText(l, t("rating_new"))}</span>
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
                        commit to it. Same stepper as the cart: − and +, and
                        the kilos between them can be typed. */}
                    <div className="mp-qty">
                      <span className="mp-qty-lbl">{t("mp_how_many")}</span>
                      <div className="qty-step">
                        <button onClick={() => setQty(l.id, qty - 1, l.kg)} disabled={qty <= 1} aria-label={t("cart_less")}>
                          <Minus size={18} strokeWidth={2.6} />
                        </button>
                        <QtyField value={qty} max={l.kg} onChange={n => setQty(l.id, n, l.kg)} label={t("mp_how_many")} />
                        <button onClick={() => setQty(l.id, qty + 1, l.kg)} disabled={qty >= l.kg} aria-label={t("cart_more")}>
                          <Plus size={18} strokeWidth={2.6} />
                        </button>
                      </div>
                      <span className="mp-qty-total">{peso(qty * l.pricePerKg)}</span>
                      {qty >= l.kg && <span className="mp-qty-note">{t("cart_all_avail")}</span>}
                    </div>
                    {/* Add to Cart, and beside it Call Now: the farmer's
                        number in the phone's dialer, to ask before ordering,
                        the way buying from a farmer is usually done here. */}
                    <div className="listing-btns mp-actions">
                      <button className={`add-cart-btn${inC ? " in-cart" : ""}`}
                        onClick={() => (inC ? (setOpenId(null), setShowCart(true)) : addToCart(l))}>
                        <span className="act-lbl" key={inC ? "in" : "add"}>
                          {inC
                            ? <><Check size={18} strokeWidth={2.6} /> {t("cart_in_cart")} <ChevronRight size={16} strokeWidth={2.4} className="act-chev" /></>
                            : <><ShoppingCart size={18} strokeWidth={2.2} /> {t("cart_add")}</>}
                        </span>
                      </button>
                      {tel ? (
                        <a className="call-now-btn" href={`tel:${tel}`} aria-label={`${t("mp_call_now")}: ${l.seller}`}>
                          <Phone size={18} strokeWidth={2.2} /> {t("mp_call_now")}
                        </a>
                      ) : (
                        <button className="call-now-btn" disabled aria-describedby="mp-call-none">
                          <Phone size={18} strokeWidth={2.2} /> {t("mp_call_now")}
                        </button>
                      )}
                    </div>
                    {!tel && <p className="mp-call-none" id="mp-call-none">{t("seller_sample_call")}</p>}
                  </>
                ) : (
                  <div className="listing-btns mp-actions">
                    <button className="btn-call"><Phone size={18} strokeWidth={2.2} /> {t("trade_call_seller")}</button>
                    <button className="btn-details" onClick={() => setSellerDetail(market.sellers[market.sellerKeyOf(l)] || null)}>{t("trade_view_details")}</button>
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
        onClose={() => { setConfirmDelete(null); setRemoveError(""); }}
        className="confirm-sheet"
        label={t("trade_remove_title")}
      >
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 10 }}>🗑️</div>
        <div style={{ fontSize: "var(--fs-lead)", fontWeight: 900, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>{t("trade_remove_title")}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--text-muted)", marginBottom: 26, textAlign: "center", lineHeight: 1.6 }}>{t("trade_remove_sub")}</div>
        {removeError && <p className="form-err" role="alert"><AlertTriangle size={17} /> {removeError}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-secondary" onClick={() => { setConfirmDelete(null); setRemoveError(""); }} style={{ flex: 1 }}>← {t("cancel")}</button>
          <button className="btn-danger" onClick={() => pendingDelete && deleteListing(pendingDelete)} style={{ flex: 1 }}>{t("trade_yes_remove")}</button>
        </div>
      </Sheet>

      {/* Post / Edit listing. Four short sections, each a card: what it is,
          its price and amount, a photo, and the words and the town. The
          header and the Post button stay put while the form scrolls between
          them, so closing and posting are always one tap away, and the
          button carries what the listing comes to. A missing answer is said
          under its own field, which the form scrolls to. */}
      {(() => {
        // Crop types and their varieties, straight from the price list. The
        // form kept its own copy, which never learnt about ampalaya or
        // watermelon and spelt two varieties differently from the prices, so
        // those listings found no photo and no market price. Grouped the way
        // the marketplace filters them: crops, vegetables, fruits.
        const varietiesOf = (group: string) => group === "Rice"
          ? RICE_VARIETIES.map(v => v.name)
          : (CROP_GROUPS.find(g => g.group === group)?.varieties ?? []).map(v => v.name);
        const POST_FAMILIES = CROP_FAMILIES.map(family => ({
          family,
          groups: (FAMILY_GROUPS[family] ?? []).map(label => ({ label, varieties: varietiesOf(label) })),
        }));
        const CROP_GROUPS_PICKER = POST_FAMILIES.flatMap(f => f.groups);
        // An existing listing may name its type ("Onions") rather than a
        // variety, so match either before falling back to the first.
        const selectedGroup = CROP_GROUPS_PICKER.find(g => g.varieties.includes(form.crop) || g.label === form.crop) || CROP_GROUPS_PICKER[0];
        // Today's price for this variety, from the same list as Prices: a
        // place to start from, one tap to use.
        const marketKg = (CROPS.find(c => c.name === form.crop) ?? CROPS.find(c => CROP_GROUP_BY_ID[c.id] === form.crop))?.pricePerKg;
        const priceN = Number(form.pricePerKg), kgN = Number(form.kg);
        const total = priceN > 0 && kgN > 0 ? priceN * kgN : 0;
        const errLine = (field: NonNullable<typeof bad>, key: Parameters<typeof t>[0]) => bad === field && (
          <p className="sf-err" id={`sf-${field}-err`} role="alert"><AlertTriangle size={16} strokeWidth={2.4} aria-hidden="true" /> {t(key)}</p>
        );

        return (
          <Sheet
            open={showModal}
            onClose={() => setShowModal(false)}
            className="post-sheet modal-sheet"
            label={editId ? t("trade_edit_listing") : t("trade_post_title")}
          >
            <header className="sf-head">
              <img className="sf-mark" src={leafMask} alt="" aria-hidden="true" />
              <div className="sf-head-txt">
                <h2 className="sf-title">{editId ? t("trade_edit_listing") : t("trade_post_title")}</h2>
                <p className="sf-sub">{editId ? t("trade_edit_listing_sub") : t("trade_post_sub")}</p>
              </div>
              <button type="button" className="sf-x" onClick={() => setShowModal(false)} aria-label={t("close")}>
                <X size={22} strokeWidth={2.4} />
              </button>
            </header>

            <div className="sf-body">
              {/* 1 ── What: the crop as its drawing, then its variety. */}
              <section className="sf-sec" aria-labelledby="sf-what">
                <h3 className="sf-sec-t" id="sf-what"><span className="sf-n" aria-hidden="true">1</span>{t("pl_sec_what")}</h3>
                {POST_FAMILIES.map(f => (
                  <div className="sf-fam" key={f.family}>
                    <div className="sf-fam-t">{t(`fam_${f.family.toLowerCase()}` as "fam_crops")}</div>
                    <div className="sf-tiles">
                      {f.groups.map(g => {
                        const on = selectedGroup.label === g.label;
                        const pic = GROW_ART[g.label] ?? cropGroupPhoto(g.label);
                        return (
                          <button key={g.label} type="button" className={`sf-tile${on ? " on" : ""}`} aria-pressed={on}
                            onClick={() => { haptic.select(); if (!on) setForm(d => ({ ...d, crop: g.varieties[0] })); }}>
                            <span className="sf-tile-pic">
                              {pic ? <img src={pic} alt="" decoding="async" draggable={false} /> : <CropIcon crop={g.label} size={26} />}
                            </span>
                            <span className="sf-tile-n">{tn(g.label)}</span>
                            <span className="sf-tick" aria-hidden="true"><Check size={12} strokeWidth={3.6} /></span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* A crop sold in one variety isn't asked about. */}
                {selectedGroup.varieties.length > 1 && (
                  <div className="sf-varieties" key={selectedGroup.label}>
                    <div className="sf-lbl" id="sf-variety">{t("trade_step_variety")}</div>
                    <div className="sf-chips" role="group" aria-labelledby="sf-variety">
                      {selectedGroup.varieties.map(v => {
                        const on = form.crop === v;
                        return (
                          <button key={v} type="button" className={`sf-chip${on ? " on" : ""}`} aria-pressed={on}
                            onClick={() => { haptic.select(); setForm(d => ({ ...d, crop: v })); }}>
                            {on && <Check size={16} strokeWidth={3} aria-hidden="true" />}{tn(v)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* 2 ── Price and amount: big numbers, the units in the field. */}
              <section className="sf-sec" aria-labelledby="sf-money">
                <h3 className="sf-sec-t" id="sf-money"><span className="sf-n" aria-hidden="true">2</span>{t("pl_sec_price")}</h3>
                <div className="sf-group">
                  <label className="sf-lbl" htmlFor="sf-price">{t("trade_step_price")}</label>
                  <div className={`sf-field${bad === "price" ? " bad" : ""}`} onClick={() => priceRef.current?.focus()}>
                    <span className="sf-pre" aria-hidden="true">₱</span>
                    <input id="sf-price" ref={priceRef} type="text" inputMode="decimal" autoComplete="off" maxLength={9}
                      placeholder="48"
                      value={form.pricePerKg} aria-invalid={bad === "price" || undefined}
                      aria-describedby={[marketKg ? "sf-market" : "", bad === "price" ? "sf-price-err" : ""].filter(Boolean).join(" ") || undefined}
                      onChange={e => { setForm(d => ({ ...d, pricePerKg: decimalText(e.target.value) })); if (bad === "price") setBad(null); }} />
                    <span className="sf-suf" aria-hidden="true">/kg</span>
                  </div>
                  {errLine("price", "err_valid_price")}
                  {marketKg ? (
                    <div className="sf-market" id="sf-market">
                      <span>{t("pl_market_today")} <b>{peso(marketKg)}/kg</b></span>
                      {priceN !== marketKg && (
                        <button type="button" className="sf-use" onClick={() => { haptic.select(); setForm(d => ({ ...d, pricePerKg: String(marketKg) })); if (bad === "price") setBad(null); }}>
                          {t("pl_use")} {peso(marketKg)}
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="sf-group">
                  <label className="sf-lbl" htmlFor="sf-kg">{t("trade_step_qty")}</label>
                  <div className={`sf-field${bad === "kg" ? " bad" : ""}`} onClick={() => kgRef.current?.focus()}>
                    <input id="sf-kg" ref={kgRef} type="text" inputMode="decimal" autoComplete="off" maxLength={9}
                      placeholder="500"
                      value={form.kg} aria-invalid={bad === "kg" || undefined} aria-describedby={bad === "kg" ? "sf-kg-err" : undefined}
                      onChange={e => { setForm(d => ({ ...d, kg: decimalText(e.target.value) })); if (bad === "kg") setBad(null); }} />
                    <span className="sf-suf" aria-hidden="true">kg</span>
                  </div>
                  {errLine("kg", "err_valid_qty")}
                </div>
              </section>

              {/* 3 ── Photo: optional, and what buyers look at first. One
                  big target to add; once there, a preview with Change and
                  Remove underneath. */}
              <section className="sf-sec" aria-labelledby="sf-photo">
                <h3 className="sf-sec-t" id="sf-photo"><span className="sf-n" aria-hidden="true">3</span>{t("mp_step_photo")}<span className="sf-opt">{t("pl_optional")}</span></h3>
                <p className="sf-hint">{t("mp_step_photo_sub")}</p>
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
              </section>

              {/* 4 ── The words and the town. */}
              <section className="sf-sec" aria-labelledby="sf-about">
                <h3 className="sf-sec-t" id="sf-about"><span className="sf-n" aria-hidden="true">4</span>{t("pl_sec_about")}</h3>
                <div className="sf-group">
                  <label className="sf-lbl" htmlFor="sf-desc">{t("trade_step_desc")}</label>
                  <p className="sf-hint" id="sf-desc-hint">{t("trade_step_desc_sub")}</p>
                  <textarea id="sf-desc" ref={descRef} className={`sf-area${bad === "desc" ? " bad" : ""}`} rows={3}
                    placeholder={t("trade_ph_desc")} value={form.desc} aria-invalid={bad === "desc" || undefined}
                    aria-describedby={bad === "desc" ? "sf-desc-hint sf-desc-err" : "sf-desc-hint"}
                    onChange={e => { setForm(d => ({ ...d, desc: e.target.value })); if (bad === "desc") setBad(null); }} />
                  {errLine("desc", "err_desc_required")}
                </div>
                <div className="sf-group">
                  <div className="sf-lbl">{t("trade_step_loc")}</div>
                  <p className="sf-hint">{t("trade_step_loc_sub")}</p>
                  {/* Picked, not typed: free text gave "Talavera", "talavera
                      n.e." and "Brgy. San Ricardo" for one place, and buyers'
                      "Near you" and new-harvest alerts match on the town's
                      exact name. The same searchable list as sign-up. */}
                  <div ref={locRef} className={`sf-pick${bad === "loc" ? " bad" : ""}`}>
                    <PickerField
                      title={t("farm_municipality_lbl")}
                      placeholder={t("farm_pick_municipality")}
                      value={form.location}
                      options={homeTowns}
                      onChange={v => { setForm(d => ({ ...d, location: v })); setFormError(""); if (bad === "loc") setBad(null); }}
                    />
                  </div>
                  {errLine("loc", "err_loc_required")}
                </div>
              </section>
            </div>

            {/* What it comes to, then Post: held at the foot of the sheet. */}
            <footer className="sf-foot">
              {total > 0 && (
                <div className="sf-sum">
                  <span className="sf-sum-what">{tn(form.crop)}, {kgN.toLocaleString()} kg × {peso(priceN)}</span>
                  <span className="sf-sum-total">{peso(total)}</span>
                </div>
              )}
              {formError && (
                <p className="sf-err sf-err-save" role="alert"><AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" /> {formError}</p>
              )}
              <button type="button" className="btn-primary sf-post" onClick={saveForm} disabled={saving} aria-busy={saving}>
                {saving ? t("trade_posting") : editId ? t("save_changes") : t("trade_post_now")}
              </button>
            </footer>
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
                              <div className="cart-item-sum">{peso(item.qty * item.pricePerKg)}</div>
                            </div>
                            <div className="cart-item-meta">
                              {item.seller} · <MapPin size={13} strokeWidth={2.2} /> {item.location}
                            </div>
                            <div className="cart-item-rate">{peso(item.pricePerKg)}<span>{t("per_kg_short")}</span></div>

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
                                <QtyField value={item.qty} max={item.maxKg} onChange={n => updateCartQty(item.listingId, n)}
                                  label={`${item.crop}: ${t("mp_how_many")}`} />
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
                  <div className="cart-total-val">{peso(cartTotal)}</div>
                </div>
                {/* Says what happens next, so "Confirm" doesn't read as "pay". */}
                <p className="cart-pay-note">{t("cart_pay_note")}</p>
                {orderError && <p className="form-err" role="alert"><AlertTriangle size={17} /> {orderError}</p>}
                <button className="cart-checkout-btn" onClick={handleCheckout} disabled={activeCart.length === 0 || placing} aria-busy={placing}>
                  {placing ? t("cart_placing") : t("cart_confirm")}
                </button>
              </div>
            )}
        </>
      </Sheet>

      {/* ── Checkout: the receipt ──
          The one place in the app that gets a celebration: seen once per
          order, at the end of a long flow. It prints out, and it stays until
          the buyer puts it away. */}
      <Receipt order={order} open={checkoutDone} onClose={() => setCheckoutDone(false)} />

      {/* ── Seller Details Modal ── */}
      <Sheet
        open={!!sellerDetail}
        onClose={() => setSellerDetail(null)}
        className="seller-modal-sheet"
        label={shownSeller?.name ?? en("seller_about")}
      >
        {shownSeller && <>

            {(() => {
              const tel = shownSeller.phone.replace(/[^\d+]/g, "");
              return (<>
                {/* AniSense's own ground: the brand green with the leaf mark
                    as a large watermark. This week's Farmer of the Week
                    wears the gold plate in the top corner, as on Home. */}
                <div className={`spf-hero${shownIsWeek ? " is-week" : ""}`}>
                  <img className="spf-mark" src={leafMask} alt="" aria-hidden="true" />
                  {shownIsWeek && <FarmerOfTheWeekBadge />}
                  <button className="spf-x" onClick={() => setSellerDetail(null)} aria-label={en("close")}>
                    <X size={20} strokeWidth={2.6} />
                  </button>
                  <div className="spf-id">
                    <span className="spf-ava" style={{ background: avaTone(shownSeller.name) }} aria-hidden="true">{shownSeller.initials}</span>
                    <div className="spf-name">{shownSeller.name}</div>
                    <div className="spf-loc"><MapPin size={14} strokeWidth={2.4} /> {shownSeller.location}</div>
                  </div>
                </div>

                {/* The three numbers a buyer weighs a farmer by, on one card
                    that rides up over the photo's edge. */}
                <div className="spf-stats">
                  <div className="spf-stat">
                    <span className="spf-stat-v">{unrated(shownSeller) ? en("rating_new") : <><Star size={16} strokeWidth={0} fill="#C98A1B" /> {shownSeller.rating.toFixed(1)}</>}</span>
                    <span className="spf-stat-l">{shownSeller.ratingCount ? `${shownSeller.ratingCount} ${en(shownSeller.ratingCount === 1 ? "rating_one" : "rating_n")}` : en("seller_rating")}</span>
                  </div>
                  <div className="spf-stat">
                    <span className="spf-stat-v">{shownSeller.yearsfarming}<small> {en("seller_years_suffix")}</small></span>
                    <span className="spf-stat-l">{en("seller_experience")}</span>
                  </div>
                  <div className="spf-stat">
                    <span className="spf-stat-v">{shownSeller.totalSales}+</span>
                    <span className="spf-stat-l">{en("seller_sales")}</span>
                  </div>
                </div>

                <div className="seller-modal-body spf-body">
                  {/* What they are selling: the reason most people open a
                      profile at all, so it comes first. */}
                  <section className="spf-card">
                    <div className="spf-h">
                      {en("seller_listings")}
                      <span className="spf-count">{sellerListings.length}</span>
                    </div>
                    {sellerListings.length === 0 ? (
                      <p className="sml-none">{en("seller_listings_none")}</p>
                    ) : (
                      <div className="sml-list">
                        {sellerListings.map(l => {
                          const photo = photoOf(l);
                          return (
                            <button key={l.id} className="sml-row" onClick={() => openFromProfile(l.id)}>
                              <span className="sml-photo">
                                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropEmoji crop={l.crop} size={24} />}
                              </span>
                              <span className="sml-body">
                                <span className="sml-name">{titleOf(l)}</span>
                                <span className="sml-meta">{l.kg} {en("trade_kg_available")}</span>
                              </span>
                              <span className="sml-price">{peso(l.pricePerKg)}<small>{en("per_kg_short")}</small></span>
                              <ChevronRight size={18} strokeWidth={2.4} className="sml-chev" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="spf-card">
                    <div className="spf-h">{en("seller_crops_sold")}</div>
                    <div className="spf-crops">
                      {shownSeller.crops.map(c => <span key={c} className="spf-crop">{c}</span>)}
                    </div>
                  </section>

                  {/* In their own words: set as a quote, not as a form field. */}
                  <section className="spf-card">
                    <div className="spf-h">{en("seller_about")}</div>
                    <p className="spf-bio">{shownSeller.bio}</p>
                  </section>

                  {/* The practical facts, as one grouped list rather than a
                      card each: they are read together, once. */}
                  <section className="spf-card spf-facts">
                    <div className="spf-h">{en("seller_details")}</div>
                    {/* A sample farmer has no phone: the row is left out. */}
                    {!shownSeller.sample && (
                      <a className="spf-fact" href={`tel:${tel}`}>
                        <span className="spf-fact-ico green"><Phone size={18} strokeWidth={2.4} /></span>
                        <span className="spf-fact-txt">
                          <span className="spf-fact-l">{en("seller_phone")}</span>
                          <span className="spf-fact-v">{shownSeller.phone}</span>
                        </span>
                        <ChevronRight size={18} strokeWidth={2.4} className="sml-chev" aria-hidden="true" />
                      </a>
                    )}
                    <div className="spf-fact">
                      <span className="spf-fact-ico blue"><MapPin size={18} strokeWidth={2.4} /></span>
                      <span className="spf-fact-txt">
                        <span className="spf-fact-l">{en("seller_location")}</span>
                        <span className="spf-fact-v">{shownSeller.location}</span>
                      </span>
                    </div>
                    <div className="spf-fact">
                      <span className="spf-fact-ico gold"><Sprout size={18} strokeWidth={2.4} /></span>
                      <span className="spf-fact-txt">
                        <span className="spf-fact-l">{en("seller_years")}</span>
                        <span className="spf-fact-v">{shownSeller.yearsfarming} {en("seller_years_suffix")}</span>
                      </span>
                    </div>
                  </section>
                </div>

                {/* Call: it used to be a button that did nothing. It opens the
                    phone's dialer with the number already in. */}
                <div className="seller-modal-footer spf-foot">
                  {/* A sample farmer is nobody's phone: no number is offered. */}
                  {shownSeller.sample ? (
                    <p className="call-seller-btn is-sample" role="note">
                      <Phone size={20} strokeWidth={2.4} aria-hidden="true" /> {en("seller_sample_call")}
                    </p>
                  ) : (
                    <a className="call-seller-btn" href={`tel:${tel}`}>
                      <Phone size={20} strokeWidth={2.4} /> {en("seller_call")} {shownSeller.name.split(" ")[0]}
                    </a>
                  )}
                </div>
              </>);
            })()}

        </>}
      </Sheet>

    </div>
  );
}
