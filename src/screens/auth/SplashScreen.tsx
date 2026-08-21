import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
import { useLang } from "../../i18n";
import { RICE_VARIETIES, CROP_GROUPS } from "../../data/crops";
import { CropPrice } from "../../types";

// ─── Welcome ──────────────────────────────────────────────────────────────────
// The hero is the price board, not the logo. It is the number a farmer walks to
// the bagsakan to check, so the app proves its worth before asking for a signup.
// The board tours the whole market: palay first, then one headline variety from
// every other crop group, then back to palay.

const HOLD_MS = 3600;

// One representative per group, picked short enough to sit on a single line
// beside the group name. Palay leads; it is what most of Nueva Ecija sells.
const LEADS = [
  ["Rice", "rice-regular-milled"],
  ["Rice", "rice-well-milled"],
  ["Rice", "rice-special"],
  ["Onions", "onion-red"],
  ["Corn", "corn-yellow"],
  ["Tomatoes", "tom-beef"],
  ["Calamansi", "cala-regular"],
  ["Mango", "mango-carab"],
  ["Garlic", "garlic-native"],
  ["Squash", "squash-kalabasa"],
] as const;

const ALL: CropPrice[] = [...RICE_VARIETIES, ...CROP_GROUPS.flatMap(g => g.varieties)];

const BOARD: { group: string; crop: CropPrice }[] = LEADS.flatMap(([group, id]) => {
  const crop = ALL.find(c => c.id === id);
  return crop ? [{ group: group as string, crop }] : [];
});

export function SplashScreen({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const { t, tn } = useLang();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (BOARD.length < 2) return;
    const id = setInterval(() => setSlide(n => (n + 1) % BOARD.length), HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const { group, crop } = BOARD[slide] ?? BOARD[0];
  const up = crop.change >= 0;
  const delta = Math.abs(crop.change).toFixed(2);
  // "Palay today" is the deliberate copy for rice in both languages; every other
  // group takes its own translated name.
  const heading = group === "Rice"
    ? t("splash_board_label")
    : `${tn(group)} ${t("splash_board_today")}`;

  return (
    <div className="a-screen">
      <div className="a-welcome a-stagger">
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
          <span className="a-place">Cabanatuan</span>
        </div>

        <div className="a-board">
          <div className="a-board-slide" key={crop.id}>
            <div className="a-board-lbl">{heading} · {crop.name}</div>
            <div className="a-board-price">
              <span className="a-peso">₱</span>{crop.pricePerKg.toFixed(2)}
            </div>
            <div className="a-board-unit">{t("per_kg")}</div>
            <div className={`a-board-delta ${up ? "up" : "down"}`}>
              {up ? <ArrowUp size={17} strokeWidth={3} /> : <ArrowDown size={17} strokeWidth={3} />}
              ₱{delta} {t("splash_from_yesterday")}
            </div>
          </div>
          <div className="a-board-foot">
            <Clock size={16} /> {t("splash_last_update")}
          </div>
          <div className="a-board-dots" aria-hidden="true">
            {BOARD.map((s, n) => (
              <span key={s.crop.id} className={n === slide ? "on" : ""} />
            ))}
          </div>
        </div>

        <p className="a-tagline">
          {t("splash_lines")}{"\n"}<em>{t("splash_slogan")}</em>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="a-btn a-btn-gold" onClick={onSignUp}>{t("splash_create_account")}</button>
          <button className="a-btn a-btn-ghost-ink" onClick={onSignIn}>{t("splash_have_account")}</button>
        </div>
        <p className="a-legal">{t("splash_free")}</p>
      </div>
    </div>
  );
}
