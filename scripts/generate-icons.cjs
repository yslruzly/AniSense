// Regenerate Android launcher icons from src/assets/AnisenseLogoIn.png
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "src/assets/AnisenseLogoIn.png";
const RES = "android/app/src/main/res";
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

// Legacy square/round icon sizes, and adaptive foreground sizes (108dp).
const DENSITIES = {
  mdpi: { legacy: 48, fg: 108 },
  hdpi: { legacy: 72, fg: 162 },
  xhdpi: { legacy: 96, fg: 216 },
  xxhdpi: { legacy: 144, fg: 324 },
  xxxhdpi: { legacy: 192, fg: 432 },
};

// The artwork ships on opaque white; key that out so the mark can sit on any
// background. Edge pixels ramp rather than clip, keeping the anti-aliasing.
async function keyOutWhite(file) {
  const img = sharp(file).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const out = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const lum = Math.max(r, g, b);
    let a = 255;
    if (lum >= 252) a = 0;
    else if (lum > 232) a = Math.round(((252 - lum) / 20) * 255);
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();
}

// Square canvas of `size` with the mark centred at `scale` of the canvas.
async function place(markBuf, size, scale, background) {
  const inner = Math.round(size * scale);
  const mark = await sharp(markBuf).resize(inner, inner, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).toBuffer();
  const offset = Math.round((size - inner) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  }).composite([{ input: mark, top: offset, left: offset }]).png().toBuffer();
}

function circleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`
  );
}

(async () => {
  let mark = await keyOutWhite(SRC);
  mark = await sharp(mark).trim({ threshold: 1 }).toBuffer(); // drop the white margin

  for (const [dpi, { legacy, fg }] of Object.entries(DENSITIES)) {
    const dir = path.join(RES, `mipmap-${dpi}`);
    fs.mkdirSync(dir, { recursive: true });

    // Legacy square icon: mark on the brand white plate.
    await sharp(await place(mark, legacy, 0.74, BG))
      .toFile(path.join(dir, "ic_launcher.png"));

    // Legacy round icon: the same plate, clipped to a circle.
    const round = await place(mark, legacy, 0.66, BG);
    await sharp(round)
      .composite([{ input: circleMask(legacy), blend: "dest-in" }])
      .png().toFile(path.join(dir, "ic_launcher_round.png"));

    // Adaptive foreground: transparent, mark inside the 66/108 safe zone.
    await sharp(await place(mark, fg, 0.52, { r: 0, g: 0, b: 0, alpha: 0 }))
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    console.log(`mipmap-${dpi}: ${legacy}px legacy, ${fg}px foreground`);
  }
})();
