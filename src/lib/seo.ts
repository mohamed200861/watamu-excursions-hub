import og from "@/assets/eco-tours-og.webp.asset.json";
import { excursions, parks, safariData, type Locale } from "@/lib/site-data";

const sectionMap: Record<Locale, Record<string, string>> = {
  it: { safari: "safaris", escursioni: "excursions", parchi: "parks", "chi-siamo": "about", galleria: "gallery", contatti: "contact" },
  en: { safaris: "safari", excursions: "escursioni", parks: "parchi", about: "chi-siamo", gallery: "galleria", contact: "contatti" },
};
export function getLocale(value: string): Locale { return value === "en" ? "en" : "it"; }
export function counterpart(lang: Locale, section?: string, slug?: string) {
  const other = lang === "it" ? "en" : "it";
  if (!section) return `/${other}`;
  return `/${other}/${sectionMap[lang][section] ?? section}${slug ? `/${slug}` : ""}`;
}
export function headFor(lang: Locale, title: string, description: string, path: string, schema?: object) {
  const other = lang === "it" ? "en" : "it";
  const parts = path.split("/").filter(Boolean); const alt = counterpart(lang, parts[1], parts[2]);
  return { meta:[{title:`${title} — ECO TOURS AND SAFARI'S`},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:description},{property:"og:type",content:"website"},{property:"og:url",content:path},{property:"og:image",content:og.url},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:image",content:og.url}],links:[{rel:"canonical",href:path},{rel:"alternate",hrefLang:lang,href:path},{rel:"alternate",hrefLang:other,href:alt},{rel:"alternate",hrefLang:"x-default",href:"/it"}],scripts:schema?[{type:"application/ld+json",children:JSON.stringify(schema)}]:[] };
}
export function itemFor(lang: Locale, section:string, slug:string){if(section==="safari"||section==="safaris")return {kind:"safari" as const,item:safariData[lang].find(x=>x.slug===slug)};if(section==="escursioni"||section==="excursions")return {kind:"excursions" as const,item:excursions[lang].find(x=>x.slug===slug)};return {kind:"parks" as const,item:parks[lang].find(x=>x.slug===slug)};}
export const agencySchema={"@context":"https://schema.org","@type":["TravelAgency","LocalBusiness"],name:"ECO TOURS AND SAFARI'S",founder:"Africano di Africa",areaServed:["Watamu","Malindi","Kenya"],telephone:"+254742161072",sameAs:["https://instagram.com/africano_di_africa_","https://wa.me/254742161072"]};
