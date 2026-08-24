// ─── Crop photos ──────────────────────────────────────────────────────────────
// One photograph per crop row in the market list. Public domain, CC0, Unsplash
// or Pexels licence, so none of them carries an attribution obligation;
// provenance is recorded in ../assets/crops/CREDITS.md.
//
// 16 photographs cover 20 rows. The 4 rows that share an image do so because
// the difference does not photograph: all three rice grades are milled white
// rice, and a Diamante Max F1 and an Assila F1 are both a red tomato.

import cala_regular from "../assets/crops/cala-regular.webp";
import corn_sweet from "../assets/crops/corn-sweet.webp";
import corn_white from "../assets/crops/corn-white.webp";
import corn_yellow from "../assets/crops/corn-yellow.webp";
import garlic_native from "../assets/crops/garlic-native.webp";
import mango_carab from "../assets/crops/mango-carab.webp";
import mango_indian from "../assets/crops/mango-indian.webp";
import mango_pahutan from "../assets/crops/mango-pahutan.webp";
import onion_red from "../assets/crops/onion-red.webp";
import onion_spring from "../assets/crops/onion-spring.webp";
import onion_white from "../assets/crops/onion-white.webp";
import onion_yellow from "../assets/crops/onion-yellow.webp";
import rice_special from "../assets/crops/rice-special.webp";
import squash_kalabasa from "../assets/crops/squash-kalabasa.webp";
import tom_cherry from "../assets/crops/tom-cherry.webp";
import tom_roma from "../assets/crops/tom-roma.webp";
import { CROPS, CROP_GROUPS } from "./crops";

export const CROP_PHOTOS: Record<string, string> = {
  "rice-special": rice_special,
  "rice-well-milled": rice_special,
  "rice-regular-milled": rice_special,
  "onion-red": onion_red,
  "onion-white": onion_white,
  "onion-yellow": onion_yellow,
  "onion-spring": onion_spring,
  "cala-regular": cala_regular,
  "mango-carab": mango_carab,
  "mango-indian": mango_indian,
  "mango-horse": mango_carab,
  "mango-pahutan": mango_pahutan,
  "garlic-native": garlic_native,
  "tom-cherry": tom_cherry,
  "tom-roma": tom_roma,
  "tom-beef": tom_cherry,
  "corn-yellow": corn_yellow,
  "corn-white": corn_white,
  "corn-sweet": corn_sweet,
  "squash-kalabasa": squash_kalabasa,
};

/** Falls back to undefined so the caller can keep showing the line icon. */
export function cropPhoto(id: string): string | undefined {
  return CROP_PHOTOS[id];
}

/**
 * Marketplace listings carry a crop name and a free-text variety rather than a
 * crop id, so the same photographs have to be reached by name. Falls back to
 * undefined and lets the caller keep the line icon.
 */
export function cropPhotoFor(crop: string, variety?: string): string | undefined {
  const norm = (s: string) => s.toLowerCase().trim();

  // A listing whose crop or variety is itself a priced crop ("Special Rice",
  // "Yellow Corn") resolves straight to that row's photo.
  for (const n of [variety, crop]) {
    if (!n) continue;
    const hit = CROPS.find(c => norm(c.name) === norm(n));
    if (hit && CROP_PHOTOS[hit.id]) return CROP_PHOTOS[hit.id];
  }

  // Otherwise the crop is a group ("Onions") and the variety is a fragment
  // ("Red") of one of its rows; an empty variety takes the group's first photo.
  const group = CROP_GROUPS.find(g => norm(g.group) === norm(crop));
  if (group) {
    if (variety) {
      const v = group.varieties.find(x => norm(x.name).includes(norm(variety)));
      if (v && CROP_PHOTOS[v.id]) return CROP_PHOTOS[v.id];
    }
    const first = group.varieties.find(x => CROP_PHOTOS[x.id]);
    if (first) return CROP_PHOTOS[first.id];
  }
  return undefined;
}
