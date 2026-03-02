-- ============================================================
-- REUNÔ — Link único de confirmação por reunião
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1) Adiciona token único na reunião
alter table public.meetings
  add column if not exists invite_token uuid unique default gen_random_uuid();

-- 2) Função para confirmar presença via token da reunião
create or replace function public.confirm_meeting_presence(
  p_meeting_token uuid,
  p_user_id uuid default null,
  p_guest_name text default null,
  p_guest_email text default null
) returns json as $$
declare
  v_meeting public.meetings;
  v_participant public.meeting_participants;
begin
  select * into v_meeting
  from public.meetings
  where invite_token = p_meeting_token;

  if not found then
    raise exception 'Token de reunião inválido.';
  end if;

  if v_meeting.status = 'cancelled' then
    raise exception 'Esta reunião foi cancelada.';
  end if;

  if p_user_id is null and (p_guest_name is null or length(trim(p_guest_name)) = 0) then
    raise exception 'Nome do visitante é obrigatório.';
  end if;

  if p_user_id is not null then
    select * into v_participant
    from public.meeting_participants
    where meeting_id = v_meeting.id and user_id = p_user_id;

    if not found then
      insert into public.meeting_participants (meeting_id, user_id, status, confirmed_at)
      values (v_meeting.id, p_user_id, 'confirmed', now())
      returning * into v_participant;
    else
      update public.meeting_participants
      set status = 'confirmed', confirmed_at = now()
      where id = v_participant.id
      returning * into v_participant;
    end if;
  else
    if p_guest_email is not null and length(trim(p_guest_email)) > 0 then
      select * into v_participant
      from public.meeting_participants
      where meeting_id = v_meeting.id and guest_email = p_guest_email;
    else
      v_participant := null;
    end if;

    if v_participant is null then
      insert into public.meeting_participants (meeting_id, guest_name, guest_email, status, confirmed_at)
      values (v_meeting.id, p_guest_name, p_guest_email, 'confirmed', now())
      returning * into v_participant;
    else
      update public.meeting_participants
      set status = 'confirmed', confirmed_at = now(), guest_name = coalesce(p_guest_name, guest_name)
      where id = v_participant.id
      returning * into v_participant;
    end if;
  end if;

  return json_build_object(
    'success', true,
    'meeting_id', v_meeting.id,
    'participant_id', v_participant.id
  );
end;
$$ language plpgsql security definer;

revoke all on function public.confirm_meeting_presence(uuid, uuid, text, text) from public;
grant execute on function public.confirm_meeting_presence(uuid, uuid, text, text) to anon, authenticated;
