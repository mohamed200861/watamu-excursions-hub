import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveContent } from "@/lib/admin.functions";
import { CoverEditor } from "@/components/admin/CoverEditor";
import { Area, Card, Lines, Text, btn, btnDanger, btnGhost, move, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({ component: TextsPage });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

function useSiteContent() {
  return useQuery({
    queryKey: ["admin", "site_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("key, data");
      if (error) throw new Error("Impossibile caricare i testi");
      return Object.fromEntries(data.map((r) => [r.key, r.data as Any])) as Record<string, Any>;
    },
  });
}

function TextsPage() {
  const q = useSiteContent();
  if (q.isLoading) return <p className="text-muted-foreground">Caricamento…</p>;
  if (q.error || !q.data) return <p className="text-destructive">Impossibile caricare i testi. Ricarica la pagina.</p>;
  const c = q.data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Il sito si aggiorna in circa un minuto. I testi inglesi restano fissi: per cambiarli chiedi allo sviluppatore.</p>
      <Block keyName="home" title="Home" initial={c["home"] ?? {}} render={(v, set) => <HomeForm v={v} set={set} />} />
      <Block
        keyName="headers"
        title="Foto in alto delle pagine"
        initial={c["headers"] ?? {}}
        render={(v, set) => (
          <>
            <p className="text-sm text-muted-foreground">Se non scegli una foto resta quella attuale. Dopo “Prepara copertina” premi “Salva foto in alto delle pagine”.</p>
            {([["safari", "Pagina Safari"], ["excursions", "Pagina Escursioni"], ["parks", "Pagina Parchi"], ["about", "Pagina Chi siamo"], ["gallery", "Pagina Galleria"], ["contact", "Pagina Contatti"]] as const).map(([k, label]) => (
              <div key={k} className="space-y-2 rounded-md border border-border p-3">
                <h3 className="text-lg">{label}</h3>
                <CoverEditor cover={v[k] ?? null} onChange={(x) => set({ ...v, [k]: x })} />
              </div>
            ))}
          </>
        )}
      />
      <Block keyName="about" title="Chi siamo" initial={c["about"] ?? { title: "", subtitle: "", text: "" }} render={(v, set) => <AboutForm v={v} set={set} />} />
      {(["contact", "gallery"] as const).map((k) => (
        <Block
          key={k}
          keyName={k}
          title={{ about: "Chi siamo", contact: "Contatti", gallery: "Galleria (testi)" }[k]}
          initial={c[k] ?? { title: "", subtitle: "", text: "" }}
          render={(v, set) => (
            <>
              <Text label="Titolo" value={v.title ?? ""} onChange={(x) => set({ ...v, title: x })} />
              <Text label="Sottotitolo" value={v.subtitle ?? ""} onChange={(x) => set({ ...v, subtitle: x })} />
              <Area label="Testo" rows={5} value={v.text ?? ""} onChange={(x) => set({ ...v, text: x })} />
            </>
          )}
        />
      ))}
      <Block keyName="faq" title="Domande frequenti" initial={c["faq"] ?? { items: [] }} render={(v, set) => <FaqForm v={v} set={set} />} />
      <Block
        keyName="info"
        title="Cosa portare (safari)"
        initial={c["info"] ?? { bring: [] }}
        render={(v, set) => <Lines label="Elenco" value={v.bring ?? []} onChange={(x) => set({ ...v, bring: x })} rows={6} />}
      />
    </div>
  );
}

function Block({ keyName, title, initial, render }: { keyName: string; title: string; initial: Any; render: (v: Any, set: (v: Any) => void) => React.ReactNode }) {
  const [v, setV] = useState<Any>(initial);
  useEffect(() => setV(initial), [initial]);
  const save = useServerFn(saveContent);
  const { run, busy, view } = useStatus();
  return (
    <Card title={title}>
      {render(v, setV)}
      {view}
      <button className={btn} disabled={busy} onClick={() => run(() => save({ data: { key: keyName as any, data: clean(v) } }))}>
        Salva {title.toLowerCase()}
      </button>
    </Card>
  );
}

function clean(v: Any): Any {
  // drop empty trailing lines from list fields before sending
  return JSON.parse(JSON.stringify(v, (_k, x) => (Array.isArray(x) ? x.filter((s) => !(typeof s === "string" && s.trim() === "")) : x)));
}

function HomeForm({ v, set }: { v: Any; set: (v: Any) => void }) {
  const f = (k: string) => ({ value: v[k] ?? "", onChange: (x: string) => set({ ...v, [k]: x }) });
  const why: Any[] = [...(v.why ?? []), {}, {}, {}, {}, {}, {}].slice(0, 6);
  return (
    <>
      <div className="space-y-2 rounded-md border border-border p-3">
        <h3 className="text-lg">Foto grande in alto (home)</h3>
        <p className="text-sm text-muted-foreground">Se non scegli una foto resta quella attuale. Dopo “Prepara copertina” premi “Salva home”.</p>
        <CoverEditor cover={v.heroImage ?? null} onChange={(x) => set({ ...v, heroImage: x })} />
      </div>
      <Text label="Riga sopra il titolo" {...f("heroEyebrow")} />
      <Text label="Titolo principale" {...f("heroTitle")} />
      <Area label="Testo sotto il titolo" {...f("heroText")} />
      <Text label="Etichetta in basso nella foto" {...f("heroNote")} />
      <Text label="Titolo sezione “Perché scegliere noi”" {...f("introTitle")} />
      {why.map((w, i) => (
        <div key={i} className="space-y-2 rounded-md border border-border p-3">
          <Text label={`Punto ${i + 1} – titolo`} value={w.title ?? ""} onChange={(x) => set({ ...v, why: why.map((o, j) => (j === i ? { ...o, title: x } : o)) })} />
          <Area label={`Punto ${i + 1} – testo`} value={w.text ?? ""} onChange={(x) => set({ ...v, why: why.map((o, j) => (j === i ? { ...o, text: x } : o)) })} />
        </div>
      ))}
      <Text label="Titolo safari in evidenza" {...f("featuredTitle")} />
      <Area label="Testo safari in evidenza" {...f("featuredIntro")} />
      <div className="space-y-2 rounded-md border border-border p-3">
        <h3 className="text-lg">Foto della sezione “Mare e terra”</h3>
        <CoverEditor cover={v.seaImage ?? null} onChange={(x) => set({ ...v, seaImage: x })} />
      </div>
      <Text label="Sezione mare – riga sopra" {...f("seaEyebrow")} />
      <Text label="Sezione mare – titolo" {...f("seaTitle")} />
      <Area label="Sezione mare – testo" {...f("seaText")} />
      <Area label="Testo nel piè di pagina" {...f("footerText")} />
    </>
  );
}

function FaqForm({ v, set }: { v: Any; set: (v: Any) => void }) {
  const items: { q: string; a: string }[] = v.items ?? [];
  const upd = (next: typeof items) => set({ ...v, items: next });
  return (
    <>
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-md border border-border p-3">
          <Text label={`Domanda ${i + 1}`} value={it.q} onChange={(x) => upd(items.map((o, j) => (j === i ? { ...o, q: x } : o)))} />
          <Area label="Risposta" value={it.a} onChange={(x) => upd(items.map((o, j) => (j === i ? { ...o, a: x } : o)))} />
          <div className="flex flex-wrap gap-2">
            <button className={btnGhost} disabled={i === 0} onClick={() => upd(move(items, i, -1))}>Su</button>
            <button className={btnGhost} disabled={i === items.length - 1} onClick={() => upd(move(items, i, 1))}>Giù</button>
            <button className={btnDanger} onClick={() => upd(items.filter((_, j) => j !== i))}>Rimuovi</button>
          </div>
        </div>
      ))}
      <button className={btnGhost} onClick={() => upd([...items, { q: "", a: "" }])}>+ Aggiungi domanda</button>
    </>
  );
}


function AboutForm({ v, set }: { v: Any; set: (v: Any) => void }) {
  const f = (k: string) => ({ value: v[k] ?? "", onChange: (x: string) => set({ ...v, [k]: x }) });
  const photos: Any[] = v.photos ?? [];
  const lic = { text: "", number: "", expires: "", ...(v.license ?? {}) };
  const setLic = (k: string, x: string) => set({ ...v, license: { ...lic, [k]: x } });
  return (
    <>
      <Text label="Titolo" {...f("title")} />
      <Text label="Sottotitolo" {...f("subtitle")} />
      <Area label="Testo introduttivo" rows={4} {...f("text")} />
      <Text label="Titolo sezione “Chi sono”" {...f("meTitle")} />
      <Area label="Testo “Chi sono” (riga vuota = nuovo paragrafo)" rows={10} {...f("me")} />
      <div className="space-y-3 rounded-md border border-border p-3">
        <h3 className="text-lg">Foto (da 1 a 3)</h3>
        {photos.map((ph, i) => (
          <div key={ph.path + i} className="space-y-2">
            <p className="text-sm text-muted-foreground">Foto {i + 1}{i === 0 ? " (grande, in evidenza)" : ""}</p>
            <CoverEditor cover={ph} onChange={(x) => set({ ...v, photos: x ? photos.map((o, j) => (j === i ? x : o)) : photos.filter((_, j) => j !== i) })} />
            <div className="flex flex-wrap gap-2">
              <button className={btnGhost} disabled={i === 0} onClick={() => set({ ...v, photos: move(photos, i, -1) })}>Su</button>
              <button className={btnGhost} disabled={i === photos.length - 1} onClick={() => set({ ...v, photos: move(photos, i, 1) })}>Giù</button>
            </div>
          </div>
        ))}
        {photos.length < 3 && <NewAboutPhoto onAdd={(x) => set({ ...v, photos: [...photos, x] })} />}
        <p className="text-sm text-muted-foreground">Dopo “Prepara copertina” premi “Salva chi siamo”.</p>
      </div>
      <div className="space-y-2 rounded-md border border-border p-3">
        <h3 className="text-lg">Licenza guida (facoltativa)</h3>
        <p className="text-sm text-muted-foreground">Il riquadro compare in Chi siamo solo se il testo è compilato e la scadenza non è passata. Esempio: Guida con licenza TRA (Tourism Regulatory Authority, Kenya), classe E</p>
        <Text label="Testo" value={lic.text} onChange={(x) => setLic("text", x)} />
        <Text label="Numero (mostrato solo se compilato)" value={lic.number} onChange={(x) => setLic("number", x)} />
        <label className="block space-y-1 text-sm"><span>Scadenza</span><input type="date" className="w-full rounded-md border border-border bg-background px-3 py-2" value={lic.expires} onChange={(e) => setLic("expires", e.target.value)} /></label>
      </div>
    </>
  );
}
function NewAboutPhoto({ onAdd }: { onAdd: (c: Any) => void }) {
  const [k, setK] = useState(0);
  return <CoverEditor key={k} cover={null} onChange={(x) => { if (x) { onAdd(x); setK(k + 1); } }} />;
}
