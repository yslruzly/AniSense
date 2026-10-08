import { Award } from "lucide-react";
import { translations } from "../../i18n";

// ─── AniSense Farmer of the Week ─────────────────────────────────────────────
// The gold plate (.ff-badge), on the photo of whoever holds the title this
// week: their big card on Home, and their profile. (In the Market's row the
// same farmer is marked by a moving gold ring instead.) The award's name is a
// title, so it stays in English, like the other AniSense award names.

export function FarmerOfTheWeekBadge() {
  return (
    <span className="ff-badge">
      <span className="ff-badge-coin" aria-hidden="true"><Award size={14} strokeWidth={2.4} /></span>
      {translations.ff_week.en}
    </span>
  );
}
