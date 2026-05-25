
-- 1. Restrict storage policies on portal_assets to admins
DROP POLICY IF EXISTS "Admins podem atualizar" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem upload" ON storage.objects;

CREATE POLICY "Admins can upload portal_assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portal_assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update portal_assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'portal_assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete portal_assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'portal_assets' AND public.has_role(auth.uid(), 'admin'));

-- 2. Restrict configuracoes SELECT to admins only (table is internal)
DROP POLICY IF EXISTS "Anyone can read configuracoes" ON public.configuracoes;
CREATE POLICY "Admins can read configuracoes"
ON public.configuracoes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated
-- has_role is only invoked from within RLS policies (definer context); no caller EXECUTE needed
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.initialize_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_setup_needed() FROM PUBLIC, anon, authenticated;
