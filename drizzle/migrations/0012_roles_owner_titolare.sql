
-- Pending first-login password change: stores only a fingerprint of the password hash at creation/reset time.
CREATE TABLE IF NOT EXISTS public.password_change_required (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.password_change_required TO service_role;
ALTER TABLE public.password_change_required ENABLE ROW LEVEL SECURITY;
-- no policies: only security-definer functions touch it

CREATE OR REPLACE FUNCTION public.password_change_pending(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.password_change_required r JOIN auth.users u ON u.id = r.user_id
    WHERE r.user_id = _uid AND md5(coalesce(u.encrypted_password, '')) = r.fingerprint)
$$;

CREATE OR REPLACE FUNCTION public.is_owner(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'admin') AND NOT public.password_change_pending(_uid)
$$;

CREATE OR REPLACE FUNCTION public.can_edit(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (public.has_role(_uid, 'admin') OR public.has_role(_uid, 'titolare')) AND NOT public.password_change_pending(_uid)
$$;

CREATE OR REPLACE FUNCTION public.my_access()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'role', CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'proprietario' WHEN public.has_role(auth.uid(), 'titolare') THEN 'titolare' ELSE NULL END,
    'pending', public.password_change_pending(auth.uid()))
$$;

-- New accounts (created by the developer from the backend) must change password at first login.
CREATE OR REPLACE FUNCTION public.flag_new_user_password()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.password_change_required (user_id, fingerprint)
  VALUES (NEW.id, md5(coalesce(NEW.encrypted_password, ''))) ON CONFLICT (user_id) DO UPDATE SET fingerprint = EXCLUDED.fingerprint, created_at = now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created_flag_password ON auth.users;
CREATE TRIGGER on_auth_user_created_flag_password AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.flag_new_user_password();

-- For the developer after resetting a password from the backend (SQL only, not callable through the API).
CREATE OR REPLACE FUNCTION public.require_password_change(_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u record;
BEGIN
  SELECT id, encrypted_password INTO _u FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF _u.id IS NULL THEN RETURN false; END IF;
  INSERT INTO public.password_change_required (user_id, fingerprint) VALUES (_u.id, md5(coalesce(_u.encrypted_password, '')))
  ON CONFLICT (user_id) DO UPDATE SET fingerprint = EXCLUDED.fingerprint, created_at = now();
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.require_password_change(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.flag_new_user_password() FROM PUBLIC, anon, authenticated;

-- Audit events (login, password change) for any staff member; never stores passwords.
CREATE OR REPLACE FUNCTION public.log_event(_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _action NOT IN ('login', 'password.change', 'logout') THEN RAISE EXCEPTION 'invalid action'; END IF;
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'titolare')) THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.audit_log (user_id, action) VALUES (auth.uid(), _action);
END $$;
REVOKE EXECUTE ON FUNCTION public.log_event(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_event(text) TO authenticated;

-- Staff management (owner only)
CREATE OR REPLACE FUNCTION public.grant_role(_email text, _role public.app_role)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT u.id INTO _id FROM auth.users u WHERE lower(u.email) = lower(trim(_email)) LIMIT 1;
  IF _id IS NULL THEN RETURN NULL; END IF;
  DELETE FROM public.user_roles WHERE user_id = _id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_id, _role);
  RETURN _id;
END $$;
CREATE OR REPLACE FUNCTION public.list_staff()
RETURNS TABLE(id uuid, email text, role text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text, CASE WHEN r.role = 'admin' THEN 'proprietario' ELSE r.role::text END
    FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id;
END $$;
CREATE OR REPLACE FUNCTION public.revoke_staff(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'self'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  RETURN true;
END $$;
CREATE OR REPLACE FUNCTION public.grant_admin(_email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN public.grant_role(_email, 'admin'); END $$;
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(id uuid, email text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id WHERE r.role = 'admin';
END $$;
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN public.revoke_staff(_user_id); END $$;
REVOKE EXECUTE ON FUNCTION public.grant_role(text, public.app_role), public.list_staff(), public.revoke_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_role(text, public.app_role), public.list_staff(), public.revoke_staff(uuid), public.my_access(), public.can_edit(uuid), public.is_owner(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.reorder_items(_table text, _ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.can_edit(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _table = 'packages' THEN
    UPDATE public.packages p SET sort = t.ord FROM unnest(_ids) WITH ORDINALITY AS t(id, ord) WHERE p.id = t.id;
  ELSIF _table = 'gallery_photos' THEN
    UPDATE public.gallery_photos g SET sort = t.ord FROM unnest(_ids) WITH ORDINALITY AS t(id, ord) WHERE g.id = t.id;
  ELSE RAISE EXCEPTION 'invalid table'; END IF;
END $$;

-- Content tables: owner and titolare edit; titolare cannot touch technical keys (settings, owner).
DROP POLICY IF EXISTS "admin write packages" ON public.packages;
CREATE POLICY "staff write packages" ON public.packages FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
DROP POLICY IF EXISTS "public read visible packages" ON public.packages;
CREATE POLICY "public read visible packages" ON public.packages FOR SELECT TO anon, authenticated USING (visible OR public.can_edit(auth.uid()));

DROP POLICY IF EXISTS "admin write photos" ON public.gallery_photos;
CREATE POLICY "staff write photos" ON public.gallery_photos FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
DROP POLICY IF EXISTS "public read photos" ON public.gallery_photos;
CREATE POLICY "public read photos" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (((NOT hidden) AND category = ANY (ARRAY['safari','mare','persone'])) OR public.can_edit(auth.uid()));

DROP POLICY IF EXISTS "admin write content" ON public.site_content;
CREATE POLICY "staff write content" ON public.site_content FOR ALL TO authenticated
  USING (public.is_owner(auth.uid()) OR (public.can_edit(auth.uid()) AND key = ANY (ARRAY['home','about','contact','gallery','faq','info','headers'])))
  WITH CHECK (public.is_owner(auth.uid()) OR (public.can_edit(auth.uid()) AND key = ANY (ARRAY['home','about','contact','gallery','faq','info','headers'])));
DROP POLICY IF EXISTS "public read content" ON public.site_content;
CREATE POLICY "public read content" ON public.site_content FOR SELECT TO anon, authenticated
  USING (key = ANY (ARRAY['home','about','contact','gallery','faq','info','settings','owner','headers']) OR public.can_edit(auth.uid()));

DROP POLICY IF EXISTS "admin insert log" ON public.audit_log;
CREATE POLICY "staff insert log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "admin read log" ON public.audit_log;
CREATE POLICY "owner read log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_owner(auth.uid()));

DROP POLICY IF EXISTS "admin upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "admin update gallery" ON storage.objects;
DROP POLICY IF EXISTS "admin delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "admin read gallery" ON storage.objects;
CREATE POLICY "staff upload gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND public.can_edit(auth.uid()));
CREATE POLICY "staff update gallery" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND public.can_edit(auth.uid()));
CREATE POLICY "staff delete gallery" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND public.can_edit(auth.uid()));
CREATE POLICY "staff read gallery" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'gallery' AND public.can_edit(auth.uid()));
