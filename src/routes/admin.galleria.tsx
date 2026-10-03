import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deletePhoto, registerPhoto, reorder, updatePhoto } from "@/lib/admin.functions";
import { checkFile, prepareImage } from "@/lib/image-resize";
import { Card, Field, Text, btn, btnDanger, btnGhost, errorText, input, move, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/galleria")({ component: GalleryPage });

type Photo = { id: string; path: string; thumb_path: string; caption: string; alt: string; category: "safari" | "mare" | "persone"; sort: number };
const cats = [
  { v: "safari", l: "Safari" },
  { v: "mare", l: "Mare" },
  { v: "persone", l: "Persone" },
] as const;

function GalleryPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "photos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_photos").select("*").order("sort");
      if (error) throw new Error("Impossibile caricare le foto");
      return data as unknown as Photo[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "photos"] });
  const register = useServerFn(registerPhoto);
  const doReorder = useServerFn(reorder);
  const [category, setCategory] = useState<Photo["category"]>("safari");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const { run, busy, view } = useStatus();
  const photos = q.data ?? [];

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const errs: string[] = [];
    const valid = Array.from(files).filter((f) => {
      const e = checkFile(f);
      if (e) errs.push(e);
      return !e;
    });
    let sort = photos.length;
    let done = 0;
    let ok = 0;
    for (const f of valid) {
      setProgress(`Caricamento ${done + 1} di ${valid.length}…`);
      try {
        const { full, thumb } = await prepareImage(f);
        // Content-hashed names: a file never changes under the same name, so it can be cached forever.
        const hash = async (b: Blob) =>
          Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await b.arrayBuffer())).slice(0, 10), (x) => x.toString(16).padStart(2, "0")).join("");
        const folder = new Date().toISOString().slice(0, 7);
        const path = `${folder}/${await hash(full.blob)}.webp`;
        const thumbPath = `${folder}/${await hash(thumb.blob)}-640.webp`;
        const a = await supabase.storage.from("gallery").upload(path, full.blob, { contentType: "image/webp", upsert: true });
        if (a.error) throw new Error(`Caricamento di “${f.name}” non riuscito.`);
        const b = await supabase.storage.from("gallery").upload(thumbPath, thumb.blob, { contentType: "image/webp", upsert: true });
        if (b.error) throw new Error(`Caricamento di “${f.name}” non riuscito.`);
        const name = f.name.replace(/\.[^.]+$/, "").slice(0, 120);
        await register({ data: { path, thumb_path: thumbPath, width: full.width, height: full.height, caption: "", alt: name, category, sort: sort++ } });
        ok++;
      } catch (e) {
        errs.push(errorText(e));
      }
      done++;
    }
    setProgress(valid.length ? `${ok} foto caricate.` : "");
    setErrors(errs);
    refresh();
  }

  return (
    <div className="space-y-4">
      <Card title="Carica foto">
        <Field label="Categoria delle nuove foto">
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value as Photo["category"])}>
            {cats.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </Field>
        <Field label="Scegli una o più foto" hint="JPG, PNG o WebP fino a 15 MB. Vengono ridotte e ottimizzate automaticamente.">
          <input className={input} type="file" accept="image/*" multiple onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
        </Field>
        {progress && <p className="text-sm">{progress}</p>}
        {errors.length > 0 && (
          <ul className="space-y-1 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}
      </Card>
      {view}
      {q.isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {q.error && <p className="text-destructive">Impossibile caricare le foto. Ricarica la pagina.</p>}
      {photos.length === 0 && !q.isLoading && <p className="text-sm text-muted-foreground">Nessuna foto: il sito mostra le immagini predefinite.</p>}
      <ul className="space-y-3">
        {photos.map((p, i) => (
          <PhotoRow
            key={p.id}
            p={p}
            first={i === 0}
            last={i === photos.length - 1}
            busy={busy}
            onMove={(d) => run(async () => { await doReorder({ data: { table: "gallery_photos", ids: move(photos, i, d).map((x) => x.id) } }); await refresh(); }, "Ordine aggiornato")}
            onChanged={refresh}
          />
        ))}
      </ul>
    </div>
  );
}

function PhotoRow({ p, first, last, busy, onMove, onChanged }: { p: Photo; first: boolean; last: boolean; busy: boolean; onMove: (d: number) => void; onChanged: () => void }) {
  const [v, setV] = useState(p);
  const save = useServerFn(updatePhoto);
  const del = useServerFn(deletePhoto);
  const s = useStatus();
  return (
    <li className="space-y-3 rounded-lg border border-border bg-card p-3">
      <img src={`/api/public/img/${p.thumb_path}`} alt={p.alt} className="h-40 w-full rounded-md object-cover" loading="lazy" />
      <Text label="Didascalia" value={v.caption} onChange={(x) => setV({ ...v, caption: x })} />
      <Text label="Testo alternativo" hint="Descrivi la foto per chi non può vederla" value={v.alt} onChange={(x) => setV({ ...v, alt: x })} />
      <Field label="Categoria">
        <select className={input} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as Photo["category"] })}>
          {cats.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
      </Field>
      {s.view}
      <div className="flex flex-wrap gap-2">
        <button className={btn} disabled={s.busy} onClick={() => s.run(() => save({ data: { id: p.id, caption: v.caption, alt: v.alt, category: v.category } }))}>Salva</button>
        <button className={btnGhost} disabled={busy || first} aria-label="Sposta su" onClick={() => onMove(-1)}>↑</button>
        <button className={btnGhost} disabled={busy || last} aria-label="Sposta giù" onClick={() => onMove(1)}>↓</button>
        <button
          className={btnDanger}
          disabled={s.busy}
          onClick={() => {
            if (!confirm("Eliminare definitivamente questa foto?")) return;
            s.run(async () => { await del({ data: { id: p.id } }); onChanged(); }, "Eliminata");
          }}
        >
          Elimina
        </button>
      </div>
    </li>
  );
}
