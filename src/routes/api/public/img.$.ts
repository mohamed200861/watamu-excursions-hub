import { createFileRoute } from "@tanstack/react-router";
import { missingMessage, readSupabaseConfig } from "@/lib/supabase-config";

// Serves published gallery/cover photos from private storage with long-lived CDN caching.
// Uses only the public key, so it works on any host (Lovable or Cloudflare) with just
// VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY; storage RLS allows only published files.
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(path)) return new Response("Not found", { status: 404 });
        const { config, missing } = readSupabaseConfig();
        if (!config) {
          console.error(`[img] ${missingMessage(missing)}`);
          return new Response("Unavailable", { status: 503 });
        }
        const { url, key } = config;
        try {
          const headers: Record<string, string> = { apikey: key };
          if (!key.startsWith("sb_")) headers["Authorization"] = `Bearer ${key}`;
          const r = await fetch(`${url}/storage/v1/object/authenticated/gallery/${path}`, { headers });
          if (!r.ok || !r.body) return new Response("Not found", { status: 404 });
          return new Response(r.body, {
            headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable" },
          });
        } catch {
          return new Response("Unavailable", { status: 503 });
        }
      },
    },
  },
});
