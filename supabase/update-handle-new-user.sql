-- Atualizar trigger handle_new_user para incluir sector_id e position_id
-- vindos do user_metadata no momento do signup

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, sector_id, position_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null),
    case
      when new.raw_user_meta_data ->> 'sector_id' is not null
           and new.raw_user_meta_data ->> 'sector_id' <> ''
      then (new.raw_user_meta_data ->> 'sector_id')::uuid
      else null
    end,
    case
      when new.raw_user_meta_data ->> 'position_id' is not null
           and new.raw_user_meta_data ->> 'position_id' <> ''
      then (new.raw_user_meta_data ->> 'position_id')::uuid
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer;
