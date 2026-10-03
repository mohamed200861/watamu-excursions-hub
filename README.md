# Safari Sunsets & Safaris

Costruisci il sito di ECO TOURS AND SAFARI'S (safari ed escursioni in Kenya, base Watamu/Malindi).
Titolare: "Africano di Africa", Instagram @africano_di_africa_
WhatsApp: +254742161072 (link wa.me/254742161072 con messaggio precompilato)
Lingue: italiano (principale) e inglese (/it e /en con hreflang)

Palette dal logo allegato:
- Verde foresta keniota: #093F20
- Arancio tramonto / terracotta: #FE7D17
- Sabbia calda e oro d'accento per lo sfondo e i dettagli (#FBF8F3, #FAF5EE, #D4AF37)
Usa il logo SVG allegato nell'header, nel footer, crea la favicon e predisponilo per l'Open Graph.

Rendering e Architettura (Livello 1):
- TanStack Start con SSR / prerender delle pagine pubbliche. Le pagine pubbliche (home, safari, escursioni, parchi, chi siamo, contatti) devono arrivare con HTML semantico completo, title, meta description unici, canonical, hreflang, Open Graph e JSON-LD (TravelAgency/LocalBusiness, TouristTrip, FAQPage, BreadcrumbList) presenti nell'HTML iniziale prima di qualsiasi esecuzione JS.
- Bundle ultra-leggero: pagina iniziale sotto 100 KB escluse le immagini sopra la piega, zero librerie UI pesanti, solo SVG inlined e Tailwind CSS. Immagini WebP con width/height e lazy loading.

Obiettivo & WhatsApp:
- Portare contatti WhatsApp. Ogni pacchetto ha un pulsante che apre wa.me/254742161072 con messaggio precompilato specifico (es. "Ciao Africano! Vorrei informazioni su {pacchetto}...").
- Pulsante fisso WhatsApp su mobile.

Contenuti (usa solo questi, non inventare prezzi o date):
Parchi: Masai Mara National Reserve, Amboseli National Park, Lake Nakuru National Park, Tsavo Est National Park, Tsavo Ovest National Park, Taita Hills Wildlife Sanctuary.

Safari:
1. 2 giorni / 1 notte: Tsavo Est
2. 3 giorni / 2 notti: Tsavo Est + Taita Hills
3. 3 giorni / 2 notti: Tsavo Est + Amboseli
4. 5 giorni / 4 notti da Nairobi: Masai Mara (2 notti), Lake Nakuru (1), Amboseli (1)
5. 6 giorni / 5 notti: come sopra + Tsavo Est (1)
6. 7 giorni / 6 notti: come sopra + Taita Hills (1) + Tsavo Est (1)
Per ogni safari: itinerario giorno per giorno (partenze ore 6:00, game drive mattina e pomeriggio, pranzo, lodge, rientro a Watamu o aeroporto Mombasa), lodge/camp indicati (Sentrim Mara, Fig Tree, Lake Nakuru Lodge, Sentrim Tari Camp, Manyatta Luxury Camp, Voi Safari Lodge, Voi Wildlife Lodge, "secondo disponibilità").
Incluso: jeep 4x4 con tettuccio apribile, ingressi ai parchi, pernottamento all-inclusive (bevande ai pasti escluse), acqua durante i game drive, guida autorizzata in italiano, autista professionale, assicurazione safari completa.
Non incluso: bevande ai pasti e colazione del giorno di partenza, mance, extra personali, ingresso al villaggio Masai.
Consigli: cosa portare (abbigliamento estivo e più pesante per la sera, cappello, antizanzare, crema solare, occhiali da sole, costume, adattatore, binocolo, macchina fotografica). Notte a Taita Hills: safari notturno a pagamento con ranger.

Escursioni mare e terra (testi chiari ed eleganti):
1. Safari Blu (snorkeling Watamu Marine National Park, spiaggia di Garoda, pranzo ad aragosta a Sudi Island, rientro h 17)
2. Isola dell'Amore (atollo a piedi o in barca secondo la marea, cuore di sabbia bianca)
3. Sardegna Due (atollo, barriera corallina, pranzo di crostacei)
4. Isola di Robinson (Che Shale, granchi rossi, mangrovie)
5. Rovine di Gede (baobab, scimmiette)
6. La Cucina del Diavolo / Hell's Kitchen a Marafa (canyon, tramonto)
7. Vera Africa (villaggi swahili, incontro con famiglie; chi vuole può portare doni, con rispetto e senza retorica)
8. Aperitivo a Mida Creek (tramonto tra le mangrovie: Lichthaus, Crab Shack o Prawn's Lake)

Design:
- Mobile-first, autentica eleganza africana, tipografia con serif espressivo per i titoli e sans pulito per i testi. Spaziature generose, zero aspetto da template, contrasti elevati (WCAG AA).
- Card pacchetti con badge durata, parchi inclusi e CTA WhatsApp diretta.
- Sezioni Home: Hero immersiva, Perché noi (guida locale in italiano, sicurezza, autenticità), Safari in evidenza, Escursioni Mare e Terra, FAQ con risposte reali, Footer con @africano_di_africa_ e WhatsApp.
- Pagine dedicate per ciascun safari, escursione e parco, Chi siamo, Galleria e Contatti.

Implementa il Livello 1 completo e fermati.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8bf6e13-8777-4fac-a137-b2fa87edefb9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
