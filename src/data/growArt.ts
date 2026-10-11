// ─── What do you grow: the pictures ───────────────────────────────────────────
// One drawing per crop on the farmer's last sign-up question, in place of the
// emoji: emoji differ from phone to phone, several are stand-ins (a lemon for
// calamansi, a carved pumpkin for squash, a cucumber for ampalaya) and two
// show as empty boxes on older Androids. These are the same on every phone.
// Sources: design/artwork/WhatDoYouGrow, 192 x 192 here (a 64 px tile at 3x).

import ampalaya from "../assets/grow/ampalaya.webp";
import calamansi from "../assets/grow/calamansi.webp";
import corn from "../assets/grow/corn.webp";
import garlic from "../assets/grow/garlic.webp";
import mango from "../assets/grow/mango.webp";
import onion from "../assets/grow/onion.webp";
import rice from "../assets/grow/rice.webp";
import squash from "../assets/grow/squash.webp";
import tomato from "../assets/grow/tomato.webp";
import watermelon from "../assets/grow/watermelon.webp";

/** Keyed by the names in MAIN_CROPS. */
export const GROW_ART: Record<string, string> = {
  Rice: rice,
  Corn: corn,
  Onions: onion,
  Tomatoes: tomato,
  Calamansi: calamansi,
  Mango: mango,
  Garlic: garlic,
  Squash: squash,
  Ampalaya: ampalaya,
  Watermelon: watermelon,
};
