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
- Gallery files sit in a private bucket and are served through /api/public/img/* with immutable caching, because public buckets are blocked in this workspace.
- Additional admins are created only by an existing admin through a server function using the service-role client, with a one-time temporary password and a must_change_password flag in user metadata that the /admin layout enforces; this keeps each person's access separate without public signup.
- sitemap.xml, robots.txt and llms.txt are server routes built from live content and the request origin, so they follow published content and work on any domain.
- Gallery uploads are named by content hash so the image proxy can cache them as immutable.
