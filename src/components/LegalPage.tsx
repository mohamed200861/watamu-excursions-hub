import { Shell } from './Site';
import { useContent } from '@/lib/content-client';
import { phoneLabel, whatsappTextHref, type Locale } from '@/lib/content-types';
import { legalSections, legalTitles, ownerEntries, type LegalKind } from '@/lib/legal';
export const legalMessage = { it: 'Ciao Africano! Ho una domanda sulla privacy e sulle condizioni del sito.', en: "Hi Africano! I have a question about the site's privacy and terms." };
export function LegalPage({ lang, kind }: { lang: Locale; kind: LegalKind }) {
  const c = useContent();
  const entries = ownerEntries(c.owner, lang);
  return <Shell lang={lang}><section className="legal-page band"><p className="eyebrow">ECO TOURS AND SAFARI'S</p><h1>{legalTitles[lang][kind]}</h1>
    <section><h2>{lang === 'it' ? 'Titolare e contatti' : 'Controller and contact'}</h2>{entries.length > 0 && <dl>{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<a className="text-link" href={whatsappTextHref(c.whatsapp, legalMessage[lang])} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${phoneLabel(c.whatsapp)}`}>{phoneLabel(c.whatsapp)}</a>{c.owner.email && <> · <a href={`mailto:${c.owner.email}`}>{c.owner.email}</a></>}</section>
    {legalSections(kind, lang, c.owner).map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
  </section></Shell>;
}
