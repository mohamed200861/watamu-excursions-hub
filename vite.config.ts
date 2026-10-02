// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [
      { path: "/it" }, { path: "/en" },
      ...["safari", "escursioni", "parchi", "chi-siamo", "galleria", "contatti"].map((path) => ({ path: `/it/${path}` })),
      ...["safaris", "excursions", "parks", "about", "gallery", "contact"].map((path) => ({ path: `/en/${path}` })),
      ...["tsavo-est-2-giorni", "tsavo-est-taita-hills-3-giorni", "tsavo-est-amboseli-3-giorni", "mara-nakuru-amboseli-5-giorni", "grande-kenya-6-giorni", "kenya-completo-7-giorni"].flatMap((slug) => [{ path: `/it/safari/${slug}` }, { path: `/en/safaris/${slug}` }]),
      ...["safari-blu", "isola-dell-amore", "sardegna-due", "isola-di-robinson", "rovine-di-gede", "hells-kitchen-marafa", "vera-africa", "aperitivo-mida-creek"].flatMap((slug) => [{ path: `/it/escursioni/${slug}` }, { path: `/en/excursions/${slug}` }]),
      ...["masai-mara", "amboseli", "lake-nakuru", "tsavo-est", "tsavo-ovest", "taita-hills"].flatMap((slug) => [{ path: `/it/parchi/${slug}` }, { path: `/en/parks/${slug}` }]),
    ],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
