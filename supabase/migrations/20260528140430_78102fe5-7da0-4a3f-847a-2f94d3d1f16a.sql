-- Drop tables and everything that depends on them (policies, functions, etc)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.vagas CASCADE;
DROP TABLE IF EXISTS public.vagas_historico CASCADE;
DROP TABLE IF EXISTS public.configuracoes CASCADE;

-- Drop the function with cascade to remove all policies that use it
DROP FUNCTION IF EXISTS public.has_role CASCADE;

-- Drop the role type if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        DROP TYPE public.app_role CASCADE;
    END IF;
END $$;
