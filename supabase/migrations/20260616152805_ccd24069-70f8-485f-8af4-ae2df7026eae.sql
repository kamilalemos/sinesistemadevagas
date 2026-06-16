CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, u.email::text, ur.created_at
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_admin_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado. Peça para que ele crie a conta primeiro.';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN _uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode remover seu próprio acesso.';
  END IF;
  SELECT count(*) INTO _count FROM public.user_roles WHERE role = 'admin';
  IF _count <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador.';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admins() FROM public;
REVOKE ALL ON FUNCTION public.promote_admin_by_email(text) FROM public;
REVOKE ALL ON FUNCTION public.remove_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_admin_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin(uuid) TO authenticated;