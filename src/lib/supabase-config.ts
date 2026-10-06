// Single source for the public backend address and key (server + SSR).
// Accepts runtime vars (SUPABASE_*) and falls back to the build-time VITE_* values,
// so a Cloudflare deploy works even if only the build variables are set.
// Never put a secret here: both values are public.

function env(name: string): string | undefined {
  try {
    const v = typeof process !== "undefined" ? process.env?.[name] : undefined;
    if (v) return v;
  } catch {
    /* no process in this runtime */
  }
  return undefined;
}

export type SupabaseConfig = { url: string; key: string };

export function readSupabaseConfig(): { config: SupabaseConfig | null; missing: string[] } {
  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL") || import.meta.env?.["VITE_SUPABASE_URL"];
  const key =
    env("SUPABASE_PUBLISHABLE_KEY") || env("VITE_SUPABASE_PUBLISHABLE_KEY") || import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missing = [
    ...(url ? [] : ["SUPABASE_URL (o VITE_SUPABASE_URL)"]),
    ...(key ? [] : ["SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY)"]),
  ];
  return { config: url && key ? { url: url.replace(/\/+$/, ""), key } : null, missing };
}

export function missingMessage(missing: string[]): string {
  return `Variabile mancante: ${missing.join(", ")}. Impostala su Cloudflare → Workers & Pages → il progetto → Settings → Variables and Secrets (come variabile di Build e di Runtime), poi rifai il deploy.`;
}

export function requireSupabaseConfig(): SupabaseConfig {
  const { config, missing } = readSupabaseConfig();
  if (!config) {
    const msg = missingMessage(missing);
    console.error(`[config] ${msg}`);
    throw new Error(msg);
  }
  return config;
}

/** Fetch wrapper for opaque sb_ keys (not JWTs): send apikey, never as bearer. */
export function keyFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}
