DROP FUNCTION IF EXISTS public.claim_admin();
DROP POLICY IF EXISTS "public read gallery files" ON storage.objects;
DROP POLICY IF EXISTS "public read content" ON public.site_content;
CREATE POLICY "public read content" ON public.site_content FOR SELECT TO anon, authenticated
  USING (key IN ('home','about','contact','gallery','faq','info','settings','owner') OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "public read photos" ON public.gallery_photos;
CREATE POLICY "public read photos" ON public.gallery_photos FOR SELECT TO anon, authenticated
  USING (category IN ('safari','mare','persone') OR public.has_role(auth.uid(), 'admin'));
