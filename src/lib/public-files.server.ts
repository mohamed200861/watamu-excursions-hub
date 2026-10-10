import { buildContent, loadRaw } from "./content.server";

const sections = {
  it: { list: ["safari", "escursioni", "parchi", "chi-siamo", "galleria", "contatti", "privacy", "cookie", "termini"], safari: "safari", excursions: "escursioni", parks: "parchi" },
  en: { list: ["safaris", "excursions", "parks", "about", "gallery", "contact", "privacy", "cookie", "terms"], safari: "safaris", excursions: "excursions", parks: "parks" },
} as const;

export async function sitemapXml(origin: string) {
  const raw = await loadRaw();
  const c = buildContent(raw, "it");
  const pairs: [string, string][] = [["/it", "/en"]];
  sections.it.list.forEach((s, i) => pairs.push([`/it/${s}`, `/en/${sections.en.list[i]}`]));
  for (const k of ["safari", "excursions", "parks"] as const)
    for (const p of c[k]) pairs.push([`/it/${sections.it[k]}/${p.slug}`, `/en/${sections.en[k]}/${p.slug}`]);
  const url = (loc: string, it: string, en: string) =>
    `<url><loc>${origin}${loc}</loc><xhtml:link rel="alternate" hreflang="it" href="${origin}${it}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${it}"/></url>`;
  const body = pairs.map(([it, en]) => url(it, it, en) + url(en, it, en)).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`;
}

export async function llmsTxt(origin: string) {
  const c = buildContent(await loadRaw(), "it");
  const line = (sec: string, p: { slug: string; title: string; duration: string; description: string }) =>
    `- [${p.title}](${origin}/it/${sec}/${p.slug})${p.duration ? ` (${p.duration})` : ""}: ${p.description.replace(/\s+/g, " ").slice(0, 220)}`;
  return [
    "# ECO TOURS AND SAFARI'S",
    "",
    "> Safari ed escursioni in Kenya con base a Watamu/Malindi, guidati da \"Africano di Africa\" con guida autorizzata in italiano. Contatti e prenotazioni su WhatsApp.",
    "",
    `- WhatsApp: https://wa.me/${c.whatsapp}`,
    "- Instagram: https://instagram.com/africano_di_africa_",
    ...(c.tripadvisor ? [`- Tripadvisor (profilo "Africano Di Africa Kenya Safari Tours", nome alternativo di ECO TOURS AND SAFARI'S): ${c.tripadvisor}`] : []),
    ...(c.email ? [`- Email: ${c.email}`] : []),
    `- Sito in italiano: ${origin}/it — in inglese: ${origin}/en`,
    "",
    "## Chi siamo",
    `- [Chi siamo](${origin}/it/chi-siamo) — [English](${origin}/en/about): Africano, guida a Watamu e Malindi con quattro anni di esperienza; safari ed escursioni adattati su WhatsApp.`,
    "",
    "## Informazioni legali",
    `- [Privacy](${origin}/it/privacy) — [English](${origin}/en/privacy)`,
    `- [Cookie](${origin}/it/cookie) — [English](${origin}/en/cookie)`,
    `- [Termini](${origin}/it/termini) — [English](${origin}/en/terms)`,
    "",
    "## Safari",
    ...c.safari.map((p) => line("safari", p)),
    "",
    "## Escursioni mare e terra",
    ...c.excursions.map((p) => line("escursioni", p)),
    "",
    "## Parchi",
    ...c.parks.map((p) => line("parchi", p)),
    "",
    "Prezzi e date: su richiesta via WhatsApp.",
    "",
  ].join("\n");
}

export function robotsTxt(origin: string) {
  const bots = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "*"];
  return bots.map((b) => `User-agent: ${b}\nAllow: /\nDisallow: /admin\nDisallow: /reset-password\n`).join("\n") + `\nSitemap: ${origin}/sitemap.xml\n`;
}
