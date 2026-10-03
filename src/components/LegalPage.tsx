import { Shell } from './Site';
import { useContent } from '@/lib/content-client';
import { whatsappHref, type Locale } from '@/lib/content-types';
import { legalSections, legalTitles, ownerEntries, type LegalKind } from '@/lib/legal';
export function LegalPage({ lang, kind }: { lang: Locale; kind: LegalKind }) {
  const c = useContent();
  return <Shell lang={lang}><section className="legal-page band"><p className="eyebrow">ECO TOURS AND SAFARI'S</p><h1>{legalTitles[lang][kind]}</h1>
    <section><h2>{lang === 'it' ? 'Titolare e contatti' : 'Controller and contact'}</h2><dl>{ownerEntries(c.owner, lang).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><a className="text-link" href={whatsappHref(c, lang === 'it' ? 'privacy e condizioni' : 'privacy and terms')} target="_blank" rel="noreferrer">WhatsApp</a>{c.owner.email && <> · <a href={`mailto:${c.owner.email}`}>{c.owner.email}</a></>}</section>
    {legalSections(kind, lang).map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
  </section></Shell>;
}
