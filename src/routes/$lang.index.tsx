import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { agencySchema, getLocale, headFor } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  loader: async ({ params }) => {
    const c = await loadContent(getLocale(params.lang));
    return { faq: c.faq, whatsapp: c.whatsapp };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const faq = loaderData?.faq ?? [];
    return headFor(
      l,
      l === "it" ? "Safari ed escursioni in Kenya" : "Safaris and excursions in Kenya",
      l === "it"
        ? "Safari ed escursioni autentiche in Kenya con guida locale in italiano, da Watamu e Malindi."
        : "Authentic Kenya safaris and excursions with a local Italian-speaking guide, from Watamu and Malindi.",
      `/${l}`,
      {
        "@context": "https://schema.org",
        "@graph": [
          agencySchema(loaderData?.whatsapp ?? "254742161072"),
          { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      },
    );
  },
  component: Page,
});

function Page() {
  const { lang } = Route.useParams();
  return <Home lang={getLocale(lang)} />;
}
