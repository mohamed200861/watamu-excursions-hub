import { Link, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/eco-tours-logo.svg.asset.json";
import safariHero from "@/assets/safari-hero.webp";
import coast from "@/assets/watamu-coast.webp";
import wildlife from "@/assets/kenya-wildlife.webp";
import creek from "@/assets/mida-creek.webp";
import { counterpart } from "@/lib/seo";
import { useContent } from "@/lib/content-client";
import { phoneLabel, whatsappHref, type Kind, type Locale, type Pkg } from "@/lib/content-types";
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
          <a href={otherPath} className="lang">
            {other.toUpperCase()}
          </a>
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
          {(["safari", "excursions", "parks"] as const).map((kind, i) => <nav key={kind} aria-label={nav[lang][i]}><h3>{nav[lang][i]}</h3><Link to="/$lang/$section" params={{ lang, section: p[kind] }}>{lang === "it" ? "Tutte le esperienze" : "All experiences"}</Link>{c[kind].slice(0, 3).map(item => <Link key={item.slug} to="/$lang/$section/$slug" params={{ lang, section: p[kind], slug: item.slug }}>{item.title}</Link>)}</nav>)}
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
        {type === "gallery" ? (
          <div className="gallery">
            {c.photos.length > 0 ? (
              c.photos.map((ph) => (
                <a key={ph.id} href={ph.src} target="_blank" rel="noreferrer" title={ph.caption}>
                  <img src={ph.thumb} alt={ph.alt} width="480" height={Math.round((480 * ph.height) / ph.width)} loading="lazy" />
                </a>
              ))
            ) : (
              <>
                <img src={safariHero} alt="Kenyan safari" width="1600" height="1000" loading="lazy" />
                <img src={coast} alt="Watamu coast" width="1200" height="800" loading="lazy" />
                <img src={wildlife} alt="Elephant in Tsavo" width="1200" height="800" loading="lazy" />
                <img src={creek} alt="Mida Creek" width="1200" height="800" loading="lazy" />
              </>
            )}
          </div>
        ) : (
          <a className="button" href={whatsappHref(c, type === "contact" ? (lang === "it" ? "un viaggio in Kenya" : "a trip to Kenya") : "ECO TOURS AND SAFARI'S")} target="_blank" rel="noreferrer">
            WhatsApp · {phoneLabel(c.whatsapp)}
          </a>
        )}
      </section>
    </Shell>
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

function PackagePhoto({ item, thumb = false }: { item: Pkg; thumb?: boolean }) {
  if (!item.cover) return <div className={thumb ? "package-placeholder" : "package-placeholder cover-placeholder"} role="img" aria-label={item.title}><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M8 64h104M18 64l34-38 25 38M61 42l14-18 30 40M85 10a7 7 0 1 0 .01 0" /></svg><span>ECO TOURS AND SAFARI'S</span></div>;
  return <img src={`/api/public/img/${thumb ? item.cover.thumb_path : item.cover.path}`} alt={item.cover.alt} width={thumb ? 480 : 1600} height={thumb ? 300 : 1000} loading={thumb ? "lazy" : "eager"} fetchPriority={thumb ? "auto" : "high"} style={thumb ? undefined : { objectPosition: `${item.cover.focal_x}% ${item.cover.focal_y}%` }} />;
}
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" /></svg>; }
