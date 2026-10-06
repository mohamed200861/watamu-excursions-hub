import { Link, useRouterState } from "@tanstack/react-router";
const logo = { url: "/eco-tours-logo.svg" };
import safariHero from "@/assets/safari-hero.webp";
import coast from "@/assets/watamu-coast.webp";
import wildlife from "@/assets/kenya-wildlife.webp";
import creek from "@/assets/mida-creek.webp";
import { counterpart } from "@/lib/seo";
import { useContent } from "@/lib/content-client";
import { licenseActive, phoneLabel, whatsappHref, type AboutText, type Kind, type Locale, type Pkg, type Photo } from "@/lib/content-types";
import { useEffect, useState } from "react";
const nav = {
  it: ["Safari", "Escursioni", "Parchi", "Chi siamo", "Galleria", "Contatti"],
  en: ["Safaris", "Excursions", "Parks", "About", "Gallery", "Contact"],
};
const images = { safari: safariHero, coast, wildlife, creek };
const paths = {
  it: {
    safari: "safari",
    excursions: "escursioni",
    parks: "parchi",
    about: "chi-siamo",
    gallery: "galleria",
    contact: "contatti",
  },
  en: {
    safari: "safaris",
    excursions: "excursions",
    parks: "parks",
    about: "about",
    gallery: "gallery",
    contact: "contact",
  },
};
export function Shell({ lang, children, subject }: { lang: Locale; children: React.ReactNode; subject?: string }) {
  const p = paths[lang];
  const c = useContent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const other = lang === "it" ? "en" : "it";
  const parts = pathname.split("/").filter(Boolean);
  const otherPath = counterpart(lang, parts[1], parts[2]);
  return (
    <>
      <header className="site-header" id="top">
        <Link
          to="/$lang"
          params={{ lang }}
          aria-label="ECO TOURS AND SAFARI'S home"
          className="brand"
        >
          <img src={logo.url} alt="ECO TOURS AND SAFARI'S" width="68" height="68" />
          <span>
            <b>ECO TOURS</b>
            <small>AND SAFARI'S</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/$lang/$section" params={{ lang, section: p.safari }}>
            {nav[lang][0]}
          </Link>
          <Link to="/$lang/$section" params={{ lang, section: p.excursions }}>
            {nav[lang][1]}
          </Link>
          <Link to="/$lang/$section" params={{ lang, section: p.parks }}>
            {nav[lang][2]}
          </Link>
          <Link to="/$lang/$section" params={{ lang, section: p.about }}>
            {nav[lang][3]}
          </Link>
          <Link to="/$lang/$section" params={{ lang, section: p.gallery }}>
            {nav[lang][4]}
          </Link>
          <Link to="/$lang/$section" params={{ lang, section: p.contact }}>
            {nav[lang][5]}
          </Link>
        </nav>
        <div className="header-actions">
          {parts[2] ? <Link to="/$lang/$section/$slug" params={{ lang: other, section: otherPath.split("/")[2] ?? "", slug: parts[2] }} className="lang">{other.toUpperCase()}</Link> : parts[1] ? <Link to="/$lang/$section" params={{ lang: other, section: otherPath.split("/")[2] ?? "" }} className="lang">{other.toUpperCase()}</Link> : <Link to="/$lang" params={{ lang: other }} className="lang">{other.toUpperCase()}</Link>}
          <details className="mobile-menu">
            <summary aria-label={lang === "it" ? "Apri menu" : "Open menu"}>☰</summary>
            <div>
              <Link to="/$lang/$section" params={{ lang, section: p.safari }}>
                {nav[lang][0]}
              </Link>
              <Link to="/$lang/$section" params={{ lang, section: p.excursions }}>
                {nav[lang][1]}
              </Link>
              <Link to="/$lang/$section" params={{ lang, section: p.parks }}>
                {nav[lang][2]}
              </Link>
              <Link to="/$lang/$section" params={{ lang, section: p.about }}>
                {nav[lang][3]}
              </Link>
              <Link to="/$lang/$section" params={{ lang, section: p.gallery }}>
                {nav[lang][4]}
              </Link>
              <Link to="/$lang/$section" params={{ lang, section: p.contact }}>
                {nav[lang][5]}
              </Link>
            </div>
          </details>
          <a
            className="button small"
            href={whatsappHref(c, "ECO TOURS AND SAFARI'S")}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </header>
      <main>{children}</main>
      <section className="footer-invite"><h2>{lang === "it" ? "Pianifichiamo il tuo safari su misura" : "Let’s plan your tailor-made safari"}</h2><a className="button" href={whatsappHref(c, subject || (lang === "it" ? "un safari su misura" : "a tailor-made safari"))} target="_blank" rel="noreferrer">WhatsApp <WhatsAppIcon /></a></section>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><img src={logo.url} alt="ECO TOURS AND SAFARI'S" width="96" height="96" /><h2>ECO TOURS<br />AND SAFARI'S</h2><p>{c.home.footerText}</p><div className="social-links"><a href="https://instagram.com/africano_di_africa_" aria-label="Instagram @africano_di_africa_" target="_blank" rel="noreferrer"><InstagramIcon /></a><a href={whatsappHref(c, subject || "ECO TOURS AND SAFARI'S")} aria-label="WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon /></a></div><small>@africano_di_africa_</small></div>
          {(["safari", "excursions", "parks"] as const).map((kind, i) => <nav key={kind} aria-label={nav[lang][i]}><h3>{nav[lang][i]}</h3><Link to="/$lang/$section" params={{ lang, section: p[kind] }}>{[["Tutti i safari", "All safaris"], ["Tutte le escursioni", "All excursions"], ["Tutti i parchi", "All parks"]][i]![lang === "it" ? 0 : 1]}</Link>{c[kind].slice(0, 3).map(item => <Link key={item.slug} to="/$lang/$section/$slug" params={{ lang, section: p[kind], slug: item.slug }}>{item.title}</Link>)}</nav>)}
          <nav aria-label={nav[lang][5]}><h3>{nav[lang][5]}</h3><Link to="/$lang/$section" params={{ lang, section: p.contact }}>{nav[lang][5]}</Link><Link to="/$lang/$section" params={{ lang, section: p.about }}>{nav[lang][3]}</Link><Link to="/$lang/$section" params={{ lang, section: p.gallery }}>{nav[lang][4]}</Link><a href={whatsappHref(c, subject || "ECO TOURS AND SAFARI'S")} target="_blank" rel="noreferrer">{phoneLabel(c.whatsapp)}</a></nav>
        </div>
        <div className="footer-bottom"><small>© {new Date().getUTCFullYear()} ECO TOURS AND SAFARI'S</small><nav aria-label={lang === "it" ? "Informazioni legali" : "Legal information"}>{["privacy", "cookie", lang === "it" ? "termini" : "terms"].map(section => <Link key={section} to="/$lang/$section" params={{ lang, section }}>{section === "termini" ? "Termini" : section.charAt(0).toUpperCase() + section.slice(1)}</Link>)}</nav><div className="footer-languages"><Link to="/$lang" params={{ lang: "it" }} aria-current={lang === "it" ? "page" : undefined}>IT</Link><Link to="/$lang" params={{ lang: "en" }} aria-current={lang === "en" ? "page" : undefined}>EN</Link></div><a href="#top" className="back-top">{lang === "it" ? "Torna su" : "Back to top"} ↑</a></div>
      </footer>
      <a
        className="whatsapp-float"
        href={whatsappHref(c, subject || (lang === "it" ? "un viaggio in Kenya" : "a trip to Kenya"))}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </>
  );
}
export function Home({ lang }: { lang: Locale }) {
  const p = paths[lang];
  const c = useContent();
  const h = c.home;
  return (
    <Shell lang={lang}>
      <section className="hero">
        <img
          src={safariHero}
          alt={lang === "it" ? "Safari nella savana del Kenya al tramonto" : "Safari in the Kenyan savanna at sunset"}
          width="1600"
          height="1000"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">{h.heroEyebrow}</p>
          <h1>{h.heroTitle}</h1>
          <p>{h.heroText}</p>
          <div className="hero-actions">
            <Link className="button" to="/$lang/$section" params={{ lang, section: p.safari }}>
              {lang === "it" ? "Scopri i safari" : "Explore safaris"}
            </Link>
            <a className="text-link light" href={whatsappHref(c, lang === "it" ? "un viaggio in Kenya" : "a trip to Kenya")} target="_blank" rel="noreferrer">
              {lang === "it" ? "Parla con Africano" : "Talk to Africano"} →
            </a>
          </div>
        </div>
        <span className="hero-note">{h.heroNote}</span>
      </section>
      <section className="intro band">
        <p className="eyebrow">Africano di Africa</p>
        <h2>{h.introTitle}</h2>
        <div className="three">
          {h.why.map((w, i) => (
            <article key={i}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </article>
          ))}
        </div>
      </section>
      <Listing title={h.featuredTitle} intro={h.featuredIntro} items={c.safari.slice(0, 3)} lang={lang} kind="safari" />
      <section className="split-feature">
        <img src={coast} alt="Watamu coast" width="1200" height="800" loading="lazy" />
        <div>
          <p className="eyebrow">{h.seaEyebrow}</p>
          <h2>{h.seaTitle}</h2>
          <p>{h.seaText}</p>
          <Link className="button" to="/$lang/$section" params={{ lang, section: p.excursions }}>
            {lang === "it" ? "Vedi le escursioni" : "See excursions"}
          </Link>
        </div>
      </section>
      <Faq lang={lang} />
    </Shell>
  );
}
function priceLabel(lang: Locale, item: Pkg) {
  return item.price ? item.price : lang === "it" ? "Prezzo: chiedi su WhatsApp" : "Price: ask on WhatsApp";
}
function Listing({ title, intro, items, lang, kind }: { title: string; intro: string; items: Pkg[]; lang: Locale; kind: Kind }) {
  const base = paths[lang][kind];
  const c = useContent();
  return (
    <section className="listing band">
      <div className="section-head">
        <div>
          <p className="eyebrow">ECO TOURS AND SAFARI'S</p>
          <h2>{title}</h2>
        </div>
        <p>{intro}</p>
      </div>
      <div className="grid">
        {items.map((item) => (
          <article className="card" key={item.slug}>
            <Link to="/$lang/$section/$slug" params={{ lang, section: base, slug: item.slug }}>
              <PackagePhoto item={item} thumb />
              <div className="card-body">
                <span>{item.duration}</span>
                <h3>{item.title}</h3>
                <p className="card-description">{item.description}</p>
                {item.parks.length > 0 && <ul className="park-tags">{item.parks.map(park => <li key={park}>{park}</li>)}</ul>}
                {kind !== "parks" && <p><small>{priceLabel(lang, item)}</small></p>}
                <strong>{lang === "it" ? "Scopri l’esperienza" : "Explore the experience"} →</strong>
              </div>
            </Link>
            {(
              <a className="card-wa button" href={whatsappHref(c, item.title)} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
export function IndexPage({ lang, kind }: { lang: Locale; kind: Kind }) {
  const c = useContent();
  const data = c[kind];
  const titles = {
    it: { safari: "Safari in Kenya", excursions: "Escursioni mare e terra", parks: "I parchi del Kenya" },
    en: { safari: "Safaris in Kenya", excursions: "Sea and land excursions", parks: "Kenya’s parks" },
  };
  return (
    <Shell lang={lang}>
      <PageHero
        title={titles[lang][kind]}
        text={lang === "it" ? "Esperienze curate da Africano di Africa, tra natura, incontri e paesaggi indimenticabili." : "Journeys curated by Africano di Africa, through nature, encounters and unforgettable landscapes."}
        image={kind === "excursions" ? coast : wildlife}
      />
      <Listing
        title={titles[lang][kind]}
        intro={lang === "it" ? "Scegli l’esperienza e scrivici direttamente su WhatsApp." : "Choose your experience and message us directly on WhatsApp."}
        items={data}
        lang={lang}
        kind={kind}
      />
    </Shell>
  );
}
export function DetailPage({ lang, kind, slug }: { lang: Locale; kind: Kind; slug: string }) {
  const c = useContent();
  const item = c[kind].find((x) => x.slug === slug);
  if (!item)
    return (
      <Shell lang={lang}>
        <div className="empty">
          <h1>{lang === "it" ? "Esperienza non trovata" : "Experience not found"}</h1>
        </div>
      </Shell>
    );
  const hasDays = item.itinerary.length > 0;
  return (
    <Shell lang={lang} subject={item.title}>
      <section className="page-hero package-hero"><PackagePhoto item={item} /><div className="hero-shade" /><div><p className="eyebrow">{item.duration}</p><h1>{item.title}</h1><p>{item.description}</p></div></section>
      <section className="detail band">
        <article>
          <section className="brief"><h2>{lang === "it" ? "In breve" : "At a glance"}</h2><dl><div><dt>{kind === "parks" ? (lang === "it" ? "Il parco" : "The park") : (lang === "it" ? "Durata" : "Duration")}</dt><dd>{item.duration}</dd></div>{hasDays && <div><dt>{lang === "it" ? "Notti" : "Nights"}</dt><dd>{Math.max(0, item.itinerary.length - 1)}</dd></div>}{item.itinerary[0] && <div><dt>{lang === "it" ? "Partenza" : "Departure"}</dt><dd>{item.itinerary[0].split(/[.!?]/)[0]}</dd></div>}{item.parks.length > 0 && <div><dt>{lang === "it" ? "Parchi" : "Parks"}</dt><dd>{item.parks.join(" · ")}</dd></div>}{item.lodges.length > 0 && <div><dt>Lodge / camp</dt><dd>{item.lodges.join(" · ")} — {lang === "it" ? "secondo disponibilità" : "subject to availability"}</dd></div>}</dl></section>
          {hasDays ? (
            <>
              <p className="eyebrow">{lang === "it" ? "Itinerario" : "Itinerary"}</p>
              <h2>{lang === "it" ? "Giorno per giorno" : "Day by day"}</h2>
              <ol className="timeline">
                {item.itinerary.map((d, i) => (
                  <li key={i}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{lang === "it" ? `Giorno ${i + 1}` : `Day ${i + 1}`}</h3>
                      <p>{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {item.parks.length > 0 && (
                <>
                  <h2>{lang === "it" ? "Parchi" : "Parks"}</h2>
                  <p>{item.parks.join(" · ")}</p>
                </>
              )}
              {item.lodges.length > 0 && (
                <>
                  <h2>{lang === "it" ? "Lodge e camp" : "Lodges and camps"}</h2>
                  <p>
                    {item.lodges.join(" · ")} — {lang === "it" ? "secondo disponibilità" : "subject to availability"}.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <p className="eyebrow">{lang === "it" ? "L’esperienza" : "The experience"}</p>
              <h2>{item.duration}</h2>
              <p className="lead">{item.description}</p>
            </>
          )}
        </article>
        <aside>
          {item.included.length > 0 && <Info title={lang === "it" ? "Incluso" : "Included"} items={item.included} />}
          {item.excluded.length > 0 && <Info title={lang === "it" ? "Non incluso" : "Not included"} items={item.excluded} excluded />}
          {kind === "safari" && c.bring.length > 0 && <Info title={lang === "it" ? "Cosa portare" : "What to bring"} items={c.bring} />}
          {kind !== "parks" && <p className="lead">{priceLabel(lang, item)}</p>}
          <a className="button wide" href={whatsappHref(c, item.title)} target="_blank" rel="noreferrer">
            {lang === "it" ? "Chiedi informazioni" : "Ask for information"}
          </a>
        </aside>
      </section>
      <Listing title={lang === "it" ? "Altre esperienze" : "Related experiences"} intro="" items={c[kind].filter(p => p.slug !== item.slug).slice(0, 3)} lang={lang} kind={kind} />
    </Shell>
  );
}
function Info({ title, items, excluded = false }: { title: string; items: string[]; excluded?: boolean }) {
  return (
    <section className="info">
      <h3>{title}</h3>
      <ul>
        {items.map((x, i) => (
          <li key={i}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={excluded ? "M6 6l12 12M18 6L6 18" : "M4 12l5 5L20 6"} /></svg><span>{x}</span></li>
        ))}
      </ul>
    </section>
  );
}
export function SimplePage({ lang, type }: { lang: Locale; type: "about" | "gallery" | "contact" }) {
  const c = useContent();
  const t = c[type];
  return (
    <Shell lang={lang}>
      <PageHero title={t.title} text={t.subtitle} image={type === "gallery" ? creek : type === "about" ? wildlife : coast} />
      <section className="simple band">
        <p className="lead">{t.text}</p>
        {type === "about" && <AboutMe a={c.about} lang={lang} />}
        {type === "gallery" ? (
          <Gallery lang={lang} photos={c.photos.length > 0 ? c.photos : [
            { id: "t1", src: safariHero, thumb: safariHero, width: 1600, height: 1000, caption: "Safari", alt: "Kenyan safari", category: "safari" },
            { id: "t2", src: coast, thumb: coast, width: 1200, height: 800, caption: "Watamu", alt: "Watamu coast", category: "mare" },
            { id: "t3", src: wildlife, thumb: wildlife, width: 1200, height: 800, caption: "Tsavo", alt: "Elephant in Tsavo", category: "safari" },
            { id: "t4", src: creek, thumb: creek, width: 1200, height: 800, caption: "Mida Creek", alt: "Mida Creek", category: "mare" },
          ]} />
        ) : (
          <a className="button" href={whatsappHref(c, type === "contact" ? (lang === "it" ? "un viaggio in Kenya" : "a trip to Kenya") : "ECO TOURS AND SAFARI'S")} target="_blank" rel="noreferrer">
            WhatsApp · {phoneLabel(c.whatsapp)}
          </a>
        )}
      </section>
    </Shell>
  );
}
function AboutMe({ a, lang }: { a: AboutText; lang: Locale }) {
  const photos = a.photos ?? [];
  const lic = a.license;
  const showLic = licenseActive(lic);
  if (!a.me && photos.length === 0 && !showLic) return null;
  return (
    <section className={photos.length ? "about-me" : "about-me no-photo"} aria-labelledby="about-me-title">
      {photos.length > 0 && (
        <div className="about-photos">
          {photos.map((ph, i) => (
            <img key={ph.path} src={`/api/public/img/${i === 0 ? ph.path : ph.thumb_path}`} alt={ph.alt} width={i === 0 ? 1600 : 480} height={i === 0 ? 1000 : 300} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} decoding="async" style={{ objectPosition: `${ph.focal_x}% ${ph.focal_y}%` }} />
          ))}
        </div>
      )}
      <div className="about-text">
        <h2 id="about-me-title">{a.meTitle || (lang === "it" ? "Chi sono" : "About me")}</h2>
        {(a.me ?? "").split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
        {showLic && lic && <p className="license-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11l4 4z" /></svg><span>{lic.text}{lic.number ? ` · n. ${lic.number}` : ""}</span></p>}
      </div>
    </section>
  );
}
function Gallery({ photos, lang }: { photos: Photo[]; lang: Locale }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open]);
  const cur = open === null ? null : photos[open];
  return (
    <>
      <div className="gallery">
        {photos.map((ph, i) => (
          <button key={ph.id} type="button" className="gallery-item" onClick={() => setOpen(i)} aria-label={(lang === "it" ? "Ingrandisci: " : "Enlarge: ") + (ph.caption || ph.alt)}>
            <img src={ph.thumb} srcSet={ph.thumb !== ph.src ? `${ph.thumb} 640w, ${ph.src} ${ph.width}w` : undefined} sizes="(max-width: 860px) 50vw, 33vw" alt={ph.alt} width={ph.width} height={ph.height} loading={i < 6 ? "eager" : "lazy"} decoding="async" />
            {ph.caption && <span>{ph.caption}</span>}
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={cur.caption || cur.alt} onClick={() => setOpen(null)}>
          <img src={cur.src} alt={cur.alt} width={cur.width} height={cur.height} onClick={(e) => e.stopPropagation()} />
          <p>{cur.caption} <small>{(open ?? 0) + 1} / {photos.length}</small></p>
          <button type="button" className="lb-close" aria-label={lang === "it" ? "Chiudi" : "Close"} onClick={() => setOpen(null)}>×</button>
          {photos.length > 1 && <>
            <button type="button" className="lb-prev" aria-label={lang === "it" ? "Precedente" : "Previous"} onClick={(e) => { e.stopPropagation(); go(-1); }}>‹</button>
            <button type="button" className="lb-next" aria-label={lang === "it" ? "Successiva" : "Next"} onClick={(e) => { e.stopPropagation(); go(1); }}>›</button>
          </>}
        </div>
      )}
    </>
  );
}
function PageHero({ title, text, image, kicker }: { title: string; text: string; image: string; kicker?: string }) {
  return (
    <section className="page-hero">
      <img src={image} alt="" width="1600" height="1000" />
      <div className="hero-shade" />
      <div>
        <p className="eyebrow">{kicker ?? "ECO TOURS AND SAFARI'S"}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
function Faq({ lang }: { lang: Locale }) {
  const c = useContent();
  return (
    <section className="faq band">
      <p className="eyebrow">FAQ</p>
      <h2>{lang === "it" ? "Prima di partire" : "Before you go"}</h2>
      {c.faq.map((f, i) => (
        <details key={i}>
          <summary>
            {f.q}
            <span>+</span>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7c1.7.9 3.5 1.4 5.4 1.4 6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.4-8.4Zm-8.4 18.2c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-3.9 1 1-3.8-.2-.4a9.8 9.8 0 1 1 8.4 4.7Zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.7.1-.2 0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5H8c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 .9 4.1.7.7-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

const seaSlugs = ["safari-blu", "isola-dell-amore", "sardegna-due", "isola-di-robinson"];
const parkSlugs = ["masai-mara", "amboseli", "lake-nakuru", "tsavo-est", "tsavo-ovest", "taita-hills"];
function fallbackPhoto(slug: string) {
  if (seaSlugs.includes(slug)) return coast;
  if (parkSlugs.includes(slug)) return safariHero;
  if (["rovine-di-gede", "hells-kitchen-marafa", "vera-africa", "aperitivo-mida-creek"].includes(slug)) return creek;
  return wildlife;
}
function PackagePhoto({ item, thumb = false }: { item: Pkg; thumb?: boolean }) {
  if (!item.cover) return <img src={fallbackPhoto(item.slug)} alt={item.title} width={thumb ? 480 : 1600} height={thumb ? 300 : 1000} loading={thumb ? "lazy" : "eager"} />;
  return <img src={`/api/public/img/${thumb ? item.cover.thumb_path : item.cover.path}`} alt={item.cover.alt} width={thumb ? 480 : 1600} height={thumb ? 300 : 1000} loading={thumb ? "lazy" : "eager"} fetchPriority={thumb ? "auto" : "high"} style={thumb ? undefined : { objectPosition: `${item.cover.focal_x}% ${item.cover.focal_y}%` }} />;
}
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></svg>; }
