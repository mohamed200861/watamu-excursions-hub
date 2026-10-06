import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { keyFetch, requireSupabaseConfig } from "./supabase-config";

// Verifies the signed-in user's token and gives handlers a client acting as that user (RLS applies).
// Uses only the public key, so no secret is needed anywhere.
export const requireUser = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { url, key } = requireSupabaseConfig();
  const auth = getRequest()?.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new Error("Sessione scaduta: accedi di nuovo.");
  const supabase = createClient<Database>(url, key, {
    global: { fetch: keyFetch(key), headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw new Error("Sessione scaduta: accedi di nuovo.");
  return next({ context: { supabase, userId: data.claims.sub as string, claims: data.claims } });
});
