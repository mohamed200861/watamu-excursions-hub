import type { Cover } from './content-types';
export const COVER_FULL_MAX = 1600;
export const COVER_THUMB_WIDTH = 480;
export const COVER_OG_WIDTH = 1200;
export const COVER_OG_HEIGHT = 630;
export function cropRect(width: number, height: number, ratio: number, x: number, y: number) {
  const w = Math.min(width, height * ratio), h = w / ratio;
  return { x: Math.max(0, Math.min(width - w, width * x / 100 - w / 2)), y: Math.max(0, Math.min(height - h, height * y / 100 - h / 2)), width: w, height: h };
}
export async function prepareCover(blob: Blob, x: number, y: number) {
  const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  try {
    const render = async (width: number, height: number, crop: boolean) => {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Conversione non disponibile');
      const r = crop ? cropRect(bmp.width, bmp.height, width / height, x, y) : { x: 0, y: 0, width: bmp.width, height: bmp.height };
      ctx.drawImage(bmp, r.x, r.y, r.width, r.height, 0, 0, width, height);
      const result = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', .82));
      if (!result || result.type !== 'image/webp') throw new Error('Conversione WebP non disponibile');
      return result;
    };
    const scale = Math.min(1, COVER_FULL_MAX / Math.max(bmp.width, bmp.height));
    return { full: await render(Math.round(bmp.width * scale), Math.round(bmp.height * scale), false), thumb: await render(COVER_THUMB_WIDTH, 300, true), og: await render(COVER_OG_WIDTH, COVER_OG_HEIGHT, true) };
  } finally { bmp.close(); }
}
export async function coverFromBlob(blob: Blob, alt: string, x: number, y: number, upload: (path: string, blob: Blob) => Promise<void>): Promise<Cover> {
  const images = await prepareCover(blob, x, y);
  const paths: string[] = [];
  for (const [suffix, image] of Object.entries(images)) {
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await image.arrayBuffer())), b => b.toString(16).padStart(2, '0')).join('');
    const path = `covers/${hash}-${suffix}.webp`;
    await upload(path, image); paths.push(path);
  }
  const [path, thumb_path, og_path] = paths;
  if (!path || !thumb_path || !og_path) throw new Error('Copertina incompleta');
  return { path, thumb_path, og_path, alt, focal_x: x, focal_y: y };
}
