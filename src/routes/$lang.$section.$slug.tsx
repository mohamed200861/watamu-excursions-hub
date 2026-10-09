import { createFileRoute, notFound } from "@tanstack/react-router";
import { DetailPage } from "@/components/Site";
import { loadContent } from "@/lib/content-client";
import { abs, agencySchema, detailSeo, getLocale, headFor, kindFor } from "@/lib/seo";

export const Route = createFileRoute("/$lang/$section/$slug")({
  loader: async ({ params }) => {
    const kind = kindFor(params.section);
    if (!kind) throw notFound();
    const c = await loadContent(getLocale(params.lang));
    const item = c[kind].find((x) => x.slug === params.slug);
    if (!item) throw notFound();
    return { kind, title: item.title, description: item.description, whatsapp: c.whatsapp, tripadvisor: c.tripadvisor, image: item.cover ? `/api/public/img/${item.cover.og_path}` : undefined };
  },
  staleTime: 60_000,
  head: ({ params, loaderData }) => {
    const l = getLocale(params.lang);
    const path = `/${l}/${params.section}/${params.slug}`;
    if (!loaderData) return headFor(l, l === "it" ? "Esperienza non trovata" : "Experience not found", "ECO TOURS AND SAFARI'S", path, undefined, undefined, true);
    const { kind, title, description, whatsapp, tripadvisor, image } = loaderData;
    const [seoTitle, seoDesc] = detailSeo(l, kind, title);
    const img = image ? abs(image) : undefined;
    const primary =
      kind === "safari"
        ? { "@type": "TouristTrip", name: title, description, url: abs(path), touristType: "Safari", ...(img ? { image: img } : {}), provider: { "@id": abs("/#organization") } }
        : { "@type": "TouristAttraction", name: title, description, url: abs(path), ...(img ? { image: img } : {}) };
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        primary,
        agencySchema(whatsapp, tripadvisor),
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs(`/${l}`) },
            { "@type": "ListItem", position: 2, name: params.section, item: abs(`/${l}/${params.section}`) },
            { "@type": "ListItem", position: 3, name: title, item: abs(path) },
          ],
        },
      ],
    };
    return headFor(l, seoTitle, seoDesc, path, schema, image ?? "/eco-tours-og.webp");
  },
  component: Page,
});

function Page() {
  const { lang, section, slug } = Route.useParams();
  return <DetailPage lang={getLocale(lang)} kind={kindFor(section) ?? "safari"} slug={slug} />;
}
