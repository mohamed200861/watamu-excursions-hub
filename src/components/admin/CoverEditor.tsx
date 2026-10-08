import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { coverFromBlob } from '@/lib/cover-image';
import { checkFile } from '@/lib/image-resize';
import type { Cover } from '@/lib/content-types';
import { Button, Field, Text, btn, btnGhost, input, useStatus } from './ui';
export function CoverEditor({ cover, onChange }: { cover?: Cover | null | undefined; onChange: (cover: Cover | null) => void }) {
  const [source, setSource] = useState<Blob | null>(null), [preview, setPreview] = useState('');
  const [alt, setAlt] = useState(cover?.alt ?? ''), [x, setX] = useState(cover?.focal_x ?? 50), [y, setY] = useState(cover?.focal_y ?? 50);
  const s = useStatus();
  const photos = useQuery({ queryKey: ['admin', 'cover-photos'], queryFn: async () => { const { data, error } = await supabase.from('gallery_photos').select('id,path,caption,alt'); if (error) throw new Error('Galleria non disponibile'); return data; } });
  useEffect(() => { if (!source) return; const url = URL.createObjectURL(source); setPreview(url); return () => URL.revokeObjectURL(url); }, [source]);
  async function select(path: string, label: string) {
    const { data, error } = await supabase.storage.from('gallery').download(path); if (error || !data) throw new Error('Foto non disponibile'); setSource(data); setAlt(label); setX(50); setY(50);
  }
  return <section className="space-y-3 border-t border-border pt-4">
    <h3 className="text-lg">Copertina</h3>
    <Field label="Carica foto" hint="Immagine fino a 15 MB; pagina 1600 px, card 480 px, condivisione 1200 × 630."><input className={input} type="file" accept="image/*" disabled={s.busy} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const error = checkFile(f); if (error) s.setStatus({ type: 'err', text: error }); else { setSource(f); setAlt(''); setX(50); setY(50); } e.target.value = ''; }} /></Field>
    <Field label="Oppure scegli dalla galleria"><select className={input} defaultValue="" disabled={s.busy} onChange={e => { const p = photos.data?.find(p => p.id === e.target.value); if (p) s.run(() => select(p.path, p.alt || p.caption), 'Foto selezionata'); }}><option value="">Seleziona una foto</option>{photos.data?.map(p => <option key={p.id} value={p.id}>{p.caption || p.alt || 'Foto'}</option>)}</select></Field>
    {photos.error && <p role="alert" className="text-destructive">Galleria non disponibile.</p>}
    {(preview || cover) && <img src={preview || `/api/public/img/${cover?.path}`} alt={alt} className="aspect-[16/10] w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />}
    <Text label="Testo alternativo della copertina" value={alt} onChange={setAlt} />
    <Field label="Punto focale orizzontale"><input type="range" min="0" max="100" value={x} onChange={e => setX(Number(e.target.value))} className="w-full" /></Field>
    <Field label="Punto focale verticale"><input type="range" min="0" max="100" value={y} onChange={e => setY(Number(e.target.value))} className="w-full" /></Field>
    {s.view}
    <div className="flex flex-wrap gap-2"><Button className={btn} disabled={s.busy || (!source && !cover)} onClick={() => s.run(async () => {
      if (!alt.trim()) throw new Error('Descrivi la foto nel testo alternativo');
      let blob = source;
      if (!blob && cover) { const { data, error } = await supabase.storage.from('gallery').download(cover.path); if (error || !data) throw new Error('Foto non disponibile'); blob = data; }
      if (!blob) return;
      const result = await coverFromBlob(blob, alt.trim(), x, y, async (path, image) => { const { error } = await supabase.storage.from('gallery').upload(path, image, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' }); if (error) throw new Error('Caricamento copertina non riuscito'); });
      onChange(result);
    }, 'Copertina pronta: salva il pacchetto')}>Prepara copertina</Button><Button className={btnGhost} disabled={s.busy} onClick={() => { onChange(null); setSource(null); setPreview(''); }}>Rimuovi copertina</Button></div>
  </section>;
}
