import logoSrc from "../assets/AnisenseLogoIn.png";

// ─── Member ID → PNG ──────────────────────────────────────────────────────────
// Redraws the member ID card onto a canvas, at 3x, so the saved image is
// sharp on any phone. Drawn by hand rather than screenshotting the DOM:
// DOM-capture libraries miss backdrop blur, web fonts and CSS patterns inside
// an Android WebView, and a saved ID that looks off is worse than no button.
//
// The geometry mirrors .wid-card in appStyles (268px wide, same paddings), so
// the file matches what's on screen. Always English, like the card.

export type MemberIdData = {
  name: string;
  initials: string;
  role: "Farmer" | "Buyer";
  location?: string;
  id: string;
  since: Date;
  photo: string | null;
};

const INK = "#16211B", TANIM = "#0B6B41", TANIM_SK = "#D7EADD", PALAY = "#F2B32C";
const LINE = "#D9DBDE", LINE_STRONG = "#C2C5C9", FAINT = "#606469";
const FONT = "Lexend, system-ui, sans-serif";

const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img = new Image();
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

export async function renderMemberId(d: MemberIdData): Promise<Blob> {
  await document.fonts?.ready;
  const [logo, photo] = await Promise.all([
    loadImage(logoSrc),
    d.photo ? loadImage(d.photo).catch(() => null) : Promise.resolve(null),
  ]);

  const W = 268, PAD = 28, S = 3;
  const BAND = 70, PHOTO_W = 112, PHOTO_H = 134;

  // Measure the name first; it decides the card's height.
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `800 21px ${FONT}`;
  const nameLines = wrap(measure, d.name, W - 36);

  const photoY = BAND + 20;
  const nameY = photoY + PHOTO_H + 18;
  const nameH = nameLines.length * 24;
  const roleY = nameY + nameH + 5;
  const locY = roleY + 17 + 6;
  const bodyEnd = (d.location ? locY + 18 : roleY + 17) + 14;
  const footY = bodyEnd;
  const H = footY + 12 + 34 + 8 + 26 + 14;

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
  paper.addColorStop(1, "#F4F6F3");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // Security rings behind the photo.
  ctx.strokeStyle = "rgba(11,107,65,.07)";
  ctx.lineWidth = 1;
  const cx = W / 2, cy = H * 0.42;
  for (let r = 8; r < 420; r += 8) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }

  // Issuer band.
  const band = ctx.createLinearGradient(0, 0, W, BAND);
  band.addColorStop(0, "#1D2E25");
  band.addColorStop(1, INK);
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, BAND);
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.9);
  glow.addColorStop(0, "rgba(126,196,120,.28)");
  glow.addColorStop(1, "rgba(126,196,120,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, BAND);

  // Lanyard slot.
  roundRect(ctx, W / 2 - 23, 9, 46, 9, 4.5);
  ctx.fillStyle = "#0E1511";
  ctx.fill();

  // Logo tile, wordmark, "MEMBER ID".
  roundRect(ctx, 14, 28, 30, 30, 8);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.drawImage(logo, 19, 33, 20, 20);
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 16px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("AniSense", 52, 43);
  ctx.font = `700 11px ${FONT}`;
  track(ctx, 0.12, 11);
  ctx.fillStyle = PALAY;
  ctx.textAlign = "right";
  ctx.fillText("MEMBER ID", W - 14, 43);
  track(ctx, 0, 11);

  // Photo, on a white mat with a hairline frame.
  const px = (W - PHOTO_W) / 2;
  roundRect(ctx, px - 5, photoY - 5, PHOTO_W + 10, PHOTO_H + 10, 19);
  ctx.fillStyle = LINE;
  ctx.fill();
  roundRect(ctx, px - 4, photoY - 4, PHOTO_W + 8, PHOTO_H + 8, 18);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.save();
  roundRect(ctx, px, photoY, PHOTO_W, PHOTO_H, 14);
  ctx.clip();
  if (photo) {
    // object-fit: cover
    const scale = Math.max(PHOTO_W / photo.width, PHOTO_H / photo.height);
    const w = photo.width * scale, h = photo.height * scale;
    ctx.drawImage(photo, px + (PHOTO_W - w) / 2, photoY + (PHOTO_H - h) / 2, w, h);
  } else {
    ctx.fillStyle = TANIM_SK;
    ctx.fillRect(px, photoY, PHOTO_W, PHOTO_H);
    ctx.fillStyle = TANIM;
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(d.initials, W / 2, photoY + PHOTO_H / 2 + 2);
  }
  ctx.restore();

  // Name, role, location.
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = `800 21px ${FONT}`;
  nameLines.forEach((l, i) => ctx.fillText(l, W / 2, nameY + i * 24));
  ctx.font = `700 12px ${FONT}`;
  track(ctx, 0.14, 12);
  ctx.fillStyle = TANIM;
  ctx.fillText(d.role.toUpperCase(), W / 2, roleY);
  track(ctx, 0, 12);
  if (d.location) {
    ctx.font = `400 13.5px ${FONT}`;
    ctx.fillStyle = FAINT;
    ctx.fillText(d.location, W / 2, locY, W - 36);
  }

  // Dashed rule, ID number, member since.
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = LINE_STRONG;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, footY);
  ctx.lineTo(W - 16, footY);
  ctx.stroke();
  ctx.setLineDash([]);

  const lblY = footY + 12, valY = lblY + 15;
  ctx.font = `700 10.5px ${FONT}`;
  track(ctx, 0.12, 10.5);
  ctx.fillStyle = FAINT;
  ctx.textAlign = "left";
  ctx.fillText("ID NO.", 16, lblY);
  ctx.textAlign = "right";
  ctx.fillText("MEMBER SINCE", W - 16, lblY);
  track(ctx, 0, 10.5);
  ctx.font = `700 14px ${FONT}`;
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.fillText(d.id, 16, valY);
  ctx.textAlign = "right";
  ctx.fillText(d.since.toLocaleDateString("en-PH", { month: "short", year: "numeric" }), W - 16, valY);

  // Barcode: the same 17px bar pattern as the card's CSS.
  const barY = valY + 18 + 8, bars: [number, number][] = [[0, 2], [4, 5], [8, 11], [12, 13]];
  ctx.fillStyle = "rgba(22,33,27,.85)";
  for (let x = 16; x < W - 16; x += 17) {
    for (const [a, b] of bars) {
      const x0 = x + a, x1 = Math.min(x + b, W - 16);
      if (x0 < W - 16) ctx.fillRect(x0, barY, x1 - x0, 26);
    }
  }
  ctx.restore();

  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
