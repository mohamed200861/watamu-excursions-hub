CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, role public.app_role NOT NULL, UNIQUE (user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.claim_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  LOCK TABLE public.user_roles IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN public.has_role(auth.uid(), 'admin'); END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.site_content (key text PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('safari','excursion','park')),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  duration text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  included jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded jsonb NOT NULL DEFAULT '[]'::jsonb,
  parks jsonb NOT NULL DEFAULT '[]'::jsonb,
  lodges jsonb NOT NULL DEFAULT '[]'::jsonb,
  image text NOT NULL DEFAULT 'safari',
  price text,
  visible boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible packages" ON public.packages FOR SELECT TO anon, authenticated USING (visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write packages" ON public.packages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  thumb_path text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  caption text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'safari' CHECK (category IN ('safari','mare','persone')),
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read photos" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write photos" ON public.gallery_photos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.audit_log (id bigserial PRIMARY KEY, user_id uuid, action text NOT NULL, detail jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT USAGE ON SEQUENCE public.audit_log_id_seq TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin insert log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE POLICY "admin upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));