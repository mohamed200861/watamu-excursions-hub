/** Minimum password length for every admin password (first access, change). */
export const MIN_PASSWORD = 12;
export const passwordTooShort = (p: string) => p.length < MIN_PASSWORD;

const COMMON = ["password", "passw0rd", "123456", "qwerty", "azerty", "abc123", "iloveyou", "admin", "letmein", "welcome", "benvenuto", "ciao", "safari", "kenya", "watamu", "malindi", "africano", "ecotours", "1234", "0000", "1111"];

/** Returns a plain-Italian reason when a password is too weak, or null when it is acceptable. */
export function passwordProblem(p: string, email = ""): string | null {
  if (passwordTooShort(p)) return `La password deve avere almeno ${MIN_PASSWORD} caratteri.`;
  const low = p.toLowerCase();
  if (/^(.)\1+$/.test(p)) return "La password non può essere sempre lo stesso carattere.";
  if (/^\d+$/.test(p)) return "Non usare solo numeri: aggiungi delle parole.";
  if (new Set(low).size < 5) return "La password è troppo ripetitiva: usa più lettere diverse.";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 4 && low.includes(local)) return "Non usare il tuo indirizzo email nella password.";
  const stripped = low.replace(/[^a-z0-9]/g, "");
  for (const w of COMMON) if (stripped.replace(/\d+$/, "") === w || (w.length >= 6 && stripped.startsWith(w) && stripped.length - w.length < 6)) return "Questa password è troppo facile da indovinare. Prova con tre o quattro parole a caso.";
  if (/(19|20)\d{2}$/.test(low) && low.length < 16) return "Non finire la password con un anno: è facile da indovinare.";
  return null;
}
