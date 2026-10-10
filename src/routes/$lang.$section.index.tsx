import { createFileRoute, notFound } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { IndexPage, SimplePage } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { legalComplete } from "@/lib/legal";
import { abs, agencySchema, breadcrumbSchema, getLocale, headFor, kindFor, pageSeo } from "@/lib/seo";
const valid = ["safari", "safaris", "escursioni", "excursions", "parchi", "parks", "chi-siamo", "about", "galleria", "gallery", "contatti", "contact", "privacy", "cookie", "termini", "terms"];
const legal = ["privacy", "cookie", "termini", "terms"];
export const Route = createFileRoute("/$lang/$section/")({
  beforeLoad: ({ params }) => { if (!valid.includes(params.section)) throw notFound(); },
  loader: async ({ params }) => {
    const c = await loadContent(getLocale(params.lang));
    const kind = kindFor(params.section);
    return {
      incomplete: legal.includes(params.section) ? !legalComplete(c.owner) : false,
      whatsapp: c.whatsapp, tripadvisor: c.tripadvisor, email: c.email,
      items: kind ? c[kind].map((p) => ({ slug: p.slug, title: p.title })) : [],
    };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const [t, d] = pageSeo[`${l}:${params.section}`] ?? ["ECO TOURS AND SAFARI'S", "Safari ed escursioni in Kenya da Watamu."];
    const path = `/${l}/${params.section}`;
    const graph: object[] = [breadcrumbSchema(l, params.section)];
    if (loaderData) {
      graph.push(agencySchema(loaderData.whatsapp, loaderData.tripadvisor, loaderData.email));
      if (loaderData.items.length) graph.push({ "@type": "ItemList", itemListElement: loaderData.items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: abs(`${path}/${p.slug}`) })) });
    }
    return headFor(l, t, d, path, { "@context": "https://schema.org", "@graph": graph }, "/eco-tours-og.webp", loaderData?.incomplete ?? legal.includes(params.section));
  },
  component: Page,
});
function Page() {
  const { lang, section } = Route.useParams();
  const l = getLocale(lang);
  if (legal.includes(section)) return <LegalPage lang={l} kind={section === "privacy" ? "privacy" : section === "cookie" ? "cookie" : "terms"} />;
  if (section === "safari" || section === "safaris") return <IndexPage lang={l} kind="safari" />;
  if (section === "escursioni" || section === "excursions") return <IndexPage lang={l} kind="excursions" />;
  if (section === "parchi" || section === "parks") return <IndexPage lang={l} kind="parks" />;
  return <SimplePage lang={l} type={section === "chi-siamo" || section === "about" ? "about" : section === "galleria" || section === "gallery" ? "gallery" : "contact"} />;
}
