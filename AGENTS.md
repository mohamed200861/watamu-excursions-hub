<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture
- Italian public content lives in the database (site_content, packages, gallery_photos) and is read server-side via getSiteContent with a short timeout; English copy stays in src/lib/content-en.json keyed by slug, because only Italian is editable from /admin.
- Public pages SSR live content and fall back to the worker's last good read, then to src/lib/content-snapshot.json (refreshed on every build), so a slow or paused backend never breaks public pages.
- Admin writes go only through server functions that validate with zod and log to audit_log; the auth client loads only on /admin to keep the public bundle small.
- Two staff roles in user_roles: 'admin' (= proprietario, developer) and 'titolare' (client). RLS uses can_edit()/is_owner(), which also return false while a first-login password change is pending (password_change_required stores only a hash fingerprint, set by an auth.users insert trigger or require_password_change() run from backend SQL), so permissions and the forced change are enforced by the database, not the UI.
- No public password recovery: the developer resets passwords from the backend and then runs require_password_change(email); this avoids reset-link abuse and needs no service-role key.
- The owner guide lives once in docs/GUIDA-TITOLARE.md and /admin/guida renders that same file, so the two versions cannot drift.
- Gallery files sit in a private bucket; storage RLS lets the public key read only files referenced by gallery_photos or visible package covers, and /api/public/img/* proxies them with the public key only, so self-hosting (e.g. Cloudflare) needs no service-role secret.
- Static brand files (logo, OG image) live in public/ rather than platform asset pointers, so external deploys from Git serve them.
- The public address lives only in src/lib/site.ts (SITE_URL, overridable via VITE_SITE_URL) and feeds canonical, hreflang, OG, JSON-LD, sitemap/robots/llms and reset links; src/server.ts redirects www to it and adds X-Robots-Tag noindex on any other host, so previews never get indexed.
- Legal pages hide empty controller fields and stay noindex until legalComplete() passes, so incomplete notices are never shown or indexed.
- Gallery uploads are named by content hash so the image proxy can cache them as immutable.
- Package covers are stored as validated JSON metadata on packages, with content-hashed private-storage full, thumbnail and social renditions; this keeps existing package records and fallback reads backward compatible.
- Legal notices share the bilingual section route and read public owner fields from site_content; this keeps notices server-rendered and contact details editable without duplicating routes.
- Cover crops are generated in the browser from a shared pure crop calculation; this keeps focal-point thumbnails and social images consistent without new dependencies.
- About-page photos and the optional guide licence live inside the 'about' site_content row (photos reuse the cover pipeline and is_published_file allows them); the licence badge is shown only via licenseActive() and never enters JSON-LD.

- The app never uses the service-role key: admin actions run with the signed-in admin's token (src/lib/admin-auth.ts) and admin management goes through has_role-guarded security-definer SQL functions; public backend URL/key are read only via src/lib/supabase-config.ts, so Cloudflare deploys need public variables only.
- Lockfile must stay compatible with the Bun version in .bun-version: after any dependency change regenerate bun.lock with that Bun version and confirm a clean install leaves it unchanged. Cloudflare Workers Builds' automatic frozen install rejects text bun.lock files, so the deploy relies on SKIP_DEPENDENCY_INSTALL=true and a build command of `bun install && bun run build`.
- Security and cache headers (CSP, HSTS, nosniff, immutable caching) are set in src/server.ts for every Worker response; keeping them in one place avoids drift between hosts.
- Gallery photos have a hidden flag that every public read (content.server, snapshot, storage policy) filters out; hiding never deletes, so photos stay recoverable.
