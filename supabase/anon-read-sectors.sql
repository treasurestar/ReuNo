-- Permitir leitura anônima de setores e cargos
-- Necessário para a tela de registro (usuário ainda não autenticado)

drop policy if exists "Anon le setores" on public.sectors;
create policy "Anon le setores"
  on public.sectors for select to anon using (true);

drop policy if exists "Anon le cargos" on public.positions;
create policy "Anon le cargos"
  on public.positions for select to anon using (true);
