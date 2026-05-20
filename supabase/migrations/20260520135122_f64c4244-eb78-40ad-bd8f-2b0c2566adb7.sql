-- Add new columns for manual job registration
ALTER TABLE public.vagas 
ADD COLUMN IF NOT EXISTS salario TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS beneficios TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS publicada BOOLEAN DEFAULT true;

-- Update RLS policies to ensure 'publicada' is respected for public reads if necessary
-- Current policy: POLICY "Anyone can read vagas" FOR SELECT USING (true)
-- We should update it to only allow public to read published jobs, 
-- but keep it accessible for admins even if not published.

DROP POLICY IF EXISTS "Anyone can read vagas" ON public.vagas;

CREATE POLICY "Anyone can read published vagas" 
ON public.vagas 
FOR SELECT 
USING (
  publicada = true 
  OR 
  (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
);
