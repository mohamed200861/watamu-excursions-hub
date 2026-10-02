import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Field, btn, input, useStatus } from "@/components/admin/ui";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nuova password — ECO TOURS AND SAFARI'S" },
      { name: "description", content: "Imposta una nuova password per l'area riservata." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { run, busy, view } = useStatus();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => d.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      if (password.length < 8) throw new Error("La password deve avere almeno 8 caratteri.");
      if (password !== confirm) throw new Error("Le due password non coincidono.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error("Impossibile aggiornare la password: scegline una più sicura o richiedi un nuovo link.");
      setTimeout(() => navigate({ to: "/admin", replace: true }), 1200);
    }, "Password aggiornata");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <Card title="Scegli una nuova password">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Apri questa pagina dal link ricevuto via email.</p>
          ) : (
            <>
              <Field label="Nuova password">
                <input className={input} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Field label="Ripeti password">
                <input className={input} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </Field>
              {view}
              <button className={`${btn} w-full`} disabled={busy}>Salva password</button>
            </>
          )}
        </Card>
      </form>
    </div>
  );
}
