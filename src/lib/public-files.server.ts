import { buildContent, loadRaw } from "./content.server";

const sections = {
  it: { list: ["safari", "escursioni", "parchi", "chi-siamo", "galleria", "contatti", "privacy", "cookie", "termini"], safari: "safari", excursions: "escursioni", parks: "parchi" },
  en: { list: ["safaris", "excursions", "parks", "about", "gallery", "contact", "privacy", "cookie", "terms"], safari: "safaris", excursions: "excursions", parks: "parks" },
} as const;

export async function sitemapXml(origin: string) {
  const raw = await loadRaw();
  const c = buildContent(raw, "it");
  const owner = c.owner;
  const { legalComplete } = await import("./legal");
  const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  type Entry = { it: string; en: string; lastmod?: string | undefined; images?: { loc: string; title: string }[] | undefined };
  const legalOk = legalComplete(owner);
  const entries: Entry[] = [{ it: "/it", en: "/en" }];
  sections.it.list.forEach((s, i) => {
    if (!legalOk && ["privacy", "cookie", "termini"].includes(s)) return; // noindex pages stay out
    entries.push({
      it: `/it/${s}`, en: `/en/${sections.en.list[i]}`,
      images: s === "galleria" ? c.photos.map((p) => ({ loc: p.src.startsWith("http") ? p.src : `${origin}${p.src}`, title: p.alt || p.caption })) : undefined,
    });
  });
  const updated = new Map(raw.packages.map((r) => [r.slug, (r as { updated_at?: string }).updated_at]));
  for (const k of ["safari", "excursions", "parks"] as const)
    for (const p of c[k]) entries.push({
      it: `/it/${sections.it[k]}/${p.slug}`, en: `/en/${sections.en[k]}/${p.slug}`,
      lastmod: updated.get(p.slug)?.slice(0, 10),
      images: p.cover?.path ? [{ loc: `${origin}/api/public/img/${p.cover.path}`, title: p.cover.alt || p.title }] : undefined,
    });
  const url = (loc: string, e: Entry) =>
    `<url><loc>${origin}${loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<xhtml:link rel="alternate" hreflang="it" href="${origin}${e.it}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}${e.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${e.it}"/>${(e.images ?? []).map((im) => `<image:image><image:loc>${esc(im.loc)}</image:loc></image:image>`).join("")}</url>`;
  const body = entries.map((e) => url(e.it, e) + url(e.en, e)).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
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
    `- Versione completa: ${origin}/llms-full.txt`,
    "- Lingue: italiano, inglese",
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

export async function llmsFullTxt(origin: string) {
  const raw = await loadRaw();
  const out: string[] = [await llmsTxt(origin), "", "# Dettaglio completo dei pacchetti", ""];
  for (const lang of ["it", "en"] as const) {
    const c = buildContent(raw, lang);
    out.push(lang === "it" ? "## Italiano" : "## English", "");
    for (const k of ["safari", "excursions", "parks"] as const)
      for (const p of c[k]) {
        out.push(`### ${p.title}`, `URL: ${origin}/${lang}/${sections[lang][k]}/${p.slug}`);
        if (p.duration) out.push(`${lang === "it" ? "Durata" : "Duration"}: ${p.duration}`);
        if (p.parks.length) out.push(`${lang === "it" ? "Parchi" : "Parks"}: ${p.parks.join(", ")}`);
        out.push("", p.description.trim(), "");
        if (p.itinerary.length) out.push(lang === "it" ? "Itinerario:" : "Itinerary:", ...p.itinerary.map((d, i) => `${i + 1}. ${d}`), "");
        if (p.included.length) out.push(lang === "it" ? "Incluso:" : "Included:", ...p.included.map((x) => `- ${x}`), "");
        if (p.excluded.length) out.push(lang === "it" ? "Non incluso:" : "Not included:", ...p.excluded.map((x) => `- ${x}`), "");
        if (k !== "parks") out.push(`${lang === "it" ? "Prezzo" : "Price"}: ${p.price || (lang === "it" ? "su richiesta via WhatsApp" : "on request via WhatsApp")}`, "");
      }
    if (c.faq.length) out.push(lang === "it" ? "## Domande frequenti" : "## FAQ", "", ...c.faq.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, ""]));
  }
  out.push(`Prenotazione: si scrive su WhatsApp (https://wa.me/${buildContent(raw, "it").whatsapp}); programma e condizioni sono definiti nel preventivo.`, "");
  return out.join("\n");
}

export function robotsTxt(origin: string) {
  const bots = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "*"];
  return bots.map((b) => `User-agent: ${b}\nAllow: /\nDisallow: /admin\nDisallow: /reset-password\n`).join("\n") + `\nSitemap: ${origin}/sitemap.xml\n`;
}
