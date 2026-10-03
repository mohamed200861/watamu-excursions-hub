import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { llmsTxt } = await import("@/lib/public-files.server");
        const { SITE_URL: origin } = await import("@/lib/site");
        return new Response(await llmsTxt(origin), {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
