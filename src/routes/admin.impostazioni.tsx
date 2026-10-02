import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { exportBackup, saveContent } from "@/lib/admin.functions";
import { Area, Card, Text, btn, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/impostazioni")({ component: SettingsPage });

const actions: Record<string, string> = {
  "admin.claim": "Attivato amministratore",
  "content.save": "Testi salvati",
  "package.create": "Pacchetto creato",
  "package.update": "Pacchetto modificato",
  "package.delete": "Pacchetto eliminato",
  "photo.upload": "Foto caricata",
  "photo.delete": "Foto eliminata",
  "backup.export": "Backup esportato",
};

function SettingsPage() {
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("key", "settings").maybeSingle();
      if (error) throw new Error("Impossibile caricare le impostazioni");
      return (data?.data ?? {}) as { whatsapp?: string; template?: string };
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
  useEffect(() => {
    if (settings.data) {
      setWhatsapp(settings.data.whatsapp ?? "");
      setTemplate(settings.data.template ?? "");
    }
  }, [settings.data]);
  const save = useServerFn(saveContent);
  const backup = useServerFn(exportBackup);
  const s1 = useStatus();
  const s2 = useStatus();
  const preview = template.replaceAll("{pacchetto}", "Tsavo Est").replaceAll("{persone}", "2").replaceAll("{date}", "10–12 marzo");

  return (
    <div className="space-y-4">
      <Card title="WhatsApp">
        <Text label="Numero WhatsApp" hint="Solo cifre con prefisso internazionale, senza + (es. 254742161072)" value={whatsapp} onChange={setWhatsapp} />
        <Area
          label="Messaggio precompilato"
          hint="Segnaposto disponibili: {pacchetto}, {persone}, {date}. Sul sito {persone} e {date} restano da completare dal cliente."
          value={template}
          onChange={setTemplate}
        />
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">Anteprima: {preview}</p>
        {s1.view}
        <button className={btn} disabled={s1.busy} onClick={() => s1.run(() => save({ data: { key: "settings", data: { whatsapp: whatsapp.replace(/\D/g, ""), template } } }))}>
          Salva WhatsApp
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
