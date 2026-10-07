ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
DROP POLICY IF EXISTS "public read photos" ON public.gallery_photos;
CREATE POLICY "public read photos" ON public.gallery_photos FOR SELECT TO anon, authenticated
USING ((NOT hidden AND category = ANY (ARRAY['safari','mare','persone'])) OR public.has_role(auth.uid(), 'admin'));