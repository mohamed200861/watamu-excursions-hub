/** Pure checks for gallery photos (shared by /admin and tests). */
export type StoredFile = { size: number; mimetype: string } | undefined;
export type CheckPhoto = { path: string; thumb_path: string; width: number; height: number; alt: string };

export const filenameAlt = (alt: string) => /^(img|dsc|pxl|wa)[-_]?\d/i.test(alt.trim()) || /^img[-_]/i.test(alt.trim());

export function photoProblems(p: CheckPhoto, full: StoredFile, thumb: StoredFile): string[] {
  const out: string[] = [];
  const bad = (f: StoredFile) => !f || f.size <= 0 || f.mimetype !== "image/webp";
  if (!full) out.push("File della foto mancante");
  else if (bad(full)) out.push("Formato del file non valido");
  if (!p.thumb_path || !thumb) out.push("Miniatura mancante");
  else if (bad(thumb)) out.push("Miniatura non valida");
  if (!(p.width > 0 && p.height > 0)) out.push("Dimensioni pari a 0");
  if (!p.alt.trim()) out.push("Testo alternativo vuoto");
  else if (filenameAlt(p.alt)) out.push("Testo alternativo è un nome di file");
  return out;
}

/** A photo can be repaired only if its full image still exists and is valid. */
export const repairable = (full: StoredFile) => !!full && full.size > 0 && full.mimetype === "image/webp";
