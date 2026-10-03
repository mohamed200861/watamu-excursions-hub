CREATE OR REPLACE FUNCTION public.is_published_file(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.gallery_photos g WHERE g.path = _name OR g.thumb_path = _name)
      OR EXISTS (SELECT 1 FROM public.packages p WHERE p.visible AND p.cover IS NOT NULL
                 AND _name IN (p.cover->>'path', p.cover->>'thumb_path', p.cover->>'og_path'))
$$;
REVOKE ALL ON FUNCTION public.is_published_file(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_published_file(text) TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "read published gallery files" ON storage.objects;
CREATE POLICY "read published gallery files" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery' AND public.is_published_file(name));