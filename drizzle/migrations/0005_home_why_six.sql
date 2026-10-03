UPDATE public.site_content SET data = data
  || jsonb_build_object(
    'heroTitle', 'Il Kenya vero, dal mare di Watamu alla savana',
    'heroText', 'Safari in jeep 4x4 con tettuccio apribile ed escursioni via mare e terra, con guida autorizzata in italiano.',
    'introTitle', 'Perché scegliere noi',
    'why', jsonb_build_array(
      jsonb_build_object('title','Guida autorizzata in italiano','text','Guida autorizzata che parla italiano e autista professionale per tutto il viaggio.'),
      jsonb_build_object('title','Jeep 4x4 con tettuccio apribile','text','Per osservare e fotografare gli animali durante i game drive.'),
      jsonb_build_object('title','Ingressi e acqua inclusi','text','Ingressi ai parchi e acqua durante i game drive sono compresi.'),
      jsonb_build_object('title','Assicurazione safari completa','text','Copertura con veicolo sostitutivo e soccorso.'),
      jsonb_build_object('title','All-inclusive nei lodge','text','Pensione all-inclusive nei lodge (bevande ai pasti escluse), con partenza dal resort a Watamu per i safari brevi.'),
      jsonb_build_object('title','Su misura su WhatsApp','text','Pacchetti costruiti su misura, scrivendo direttamente su WhatsApp.')
    ))
WHERE key = 'home';
