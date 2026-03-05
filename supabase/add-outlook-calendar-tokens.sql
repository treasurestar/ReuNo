-- ============================================================
-- Outlook Calendar OAuth tokens — uma linha por usuário
-- Execute no Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

create table if not exists public.outlook_calendar_tokens (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.outlook_calendar_tokens
  is 'Tokens OAuth do Outlook Calendar (Microsoft Graph) por usuário';

-- Trigger updated_at
create trigger trg_outlook_tokens_updated_at
  before update on public.outlook_calendar_tokens
  for each row execute function public.set_updated_at();

-- RLS
alter table public.outlook_calendar_tokens enable row level security;

drop policy if exists "User reads own outlook tokens" on public.outlook_calendar_tokens;
create policy "User reads own outlook tokens"
  on public.outlook_calendar_tokens for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "User inserts own outlook tokens" on public.outlook_calendar_tokens;
create policy "User inserts own outlook tokens"
  on public.outlook_calendar_tokens for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "User updates own outlook tokens" on public.outlook_calendar_tokens;
create policy "User updates own outlook tokens"
  on public.outlook_calendar_tokens for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "User deletes own outlook tokens" on public.outlook_calendar_tokens;
create policy "User deletes own outlook tokens"
  on public.outlook_calendar_tokens for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admin manages outlook tokens" on public.outlook_calendar_tokens;
create policy "Admin manages outlook tokens"
  on public.outlook_calendar_tokens for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
