// ─── Image helpers ────────────────────────────────────────────────────────────

/**
 * A photo from a phone camera is often 4000px and several megabytes. Kept as
 * is, a handful of listings would make every screen that shows them slow, and
 * uploading one would take a minute on rural data. Scale the long side down
 * to `max` and re-encode as JPEG: a sharp, full-width photo at ~150-300 KB.
 * Browsers apply the photo's EXIF rotation when drawing, so it comes out the
 * right way up.
 */
export async function downscaleImage(file: File, max = 1280, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
