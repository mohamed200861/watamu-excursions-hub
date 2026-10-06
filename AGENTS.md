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
- Admin writes go only through server functions that check the admin role and validate with zod, and log to audit_log; the auth client loads only on /admin and /reset-password to keep the public bundle small.
- Gallery files sit in a private bucket; storage RLS lets the public key read only files referenced by gallery_photos or visible package covers, and /api/public/img/* proxies them with the public key only, so self-hosting (e.g. Cloudflare) needs no service-role secret.
- Static brand files (logo, OG image) live in public/ rather than platform asset pointers, so external deploys from Git serve them.
- Additional admins are created only by an existing admin through a server function using the service-role client, with a one-time temporary password and a must_change_password flag in user metadata that the /admin layout enforces; this keeps each person's access separate without public signup.
- The public address lives only in src/lib/site.ts (SITE_URL, overridable via VITE_SITE_URL) and feeds canonical, hreflang, OG, JSON-LD, sitemap/robots/llms and reset links; src/server.ts redirects www to it and adds X-Robots-Tag noindex on any other host, so previews never get indexed.
- Legal pages hide empty controller fields and stay noindex until legalComplete() passes, so incomplete notices are never shown or indexed.
- Gallery uploads are named by content hash so the image proxy can cache them as immutable.
- Package covers are stored as validated JSON metadata on packages, with content-hashed private-storage full, thumbnail and social renditions; this keeps existing package records and fallback reads backward compatible.
- Legal notices share the bilingual section route and read public owner fields from site_content; this keeps notices server-rendered and contact details editable without duplicating routes.
- Cover crops are generated in the browser from a shared pure crop calculation; this keeps focal-point thumbnails and social images consistent without new dependencies.
- About-page photos and the optional guide licence live inside the 'about' site_content row (photos reuse the cover pipeline and is_published_file allows them); the licence badge is shown only via licenseActive() and never enters JSON-LD.
