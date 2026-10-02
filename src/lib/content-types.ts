export type Locale = "it" | "en";
export type ImageKey = "safari" | "coast" | "wildlife" | "creek";
export type Kind = "safari" | "excursions" | "parks";

export type Pkg = {
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
};

export type SiteContent = {
  lang: Locale;
  whatsapp: string;
  template: string;
  home: HomeText;
  about: PageText;
  contact: PageText;
  gallery: PageText;
  faq: { q: string; a: string }[];
  bring: string[];
  safari: Pkg[];
  excursions: Pkg[];
  parks: Pkg[];
  photos: Photo[];
};

export function whatsappHref(c: Pick<SiteContent, "whatsapp" | "template">, subject: string) {
  const text = c.template
    .replaceAll("{pacchetto}", subject)
    .replaceAll("{persone}", "…")
    .replaceAll("{date}", "…");
  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function phoneLabel(n: string) {
  return `+${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`.trim();
}
