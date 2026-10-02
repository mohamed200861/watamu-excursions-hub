import { createFileRoute, notFound } from "@tanstack/react-router";
import { DetailPage } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { agencySchema, getLocale, headFor, kindFor } from "@/lib/seo";

export const Route = createFileRoute("/$lang/$section/$slug")({
  loader: async ({ params }) => {
    const kind = kindFor(params.section);
    if (!kind) throw notFound();
    const c = await loadContent(getLocale(params.lang));
    const item = c[kind].find((x) => x.slug === params.slug);
    if (!item) throw notFound();
    return { kind, title: item.title, description: item.description, whatsapp: c.whatsapp };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const path = `/${l}/${params.section}/${params.slug}`;
    if (!loaderData) return headFor(l, l === "it" ? "Esperienza non trovata" : "Experience not found", "ECO TOURS AND SAFARI'S", path);
    const { kind, title, description, whatsapp } = loaderData;
    const primary =
      kind === "safari"
        ? { "@type": "TouristTrip", name: title, description, touristType: "Safari", provider: { "@type": "TravelAgency", name: "ECO TOURS AND SAFARI'S" } }
        : { "@type": "TouristAttraction", name: title, description };
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        primary,
        agencySchema(whatsapp),
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `/${l}` },
            { "@type": "ListItem", position: 2, name: params.section, item: `/${l}/${params.section}` },
            { "@type": "ListItem", position: 3, name: title, item: path },
          ],
        },
      ],
    };
    return headFor(l, title, description, path, schema);
  },
  component: Page,
});

function Page() {
  const { lang, section, slug } = Route.useParams();
  return <DetailPage lang={getLocale(lang)} kind={kindFor(section) ?? "safari"} slug={slug} />;
}
