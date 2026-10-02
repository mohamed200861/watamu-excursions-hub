// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";
import { writeFile } from "node:fs/promises";

// On every build, refresh the fallback copy of the published content from the database.
// If the database is unreachable the previous copy is kept.
function contentSnapshot(): Plugin {
  return {
    name: "content-snapshot",
    apply: "build",
    async buildStart() {
      const env = loadEnv("production", process.cwd(), "");
      const url = env["VITE_SUPABASE_URL"];
      const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"];
      if (!url || !key) return;
      const headers: Record<string, string> = { apikey: key };
      if (!key.startsWith("sb_")) headers["Authorization"] = `Bearer ${key}`;
      try {
        const get = async (p: string) => {
          const r = await fetch(`${url}/rest/v1/${p}`, { headers, signal: AbortSignal.timeout(8000) });
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        };
        const [content, packages, photos] = await Promise.all([
          get("site_content?select=key,data"),
          get("packages?select=*&visible=eq.true&order=sort.asc"),
          get("gallery_photos?select=*&order=sort.asc"),
        ]);
        const map = Object.fromEntries(content.map((r: { key: string; data: unknown }) => [r.key, r.data]));
        if (!map.home) return;
        await writeFile("src/lib/content-snapshot.json", JSON.stringify({ content: map, packages, photos }));
      } catch (e) {
        console.warn("[content-snapshot] kept previous copy:", e);
      }
    },
  };
}

export default defineConfig({
  plugins: [contentSnapshot()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
