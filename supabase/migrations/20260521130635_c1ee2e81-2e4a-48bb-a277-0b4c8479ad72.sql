-- Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portal_assets', 'portal_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso

-- 1. Permitir leitura pública
CREATE POLICY "Leitura Pública" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portal_assets');

-- 2. Permitir que admins autenticados façam upload
CREATE POLICY "Admins podem upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'portal_assets' AND 
  auth.role() = 'authenticated'
);

-- 3. Permitir que admins autenticados atualizem
CREATE POLICY "Admins podem atualizar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'portal_assets' AND 
  auth.role() = 'authenticated'
);

-- 4. Permitir que admins autenticados deletem
CREATE POLICY "Admins podem deletar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'portal_assets' AND 
  auth.role() = 'authenticated'
);