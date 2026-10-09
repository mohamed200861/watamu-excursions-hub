import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { SITE_URL } from "@/lib/site";
import { agencySchema, getLocale, headFor, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  loader: async ({ params }) => {
    const c = await loadContent(getLocale(params.lang));
    return { faq: c.faq, whatsapp: c.whatsapp, tripadvisor: c.tripadvisor };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const faq = loaderData?.faq ?? [];
    const [title, description] = pageSeo[`${l}:home`]!;
    return headFor(l, title, description, `/${l}`, {
      "@context": "https://schema.org",
      "@graph": [
        agencySchema(loaderData?.whatsapp ?? "254742161072", loaderData?.tripadvisor),
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "ECO TOURS AND SAFARI'S", inLanguage: ["it", "en"], publisher: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ],
    }, "/eco-tours-og.webp");
  },
  component: Page,
});

function Page() {
  const { lang } = Route.useParams();
  return <Home lang={getLocale(lang)} />;
}
