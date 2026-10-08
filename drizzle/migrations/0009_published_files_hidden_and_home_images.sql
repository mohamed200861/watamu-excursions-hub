CREATE OR REPLACE FUNCTION public.is_published_file(_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.gallery_photos g WHERE NOT g.hidden AND (g.path = _name OR g.thumb_path = _name))
      OR EXISTS (SELECT 1 FROM public.packages p WHERE p.visible AND p.cover IS NOT NULL
                 AND _name IN (p.cover->>'path', p.cover->>'thumb_path', p.cover->>'og_path'))
      OR EXISTS (SELECT 1 FROM public.site_content s, jsonb_array_elements(CASE WHEN jsonb_typeof(s.data->'photos') = 'array' THEN s.data->'photos' ELSE '[]'::jsonb END) ph
                 WHERE s.key = 'about' AND _name IN (ph->>'path', ph->>'thumb_path', ph->>'og_path'))
      OR EXISTS (SELECT 1 FROM public.site_content s WHERE s.key = 'home'
                 AND _name IN (s.data->'heroImage'->>'path', s.data->'heroImage'->>'thumb_path', s.data->'heroImage'->>'og_path',
                               s.data->'seaImage'->>'path', s.data->'seaImage'->>'thumb_path', s.data->'seaImage'->>'og_path'))
$function$;