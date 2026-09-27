import logoSrc from "../assets/AnisenseLogoIn.png";

// ─── Order receipt → PNG ──────────────────────────────────────────────────────
// Redraws the receipt onto a canvas at 3x, for "Save this receipt". Drawn by
// hand, like the member ID, rather than captured from the DOM: capture
// libraries lose masks, dashed borders and web fonts inside an Android
// WebView, and a saved receipt that looks wrong is worse than none.
//
// The layout mirrors .rc-paper in appStyles: same width, paddings, order of
// parts and torn foot, set on a soft backdrop so the torn edge shows. The
// words come in already translated, so the file matches the screen.

export interface ReceiptImageLine { name: string; qtyLine: string; amount: string }
export interface ReceiptImageGroup { seller: string; initials: string; location: string; lines: ReceiptImageLine[] }
export interface ReceiptImageData {
  brandKicker: string;   // "Order receipt"
  title: string;         // "Order placed!"
  placedLabel: string; placed: string;
  buyerLabel: string; buyer: string;
  groups: ReceiptImageGroup[];
  totalLabel: string; totalSub: string; total: string;
  note: string;
  thanks: string;
}

const TEXT = "#16211B", MUTED = "#474B4F", FAINT = "#606469";
const TANIM = "#0B6B41", TANIM_DEEP = "#0F3524", TANIM_SK = "#D7EADD";
const PAPER = "#FFFDF6", PERF = "#DDD6C4", GOLD_SK = "#FDF3DD", GOLD_LINE = "#F0DCA6";
const DISPLAY = "Lexend, system-ui, sans-serif";
const BODY = "'Source Sans 3', system-ui, sans-serif";

const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

function track(ctx: CanvasRenderingContext2D, px: number) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${px}px`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) { lines.push(line); line = w; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderReceipt(d: ReceiptImageData): Promise<Blob> {
  await document.fonts?.ready;
  const logo = await loadImage(logoSrc);

  const W = 340, PAD = 22, S = 3, MARGIN = 26, ZZ = 11;
  const inner = W - PAD * 2;
  const m = document.createElement("canvas").getContext("2d")!;

  // ── Measure, so the canvas is exactly as tall as the receipt ──
  m.font = `600 14px ${BODY}`;
  const buyerLines = wrap(m, d.buyer, inner / 2 - 6);
  m.font = `400 13px ${BODY}`;
  const noteLines = wrap(m, d.note, inner - 24);
  m.font = `600 13.5px ${BODY}`;
  const thanksLines = wrap(m, d.thanks, inner);

  let h = PAD;
  h += 34 + 8 + 14;                 // logo row, kicker
  h += 18 + 28;                     // title
  h += 16 + 14 + Math.max(18, buyerLines.length * 18); // meta
  h += 16 + 2 + 16;                 // perforation
  d.groups.forEach((g, i) => {
    if (i > 0) h += 14;
    h += 34 + 8;                    // seller row
    h += g.lines.length * 42;       // item lines
  });
  h += 16 + 2 + 16;                 // perforation
  h += 44;                          // total
  h += 14 + 20 + noteLines.length * 19.5; // note
  h += 12 + thanksLines.length * 19;
  h += 18 + ZZ;                     // foot + torn edge
  const H = Math.ceil(h);

  const canvas = document.createElement("canvas");
  canvas.width = (W + MARGIN * 2) * S;
  canvas.height = (H + MARGIN * 2) * S;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(S, S);

  // Backdrop: the soft green the app sits on, so the paper and its torn
  // foot read as a receipt lying on something.
  ctx.fillStyle = "#E4EEE7";
  ctx.fillRect(0, 0, W + MARGIN * 2, H + MARGIN * 2);
  ctx.translate(MARGIN, MARGIN);

  // ── The paper: rounded top, zigzag foot, a soft shadow under it ──
  const paper = new Path2D();
  const r = 20;
  paper.moveTo(0, r);
  paper.arcTo(0, 0, r, 0, r);
  paper.lineTo(W - r, 0);
  paper.arcTo(W, 0, W, r, r);
  paper.lineTo(W, H - ZZ);
  const teeth = Math.round(W / (ZZ * 2));
  const tw = W / teeth;
  for (let i = teeth - 1; i >= 0; i--) {
    paper.lineTo(i * tw + tw / 2, H);
    paper.lineTo(i * tw, H - ZZ);
  }
  paper.closePath();
  ctx.save();
  ctx.shadowColor = "rgba(4,14,9,.22)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = PAPER;
  ctx.fill(paper);
  ctx.restore();
  ctx.save();
  ctx.clip(paper);

  let y = PAD;
  const centre = W / 2;

  // Brand row
  ctx.font = `700 21px ${DISPLAY}`;
  ctx.textBaseline = "middle";
  const brandW = 34 + 8 + ctx.measureText("AniSense").width;
  const bx = centre - brandW / 2;
  ctx.drawImage(logo, bx, y, 34, 34);
  ctx.fillStyle = TANIM_DEEP;
  ctx.textAlign = "left";
  ctx.fillText("AniSense", bx + 42, y + 18);
  y += 34 + 8;
  ctx.font = `700 11.5px ${BODY}`;
  track(ctx, 1.8);
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText(d.brandKicker.toUpperCase(), centre, y + 7);
  track(ctx, 0);
  y += 14;

  // Title
  y += 18;
  ctx.font = `700 22px ${DISPLAY}`;
  ctx.fillStyle = TEXT;
  ctx.fillText(d.title, centre, y + 14);
  y += 28;

  // Meta: placed, buyer
  y += 16;
  const col2 = PAD + inner / 2 + 6;
  ctx.textAlign = "left";
  ctx.font = `700 10.5px ${BODY}`; track(ctx, 1.3); ctx.fillStyle = FAINT;
  ctx.fillText(d.placedLabel.toUpperCase(), PAD, y + 6);
  ctx.fillText(d.buyerLabel.toUpperCase(), col2, y + 6);
  track(ctx, 0);
  y += 14;
  ctx.font = `600 14px ${BODY}`; ctx.fillStyle = TEXT;
  ctx.fillText(d.placed, PAD, y + 9);
  buyerLines.forEach((ln, i) => ctx.fillText(ln, col2, y + 9 + i * 18));
  y += Math.max(18, buyerLines.length * 18);

  const perforation = () => {
    y += 16;
    ctx.save();
    ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.strokeStyle = PERF;
    ctx.beginPath(); ctx.moveTo(0, y + 1); ctx.lineTo(W, y + 1); ctx.stroke();
    ctx.restore();
    y += 2 + 16;
  };
  perforation();

  // Items, by farmer
  d.groups.forEach((g, gi) => {
    if (gi > 0) y += 14;
    ctx.beginPath(); ctx.arc(PAD + 15, y + 15, 15, 0, Math.PI * 2);
    ctx.fillStyle = TANIM_SK; ctx.fill();
    ctx.font = `800 11.5px ${BODY}`; ctx.fillStyle = TANIM_DEEP; ctx.textAlign = "center";
    ctx.fillText(g.initials, PAD + 15, y + 15.5);
    ctx.textAlign = "left";
    ctx.font = `700 14.5px ${BODY}`; ctx.fillStyle = TEXT;
    ctx.fillText(g.seller, PAD + 40, y + 8);
    ctx.font = `400 12.5px ${BODY}`; ctx.fillStyle = FAINT;
    ctx.fillText(g.location, PAD + 40, y + 25);
    y += 34 + 8;
    for (const l of g.lines) {
      ctx.font = `600 14.5px ${BODY}`; ctx.fillStyle = TEXT; ctx.textAlign = "left";
      ctx.fillText(l.name, PAD + 40, y + 10);
      ctx.font = `400 12.5px ${BODY}`; ctx.fillStyle = FAINT;
      ctx.fillText(l.qtyLine, PAD + 40, y + 28);
      ctx.font = `700 14.5px ${BODY}`; ctx.fillStyle = TEXT; ctx.textAlign = "right";
      ctx.fillText(l.amount, W - PAD, y + 10);
      y += 42;
    }
  });
  ctx.textAlign = "left";
  perforation();

  // Total
  ctx.font = `700 16px ${DISPLAY}`; ctx.fillStyle = TEXT;
  ctx.fillText(d.totalLabel, PAD, y + 12);
  ctx.font = `500 12.5px ${BODY}`; ctx.fillStyle = FAINT;
  ctx.fillText(d.totalSub, PAD, y + 32);
  ctx.font = `800 28px ${DISPLAY}`; ctx.fillStyle = TANIM_DEEP; ctx.textAlign = "right";
  ctx.fillText(d.total, W - PAD, y + 24);
  ctx.textAlign = "left";
  y += 44;

  // Note: nothing has been paid
  y += 14;
  const noteH = 20 + noteLines.length * 19.5;
  const np = new Path2D();
  const nr = 12, nx = PAD, nw = inner;
  np.moveTo(nx + nr, y); np.arcTo(nx + nw, y, nx + nw, y + noteH, nr); np.arcTo(nx + nw, y + noteH, nx, y + noteH, nr);
  np.arcTo(nx, y + noteH, nx, y, nr); np.arcTo(nx, y, nx + nw, y, nr); np.closePath();
  ctx.fillStyle = GOLD_SK; ctx.fill(np);
  ctx.lineWidth = 1; ctx.strokeStyle = GOLD_LINE; ctx.stroke(np);
  ctx.font = `400 13px ${BODY}`; ctx.fillStyle = MUTED;
  noteLines.forEach((ln, i) => ctx.fillText(ln, nx + 12, y + 10 + 9.75 + i * 19.5));
  y += noteH;

  // Thanks
  y += 12;
  ctx.font = `600 13.5px ${BODY}`; ctx.fillStyle = TANIM; ctx.textAlign = "center";
  thanksLines.forEach((ln, i) => ctx.fillText(ln, centre, y + 9.5 + i * 19));

  ctx.restore();

  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
