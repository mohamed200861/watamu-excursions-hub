import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deletePhoto, registerPhoto, reorder, updatePhoto } from "@/lib/admin.functions";
import { checkFile, prepareImage } from "@/lib/image-resize";
import { photoProblems, repairable, filenameAlt, type StoredFile } from "@/lib/photo-check";
import { Card, Field, Text, btn, btnDanger, btnGhost, errorText, input, move, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/galleria")({ component: GalleryPage });

type Photo = { id: string; path: string; thumb_path: string; caption: string; alt: string; category: "safari" | "mare" | "persone"; sort: number; hidden: boolean; width: number; height: number };
const cats = [
  { v: "safari", l: "Safari" },
  { v: "mare", l: "Mare" },
  { v: "persone", l: "Persone" },
] as const;
const catAlt = { safari: "Safari in jeep nei parchi del Kenya", mare: "Il mare e la costa di Watamu", persone: "Viaggiatori con Africano durante un safari in Kenya" } as const;
const hash = async (b: Blob) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await b.arrayBuffer())).slice(0, 10), (x) => x.toString(16).padStart(2, "0")).join("");

/** Lists the stored files of every folder used by the photos (one request per folder). */
async function storedFiles(photos: Photo[]) {
  const folders = [...new Set(photos.flatMap((p) => [p.path, p.thumb_path]).filter(Boolean).map((x) => x.split("/")[0] as string))];
  const files = new Map<string, StoredFile>();
  for (const f of folders) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.storage.from("gallery").list(f, { limit: 1000, offset });
      if (error) throw new Error("Impossibile leggere l'archivio foto");
      for (const o of data ?? []) files.set(`${f}/${o.name}`, { size: Number(o.metadata?.["size"] ?? 0), mimetype: String(o.metadata?.["mimetype"] ?? "") });
      if (!data || data.length < 1000) break;
    }
  }
  return files;
}

function GalleryPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "photos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_photos").select("*").order("sort");
      if (error) throw new Error("Impossibile caricare le foto");
      const photos = data as unknown as Photo[];
      // Private previews: hidden photos are not served publicly, so the admin uses short-lived signed links.
      const paths = [...new Set(photos.map((p) => p.thumb_path || p.path).filter(Boolean))];
      const urls = new Map<string, string>();
      for (let i = 0; i < paths.length; i += 500) {
        const { data: signed } = await supabase.storage.from("gallery").createSignedUrls(paths.slice(i, i + 500), 3600);
        for (const s of signed ?? []) if (s.signedUrl && s.path) urls.set(s.path, s.signedUrl);
      }
      return { photos, urls };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "photos"] });
  const register = useServerFn(registerPhoto);
  const doReorder = useServerFn(reorder);
  const save = useServerFn(updatePhoto);
  const [category, setCategory] = useState<Photo["category"]>("safari");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [problems, setProblems] = useState<{ id: string; label: string; reasons: string[]; result: string }[] | null>(null);
  const { run, busy, view } = useStatus();
  const check = useStatus();
  const photos = q.data?.photos ?? [];
  const urls = q.data?.urls ?? new Map<string, string>();
  const visibleCount = photos.filter((p) => !p.hidden).length;

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
        const folder = new Date().toISOString().slice(0, 7);
        const path = `${folder}/${await hash(full.blob)}.webp`;
        const thumbPath = `${folder}/${await hash(thumb.blob)}-640.webp`;
        const a = await supabase.storage.from("gallery").upload(path, full.blob, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
        if (a.error) throw new Error(`Caricamento di “${f.name}” non riuscito.`);
        const b = await supabase.storage.from("gallery").upload(thumbPath, thumb.blob, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
        if (b.error) throw new Error(`Caricamento di “${f.name}” non riuscito.`);
        const name = f.name.replace(/\.[^.]+$/, "").slice(0, 120);
        await register({ data: { path, thumb_path: thumbPath, width: full.width, height: full.height, caption: "", alt: filenameAlt(name) ? catAlt[category] : name, category, sort: sort++ } });
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

  /** Finds broken photos, repairs what it can (thumbnail, size, alt text) and hides the rest. */
  async function checkAndRepair() {
    const files = await storedFiles(photos);
    const report: NonNullable<typeof problems> = [];
    for (const [i, p] of photos.entries()) {
      const full = files.get(p.path), thumb = p.thumb_path ? files.get(p.thumb_path) : undefined;
      const reasons = photoProblems(p, full, thumb);
      if (!reasons.length) continue;
      const label = `N° ${i + 1}${p.caption ? ` · ${p.caption}` : ""}`;
      try {
        if (!repairable(full)) {
          if (!p.hidden) await save({ data: { id: p.id, hidden: true } });
          report.push({ id: p.id, label, reasons, result: "Non riparabile: impostata come Nascosta" });
          continue;
        }
        const patch: { id: string; thumb_path?: string; width?: number; height?: number; alt?: string } = { id: p.id };
        if (reasons.some((r) => r.startsWith("Miniatura") || r.startsWith("Dimensioni"))) {
          const { data: blob, error } = await supabase.storage.from("gallery").download(p.path);
          if (error || !blob) throw new Error("download");
          const img = await prepareImage(new File([blob], "foto.webp", { type: "image/webp" }));
          const folder = p.path.split("/")[0];
          const thumbPath = `${folder}/${await hash(img.thumb.blob)}-640.webp`;
          const up = await supabase.storage.from("gallery").upload(thumbPath, img.thumb.blob, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
          if (up.error) throw new Error("upload");
          Object.assign(patch, { thumb_path: thumbPath, width: img.full.width, height: img.full.height });
        }
        if (reasons.some((r) => r.startsWith("Testo alternativo"))) patch.alt = catAlt[p.category] ?? catAlt.safari;
        await save({ data: patch });
        report.push({ id: p.id, label, reasons, result: "Riparata" });
      } catch {
        if (!p.hidden) await save({ data: { id: p.id, hidden: true } }).catch(() => undefined);
        report.push({ id: p.id, label, reasons, result: "Riparazione non riuscita: impostata come Nascosta" });
      }
    }
    setProblems(report);
    await refresh();
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
      <Card title="Foto con problemi">
        <p className="text-sm text-muted-foreground">Controlla file mancanti, formati non validi, miniature e testi alternativi. Ripara ciò che si può; le foto non riparabili diventano “Nascoste” (non vengono cancellate).</p>
        {check.view}
        <button className={btn} disabled={check.busy || !photos.length} onClick={() => check.run(checkAndRepair, "Controllo completato")}>{check.busy ? "Controllo in corso…" : "Controlla e ripara le foto"}</button>
        {problems && (problems.length === 0 ? <p className="text-sm">Nessun problema trovato.</p> : (
          <ul className="space-y-2 text-sm">
            {problems.map((p) => <li key={p.id} className="rounded-md border border-border p-2"><b>{p.label}</b>: {p.reasons.join(", ")}. <span className={p.result === "Riparata" ? "" : "text-destructive"}>{p.result}</span></li>)}
          </ul>
        ))}
      </Card>
      {view}
      {q.isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {q.error && <p className="text-destructive">Impossibile caricare le foto. Ricarica la pagina.</p>}
      {photos.length > 0 && <p className="text-sm text-muted-foreground">{visibleCount} foto visibili sul sito, {photos.length - visibleCount} nascoste.</p>}
      {photos.length === 0 && !q.isLoading && <p className="text-sm text-muted-foreground">Nessuna foto: sul sito la galleria mostra un invito a scrivere su WhatsApp.</p>}
      <ul className="space-y-3">
        {photos.map((p, i) => (
          <PhotoRow
            key={p.id}
            p={p}
            preview={urls.get(p.thumb_path || p.path)}
            index={i}
            total={photos.length}
            first={i === 0}
            last={i === photos.length - 1}
            busy={busy}
            onMove={(d) => run(async () => { await doReorder({ data: { table: "gallery_photos", ids: move(photos, i, d).map((x) => x.id) } }); await refresh(); }, "Ordine aggiornato")}
            onSetPosition={(to) => run(async () => {
              const next = [...photos];
              [next[i], next[to]] = [next[to] as Photo, next[i] as Photo];
              await doReorder({ data: { table: "gallery_photos", ids: next.map((x) => x.id) } });
              await refresh();
            }, `Foto spostata al n° ${to + 1}`)}
            onChanged={refresh}
          />
        ))}
      </ul>
    </div>
  );
}

function PhotoRow({ p, preview, index, total, first, last, busy, onMove, onSetPosition, onChanged }: { p: Photo; preview: string | undefined; index: number; total: number; first: boolean; last: boolean; busy: boolean; onMove: (d: number) => void; onSetPosition: (to: number) => void; onChanged: () => void }) {
  const [v, setV] = useState(p);
  const save = useServerFn(updatePhoto);
  const del = useServerFn(deletePhoto);
  const s = useStatus();
  const toggle = () => s.run(async () => { await save({ data: { id: p.id, hidden: !p.hidden } }); onChanged(); }, p.hidden ? "Foto di nuovo visibile" : "Foto nascosta");
  return (
    <li className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Field label="Numero (posizione)" hint="Scegli un numero: la foto si scambia con quella che ha quel numero.">
          <select className={input} disabled={busy} value={index} onChange={(e) => { const to = Number(e.target.value); if (to !== index) onSetPosition(to); }}>
            {Array.from({ length: total }, (_, n) => <option key={n} value={n}>N° {n + 1}</option>)}
          </select>
        </Field>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" role="switch" className="h-5 w-5" checked={p.hidden} disabled={s.busy} onChange={toggle} aria-label="Nascosta" />
          Nascosta
        </label>
      </div>
      {p.hidden && <p className="text-sm font-semibold text-destructive">Nascosta: non compare sul sito né nella galleria</p>}
      {preview ? <img src={preview} alt={p.alt} className={`h-40 w-full rounded-md object-cover ${p.hidden ? "opacity-40" : ""}`} loading="lazy" /> : <div className="flex h-40 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">Anteprima non disponibile</div>}
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
        <button className={btnGhost} disabled={s.busy} onClick={toggle}>{p.hidden ? "Mostra" : "Nascondi"}</button>
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
