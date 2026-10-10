import { ALTERNATE_NAME, DEFAULT_EMAIL, DEFAULT_TRIPADVISOR } from "@/lib/content-types";
import type { Kind, Locale, SiteContent } from "@/lib/content-types";
import { SITE_URL, clamp } from "@/lib/site";
const absolute = (path: string) => (path.startsWith("https://") ? path : `${SITE_URL}${path}`);

const sectionMap: Record<Locale, Record<string, string>> = {
  it: { safari: "safaris", escursioni: "excursions", parchi: "parks", "chi-siamo": "about", galleria: "gallery", contatti: "contact", privacy: "privacy", cookie: "cookie", termini: "terms" },
  en: { safaris: "safari", excursions: "escursioni", parks: "parchi", about: "chi-siamo", gallery: "galleria", contact: "contatti", privacy: "privacy", cookie: "cookie", terms: "termini" },
};
export function getLocale(value: string): Locale {
  return value === "en" ? "en" : "it";
}
export function counterpart(lang: Locale, section?: string, slug?: string) {
  const other = lang === "it" ? "en" : "it";
  if (!section) return `/${other}`;
  return `/${other}/${sectionMap[lang][section] ?? section}${slug ? `/${slug}` : ""}`;
}

/** Page titles (≤60) and descriptions (≤155): service + place + real benefit, only facts already on the site. */
export const pageSeo: Record<string, [string, string]> = {
  "it:home": ["Safari in Kenya ed escursioni a Watamu | Eco Tours", "Safari in jeep 4x4 con tettuccio apribile ed escursioni via mare e terra da Watamu, con guida autorizzata in italiano e ingressi ai parchi inclusi."],
  "en:home": ["Kenya Safaris and Watamu Excursions | Eco Tours", "Safaris in 4x4 jeeps with pop-up roof and sea and land excursions from Watamu, with a licensed Italian-speaking guide and park fees included."],
  "it:safari": ["Safari in Kenya da Watamu e Nairobi | Eco Tours", "Safari da 2 a 7 giorni tra Tsavo, Amboseli, Masai Mara e Taita Hills in jeep 4x4, con guida autorizzata in italiano e assicurazione inclusa."],
  "en:safaris": ["Kenya Safaris from Watamu and Nairobi | Eco Tours", "2 to 7-day safaris across Tsavo, Amboseli, Masai Mara and Taita Hills in 4x4 jeeps, with a licensed Italian-speaking guide and insurance."],
  "it:escursioni": ["Escursioni a Watamu e Malindi via mare e terra", "Safari Blu, Sardegna Due, Isola dell'Amore, Rovine di Gede e Mida Creek: escursioni da Watamu con guida in italiano, su misura via WhatsApp."],
  "en:excursions": ["Watamu and Malindi Sea and Land Excursions", "Safari Blu, Sardegna Due, Love Island, Gede Ruins and Mida Creek: excursions from Watamu with an Italian-speaking guide, tailored on WhatsApp."],
  "it:parchi": ["Parchi del Kenya: Masai Mara, Tsavo e Amboseli", "Masai Mara, Amboseli, Lake Nakuru, Tsavo Est, Tsavo Ovest e Taita Hills: safari in jeep 4x4 con tettuccio apribile e guida in italiano."],
  "en:parks": ["Kenya Parks: Masai Mara, Tsavo and Amboseli", "Masai Mara, Amboseli, Lake Nakuru, Tsavo East, Tsavo West and Taita Hills: safaris in 4x4 jeeps with pop-up roof and an Italian-speaking guide."],
  "it:chi-siamo": ["Chi siamo | Guida autorizzata in italiano a Watamu", "Africano di Africa, guida autorizzata in italiano a Watamu: safari ed escursioni in Kenya con autista professionale e jeep 4x4."],
  "en:about": ["About Us | Licensed Italian-Speaking Guide in Watamu", "Africano di Africa, a licensed Italian-speaking guide in Watamu: Kenya safaris and excursions with a professional driver and 4x4 jeeps."],
  "it:galleria": ["Galleria foto safari e mare del Kenya | Eco Tours", "Foto dei safari nei parchi del Kenya, del mare di Watamu e delle persone incontrate durante le escursioni con Eco Tours and Safari's."],
  "en:gallery": ["Kenya Safari and Sea Photo Gallery | Eco Tours", "Photos of safaris in Kenya's parks, the Watamu sea and the people met during excursions with Eco Tours and Safari's."],
  "it:contatti": ["Contatti | Safari ed escursioni a Watamu su WhatsApp", "Scrivi ad Africano di Africa su WhatsApp per pacchetti su misura: safari in Kenya ed escursioni a Watamu e Malindi con guida in italiano."],
  "en:contact": ["Contact | Watamu Safaris and Excursions on WhatsApp", "Message Africano di Africa on WhatsApp for tailor-made packages: Kenya safaris and Watamu and Malindi excursions with an Italian-speaking guide."],
  "it:privacy": ["Informativa privacy | Eco Tours and Safari's", "Come Eco Tours and Safari's tratta i dati di navigazione: nessun modulo di contatto, solo cookie tecnici, diritti GDPR e contatti del titolare."],
  "en:privacy": ["Privacy Notice | Eco Tours and Safari's", "How Eco Tours and Safari's handles browsing data: no contact forms, only technical cookies, GDPR rights and controller contacts."],
  "it:cookie": ["Informativa cookie | Eco Tours and Safari's", "Il sito usa solo cookie tecnici necessari: nessun analytics, nessun pixel pubblicitario e nessun cookie di profilazione."],
  "en:cookie": ["Cookie Notice | Eco Tours and Safari's", "This site only uses necessary technical cookies: no analytics, no advertising pixels and no profiling cookies."],
  "it:termini": ["Condizioni di servizio | Eco Tours and Safari's", "Condizioni per safari ed escursioni in Kenya: programmi indicativi, preventivi su WhatsApp, incluso ed escluso come da scheda pacchetto."],
  "en:terms": ["Terms of Service | Eco Tours and Safari's", "Terms for Kenya safaris and excursions: indicative itineraries, quotations on WhatsApp, inclusions and exclusions as listed in each package."],
};

export function detailSeo(lang: Locale, kind: Kind, title: string): [string, string] {
  const it = lang === "it";
  const suffix = kind === "safari" ? (it ? " | Safari in Kenya da Watamu" : " | Kenya Safari from Watamu") : kind === "excursions" ? (it ? " | Escursione a Watamu" : " | Watamu Excursion") : it ? " | Parco del Kenya" : " | Kenya Park";
  const t = title.length + suffix.length <= 60 ? title + suffix : clamp(title, 60);
  const d =
    kind === "safari"
      ? it ? `${title}: safari in jeep 4x4 con tettuccio apribile, guida autorizzata in italiano, ingressi e assicurazione inclusi.` : `${title}: safari in a 4x4 jeep with pop-up roof, licensed Italian-speaking guide, park fees and insurance included.`
      : kind === "excursions"
        ? it ? `${title} da Watamu con guida in italiano: programma, cosa è incluso e prenotazione diretta su WhatsApp.` : `${title} from Watamu with an Italian-speaking guide: programme, inclusions and direct booking on WhatsApp.`
        : it ? `${title}: safari in jeep 4x4 con tettuccio apribile e guida autorizzata in italiano, in partenza da Watamu.` : `${title}: safaris in a 4x4 jeep with pop-up roof and a licensed Italian-speaking guide, departing from Watamu.`;
  return [t, clamp(d, 155)];
}

export function headFor(lang: Locale, title: string, description: string, path: string, schema?: object, image?: string, noindex = false) {
  const other = lang === "it" ? "en" : "it";
  const parts = path.split("/").filter(Boolean);
  const alt = counterpart(lang, parts[1], parts[2]);
  const t = clamp(title, 60), d = clamp(description, 155);
  return {
    meta: [
      { title: t },
      { name: "description", content: d },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absolute(path) },
      { property: "og:site_name", content: "ECO TOURS AND SAFARI'S" },
      { property: "og:locale", content: lang === "it" ? "it_IT" : "en_GB" },
      { property: "og:locale:alternate", content: lang === "it" ? "en_GB" : "it_IT" },
      ...(image ? [{ property: "og:image", content: absolute(image) }, { property: "og:image:width", content: "1200" }, { property: "og:image:height", content: "630" }, { property: "og:image:type", content: "image/webp" }, { name: "twitter:image", content: absolute(image) }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: t },
      { name: "twitter:description", content: d },
    ],
    links: [
      { rel: "canonical", href: absolute(path) },
      { rel: "alternate", hrefLang: lang, href: absolute(path) },
      { rel: "alternate", hrefLang: other, href: absolute(alt) },
      { rel: "alternate", hrefLang: "x-default", href: absolute(lang === "it" ? path : alt) },
    ],
    scripts: schema ? [{ type: "application/ld+json", children: JSON.stringify(schema) }] : [],
  };
}
export function kindFor(section: string): Kind | null {
  if (section === "safari" || section === "safaris") return "safari";
  if (section === "escursioni" || section === "excursions") return "excursions";
  if (section === "parchi" || section === "parks") return "parks";
  return null;
}
export const abs = absolute;
export function agencySchema(whatsapp: string, tripadvisor: string = DEFAULT_TRIPADVISOR, email: string = DEFAULT_EMAIL) {
  return {
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: "ECO TOURS AND SAFARI'S",
    alternateName: ALTERNATE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/eco-tours-logo.svg`,
    image: `${SITE_URL}/eco-tours-og.webp`,
    founder: { "@type": "Person", name: "Africano di Africa" },
    address: { "@type": "PostalAddress", addressLocality: "Watamu", addressRegion: "Kilifi", addressCountry: "KE" },
    contactPoint: { "@type": "ContactPoint", telephone: `+${whatsapp}`, ...(email ? { email } : {}), contactType: "reservations", availableLanguage: ["Italian", "English"] },
    knowsLanguage: ["it", "en"],
    areaServed: [{ "@type": "Place", name: "Watamu" }, { "@type": "Place", name: "Malindi" }, { "@type": "Country", name: "Kenya" }],
    telephone: `+${whatsapp}`,
    ...(email ? { email } : {}),
    sameAs: ["https://instagram.com/africano_di_africa_", `https://wa.me/${whatsapp}`, ...(tripadvisor ? [tripadvisor] : [])],
  };
}
export const websiteSchema = () => ({ "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "ECO TOURS AND SAFARI'S", inLanguage: ["it", "en"], publisher: { "@id": `${SITE_URL}/#organization` } });
const sectionNames: Record<string, string> = { safari: "Safari", safaris: "Safaris", escursioni: "Escursioni", excursions: "Excursions", parchi: "Parchi", parks: "Parks", "chi-siamo": "Chi siamo", about: "About", galleria: "Galleria", gallery: "Gallery", contatti: "Contatti", contact: "Contact", privacy: "Privacy", cookie: "Cookie", termini: "Termini", terms: "Terms" };
export function breadcrumbSchema(lang: Locale, section: string, leaf?: { name: string; path: string }) {
  const items = [
    { name: "Home", item: absolute(`/${lang}`) },
    { name: sectionNames[section] ?? section, item: absolute(`/${lang}/${section}`) },
    ...(leaf ? [{ name: leaf.name, item: absolute(leaf.path) }] : []),
  ];
  return { "@type": "BreadcrumbList", itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })) };
}
export function faqSchema(faq: { q: string; a: string }[]) {
  return { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}
/** Package as TouristTrip (safari/excursion) or TouristAttraction (park). Offers only when a real price exists. */
export function packageSchema(kind: Kind, p: { title: string; description: string; itinerary: string[]; included: string[]; price?: string | null; parks?: string[] }, path: string, img?: string) {
  const base = { name: p.title, description: p.description, url: absolute(path), ...(img ? { image: img } : {}) };
  if (kind === "parks") return { "@type": "TouristAttraction", ...base, ...(p.parks?.length ? {} : {}), isAccessibleForFree: false };
  const priceNum = p.price ? Number(String(p.price).replace(/[^0-9.]/g, "")) : NaN;
  return {
    "@type": "TouristTrip",
    ...base,
    touristType: kind === "safari" ? "Safari" : "Excursion",
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(p.itinerary.length ? { itinerary: { "@type": "ItemList", numberOfItems: p.itinerary.length, itemListElement: p.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d })) } } : {}),
    ...(p.included.length ? { additionalProperty: p.included.map((x) => ({ "@type": "PropertyValue", name: "included", value: x })) } : {}),
    ...(p.price && priceNum > 0 && /€|eur|\$|usd/i.test(p.price) ? { offers: { "@type": "Offer", price: priceNum, priceCurrency: /\$|usd/i.test(p.price) ? "USD" : "EUR", url: absolute(path) } } : {}),
  };
}
export type { SiteContent };
