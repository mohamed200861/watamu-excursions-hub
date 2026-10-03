import { createFileRoute } from "@tanstack/react-router";

// Serves gallery photos from private storage with long-lived CDN caching.
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(path)) return new Response("Not found", { status: 404 });
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from("gallery").download(path);
          if (error || !data) return new Response("Not found", { status: 404 });
          return new Response(data.stream(), {
            headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable" },
          });
        } catch {
          return new Response("Unavailable", { status: 503 });
        }
      },
    },
  },
});
