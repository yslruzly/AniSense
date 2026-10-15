import leafMaskSrc from "../assets/anisense-leaf-mask.png";

// ─── Member ID → PNG ──────────────────────────────────────────────────────────
// Redraws the member ID card onto a canvas, at 3x, so the saved image is
// sharp on any phone. Drawn by hand rather than screenshotting the DOM:
// DOM-capture libraries miss backdrop blur, web fonts and CSS patterns inside
// an Android WebView, and a saved ID that looks off is worse than no button.
//
// The geometry mirrors .wid-card in appStyles (268px wide, same paddings), so
// the file matches what's on screen: the green issuer band with its gold foil
// edge, the photo in a gold-plated frame on security paper, the name, the
// role on gold, the place, the barcode, and the green band with the ID
// number and the date joined. Always English, like the card.

export type MemberIdData = {
  name: string;
  initials: string;
  role: "Farmer" | "Buyer";
  location?: string;
  id: string;
  since: Date;
  photo: string | null;
};

const INK = "#16211B", TANIM_DEEP = "#0F3524", FAINT = "#606469";
const GOLD_LIGHT = "#F7CC5B", GOLD_INK = "#3A2A05";
const FONT = "Lexend, system-ui, sans-serif";
/** The gold plate's light and shade, as in the CSS's 145deg gradients. */
const PLATE: [number, string][] = [[0, "#FFF1C4"], [0.28, "#F7CC5B"], [0.56, "#D99A1E"], [0.78, "#F3C24E"], [1, "#B07A16"]];

const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img = new Image();
  // A photo kept in Storage comes from another address. Asked for with CORS
  // (Storage allows it), it can be drawn onto the card and the card still
  // saved; without, the canvas is locked and the download fails.
  if (/^https?:/.test(src)) img.crossOrigin = "anonymous";
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Letter-spacing for the small caps labels, where the canvas supports it.
function track(ctx: CanvasRenderingContext2D, em: number, size: number) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${em * size}px`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

/** A gold plate across the box from its top-left corner to its bottom-right. */
function plate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  for (const [at, c] of PLATE) g.addColorStop(at, c);
  return g;
}

/** The AniSense green band, as .wid-band and .wid-foot paint it: the green
 *  falling from forest to near black, and a warm gold light from one corner. */
function greenBand(ctx: CanvasRenderingContext2D, y: number, w: number, h: number, light: { x: number; y: number; a: number }) {
  const g = ctx.createLinearGradient(w * 0.42, y, w * 0.58, y + h);
  g.addColorStop(0, "#145E3F");
  g.addColorStop(0.55, "#0E4630");
  g.addColorStop(1, "#0A3525");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, h);
  const r = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, w * 0.8);
  r.addColorStop(0, `rgba(242,179,44,${light.a})`);
  r.addColorStop(1, "rgba(242,179,44,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, y, w, h);
}

/** The leaf in gold: the white cut-out of the mark, filled with the plate. */
function goldLeaf(mask: HTMLImageElement, size: number, scale: number) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.round(size * scale);
  const x = c.getContext("2d")!;
  x.drawImage(mask, 0, 0, c.width, c.height);
  x.globalCompositeOperation = "source-in";
  const g = x.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, "#FFF1C4"); g.addColorStop(0.35, "#F7CC5B"); g.addColorStop(0.7, "#D99A1E"); g.addColorStop(1, "#F3C24E");
  x.fillStyle = g;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

export async function renderMemberId(d: MemberIdData): Promise<Blob> {
  await document.fonts?.ready;
  const [mask, photo] = await Promise.all([
    loadImage(leafMaskSrc),
    d.photo ? loadImage(d.photo).catch(() => null) : Promise.resolve(null),
  ]);

  const W = 268, PAD = 28, S = 3;
  const BAND = 70, PHOTO_W = 112, PHOTO_H = 134, FRAME = 3, FOOT = 60;

  // Measure the name first; it decides the card's height.
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `800 21px ${FONT}`;
  const nameLines = wrap(measure, d.name, W - 36);
  // The place wraps as the card's does (.wid-loc: the body's width less its
  // own 14px each side, and room for the pin on the first line), two lines at most.
  measure.font = `400 13.5px ${FONT}`;
  const locLines = d.location ? wrap(measure, d.location, W - 36 - 28 - 17) : [];

  const photoY = BAND + 20;
  const nameY = photoY + PHOTO_H + 16;
  const roleY = nameY + nameLines.length * 24 + 8;
  const ROLE_H = 22;
  const locY = roleY + ROLE_H + 8;
  const barY = (locLines.length ? locY + locLines.length * 18 : roleY + ROLE_H) + 14;
  const footY = barY + 26 + 16;
  const H = footY + FOOT;

  const canvas = document.createElement("canvas");
  canvas.width = (W + PAD * 2) * S;
  canvas.height = (H + PAD * 2) * S;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S);

  // Frame: the dark of the app behind the card, so it sits well in a gallery.
  ctx.fillStyle = "#0E1511";
  ctx.fillRect(0, 0, W + PAD * 2, H + PAD * 2);
  ctx.translate(PAD, PAD);

  // Card with its drop shadow.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, 0, 0, W, H, 18);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, 0, 0, W, H, 18);
  ctx.clip();
  const paper = ctx.createLinearGradient(0, 0, 0, H);
  paper.addColorStop(0, "#FFFFFF");
  paper.addColorStop(1, "#F5F8F5");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // Security rings behind the photo.
  ctx.strokeStyle = "rgba(11,107,65,.065)";
  ctx.lineWidth = 1;
  const cx = W / 2, cy = H * 0.4;
  for (let r = 8; r < 420; r += 8) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }

  // Issuer band: green, the gold light off its top-right, the terraces faint
  // from its bottom-left, the gold foil along its foot.
  greenBand(ctx, 0, W, BAND, { x: W, y: 0, a: 0.24 });
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, BAND); ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  for (let r = 14; r < 360; r += 14) { ctx.beginPath(); ctx.arc(0, BAND * 1.6, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  const foil = ctx.createLinearGradient(0, 0, W, 0);
  foil.addColorStop(0, "#B07A16"); foil.addColorStop(0.3, "#F7CC5B"); foil.addColorStop(0.5, "#FFF1C4");
  foil.addColorStop(0.7, "#F7CC5B"); foil.addColorStop(1, "#B07A16");
  ctx.fillStyle = foil;
  ctx.fillRect(0, BAND - 2, W, 2);

  // Lanyard slot.
  roundRect(ctx, W / 2 - 23, 9, 46, 9, 4.5);
  ctx.fillStyle = "#0E1511";
  ctx.fill();

  // The gold leaf, the wordmark, "MEMBER ID" in gold.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 1; ctx.shadowOffsetY = 1;
  ctx.drawImage(goldLeaf(mask, 26, S), 14, 30, 26, 26);
  ctx.restore();
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 16px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("AniSense", 48, 43);
  ctx.font = `700 11px ${FONT}`;
  track(ctx, 0.12, 11);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.textAlign = "right";
  ctx.fillText("MEMBER ID", W - 14, 43);
  track(ctx, 0, 11);

  // Photo, in its gold-plated frame.
  const px = (W - PHOTO_W) / 2;
  roundRect(ctx, px - 1, photoY - 1, PHOTO_W + 2, PHOTO_H + 2, 15);
  ctx.fillStyle = "rgba(110,70,0,.25)";
  ctx.fill();
  roundRect(ctx, px, photoY, PHOTO_W, PHOTO_H, 14);
  ctx.fillStyle = plate(ctx, px, photoY, PHOTO_W, PHOTO_H);
  ctx.fill();
  const ix = px + FRAME, iy = photoY + FRAME, iw = PHOTO_W - FRAME * 2, ih = PHOTO_H - FRAME * 2;
  ctx.save();
  roundRect(ctx, ix, iy, iw, ih, 11);
  ctx.clip();
  if (photo) {
    // object-fit: cover
    const scale = Math.max(iw / photo.width, ih / photo.height);
    const w = photo.width * scale, h = photo.height * scale;
    ctx.drawImage(photo, ix + (iw - w) / 2, iy + (ih - h) / 2, w, h);
  } else {
    const mat = ctx.createLinearGradient(0, iy, 0, iy + ih);
    mat.addColorStop(0, "#EEF6F1");
    mat.addColorStop(1, "#D7EADD");
    ctx.fillStyle = mat;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = TANIM_DEEP;
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(d.initials, W / 2, photoY + PHOTO_H / 2 + 2);
  }
  ctx.restore();

  // Name.
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = `800 21px ${FONT}`;
  nameLines.forEach((l, i) => ctx.fillText(l, W / 2, nameY + i * 24));

  // The role, on a gold pill.
  const role = d.role.toUpperCase();
  ctx.font = `800 11.5px ${FONT}`;
  track(ctx, 0.12, 11.5);
  const roleW = ctx.measureText(role).width + 22;
  roundRect(ctx, W / 2 - roleW / 2, roleY, roleW, ROLE_H, ROLE_H / 2);
  const pill = ctx.createLinearGradient(0, roleY, 0, roleY + ROLE_H);
  pill.addColorStop(0, "#FFDB7A");
  pill.addColorStop(1, "#F2B32C");
  ctx.fillStyle = pill;
  ctx.fill();
  ctx.fillStyle = GOLD_INK;
  ctx.textBaseline = "middle";
  // Tracking adds space after the last letter too; half of it back keeps the word centred.
  ctx.fillText(role, W / 2 + 0.06 * 11.5, roleY + ROLE_H / 2 + 0.5);
  track(ctx, 0, 11.5);

  // The place.
  ctx.textBaseline = "top";
  ctx.font = `400 13.5px ${FONT}`;
  ctx.fillStyle = FAINT;
  locLines.forEach((l, i) => ctx.fillText(l, W / 2, locY + i * 18));

  // Barcode: the same 17px bar pattern as the card's CSS, 200px wide.
  const bx = (W - 200) / 2, bars: [number, number][] = [[0, 2], [4, 5], [8, 11], [12, 13]];
  ctx.fillStyle = "rgba(22,33,27,.85)";
  for (let x = 0; x < 200; x += 17) {
    for (const [a, b] of bars) {
      const x0 = x + a, x1 = Math.min(x + b, 200);
      if (x0 < 200) ctx.fillRect(bx + x0, barY, x1 - x0, 26);
    }
  }

  // The bottom band: green, the gold light off its bottom-left, a gold edge
  // on top; the labels quiet, the number in gold, the date in white.
  greenBand(ctx, footY, W, FOOT, { x: 0, y: footY + FOOT, a: 0.14 });
  ctx.fillStyle = "rgba(242,179,44,.6)";
  ctx.fillRect(0, footY, W, 2);
  const lblY = footY + 12, valY = lblY + 15;
  ctx.font = `700 10.5px ${FONT}`;
  track(ctx, 0.12, 10.5);
  ctx.fillStyle = "rgba(255,255,255,.74)";
  ctx.textAlign = "left";
  ctx.fillText("ID NO.", 16, lblY);
  ctx.textAlign = "right";
  ctx.fillText("MEMBER SINCE", W - 16, lblY);
  track(ctx, 0, 10.5);
  ctx.font = `700 15px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText(d.id, 16, valY);
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(d.since.toLocaleDateString("en-PH", { month: "short", year: "numeric" }), W - 16, valY);
  ctx.restore();

  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
