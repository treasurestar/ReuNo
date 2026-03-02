-- ============================================================
-- REUNÔ — Promover usuário a admin
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- PASSO 1: Altere o email abaixo para o email do seu admin
-- ────────────────────────────────────────────────────────────
UPDATE profiles
SET role = 'admin'
WHERE email = 'SEU_EMAIL_AQUI';

-- Para verificar se funcionou:
SELECT id, email, full_name, role FROM profiles;

-- ============================================================
-- PASSO 2: Policies de admin (só precisa executar uma vez)
-- ────────────────────────────────────────────────────────────

-- Remove policies antigas caso existam (evita erro de duplicata)
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

-- Admin pode atualizar qualquer perfil (promover/rebaixar)
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin pode deletar qualquer perfil
CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
