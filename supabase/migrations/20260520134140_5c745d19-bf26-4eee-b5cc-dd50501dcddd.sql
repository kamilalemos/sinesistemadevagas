-- Update is_setup_needed with security best practices
CREATE OR REPLACE FUNCTION public.is_setup_needed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
END;
$$;

-- Update initialize_admin with security best practices
CREATE OR REPLACE FUNCTION public.initialize_admin(_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if no admins exist yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin');
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Revoke all permissions first
REVOKE ALL ON FUNCTION public.is_setup_needed() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.initialize_admin(UUID) FROM PUBLIC;

-- Grant specifically to anon and authenticated
GRANT EXECUTE ON FUNCTION public.is_setup_needed() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_admin(UUID) TO authenticated;
