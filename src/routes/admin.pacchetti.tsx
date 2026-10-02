import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deletePackage, reorder, savePackage } from "@/lib/admin.functions";
import { Area, Card, Field, Lines, Text, btn, btnDanger, btnGhost, input, move, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/pacchetti")({ component: PackagesPage });

type Kind = "safari" | "excursion" | "park";
type Pkg = {
  id?: string;
  kind: Kind;
  slug: string;
  title: string;
  duration: string;
  description: string;
  itinerary: string[];
  included: string[];
  excluded: string[];
  parks: string[];
  lodges: string[];
  image: "safari" | "coast" | "wildlife" | "creek";
  price: string | null;
  visible: boolean;
  sort: number;
};
const kinds: { k: Kind; label: string }[] = [
  { k: "safari", label: "Safari" },
  { k: "excursion", label: "Escursioni" },
  { k: "park", label: "Parchi" },
];

function PackagesPage() {
  const [kind, setKind] = useState<Kind>("safari");
  const [editing, setEditing] = useState<Pkg | null>(null);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("sort");
      if (error) throw new Error("Impossibile caricare i pacchetti");
      return data as unknown as Pkg[];
    },
  });
  const doReorder = useServerFn(reorder);
  const { run, busy, view } = useStatus();
  const list = (q.data ?? []).filter((p) => p.kind === kind);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "packages"] });

  if (editing) return <Editor pkg={editing} onClose={() => { setEditing(null); refresh(); }} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto">
        {kinds.map((k) => (
          <button key={k.k} className={k.k === kind ? btn : btnGhost} onClick={() => setKind(k.k)}>{k.label}</button>
        ))}
      </div>
      {q.isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {q.error && <p className="text-destructive">Impossibile caricare i pacchetti. Ricarica la pagina.</p>}
      {view}
      <ul className="space-y-2">
        {list.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.duration} · {p.price || "Chiedi su WhatsApp"} · {p.visible ? "Visibile" : "Nascosto"}
              </p>
            </div>
            <button className={btnGhost} disabled={busy || i === 0} aria-label="Sposta su" onClick={() => run(async () => { await doReorder({ data: { table: "packages", ids: move(list, i, -1).map((x) => x.id!) } }); await refresh(); }, "Ordine aggiornato")}>↑</button>
            <button className={btnGhost} disabled={busy || i === list.length - 1} aria-label="Sposta giù" onClick={() => run(async () => { await doReorder({ data: { table: "packages", ids: move(list, i, 1).map((x) => x.id!) } }); await refresh(); }, "Ordine aggiornato")}>↓</button>
            <button className={btn} onClick={() => setEditing(p)}>Modifica</button>
          </li>
        ))}
      </ul>
      <button
        className={btnGhost}
        onClick={() =>
          setEditing({ kind, slug: "", title: "", duration: "", description: "", itinerary: [], included: [], excluded: [], parks: [], lodges: [], image: kind === "excursion" ? "coast" : "safari", price: null, visible: false, sort: list.length })
        }
      >
        + Nuovo
      </button>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function Editor({ pkg, onClose }: { pkg: Pkg; onClose: () => void }) {
  const [v, setV] = useState<Pkg>(pkg);
  const [askPrice, setAskPrice] = useState(!pkg.price);
  const save = useServerFn(savePackage);
  const del = useServerFn(deletePackage);
  const { run, busy, view } = useStatus();
  const set = <K extends keyof Pkg>(k: K, x: Pkg[K]) => setV({ ...v, [k]: x });
  const nonEmpty = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

  return (
    <Card title={pkg.id ? `Modifica: ${pkg.title}` : "Nuovo pacchetto"}>
      <Text label="Titolo" value={v.title} onChange={(x) => setV({ ...v, title: x, slug: pkg.id ? v.slug : slugify(x) })} />
      <Text label="Indirizzo della pagina" hint="Solo lettere minuscole, numeri e trattini. Cambiarlo modifica il link della pagina." value={v.slug} onChange={(x) => set("slug", x)} />
      <Text label={v.kind === "park" ? "Sottotitolo" : "Durata"} value={v.duration} onChange={(x) => set("duration", x)} />
      <Area label="Descrizione" rows={4} value={v.description} onChange={(x) => set("description", x)} />
      {v.kind !== "park" && (
        <>
          <Lines label="Itinerario" hint="Un giorno per riga" rows={6} value={v.itinerary} onChange={(x) => set("itinerary", x)} />
          <Lines label="Incluso" value={v.included} onChange={(x) => set("included", x)} />
          <Lines label="Non incluso" value={v.excluded} onChange={(x) => set("excluded", x)} />
        </>
      )}
      {v.kind === "safari" && (
        <>
          <Lines label="Parchi" value={v.parks} onChange={(x) => set("parks", x)} />
          <Lines label="Lodge e camp" value={v.lodges} onChange={(x) => set("lodges", x)} />
        </>
      )}
      <Field label="Foto">
        <select className={input} value={v.image} onChange={(e) => set("image", e.target.value as Pkg["image"])}>
          <option value="safari">Savana al tramonto</option>
          <option value="wildlife">Elefanti</option>
          <option value="coast">Costa di Watamu</option>
          <option value="creek">Mida Creek</option>
        </select>
      </Field>
      {v.kind !== "park" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={askPrice} onChange={(e) => setAskPrice(e.target.checked)} /> Prezzo: “Chiedi su WhatsApp”
          </label>
          {!askPrice && <Text label="Prezzo" hint="Es. € 450 a persona" value={v.price ?? ""} onChange={(x) => set("price", x)} />}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.visible} onChange={(e) => set("visible", e.target.checked)} /> Visibile sul sito
      </label>
      {view}
      <div className="flex flex-wrap gap-2">
        <button
          className={btn}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const r = await save({
                data: {
                  ...v,
                  itinerary: nonEmpty(v.itinerary),
                  included: nonEmpty(v.included),
                  excluded: nonEmpty(v.excluded),
                  parks: nonEmpty(v.parks),
                  lodges: nonEmpty(v.lodges),
                  price: askPrice ? null : v.price?.trim() || null,
                },
              });
              setV({ ...v, id: r.id });
            })
          }
        >
          Salva
        </button>
        <button className={btnGhost} onClick={onClose}>Torna all'elenco</button>
        {v.id && (
          <button
            className={btnDanger}
            disabled={busy}
            onClick={() => {
              if (!confirm(`Eliminare definitivamente “${v.title}”?`)) return;
              run(async () => { await del({ data: { id: v.id! } }); onClose(); }, "Eliminato");
            }}
          >
            Elimina
          </button>
        )}
      </div>
    </Card>
  );
}
