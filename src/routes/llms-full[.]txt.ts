import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { llmsFullTxt } = await import("@/lib/public-files.server");
        const { SITE_URL: origin } = await import("@/lib/site");
        return new Response(await llmsFullTxt(origin), {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
