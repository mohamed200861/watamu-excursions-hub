import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser as requireSupabaseAuth } from "./admin-auth";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || !data) throw new Error("Accesso non autorizzato");
}
async function log(ctx: Ctx, action: string, detail: Record<string, unknown> = {}) {
  await ctx.supabase.from("audit_log").insert({ user_id: ctx.userId, action, detail });
}
function fail(error: { message?: string } | null, msg: string) {
  if (error) {
    console.error(msg, error);
    throw new Error(msg);
  }
}

const str = (max = 400) => z.string().trim().max(max);
const list = (max = 30, len = 600) => z.array(str(len)).max(max);
const page = z.object({ title: str(120).min(1), subtitle: str(300), text: str(3000) });

function coverSchemaAbout() {
  const p = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/);
  return z.object({ path: p, thumb_path: p, og_path: p, alt: str(300).min(1), focal_x: z.number().min(0).max(100), focal_y: z.number().min(0).max(100) });
}
const contentSchemas = {
  home: z.object({
    heroEyebrow: str(120),
    heroTitle: str(160).min(1),
    heroText: str(400),
    heroNote: str(120),
    introTitle: str(200),
    why: z.array(z.object({ title: str(80), text: str(400) })).min(3).max(6),
    featuredTitle: str(120),
    featuredIntro: str(300),
    seaEyebrow: str(80),
    seaTitle: str(120),
    seaText: str(400),
    footerText: str(300),
  }),
  owner: z.object({ name: str(200), address: str(400), email: z.union([z.literal(""), z.string().trim().email().max(200)]), phone: str(80), license: str(120), retention: str(1000).default(""), transfers: str(1000).default(""), law: str(1000).default("") }),
  about: page.extend({
    meTitle: str(120).default(""),
    me: str(4000).default(""),
    photos: z.array(coverSchemaAbout()).max(3).default([]),
    license: z.object({ text: str(200), number: str(80), expires: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Scadenza: usa una data valida")]) }).default({ text: "", number: "", expires: "" }),
  }),
  contact: page,
  gallery: page,
  faq: z.object({ items: z.array(z.object({ q: str(200).min(1), a: str(1500).min(1) })).max(30) }),
  info: z.object({ bring: list() }),
  settings: z.object({
    whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Numero WhatsApp: solo cifre con prefisso, es. 254742161072"),
    template: str(500).min(5).refine((t) => t.includes("{pacchetto}"), "Il messaggio deve contenere {pacchetto}"),
  }),
} as const;
type ContentKey = keyof typeof contentSchemas;

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const { key, data } = z.object({ key: z.enum(Object.keys(contentSchemas) as [ContentKey, ...ContentKey[]]), data: z.unknown() }).parse(d);
    return { key, data: contentSchemas[key].parse(data) as Record<string, unknown> };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await (context.supabase as any).from("site_content").upsert({ key: data.key, data: data.data, updated_at: new Date().toISOString() });
    fail(error, "Salvataggio non riuscito");
    await log(context, "content.save", { key: data.key });
    return { ok: true };
  });

const photoPath = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/);
const coverSchema = z.object({ path: photoPath, thumb_path: photoPath, og_path: photoPath, alt: str(300).min(1), focal_x: z.number().min(0).max(100), focal_y: z.number().min(0).max(100) });

const pkgSchema = z.object({
  cover: coverSchema.nullable().optional(),
  id: z.string().uuid().optional(),
  kind: z.enum(["safari", "excursion", "park"]),
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Indirizzo: solo lettere minuscole, numeri e trattini").max(80),
  title: str(160).min(1, "Il titolo è obbligatorio"),
  duration: str(120),
  description: str(2000),
  itinerary: list(20, 1500),
  included: list(),
  excluded: list(),
  parks: list(),
  lodges: list(),
  image: z.enum(["safari", "coast", "wildlife", "creek"]),
  price: str(120).nullable(),
  visible: z.boolean(),
  sort: z.number().int().min(0).max(10000),
});

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pkgSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = { ...data, price: data.price || null, updated_at: new Date().toISOString() };
    const { data: saved, error } = data.id
      ? await (context.supabase as any).from("packages").update(row).eq("id", data.id).select("id").single()
      : await (context.supabase as any).from("packages").insert(row).select("id").single();
    if (error?.code === "23505") throw new Error("Esiste già un pacchetto con questo indirizzo");
    fail(error, "Salvataggio non riuscito");
    await log(context, data.id ? "package.update" : "package.create", { slug: data.slug });
    return { id: saved.id as string };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row } = await (context.supabase as any).from("packages").select("slug").eq("id", data.id).single();
    const { error } = await (context.supabase as any).from("packages").delete().eq("id", data.id);
    fail(error, "Eliminazione non riuscita");
    await log(context, "package.delete", { slug: row?.slug });
    return { ok: true };
  });

const reorderSchema = z.object({ table: z.enum(["packages", "gallery_photos"]), ids: z.array(z.string().uuid()).max(500) });
export const reorder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reorderSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // One RPC call: avoids the Worker subrequest limit with many photos.
    const { error } = await (context.supabase as any).rpc("reorder_items", { _table: data.table, _ids: data.ids });
    if (error) {
      console.error("reorder failed", error);
      throw new Error("Riordino non riuscito: " + (error.message ?? "errore sconosciuto"));
    }
    return { ok: true };
  });

export const registerPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        path: photoPath,
        thumb_path: photoPath,
        width: z.number().int().min(1).max(2560),
        height: z.number().int().min(1).max(2560),
        caption: str(300),
        alt: str(300),
        category: z.enum(["safari", "mare", "persone"]),
        sort: z.number().int().min(0).max(100000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await (context.supabase as any).from("gallery_photos").insert(data);
    fail(error, "Registrazione foto non riuscita");
    await log(context, "photo.upload", { path: data.path });
    return { ok: true };
  });

export const updatePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), caption: str(300).optional(), alt: str(300).optional(), category: z.enum(["safari", "mare", "persone"]).optional(), hidden: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = await (context.supabase as any).from("gallery_photos").update(rest).eq("id", id);
    fail(error, "Salvataggio non riuscito");
    return { ok: true };
  });

export const deletePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error: e1 } = await (context.supabase as any).from("gallery_photos").select("path, thumb_path").eq("id", data.id).single();
    fail(e1, "Foto non trovata");
    const { data: covers, error: coverError } = await (context.supabase as any).from("packages").select("cover");
    fail(coverError, "Impossibile verificare le copertine");
    const used = (covers ?? []).some((p: any) => p.cover && [p.cover.path, p.cover.thumb_path, p.cover.og_path].some((path: string) => path === row.path || path === row.thumb_path));
    if (used) throw new Error("Questa foto è usata come copertina: cambia prima la copertina del pacchetto.");
    const { error: storageError } = await (context.supabase as any).storage.from("gallery").remove([row.path, row.thumb_path]);
    fail(storageError, "Eliminazione file non riuscita");
    const { error } = await (context.supabase as any).from("gallery_photos").delete().eq("id", data.id);
    fail(error, "Eliminazione non riuscita");
    await log(context, "photo.delete", { path: row.path });
    return { ok: true };
  });

export const exportBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [c, p, g] = await Promise.all([
      (context.supabase as any).from("site_content").select("*"),
      (context.supabase as any).from("packages").select("*").order("sort"),
      (context.supabase as any).from("gallery_photos").select("*").order("sort"),
    ]);
    fail(c.error || p.error || g.error, "Backup non riuscito");
    await log(context, "backup.export");
    return JSON.stringify({ exported_at: new Date().toISOString(), site_content: c.data, packages: p.data, gallery_photos: g.data }, null, 2);
  });

export const listAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await (context.supabase as any).rpc("list_admins");
    fail(error, "Impossibile leggere gli amministratori");
    return ((data ?? []) as { id: string; email: string }[]).map((r) => ({ id: r.id, email: r.email ?? "(sconosciuto)", self: r.id === context.userId }));
  });

export const addAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().toLowerCase().email("Email non valida").max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: id, error } = await (context.supabase as any).rpc("grant_admin", { _email: data.email });
    fail(error, "Impossibile assegnare il ruolo");
    if (!id) throw new Error("Nessun account con questa email. Crealo prima in Cloud → Users (con password temporanea), poi riprova.");
    await log(context, "admin.add", { email: data.email });
    return { tempPassword: null as string | null };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.id === context.userId) throw new Error("Non puoi togliere l'accesso a te stesso");
    const { error } = await (context.supabase as any).rpc("revoke_admin", { _user_id: data.id });
    fail(error, "Rimozione non riuscita");
    await log(context, "admin.remove", { user_id: data.id });
    return { ok: true };
  });
