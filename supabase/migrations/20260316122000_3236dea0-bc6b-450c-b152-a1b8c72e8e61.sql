CREATE TABLE public.vagas_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mes integer NOT NULL,
  ano integer NOT NULL,
  tipo text NOT NULL DEFAULT 'semana',
  total_vagas integer NOT NULL DEFAULT 0,
  total_cargos integer NOT NULL DEFAULT 0,
  categorias jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mes, ano, tipo)
);

ALTER TABLE public.vagas_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vagas_historico" ON public.vagas_historico FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert vagas_historico" ON public.vagas_historico FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vagas_historico" ON public.vagas_historico FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vagas_historico" ON public.vagas_historico FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));