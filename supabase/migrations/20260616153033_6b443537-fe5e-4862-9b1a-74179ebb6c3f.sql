-- 1. Add new columns
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS permissions text[] NOT NULL DEFAULT ARRAY['dashboard','cadastro-vagas','visibilidade','historico','admins','configuracoes']::text[],
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 2. has_role respects expiration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 3. New helper for permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND (expires_at IS NULL OR expires_at > now())
      AND _permission = ANY(permissions)
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;

-- 4. list_admins now returns permissions & expires_at
DROP FUNCTION IF EXISTS public.list_admins();
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  permissions text[],
  expires_at timestamptz
)
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
    SELECT ur.user_id, u.email::text, ur.created_at, ur.permissions, ur.expires_at
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

-- 5. promote with permissions/expiration
DROP FUNCTION IF EXISTS public.promote_admin_by_email(text);
CREATE OR REPLACE FUNCTION public.promote_admin_by_email(
  _email text,
  _permissions text[] DEFAULT NULL,
  _expires_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _perms text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email)) LIMIT 1;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado. Peça para que ele crie a conta primeiro.';
  END IF;
  _perms := COALESCE(_permissions, ARRAY['dashboard','cadastro-vagas','visibilidade','historico','admins','configuracoes']::text[]);

  INSERT INTO public.user_roles (user_id, role, permissions, expires_at)
  VALUES (_uid, 'admin', _perms, _expires_at)
  ON CONFLICT (user_id, role) DO UPDATE
    SET permissions = EXCLUDED.permissions,
        expires_at = EXCLUDED.expires_at;
  RETURN _uid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.promote_admin_by_email(text, text[], timestamptz) TO authenticated;

-- 6. update permissions / expiration of an existing admin
CREATE OR REPLACE FUNCTION public.update_admin(
  _user_id uuid,
  _permissions text[],
  _expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  UPDATE public.user_roles
    SET permissions = COALESCE(_permissions, permissions),
        expires_at = _expires_at
    WHERE user_id = _user_id AND role = 'admin';
  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_admin(uuid, text[], timestamptz) TO authenticated;