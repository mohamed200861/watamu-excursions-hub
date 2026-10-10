import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SITE_HOST, SITE_URL } from "./lib/site";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Security headers for every response; long immutable cache for hashed build assets and photos.
function withHeaders(response: Response, url: URL): Response {
  const r = new Response(response.body, response);
  const h = r.headers;
  const backend = (() => { try { return new URL(String(import.meta.env?.["VITE_SUPABASE_URL"] ?? "")).origin; } catch { return ""; } })();
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  if (url.protocol === "https:") h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  h.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: ${backend}`.trim(),
      `connect-src 'self' ${backend} ${backend.replace("https://", "wss://")}`.trim(),
      "frame-ancestors 'self' https://*.lovable.app https://*.lovableproject.com https://lovable.dev",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  );
  if (/^\/assets\/.+-[A-Za-z0-9_-]{6,}\.[a-z0-9]+$/.test(url.pathname) || url.pathname.startsWith("/api/public/img/")) {
    if (r.ok) h.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  // Only the final domain is indexable; previews and other hosts get noindex. Admin pages never.
  if (url.host !== SITE_HOST || url.pathname.startsWith("/admin")) h.set("X-Robots-Tag", "noindex, nofollow");
  return r;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      // www → apex permanent redirect
      if (url.host === `www.${SITE_HOST}`) return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 301);
      const handler = await getServerEntry();
      const response = await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx));
      return withHeaders(response, url);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
