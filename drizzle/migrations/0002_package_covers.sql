ALTER TABLE public.packages ADD COLUMN cover jsonb DEFAULT NULL;
ALTER TABLE public.packages ADD CONSTRAINT package_cover_object CHECK (cover IS NULL OR jsonb_typeof(cover) = 'object');