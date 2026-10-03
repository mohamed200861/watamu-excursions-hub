import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { sitemapXml } = await import("@/lib/public-files.server");
        const { SITE_URL: origin } = await import("@/lib/site");
        return new Response(await sitemapXml(origin), {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
