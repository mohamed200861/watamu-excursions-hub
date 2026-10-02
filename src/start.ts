import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

// Attaches the admin's bearer token only on admin pages, loading the auth client lazily
// so public pages never ship it (keeps the public bundle small).
const attachAdminAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const path = typeof window === "undefined" ? "" : window.location.pathname;
  if (!path.startsWith("/admin") && !path.startsWith("/reset-password")) return next();
  const { supabase } = await import("@/integrations/supabase/client");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachAdminAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
