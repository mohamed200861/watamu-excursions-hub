import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { ContentProvider, loadContent } from "@/lib/content-client";
import { getLocale } from "@/lib/seo";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang !== "it" && params.lang !== "en") throw notFound();
  },
  loader: ({ params }) => loadContent(getLocale(params.lang)),
  staleTime: 60_000,
  component: Layout,
});

function Layout() {
  const content = Route.useLoaderData();
  return (
    <ContentProvider value={content}>
      <Outlet />
    </ContentProvider>
  );
}
