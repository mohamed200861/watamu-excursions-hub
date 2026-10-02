import { useState, type ReactNode } from "react";

export const input =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
export const btn =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50";
export const btnGhost =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50";
export const btnDanger =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Text({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string | undefined }) {
  return (
    <Field label={label} hint={hint}>
      <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({ label, value, onChange, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string | undefined }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={input} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** Edits a list of strings as one item per line. */
export function Lines({ label, value, onChange, rows = 4, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; rows?: number; hint?: string | undefined }) {
  return (
    <Area
      label={label}
      rows={rows}
      hint={hint ?? "Una voce per riga"}
      value={value.join("\n")}
      onChange={(v) => onChange(v.split("\n").map((s) => s.trimStart()).filter((s, i, a) => s !== "" || i === a.length - 1))}
    />
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  );
}

export function useStatus() {
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<unknown>, ok = "Salvato") {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
      setStatus({ type: "ok", text: ok });
    } catch (e) {
      setStatus({ type: "err", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }
  const view = status ? (
    <p role="status" className={`rounded-md px-3 py-2 text-sm ${status.type === "ok" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"}`}>
      {status.text}
    </p>
  ) : null;
  return { run, busy, view, setStatus };
}

export function errorText(e: unknown): string {
  if (e && typeof e === "object" && "issues" in e && Array.isArray((e as any).issues)) {
    return (e as any).issues.map((i: any) => i.message).join(" · ");
  }
  const msg = e instanceof Error ? e.message : String(e);
  try {
    const parsed = JSON.parse(msg);
    if (Array.isArray(parsed)) return parsed.map((i: any) => i.message).join(" · ");
  } catch {
    /* not JSON */
  }
  return msg || "Si è verificato un errore";
}

export function move<T>(arr: T[], i: number, d: number): T[] {
  const next = [...arr];
  const j = i + d;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j] as T, next[i] as T];
  return next;
}
