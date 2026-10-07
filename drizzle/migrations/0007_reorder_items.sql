CREATE OR REPLACE FUNCTION public.reorder_items(_table text, _ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _table = 'packages' THEN
    UPDATE public.packages p SET sort = t.ord FROM unnest(_ids) WITH ORDINALITY AS t(id, ord) WHERE p.id = t.id;
  ELSIF _table = 'gallery_photos' THEN
    UPDATE public.gallery_photos g SET sort = t.ord FROM unnest(_ids) WITH ORDINALITY AS t(id, ord) WHERE g.id = t.id;
  ELSE RAISE EXCEPTION 'invalid table'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.reorder_items(text, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_items(text, uuid[]) TO authenticated;