
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create vagas table
CREATE TABLE public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qtd INTEGER NOT NULL,
  cbo TEXT,
  cargo TEXT NOT NULL,
  escolaridade TEXT NOT NULL DEFAULT 'Não informado',
  experiencia TEXT NOT NULL DEFAULT 'Não informada',
  descricao TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL DEFAULT 'Serviços',
  tipo TEXT NOT NULL DEFAULT 'semana' CHECK (tipo IN ('semana', 'feirao')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

-- Public can read vagas
CREATE POLICY "Anyone can read vagas"
  ON public.vagas FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert vagas"
  ON public.vagas FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vagas"
  ON public.vagas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vagas"
  ON public.vagas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create configuracoes table for period settings
CREATE TABLE public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Public can read config
CREATE POLICY "Anyone can read configuracoes"
  ON public.configuracoes FOR SELECT USING (true);

-- Only admins can modify config
CREATE POLICY "Admins can insert configuracoes"
  ON public.configuracoes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update configuracoes"
  ON public.configuracoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default config values
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('periodo_inicio', '09/03/2026'),
  ('periodo_fim', '13/03/2026'),
  ('feirao_titulo', 'Feirão da Empregabilidade 2026');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vagas_updated_at
  BEFORE UPDATE ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
