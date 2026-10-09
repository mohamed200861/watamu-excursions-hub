export type Locale = "it" | "en";
export type ImageKey = "safari" | "coast" | "wildlife" | "creek";
export type Kind = "safari" | "excursions" | "parks";
export type HeaderKey = Kind | "about" | "gallery" | "contact";
export const HEADER_KEYS: HeaderKey[] = ["safari", "excursions", "parks", "about", "gallery", "contact"];

export const DEFAULT_EMAIL = "eazyafricanah@gmail.com";
export const DEFAULT_TRIPADVISOR = "https://www.tripadvisor.it/Attraction_Review-g661279-d34035492-Reviews-Africano_Di_Africa_Kenya_Safari_Tours-Watamu_Coast_Province.html";
export const ALTERNATE_NAME = "Africano Di Africa Kenya Safari Tours";
export type Cover = { path: string; thumb_path: string; og_path: string; alt: string; focal_x: number; focal_y: number };
export type Owner = { name: string; address: string; email: string; phone: string; license: string; retention: string; transfers: string; law: string };

export type Pkg = {
  cover?: Cover | null;
  slug: string;
  title: string;
  duration: string;
  description: string;
  image: ImageKey;
  itinerary: string[];
  included: string[];
  excluded: string[];
  parks: string[];
  lodges: string[];
  price: string | null;
};

export type Photo = {
  id: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  category: string;
};

export type PageText = { title: string; subtitle: string; text: string };
export type GuideLicense = { text: string; number: string; expires: string };
export type AboutText = PageText & { meTitle?: string; me?: string; photos?: Cover[]; license?: GuideLicense };

/** Guide licence badge shows only when its text is filled and the expiry date (YYYY-MM-DD) has not passed. */
export function licenseActive(l: Partial<GuideLicense> | undefined, today: Date = new Date()): boolean {
  if (!l || !(l.text ?? "").trim()) return false;
  const exp = (l.expires ?? "").trim();
  if (!exp) return true;
  return exp >= today.toISOString().slice(0, 10);
}

export type HomeText = {
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroNote: string;
  introTitle: string;
  why: { title: string; text: string }[];
  featuredTitle: string;
  featuredIntro: string;
  seaEyebrow: string;
  seaTitle: string;
  seaText: string;
  footerText: string;
  heroImage?: Cover | null | undefined;
  seaImage?: Cover | null | undefined;
};

export type SiteContent = {
  owner: Owner;
  lang: Locale;
  whatsapp: string;
  template: string;
  email: string;
  tripadvisor: string;
  rating: string;
  home: HomeText;
  about: AboutText;
  contact: PageText;
  gallery: PageText;
  faq: { q: string; a: string }[];
  bring: string[];
  safari: Pkg[];
  excursions: Pkg[];
  parks: Pkg[];
  photos: Photo[];
  headers?: Partial<Record<HeaderKey, Cover | null>>;
};

export function whatsappHref(c: Pick<SiteContent, "whatsapp" | "template">, subject: string) {
  const text = c.template
    .replaceAll("{pacchetto}", subject)
    .replaceAll("{persone}", "…")
    .replaceAll("{date}", "…");
  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** wa.me link with a fixed message (no {persone}/{date} placeholders). */
export function whatsappTextHref(whatsapp: string, text: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Splits "Item one, Item two, item three" lists written in one sentence: a new item starts after a comma followed by a capital letter. */
export function sentenceList(text: string): string[] | null {
  const parts = text.replace(/\.\s*$/, "").split(/,\s+(?=[A-ZÀ-Ý])/);
  return parts.length >= 3 ? parts.map((x) => x.trim()) : null;
}

export function phoneLabel(n: string) {
  return `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`.trim();
}
