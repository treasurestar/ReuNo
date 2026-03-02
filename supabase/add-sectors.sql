-- ============================================================
-- Migration: Setores (departments) para organização de usuários
-- Executar no Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabela sectors
create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Trigger updated_at (reusa set_updated_at() já existente no schema)
create trigger trg_sectors_updated_at
  before update on public.sectors
  for each row execute function public.set_updated_at();

-- 3. Adicionar sector_id ao profiles
alter table public.profiles
  add column if not exists sector_id uuid references public.sectors(id)
  on delete set null;

create index if not exists idx_profiles_sector
  on public.profiles (sector_id) where sector_id is not null;

-- 4. RLS: autenticado lê, admin escreve
alter table public.sectors enable row level security;

drop policy if exists "Qualquer autenticado le setores" on public.sectors;
create policy "Qualquer autenticado le setores"
  on public.sectors for select to authenticated using (true);

drop policy if exists "Admin insere setores" on public.sectors;
create policy "Admin insere setores"
  on public.sectors for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin atualiza setores" on public.sectors;
create policy "Admin atualiza setores"
  on public.sectors for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin deleta setores" on public.sectors;
create policy "Admin deleta setores"
  on public.sectors for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
