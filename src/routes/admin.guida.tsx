import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import guide from "../../docs/GUIDA-TITOLARE.md?raw";

export const Route = createFileRoute("/admin/guida")({ component: GuidePage });

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|https:\/\/[^\s)]+)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part.startsWith("https://") ? <a key={i} className="underline" href={part} target="_blank" rel="noreferrer">{part}</a> : part,
  );
}

/** Minimal renderer for the guide's own Markdown (headings, lists, quotes, tables, paragraphs). */
function render(md: string) {
  const out: ReactNode[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const l = lines[i]!;
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("# ")) { out.push(<h1 key={i} className="font-display text-3xl">{l.slice(2)}</h1>); i++; continue; }
    if (l.startsWith("## ")) { const t = l.slice(3); out.push(<h2 key={i} id={slug(t)} className="guide-section mt-10 font-display text-2xl">{t}</h2>); i++; continue; }
    if (/^\d+\. /.test(l) || l.startsWith("- ")) {
      const ordered = /^\d+\. /.test(l);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]!) : lines[i]!.startsWith("- "))) items.push(lines[i++]!.replace(/^(\d+\. |- )/, ""));
      const Tag = ordered ? "ol" : "ul";
      out.push(<Tag key={i} className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-6`}>{items.map((x, j) => <li key={j}>{inline(x)}</li>)}</Tag>);
      continue;
    }
    if (l.startsWith("> ")) { out.push(<blockquote key={i} className="border-l-4 border-primary pl-4 italic">{inline(l.slice(2))}</blockquote>); i++; continue; }
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.startsWith("|")) { const r = lines[i++]!; if (!/^\|\s*-/.test(r)) rows.push(r.split("|").slice(1, -1).map((c) => c.trim())); }
      out.push(
        <table key={i} className="w-full border-collapse text-left">
          <thead><tr>{rows[0]!.map((c, j) => <th key={j} className="border border-border p-2">{c}</th>)}</tr></thead>
          <tbody>{rows.slice(1).map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className="border border-border p-2 align-top">{inline(c)}</td>)}</tr>)}</tbody>
        </table>,
      );
      continue;
    }
    out.push(<p key={i}>{inline(l)}</p>);
    i++;
  }
  return out;
}

function GuidePage() {
  const sections = guide.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
  return (
    <article className="guide space-y-4 text-lg leading-relaxed">
      <button className="no-print rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground" onClick={() => window.print()}>
        Stampa o salva in PDF
      </button>
      <nav aria-label="Indice" className="no-print rounded-md border border-border p-4">
        <b>Indice</b>
        <ol className="mt-2 space-y-1">
          {sections.map((s) => <li key={s}><a className="underline" href={`#${slug(s)}`}>{s}</a></li>)}
        </ol>
      </nav>
      {render(guide)}
    </article>
  );
}
