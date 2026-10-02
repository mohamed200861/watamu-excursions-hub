import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";
import { Card, Field, btn, btnGhost, input, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gestione sito — ECO TOURS AND SAFARI'S" },
      { name: "description", content: "Area riservata di gestione dei contenuti." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-lg p-6">
      <Card title="Qualcosa non ha funzionato">
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        <a className={btn} href="/admin">Ricarica</a>
      </Card>
    </div>
  ),
});

function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .rpc("has_role", { _user_id: session.user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data), () => setIsAdmin(false));
  }, [session]);

  if (session === undefined) return <Center>Caricamento…</Center>;
  if (!session) return <Login />;
  if (isAdmin === null) return <Center>Verifica account…</Center>;
  if (!isAdmin) return <NotAdmin onClaimed={() => setIsAdmin(true)} />;
  return <Shell email={session.user.email ?? ""} />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground">{children}</div>;
}

function Shell({ email }: { email: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  }
  const links = [
    { to: "/admin", label: "Testi" },
    { to: "/admin/pacchetti", label: "Pacchetti" },
    { to: "/admin/galleria", label: "Galleria" },
    { to: "/admin/impostazioni", label: "WhatsApp e backup" },
  ] as const;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <b className="font-display text-lg">Gestione sito</b>
          <div className="flex items-center gap-2">
            <a className="text-sm underline" href="/it" target="_blank" rel="noreferrer">Vedi sito</a>
            <button className={btnGhost} onClick={signOut}>Esci</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <p className="text-xs text-muted-foreground">Connesso come {email}</p>
        <Outlet />
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const { run, busy, view } = useStatus();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (forgot) {
      run(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw new Error("Invio non riuscito. Riprova tra poco.");
      }, "Se l'indirizzo è corretto, riceverai un'email con il link per scegliere una nuova password.");
    } else {
      run(async () => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error("Email o password non corretti.");
      }, "Accesso eseguito");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <Card title={forgot ? "Recupera password" : "Accesso gestione sito"}>
          <Field label="Email">
            <input className={input} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {!forgot && (
            <Field label="Password">
              <input className={input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
          )}
          {view}
          <button className={`${btn} w-full`} disabled={busy}>{forgot ? "Invia link" : "Entra"}</button>
          <button type="button" className="w-full text-sm underline" onClick={() => setForgot(!forgot)}>
            {forgot ? "Torna all'accesso" : "Password dimenticata?"}
          </button>
        </Card>
      </form>
    </div>
  );
}

function NotAdmin({ onClaimed }: { onClaimed: () => void }) {
  const claim = useServerFn(claimAdmin);
  const { run, busy, view, setStatus } = useStatus();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card title="Account non abilitato">
          <p className="text-sm text-muted-foreground">
            Questo account non ha accesso alla gestione. Se è il primo accesso al sito, puoi attivarlo come unico amministratore.
          </p>
          {view}
          <button
            className={`${btn} w-full`}
            disabled={busy}
            onClick={() =>
              run(async () => {
                const r = await claim();
                if (r.ok) onClaimed();
                else setTimeout(() => setStatus({ type: "err", text: "Esiste già un amministratore." }), 0);
              }, "")
            }
          >
            Attiva come amministratore
          </button>
          <button className={`${btnGhost} w-full`} onClick={() => supabase.auth.signOut()}>Esci</button>
        </Card>
      </div>
    </div>
  );
}
