-- Function to check if any admin exists
CREATE OR REPLACE FUNCTION public.is_setup_needed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
END;
$$;

-- Function to initialize the first admin
CREATE OR REPLACE FUNCTION public.initialize_admin(_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Ensure RLS allows the check
GRANT EXECUTE ON FUNCTION public.is_setup_needed() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_admin(UUID) TO authenticated;
