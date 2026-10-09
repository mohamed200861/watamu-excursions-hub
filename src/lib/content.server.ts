import { requireSupabaseConfig } from "./supabase-config";
import snapshot from "./content-snapshot.json";
import en from "./content-en.json";
import { DEFAULT_EMAIL, DEFAULT_TRIPADVISOR } from "./content-types";
import type { AboutText, Cover, HomeText, ImageKey, Locale, PageText, Photo, Pkg, SiteContent } from "./content-types";

type Row = {
  cover?: Cover | null;
  kind: string;
  slug: string;
  title: string;
  duration: string;
  description: string;
  itinerary: string[];
  included: string[];
  excluded: string[];
  parks: string[];
  lodges: string[];
  image: string;
  price: string | null;
  sort: number;
};
type PhotoRow = {
  id: string;
  path: string;
  thumb_path: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  category: string;
  hidden?: boolean;
};
export type Raw = { content: Record<string, any>; packages: Row[]; photos: PhotoRow[] };

// Last content successfully read from the database in this worker.
let lastGood: Raw | null = null;

async function fetchRaw(): Promise<Raw> {
  const { url, key } = requireSupabaseConfig();
  const headers: Record<string, string> = { apikey: key };
  if (!key.startsWith("sb_")) headers["Authorization"] = `Bearer ${key}`;
  const signal = AbortSignal.timeout(2500);
  const get = async (path: string) => {
    const r = await fetch(`${url}/rest/v1/${path}`, { headers, signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  const [content, packages, photos] = await Promise.all([
    get("site_content?select=key,data"),
    get("packages?select=*&visible=eq.true&order=sort.asc"),
    get("gallery_photos?select=*&hidden=eq.false&order=sort.asc"),
  ]);
  const map = Object.fromEntries((content as { key: string; data: unknown }[]).map((r) => [r.key, r.data]));
  if (!map["home"]) throw new Error("Contenuti mancanti");
  return { content: map, packages, photos };
}

export async function loadRaw(): Promise<Raw> {
  try {
    lastGood = await fetchRaw();
    return lastGood;
  } catch (error) {
    console.error("Contenuti dal database non disponibili, uso copia di riserva", error);
    return lastGood ?? (snapshot as unknown as Raw);
  }
}

const images: ImageKey[] = ["safari", "coast", "wildlife", "creek"];
const enPk = en.packages as Record<string, { title: string; duration: string; description: string; itinerary?: string[]; parks?: string[] }>;

function toPkg(r: Row, lang: Locale): Pkg {
  const base: Pkg = {
    cover: r.cover ?? null,
    slug: r.slug,
    title: r.title,
    duration: r.duration,
    description: r.description,
    image: images.includes(r.image as ImageKey) ? (r.image as ImageKey) : "safari",
    itinerary: r.itinerary ?? [],
    included: r.included ?? [],
    excluded: r.excluded ?? [],
    parks: r.parks ?? [],
    lodges: r.lodges ?? [],
    price: r.price || null,
  };
  if (lang === "it") return base;
  const t = enPk[r.slug];
  if (!t) return base;
  return {
    ...base,
    cover: base.cover ? { ...base.cover, alt: t.title } : null,
    title: t.title,
    duration: t.duration,
    description: t.description,
    itinerary: t.itinerary ?? base.itinerary,
    parks: t.parks ?? base.parks,
    included: r.kind === "safari" ? en.included : base.included,
    excluded: r.kind === "safari" ? en.excluded : base.excluded,
  };
}

const enHome: HomeText = {
  heroEyebrow: "Watamu · Malindi · Kenya",
  heroTitle: "The real Kenya, from the Watamu sea to the savanna",
  heroText: "Safaris in 4x4 jeeps with pop-up roof and sea and land excursions, with a licensed Italian-speaking guide.",
  heroNote: "Local Italian-speaking guide",
  introTitle: "Why choose us",
  why: [
    { title: "Licensed Italian-speaking guide", text: "A licensed guide who speaks Italian and a professional driver throughout your trip." },
    { title: "4x4 jeep with pop-up roof", text: "To watch and photograph wildlife during every game drive." },
    { title: "Park fees and water included", text: "Park entrance fees and water during game drives are included." },
    { title: "Full safari insurance", text: "Coverage with a replacement vehicle and assistance." },
    { title: "All-inclusive at the lodges", text: "All-inclusive board at the lodges (drinks with meals excluded), with pick-up from your resort in Watamu for short safaris." },
    { title: "Tailor-made on WhatsApp", text: "Packages built around you, by messaging us directly on WhatsApp." },
  ],
  featuredTitle: "Featured safaris",
  featuredIntro: "From Tsavo's red earth to the plains of Masai Mara.",
  seaEyebrow: "Sea and land",
  seaTitle: "Beyond the savanna",
  seaText: "Atolls, mangroves, ruins and sunsets: discover the soul of the Kenyan coast.",
  footerText: "Safaris and excursions in Kenya, based in Watamu and Malindi.",
};
const enPages: Record<"about" | "contact" | "gallery", PageText> = {
  about: {
    title: "About us",
    subtitle: "Discover Kenya with someone who lives it.",
    text: "Africano di Africa guides Italian travellers through Kenya’s great parks and the Watamu and Malindi coast, with local experience, respect and care for safety.",
  },
  contact: {
    title: "Contact",
    subtitle: "Your journey begins with a conversation.",
    text: "Message Africano directly on WhatsApp for information about safaris and excursions.",
  },
  gallery: {
    title: "Gallery",
    subtitle: "Red earth, ocean and mangroves.",
    text: "A glimpse of the landscapes that make every Kenyan journey unique.",
  },
};
const enFaq = [
  { q: "What time do safaris depart?", a: "Departures are usually around 6:00. As a rule there are morning and afternoon game drives, with lunch and overnight at a lodge or camp; on transfer days the programme may change." },
  { q: "What does the safari include?", a: en.included.join(", ") + "." },
  { q: "What is not included?", a: en.excluded.join(", ") + "." },
  { q: "What should I bring?", a: en.bring.join(", ") + "." },
  { q: "Are lodges guaranteed?", a: "The listed properties are assigned subject to availability." },
  { q: "What can I do at night in Taita Hills?", a: "An optional paid night safari with a ranger is available." },
];
const enMe = "My name is Africano and I work with ECO TOURS AND SAFARI'S on the coast of Watamu and Malindi. I have four years of experience and, before this adventure, I worked with two other companies: there I learned how much organisation and details matter, from departure times to game drives at the best moments of the day.\n\nEvery safari and every excursion can be tailored to your needs: we decide the length, parks and stops together on WhatsApp. We will do everything to make your holiday unforgettable, between the savanna and the sea of Kenya.\n\nI look forward to meeting you. Welcome!";
function aboutFor(a: AboutText | undefined, it: boolean): AboutText {
  const base = a ?? { title: "", subtitle: "", text: "" };
  const photos = Array.isArray(base.photos) ? base.photos.filter((p) => p && p.path) : [];
  if (it) return { ...base, photos };
  const enPhotos = photos.map((p, i) => ({ ...p, alt: i === 0 ? "Africano di Africa, guide of ECO TOURS AND SAFARI'S, with travellers in Kenya" : "Africano di Africa on safari in Kenya" }));
  const lic = base.license && base.license.text.trim() ? { ...base.license, text: "Licensed guide, Kenya Tourism Regulatory Authority (TRA), Class E" } : base.license;
  return { ...enPages.about, meTitle: "About me", me: base.me ? enMe : "", photos: enPhotos, license: lic ?? { text: "", number: "", expires: "" } };
}
const enTemplate = "Hello Africano! I would like information about {pacchetto}. People: {persone}. Dates: {date}.";

export function buildContent(raw: Raw, lang: Locale): SiteContent {
  const c = raw.content;
  const settings = (c["settings"] ?? {}) as { whatsapp?: string; template?: string; email?: string; tripadvisor?: string; rating?: string };
  const email = (settings.email ?? c["owner"]?.email ?? DEFAULT_EMAIL).trim();
  const tripadvisor = (settings.tripadvisor ?? DEFAULT_TRIPADVISOR).trim();
  const rating = (settings.rating ?? "").trim();
  const whatsapp = (settings.whatsapp || "254742161072").replace(/\D/g, "");
  const rows = [...raw.packages].sort((a, b) => a.sort - b.sort);
  const pk = (kind: string) => rows.filter((r) => r.kind === kind).map((r) => toPkg(r, lang));
  const it = lang === "it";
  const catAlt: Record<string, [string, string]> = {
    safari: ["Safari nei parchi del Kenya", "Safari in Kenya's parks"],
    mare: ["Il mare e la costa di Watamu", "The sea and coast of Watamu"],
    persone: ["Persone incontrate durante i viaggi in Kenya", "People met on our trips in Kenya"],
  };
  // File-like names (IMG-2026…) are not real descriptions; English pages cannot show Italian alt text.
  const photoAlt = (p: PhotoRow) => {
    const generic = (catAlt[p.category] ?? catAlt["safari"]!)[it ? 0 : 1];
    const own = (p.alt || p.caption || "").trim();
    if (!it || !own || /^(img|dsc|pxl|wa|photo|image)?[-_ ]?\d/i.test(own) || /^img[-_]/i.test(own)) return generic;
    return own;
  };
  const photos: Photo[] = raw.photos.filter((p) => !p.hidden && p.width > 0 && p.height > 0 && p.thumb_path).map((p) => ({
    id: p.id,
    src: `/api/public/img/${p.path}`,
    thumb: `/api/public/img/${p.thumb_path}`,
    width: p.width,
    height: p.height,
    caption: p.caption,
    alt: photoAlt(p),
    category: p.category,
  }));
  const home = (it ? c["home"] : { ...enHome, heroImage: c["home"]?.heroImage ?? null, seaImage: c["home"]?.seaImage ?? null }) as HomeText;
  if (!it) {
    if (home.heroImage) home.heroImage = { ...home.heroImage, alt: "Safari in Kenya with ECO TOURS AND SAFARI'S" };
    if (home.seaImage) home.seaImage = { ...home.seaImage, alt: "The Kenyan coast at Watamu" };
  }
  return {
    owner: { name: "", address: "", email: "", phone: "", license: "", retention: "", transfers: "", law: "", ...c["owner"], email },
    email,
    tripadvisor,
    rating,
    lang,
    whatsapp,
    template: it ? settings.template || "Ciao Africano! Vorrei informazioni su {pacchetto}." : enTemplate,
    home,
    about: aboutFor(c["about"] as AboutText | undefined, it),
    contact: it ? (c["contact"] as PageText) : enPages.contact,
    gallery: it ? (c["gallery"] as PageText) : enPages.gallery,
    faq: it ? ((c["faq"]?.items ?? []) as { q: string; a: string }[]) : enFaq,
    bring: it ? ((c["info"]?.bring ?? []) as string[]) : en.bring,
    safari: pk("safari"),
    excursions: pk("excursion"),
    parks: pk("park"),
    photos,
    headers: Object.fromEntries(
      Object.entries((c["headers"] ?? {}) as Record<string, Cover | null>)
        .filter(([, v]) => v && v.path)
        .map(([k, v]) => [k, it ? v : { ...v!, alt: "ECO TOURS AND SAFARI'S – Kenya" }]),
    ),
  };
}
