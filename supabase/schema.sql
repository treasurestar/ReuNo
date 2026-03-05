-- ============================================================
-- REUNÔ — Schema completo do banco de dados
-- Execute este arquivo no Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSÕES
-- ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null unique,
  avatar_url text,
  role       text not null default 'user'
             check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfis de usuários, estende auth.users';

-- ────────────────────────────────────────────────────────────
-- 2. ROOM_CONFIG (singleton)
-- ────────────────────────────────────────────────────────────
create table public.room_config (
  id               int primary key default 1 check (id = 1),
  name             text not null default 'Sala de Reuniões',
  min_participants int not null default 3,
  max_capacity     int not null default 12,
  open_time        time not null default '08:00',
  close_time       time not null default '19:00',
  timezone         text not null default 'America/Sao_Paulo',
  allow_weekends   boolean not null default false,
  amenities        jsonb not null default '["TV Samsung", "Videoconferência", "Internet"]'::jsonb,
  updated_at       timestamptz not null default now()
);

comment on table public.room_config is 'Configuração da sala única — sempre 1 linha';

-- Seed: insere a configuração inicial
insert into public.room_config (id) values (1);

-- ────────────────────────────────────────────────────────────
-- 3. MEETING_SERIES (recorrência)
-- ────────────────────────────────────────────────────────────
create table public.meeting_series (
  id              uuid primary key default gen_random_uuid(),
  frequency       text not null
                  check (frequency in ('daily', 'weekly', 'biweekly', 'monthly')),
  days_of_week    int[]           default '{}',
  recurrence_interval int not null default 1,
  ends_at         date,
  max_occurrences int,
  created_by      uuid not null references public.profiles(id),
  created_at      timestamptz not null default now()
);

comment on table public.meeting_series is 'Regras de recorrência para séries de reuniões';

-- ────────────────────────────────────────────────────────────
-- 4. MEETINGS
-- ────────────────────────────────────────────────────────────
create table public.meetings (
  id                    uuid primary key default gen_random_uuid(),
  series_id             uuid references public.meeting_series(id) on delete set null,
  title                 text not null,
  description           text,
  date                  date not null,
  start_time            time not null,
  end_time              time not null,
  duration_minutes      int not null,
  expected_participants int not null check (expected_participants >= 1),
  actual_participants   int,
  status                text not null default 'scheduled'
                        check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by            uuid not null references public.profiles(id),
  cancelled_by          uuid references public.profiles(id),
  cancelled_at          timestamptz,
  sync_outlook          boolean not null default false,
  outlook_event_id      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint meetings_time_order check (end_time > start_time)
);

comment on table public.meetings is 'Cada reunião individual (avulsa ou ocorrência de série)';

-- ────────────────────────────────────────────────────────────
-- 5. MEETING_PARTICIPANTS
-- ────────────────────────────────────────────────────────────
create table public.meeting_participants (
  id           uuid primary key default gen_random_uuid(),
  meeting_id   uuid not null references public.meetings(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  guest_name   text,
  guest_email  text,
  invite_token uuid unique default gen_random_uuid(),
  status       text not null default 'pending'
               check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  is_organizer boolean not null default false,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at   timestamptz not null default now(),

  constraint participant_identity check (user_id is not null or guest_name is not null)
);

comment on table public.meeting_participants is 'Participantes por reunião — registrados ou visitantes';

-- ────────────────────────────────────────────────────────────
-- 6. MEETING_NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
create table public.meeting_notifications (
  id             uuid primary key default gen_random_uuid(),
  meeting_id     uuid not null references public.meetings(id) on delete cascade,
  minutes_before int not null,
  scheduled_for  timestamptz not null,
  sent           boolean not null default false,
  sent_at        timestamptz,
  created_at     timestamptz not null default now()
);

comment on table public.meeting_notifications is 'Lembretes agendados antes de cada reunião';


-- ============================================================
-- INDEXES
-- ============================================================

-- Disponibilidade / agenda do dia
create index idx_meetings_date_time     on public.meetings (date, start_time);
-- Minhas reuniões
create index idx_meetings_created_by    on public.meetings (created_by);
-- Filtrar por status
create index idx_meetings_status        on public.meetings (status);
-- Buscar ocorrências de uma série
create index idx_meetings_series        on public.meetings (series_id) where series_id is not null;
-- Participantes de uma reunião
create index idx_participants_meeting   on public.meeting_participants (meeting_id);
-- Reuniões de um usuário
create index idx_participants_user      on public.meeting_participants (user_id) where user_id is not null;
-- Confirmação por link (visitante)
create index idx_participants_token     on public.meeting_participants (invite_token);
-- Cron de notificações
create index idx_notifications_pending  on public.meeting_notifications (scheduled_for, sent) where sent = false;


-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- ── updated_at automático ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_meetings_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();

create trigger trg_room_config_updated_at
  before update on public.room_config
  for each row execute function public.set_updated_at();

-- ── Criar profile automaticamente ao signup ─────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Impedir sobreposição de horários ────────────────────────
create or replace function public.check_meeting_overlap()
returns trigger as $$
begin
  if new.status = 'cancelled' then
    return new;
  end if;

  if exists (
    select 1 from public.meetings
    where id != new.id
      and date = new.date
      and status != 'cancelled'
      and (new.start_time, new.end_time) overlaps (start_time, end_time)
  ) then
    raise exception 'Já existe uma reunião neste horário. Escolha outro slot.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_meetings_no_overlap
  before insert or update on public.meetings
  for each row execute function public.check_meeting_overlap();

-- ── Validar horário de funcionamento e fins de semana ────────
create or replace function public.check_room_hours()
returns trigger as $$
declare
  cfg public.room_config;
  day_of_week int;
begin
  if new.status = 'cancelled' then
    return new;
  end if;

  select * into cfg from public.room_config where id = 1;

  -- Verifica horário
  if new.start_time < cfg.open_time or new.end_time > cfg.close_time then
    raise exception 'Horário fora do funcionamento da sala (% - %).', cfg.open_time, cfg.close_time;
  end if;

  -- Verifica fim de semana (0 = domingo, 6 = sábado no extract dow)
  day_of_week := extract(dow from new.date);
  if not cfg.allow_weekends and day_of_week in (0, 6) then
    raise exception 'A sala não está disponível nos fins de semana.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_meetings_room_hours
  before insert or update on public.meetings
  for each row execute function public.check_room_hours();

-- ── Confirmar presença de visitante via token ────────────────
create or replace function public.confirm_guest_presence(p_token uuid, p_guest_name text default null)
returns json as $$
declare
  v_participant public.meeting_participants;
begin
  select * into v_participant
  from public.meeting_participants
  where invite_token = p_token;

  if not found then
    raise exception 'Token de convite inválido.';
  end if;

  if v_participant.status in ('confirmed', 'cancelled') then
    raise exception 'Este convite já foi % .', v_participant.status;
  end if;

  update public.meeting_participants
  set
    status = 'confirmed',
    confirmed_at = now(),
    guest_name = coalesce(p_guest_name, guest_name)
  where id = v_participant.id;

  return json_build_object(
    'success', true,
    'meeting_id', v_participant.meeting_id,
    'participant_id', v_participant.id
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ── PROFILES ────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Qualquer autenticado lê profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Admin gerencia qualquer perfil"
  on public.profiles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── ROOM_CONFIG ─────────────────────────────────────────────
alter table public.room_config enable row level security;

create policy "Qualquer autenticado lê config da sala"
  on public.room_config for select
  to authenticated
  using (true);

create policy "Apenas admin edita config da sala"
  on public.room_config for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── MEETING_SERIES ──────────────────────────────────────────
alter table public.meeting_series enable row level security;

create policy "Qualquer autenticado lê séries"
  on public.meeting_series for select
  to authenticated
  using (true);

create policy "Autenticado cria série"
  on public.meeting_series for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Criador ou admin gerencia série"
  on public.meeting_series for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Criador ou admin deleta série"
  on public.meeting_series for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── MEETINGS ────────────────────────────────────────────────
alter table public.meetings enable row level security;

create policy "Qualquer autenticado lê reuniões"
  on public.meetings for select
  to authenticated
  using (true);

create policy "Autenticado cria reunião"
  on public.meetings for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Criador ou admin edita reunião"
  on public.meetings for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Criador ou admin deleta reunião"
  on public.meetings for delete
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── MEETING_PARTICIPANTS ────────────────────────────────────
alter table public.meeting_participants enable row level security;

create policy "Qualquer autenticado lê participantes"
  on public.meeting_participants for select
  to authenticated
  using (true);

create policy "Criador da reunião adiciona participantes"
  on public.meeting_participants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.meetings
      where id = meeting_id and created_by = auth.uid()
    )
  );

create policy "Participante atualiza própria participação"
  on public.meeting_participants for update
  to authenticated
  using (user_id = auth.uid());

create policy "Criador ou admin gerencia participantes"
  on public.meeting_participants for all
  to authenticated
  using (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_id
        and (
          m.created_by = auth.uid()
          or exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
          )
        )
    )
  );

-- ── MEETING_NOTIFICATIONS ───────────────────────────────────
alter table public.meeting_notifications enable row level security;

create policy "Participante lê notificações da sua reunião"
  on public.meeting_notifications for select
  to authenticated
  using (
    exists (
      select 1 from public.meeting_participants mp
      where mp.meeting_id = meeting_id
        and mp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.meetings m
      where m.id = meeting_id
        and m.created_by = auth.uid()
    )
  );

create policy "Criador da reunião gerencia notificações"
  on public.meeting_notifications for insert
  to authenticated
  with check (
    exists (
      select 1 from public.meetings
      where id = meeting_id and created_by = auth.uid()
    )
  );

create policy "Criador ou admin edita notificações"
  on public.meeting_notifications for update
  to authenticated
  using (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_id
        and (
          m.created_by = auth.uid()
          or exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
          )
        )
    )
  );

create policy "Criador ou admin deleta notificações"
  on public.meeting_notifications for delete
  to authenticated
  using (
    exists (
      select 1 from public.meetings m
      where m.id = meeting_id
        and (
          m.created_by = auth.uid()
          or exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
          )
        )
    )
  );
