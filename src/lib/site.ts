// Single source of truth for the public site address (canonical, hreflang, OG, sitemap, robots, llms.txt, JSON-LD, password-reset links).
// Override at build time with VITE_SITE_URL (no trailing slash).
export const SITE_URL: string = (import.meta.env?.['VITE_SITE_URL'] || "https://ecotoursandsafaris.it").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).host;

export function clamp(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:.\s–-]+$/, "") + "…";
}
