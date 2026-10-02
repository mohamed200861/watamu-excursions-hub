import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const contentSchemas = {
  home: z.object({
    heroEyebrow: str(120),
    heroTitle: str(160).min(1),
    heroText: str(400),
    heroNote: str(120),
    introTitle: str(200),
    why: z.array(z.object({ title: str(80), text: str(400) })).length(3),
    featuredTitle: str(120),
    featuredIntro: str(300),
    seaEyebrow: str(80),
    seaTitle: str(120),
    seaText: str(400),
    footerText: str(300),
  }),
  about: page,
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

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any).rpc("claim_admin");
    fail(error, "Impossibile verificare l'account");
    if (data) await (context.supabase as any).from("audit_log").insert({ user_id: context.userId, action: "admin.claim", detail: {} });
    return { ok: !!data };
  });

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

const pkgSchema = z.object({
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
    for (const [i, id] of data.ids.entries()) {
      const { error } = await (context.supabase as any).from(data.table).update({ sort: i }).eq("id", id);
      fail(error, "Riordino non riuscito");
    }
    return { ok: true };
  });

const photoPath = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/);
export const registerPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        path: photoPath,
        thumb_path: photoPath,
        width: z.number().int().min(1).max(1600),
        height: z.number().int().min(1).max(1600),
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
    z.object({ id: z.string().uuid(), caption: str(300), alt: str(300), category: z.enum(["safari", "mare", "persone"]) }).parse(d),
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
    await (context.supabase as any).storage.from("gallery").remove([row.path, row.thumb_path]);
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
