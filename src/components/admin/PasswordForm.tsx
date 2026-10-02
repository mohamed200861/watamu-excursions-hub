import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Field, btn, input, useStatus } from "@/components/admin/ui";

/** Change password while signed in: requires the current password. */
export function PasswordForm({ onDone }: { onDone?: () => void }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { run, busy, view } = useStatus();

  function submit(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      if (password.length < 10) throw new Error("La nuova password deve avere almeno 10 caratteri.");
      if (password !== confirm) throw new Error("Le due password non coincidono.");
      if (password === current) throw new Error("La nuova password deve essere diversa da quella attuale.");
      const { data: u } = await supabase.auth.getUser();
      const email = u.user?.email;
      if (!email) throw new Error("Sessione scaduta: accedi di nuovo.");
      const check = await supabase.auth.signInWithPassword({ email, password: current });
      if (check.error) throw new Error("La password attuale non è corretta.");
      const { error } = await supabase.auth.updateUser({ password, current_password: current, data: { must_change_password: false } });
      if (error) throw new Error("Impossibile cambiare la password: scegline una più sicura (non usare password comuni).");
      setCurrent("");
      setPassword("");
      setConfirm("");
      onDone?.();
    }, "Password cambiata");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Password attuale">
        <input className={input} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="Nuova password" hint="Almeno 10 caratteri">
        <input className={input} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Ripeti la nuova password">
        <input className={input} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      {view}
      <button className={`${btn} w-full`} disabled={busy}>Cambia password</button>
    </form>
  );
}
