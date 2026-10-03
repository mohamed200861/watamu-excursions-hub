import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { robotsTxt } = await import("@/lib/public-files.server");
        const { SITE_URL: origin } = await import("@/lib/site");
        return new Response(await robotsTxt(origin), {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
