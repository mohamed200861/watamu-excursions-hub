import { createFileRoute } from "@tanstack/react-router";

// Serves published gallery/cover photos from private storage with long-lived CDN caching.
// Uses only the public key, so it works on any host (Lovable or Cloudflare) with just
// VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY; storage RLS allows only published files.
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(path)) return new Response("Not found", { status: 404 });
        const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return new Response("Unavailable", { status: 503 });
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
