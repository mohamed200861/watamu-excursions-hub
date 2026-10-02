import { createContext, useContext, type ReactNode } from "react";
import { getSiteContent } from "./content.functions";
import type { Locale, SiteContent } from "./content-types";

const memo = new Map<Locale, { at: number; p: Promise<SiteContent> }>();

/** Shared, short-lived cache so every route of one navigation reuses one request. */
export function loadContent(lang: Locale): Promise<SiteContent> {
  const hit = memo.get(lang);
  if (hit && Date.now() - hit.at < 20_000) return hit.p;
  const p = getSiteContent({ data: { lang } });
  memo.set(lang, { at: Date.now(), p });
  p.catch(() => memo.delete(lang));
  return p;
}

const Ctx = createContext<SiteContent | null>(null);
export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useContent(): SiteContent {
  const c = useContext(Ctx);
  if (!c) throw new Error("Contenuti non disponibili");
  return c;
}
