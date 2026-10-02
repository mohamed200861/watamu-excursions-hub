import og from "@/assets/eco-tours-og.webp.asset.json";
import type { Kind, Locale, SiteContent } from "@/lib/content-types";

const sectionMap: Record<Locale, Record<string, string>> = {
  it: { safari: "safaris", escursioni: "excursions", parchi: "parks", "chi-siamo": "about", galleria: "gallery", contatti: "contact" },
  en: { safaris: "safari", excursions: "escursioni", parks: "parchi", about: "chi-siamo", gallery: "galleria", contact: "contatti" },
};
export function getLocale(value: string): Locale {
  return value === "en" ? "en" : "it";
}
export function counterpart(lang: Locale, section?: string, slug?: string) {
  const other = lang === "it" ? "en" : "it";
  if (!section) return `/${other}`;
  return `/${other}/${sectionMap[lang][section] ?? section}${slug ? `/${slug}` : ""}`;
}
export function headFor(lang: Locale, title: string, description: string, path: string, schema?: object) {
  const other = lang === "it" ? "en" : "it";
  const parts = path.split("/").filter(Boolean);
  const alt = counterpart(lang, parts[1], parts[2]);
  return {
    meta: [
      { title: `${title} — ECO TOURS AND SAFARI'S` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
      { property: "og:image", content: og.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: og.url },
    ],
    links: [
      { rel: "canonical", href: path },
      { rel: "alternate", hrefLang: lang, href: path },
      { rel: "alternate", hrefLang: other, href: alt },
      { rel: "alternate", hrefLang: "x-default", href: "/it" },
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
export function agencySchema(whatsapp: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    name: "ECO TOURS AND SAFARI'S",
    founder: { "@type": "Person", name: "Africano di Africa" },
    image: og.url,
    logo: og.url,
    address: { "@type": "PostalAddress", addressLocality: "Watamu", addressRegion: "Kilifi", addressCountry: "KE" },
    contactPoint: { "@type": "ContactPoint", telephone: `+${whatsapp}`, contactType: "reservations", availableLanguage: ["Italian", "English"] },
    knowsLanguage: ["it", "en"],
    areaServed: ["Watamu", "Malindi", "Kenya"],
    telephone: `+${whatsapp}`,
    sameAs: ["https://instagram.com/africano_di_africa_", `https://wa.me/${whatsapp}`],
  };
}
export type { SiteContent };
