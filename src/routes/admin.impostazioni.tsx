import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, saveContent } from "@/lib/admin.functions";
import { DEFAULT_EMAIL, DEFAULT_TRIPADVISOR, type Owner } from "@/lib/content-types";
import { Button, Area, Card, Text, btn, useStatus } from "@/components/admin/ui";

import { useStaffRole } from "@/lib/admin-role";

export const Route = createFileRoute("/admin/impostazioni")({ component: SettingsGate });

function SettingsGate() {
  return useStaffRole() === "proprietario" ? <SettingsPage /> : <Card title="Pagina riservata"><p className="text-sm text-muted-foreground">Questa pagina è riservata allo sviluppatore.</p></Card>;
}

const actions: Record<string, string> = {
  "admin.claim": "Attivato amministratore",
  "content.save": "Testi salvati",
  "package.create": "Pacchetto creato",
  "package.update": "Pacchetto modificato",
  "package.delete": "Pacchetto eliminato",
  "photo.upload": "Foto caricata",
  "photo.delete": "Foto eliminata",
  "backup.export": "Backup esportato",
  "login": "Accesso",
  "logout": "Uscita",
  "password.change": "Password cambiata",
  "role.grant": "Ruolo assegnato",
  "admin.remove": "Accesso rimosso",
  "photo.hide": "Foto nascosta",
  "photo.show": "Foto mostrata",
  "photo.repair": "Foto riparata",
};

function SettingsPage() {
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("key", "settings").maybeSingle();
      if (error) throw new Error("Impossibile caricare le impostazioni");
      return (data?.data ?? {}) as { whatsapp?: string; template?: string; email?: string; tripadvisor?: string; rating?: string };
    },
  });
  const logQ = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_log").select("id, action, detail, created_at").order("created_at", { ascending: false }).limit(50);
      if (error) throw new Error("Impossibile caricare il registro");
      return data;
    },
  });
  const [whatsapp, setWhatsapp] = useState("");
  const [template, setTemplate] = useState("");
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [tripadvisor, setTripadvisor] = useState(DEFAULT_TRIPADVISOR);
  const [rating, setRating] = useState("");
  useEffect(() => {
    if (settings.data) {
      setWhatsapp(settings.data.whatsapp ?? "");
      setTemplate(settings.data.template ?? "");
      setEmail(settings.data.email ?? DEFAULT_EMAIL);
      setTripadvisor(settings.data.tripadvisor ?? DEFAULT_TRIPADVISOR);
      setRating(settings.data.rating ?? "");
    }
  }, [settings.data]);
  const save = useServerFn(saveContent);
  const backup = useServerFn(exportBackup);
  const s1 = useStatus();
  const s2 = useStatus();
  const preview = template.replaceAll("{pacchetto}", "Tsavo Est").replaceAll("{persone}", "2").replaceAll("{date}", "10–12 marzo");

  return (
    <div className="space-y-4">
      <OwnerEditor />
      <Card title="WhatsApp, email e Tripadvisor">
        <Text label="Numero WhatsApp" hint="Solo cifre con prefisso internazionale, senza + (es. 254742161072)" value={whatsapp} onChange={setWhatsapp} />
        <Area
          label="Messaggio precompilato"
          hint="Segnaposto disponibili: {pacchetto}, {persone}, {date}. Sul sito {persone} e {date} restano da completare dal cliente."
          value={template}
          onChange={setTemplate}
        />
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Anteprima: {preview}</p>
        <Text label="Email di contatto" hint="Mostrata nel footer, in Contatti e nelle pagine legali" value={email} onChange={setEmail} />
        <Text label="Link Tripadvisor" hint="Indirizzo completo della tua pagina Tripadvisor" value={tripadvisor} onChange={setTripadvisor} />
        <Text label="Testo valutazione (facoltativo)" hint="Es. la tua valutazione su Tripadvisor. Se vuoto non viene mostrato" value={rating} onChange={setRating} />
        {s1.view}
        <button className={btn} disabled={s1.busy} onClick={() => s1.run(() => save({ data: { key: "settings", data: { whatsapp: whatsapp.replace(/\D/g, ""), template, email: email.trim(), tripadvisor: tripadvisor.trim(), rating: rating.trim() } } }))}>
          Salva contatti
        </button>
      </Card>
      <Card title="Backup">
        <p className="text-sm text-muted-foreground">Scarica un file con tutti i testi, i pacchetti e l'elenco delle foto.</p>
        {s2.view}
        <button
          className={btn}
          disabled={s2.busy}
          onClick={() =>
            s2.run(async () => {
              const json = await backup();
              const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = `backup-eco-tours-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              logQ.refetch();
            }, "Backup scaricato")
          }
        >
          Esporta backup
        </button>
      </Card>
      <Card title="Registro attività">
        {logQ.error && <p className="text-sm text-destructive">Impossibile caricare il registro.</p>}
        <ul className="divide-y divide-border text-sm">
          {(logQ.data ?? []).map((r) => (
            <li key={r.id} className="py-2">
              <b>{actions[r.action] ?? r.action}</b>
              {(r.detail as any)?.slug || (r.detail as any)?.key ? ` · ${(r.detail as any).slug ?? (r.detail as any).key}` : ""}
              <span className="block text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("it-IT")}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function OwnerEditor() {
  const empty: Owner = { name: "", address: "", email: "", phone: "", license: "", retention: "", transfers: "", law: "" };
  const [owner, setOwner] = useState<Owner>(empty);
  const q = useQuery({ queryKey: ["admin", "owner"], queryFn: async () => { const { data, error } = await supabase.from("site_content").select("data").eq("key", "owner").maybeSingle(); if (error) throw new Error("Dati non disponibili"); return data?.data as Partial<Owner> | undefined; } });
  useEffect(() => { if (q.data) setOwner({ ...empty, ...q.data }); }, [q.data]);
  const save = useServerFn(saveContent), s = useStatus();
  const labels: Partial<Record<keyof Owner, string>> = { name: "Nome o ragione sociale", address: "Indirizzo (facoltativo)", phone: "Telefono pubblico", retention: "Privacy – per quanto tempo conservi log, messaggi e preventivi", transfers: "Privacy – fornitori e Paesi dove sono trattati i dati", law: "Termini – legge applicabile e foro (bozza: da verificare)" };
  return <Card title="Titolare e pagine legali"><p className="text-sm text-muted-foreground">Le pagine legali entrano su Google quando sono compilati nome, email o telefono, conservazione, fornitori/Paesi e legge applicabile.</p>{q.error && <p role="alert" className="text-destructive">Impossibile caricare i dati.</p>}{(Object.keys(labels) as (keyof Owner)[]).map(k => <Text key={k} label={labels[k] ?? k} hint="Se vuoto, non viene mostrato ai visitatori" value={owner[k]} onChange={v => setOwner({ ...owner, [k]: v })} />)}{s.view}<Button className={btn} disabled={s.busy || q.isLoading || !!q.error} onClick={() => s.run(() => save({ data: { key: "owner", data: owner } }))}>Salva dati titolare</Button></Card>;
}
