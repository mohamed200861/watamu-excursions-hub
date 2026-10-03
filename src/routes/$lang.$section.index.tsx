import { createFileRoute, notFound } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { IndexPage, SimplePage } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { legalComplete } from "@/lib/legal";
import { getLocale, headFor, pageSeo } from "@/lib/seo";
const valid = ["safari", "safaris", "escursioni", "excursions", "parchi", "parks", "chi-siamo", "about", "galleria", "gallery", "contatti", "contact", "privacy", "cookie", "termini", "terms"];
const legal = ["privacy", "cookie", "termini", "terms"];
export const Route = createFileRoute("/$lang/$section/")({
  beforeLoad: ({ params }) => { if (!valid.includes(params.section)) throw notFound(); },
  loader: async ({ params }) => {
    if (!legal.includes(params.section)) return { incomplete: false };
    const c = await loadContent(getLocale(params.lang));
    return { incomplete: !legalComplete(c.owner) };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const [t, d] = pageSeo[`${l}:${params.section}`] ?? ["ECO TOURS AND SAFARI'S", "Safari ed escursioni in Kenya da Watamu."];
    return headFor(l, t, d, `/${l}/${params.section}`, undefined, "/eco-tours-og.webp", loaderData?.incomplete ?? legal.includes(params.section));
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
