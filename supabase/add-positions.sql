-- ============================================================
-- Migration: Cargos (positions) vinculados a setores
-- Executar no Supabase Dashboard > SQL Editor
-- Pré-requisito: add-sectors.sql já executado
-- ============================================================

-- 1. Tabela positions (cargos por setor)
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references public.sectors(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (sector_id, name)
);

-- 2. Adicionar position_id ao profiles
alter table public.profiles
  add column if not exists position_id uuid references public.positions(id)
  on delete set null;

-- 3. RLS: autenticado lê, admin escreve
alter table public.positions enable row level security;

drop policy if exists "Autenticado le cargos" on public.positions;
create policy "Autenticado le cargos"
  on public.positions for select to authenticated using (true);

drop policy if exists "Admin insere cargos" on public.positions;
create policy "Admin insere cargos"
  on public.positions for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin atualiza cargos" on public.positions;
create policy "Admin atualiza cargos"
  on public.positions for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin deleta cargos" on public.positions;
create policy "Admin deleta cargos"
  on public.positions for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
