# ECO TOURS AND SAFARI'S — Livello 1

## Obiettivo
Realizzare il sito pubblico bilingue italiano/inglese, orientato ai contatti WhatsApp, con identità visiva coerente al logo e HTML completo già al primo caricamento.

## Pagine e navigazione
- Reindirizzare `/` alla home italiana `/it`.
- Creare le sezioni pubbliche in entrambe le lingue: home, safari, escursioni, parchi, chi siamo/about, galleria/gallery e contatti/contact.
- Creare pagine dedicate e condivisibili per tutti i 6 safari, le 8 escursioni e i 6 parchi, usando contenuti centralizzati ma URL distinti per lingua.
- Header mobile-first con logo, selettore IT/EN, menu essenziale e CTA WhatsApp; footer con Instagram e WhatsApp.

## Contenuti e conversione
- Presentare esclusivamente i contenuti forniti, senza inventare prezzi o date.
- Inserire itinerari giorno per giorno per ogni safari, lodge/camp indicati con formula “secondo disponibilità”, inclusioni, esclusioni, consigli e nota sul safari notturno a Taita Hills.
- Inserire CTA WhatsApp specifiche per ogni pacchetto e pulsante fisso su mobile, con messaggi precompilati nella lingua attiva.
- Creare FAQ concrete su partenze, cosa è incluso, preparazione, lodge e contatto.

## Direzione visiva
- Eleganza africana autentica: verde foresta, terracotta, sabbia calda e oro, con contrasti accessibili.
- Titoli serif espressivi e testi sans leggibili, spaziature generose, linee e dettagli ispirati ai paesaggi kenioti senza effetti decorativi generici.
- Usare il logo allegato in header e footer, creare la favicon dallo stesso marchio e predisporre una risorsa Open Graph.
- Componenti leggeri, senza librerie UI aggiuntive; icone SVG inline e layout stabile su mobile e desktop.

## SEO e rendering
- Aggiungere title, description, canonical, hreflang IT/EN, Open Graph, Twitter Card e lingua HTML coerente per ogni pagina.
- Inserire JSON-LD server-rendered appropriato: TravelAgency/LocalBusiness, TouristTrip, FAQPage e BreadcrumbList.
- Configurare il prerender esplicito di tutte le pagine pubbliche, mantenendo l’HTML semantico completo prima del JavaScript.
- Aggiungere robots.txt coerente; rimandare una sitemap assoluta finché non esiste un dominio pubblico.

## Implementazione tecnica
- Organizzare testi e dati localizzati in moduli condivisi, con pagine dinamiche per safari, escursioni e parchi e percorsi concreti inclusi nel prerender.
- Usare immagini WebP locali ottimizzate con dimensioni dichiarate e caricamento differito fuori dalla prima schermata; il logo resta SVG.
- Definire palette e tipografia come token semantici in `src/styles.css`.
- Verificare build, HTML SSR, metadati/JSON-LD, link WhatsApp, navigazione bilingue e resa desktop/mobile.
