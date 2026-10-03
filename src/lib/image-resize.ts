export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif", "image/avif"];

export function checkFile(f: File): string | null {
  if (!f.type.startsWith("image/") || !ACCEPTED.includes(f.type)) return `“${f.name}” non è un'immagine supportata (JPG, PNG, WebP).`;
  if (f.size > MAX_UPLOAD_BYTES) return `“${f.name}” è troppo grande (max 15 MB).`;
  return null;
}

async function toWebp(img: ImageBitmap, max: number, quality: number) {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Il browser non supporta la conversione delle immagini.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  if (!blob || blob.type !== "image/webp") throw new Error("Conversione in WebP non supportata da questo browser.");
  return { blob, width, height };
}

/** Resizes in the browser: full image max 2560 px (never upscaled) and 640 px thumbnail, both WebP. */
export async function prepareImage(f: File) {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(f, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`Impossibile leggere “${f.name}”. Prova con una foto JPG o PNG.`);
  }
  const full = await toWebp(bmp, 2560, 0.92);
  const thumb = await toWebp(bmp, 640, 0.85);
  bmp.close();
  return { full, thumb };
}
