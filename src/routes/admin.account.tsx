import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addAdmin, listAdmins, removeAdmin } from "@/lib/admin.functions";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { useStaffRole } from "@/lib/admin-role";
import { Card, Field, btn, btnDanger, btnGhost, errorText, input, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/account")({ component: AccountPage });

function AccountPage() {
  const role = useStaffRole();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.rpc("log_event", { _action: "logout" }).then(() => undefined, () => undefined);
    await supabase.auth.signOut();
  }
  return (
    <div className="space-y-4">
      <Card title="Cambia password">
        <PasswordForm />
      </Card>
      <EmailForm />
      {role === "proprietario" && <Admins />}
      <Card title="Esci">
        <p className="text-sm text-muted-foreground">Chiudi la sessione su questo telefono o computer.</p>
        <button className={`${btnGhost} w-full`} onClick={signOut}>Esci dall'account</button>
      </Card>
    </div>
  );
}

function EmailForm() {
  const [email, setEmail] = useState("");
  const { run, busy, view } = useStatus();
  function submit(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      const { error } = await supabase.auth.updateUser({ email: email.trim() }, { emailRedirectTo: `${window.location.origin}/admin` });
      if (error) throw new Error("Impossibile cambiare l'email: controlla l'indirizzo o riprova più tardi.");
      setEmail("");
    }, "Ti abbiamo inviato un'email di conferma: il cambio diventa effettivo dopo aver aperto il link.");
  }
  return (
    <Card title="Cambia email">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nuova email">
          <input className={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {view}
        <button className={`${btn} w-full`} disabled={busy}>Cambia email</button>
      </form>
    </Card>
  );
}

function Admins() {
  const qc = useQueryClient();
  const list = useServerFn(listAdmins);
  const add = useServerFn(addAdmin);
  const remove = useServerFn(removeAdmin);
  const q = useQuery({ queryKey: ["admin", "admins"], queryFn: () => list() });
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"titolare" | "admin">("titolare");
  const [temp, setTemp] = useState<{ email: string; password: string } | null>(null);
  const { run, busy, view } = useStatus();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "admins"] });

  function submit(e: FormEvent) {
    e.preventDefault();
    const target = email.trim();
    run(async () => {
      const r = await add({ data: { email: target, role: newRole } });
      setTemp(r.tempPassword ? { email: target, password: r.tempPassword } : null);
      setEmail("");
      refresh();
    }, "Ruolo assegnato");
  }

  return (
    <Card title="Utenti e ruoli">
      {q.isError && <p className="text-sm text-destructive">{errorText(q.error)}</p>}
      <ul className="space-y-2">
        {(q.data ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-3 text-sm">
            <span className="break-all">{a.email}{a.self ? " (tu)" : ""} · {a.role === "proprietario" ? "Proprietario" : "Titolare"}</span>
            {!a.self && (
              <button
                className={btnDanger}
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Togliere l'accesso a ${a.email}?`)) return;
                  run(async () => {
                    await remove({ data: { id: a.id } });
                    refresh();
                  }, "Accesso rimosso");
                }}
              >
                Rimuovi
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Assegna ruolo (email)" hint="L'account deve già esistere (creato dal backend con password temporanea): al primo accesso dovrà cambiarla.">
          <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Ruolo">
          <select className={input} value={newRole} onChange={(e) => setNewRole(e.target.value as "titolare" | "admin")}>
            <option value="titolare">Titolare (testi, pacchetti, galleria)</option>
            <option value="admin">Proprietario (accesso completo)</option>
          </select>
        </Field>
        {view}
        <button className={`${btn} w-full`} disabled={busy}>Assegna ruolo</button>
      </form>
      {temp && (
        <div className="space-y-1 rounded-md border border-border bg-background p-3 text-sm" role="status">
          <p>Comunica a <b>{temp.email}</b> questa password temporanea (viene mostrata una sola volta):</p>
          <p className="select-all break-all font-mono text-base">{temp.password}</p>
          <p className="text-muted-foreground">Al primo accesso su /admin gli verrà chiesto di sceglierne una nuova.</p>
        </div>
      )}
    </Card>
  );
}
