-- Run this whole file in the Supabase SQL editor (safe to re-run).
--
-- Kids use an anonymous random session id: no emails, surnames or logins are stored.
-- The tables are locked: Row Level Security is on with NO policies, so the public
-- (publishable) key cannot read, list or edit them directly.
-- The app only talks to them through the three functions below, and each function
-- needs the row's unguessable id, so nobody can browse other kids' data.

create table if not exists kid_sessions (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists shared_plans (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table kid_sessions enable row level security;
alter table shared_plans enable row level security;

-- Remove any open policies from earlier experiments.
drop policy if exists "open" on kid_sessions;
drop policy if exists "open" on shared_plans;

-- Save (create or update) one kid's session. Needs the session UUID.
create or replace function save_session(p_id text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_id !~ '^[0-9a-fA-F-]{36}$' then
    raise exception 'invalid session id';
  end if;
  if length(p_data::text) > 200000 then
    raise exception 'session data too large';
  end if;
  insert into kid_sessions (id, data, updated_at)
  values (p_id, p_data, now())
  on conflict (id) do update set data = excluded.data, updated_at = now();
end;
$$;

-- Create a read-only shared plan. Insert only: an existing plan can never be overwritten.
create or replace function create_shared_plan(p_id text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_id !~ '^[A-Za-z0-9_-]{6,40}$' then
    raise exception 'invalid plan id';
  end if;
  if length(p_data::text) > 5000 then
    raise exception 'plan too large';
  end if;
  insert into shared_plans (id, data) values (p_id, p_data);
end;
$$;

-- Read one shared plan by its id (the share link). Returns null if not found.
create or replace function get_shared_plan(p_id text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select data from shared_plans where id = p_id;
$$;

revoke all on function save_session(text, jsonb) from public;
revoke all on function create_shared_plan(text, jsonb) from public;
revoke all on function get_shared_plan(text) from public;
grant execute on function save_session(text, jsonb) to anon, authenticated;
grant execute on function create_shared_plan(text, jsonb) to anon, authenticated;
grant execute on function get_shared_plan(text) to anon, authenticated;

-- =====================================================================
-- Accounts: adults (parents/teachers) sign up with Supabase Auth.
-- Each adult owns kid profiles. Kids sign in with a join code + 4-digit PIN
-- (no email needed) and their progress is saved to their profile.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

create table if not exists kids (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  grade int check (grade between 1 and 12),
  join_code text not null unique,
  pin_hash text not null,
  secret uuid not null default gen_random_uuid(), -- held by the kid's device after sign-in
  failed_attempts int not null default 0,
  locked_until timestamptz,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists kids_owner_idx on kids (owner_id);

alter table kids enable row level security;

drop policy if exists "owners manage their kids" on kids;
create policy "owners manage their kids" on kids
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- A short, easy-to-type join code like OWL-7K3Q2 (no confusing 0/O/1/I).
create or replace function make_join_code()
returns text
language plpgsql
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := 'OWL-';
    for i in 1..5 loop
      code := code || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % length(alphabet)), 1);
    end loop;
    exit when not exists (select 1 from kids where join_code = code);
  end loop;
  return code;
end;
$$;

-- Adult creates a kid profile (hashes the PIN, makes the join code).
create or replace function create_kid(p_nickname text, p_grade int, p_pin text, p_data jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  k kids;
begin
  if uid is null then raise exception 'sign in first'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must be 4 digits'; end if;
  if char_length(trim(p_nickname)) not between 1 and 20 then raise exception 'nickname must be 1 to 20 characters'; end if;
  if (select count(*) from kids where owner_id = uid) >= 40 then raise exception 'too many kid profiles'; end if;
  if length(coalesce(p_data, '{}'::jsonb)::text) > 200000 then raise exception 'data too large'; end if;

  insert into kids (owner_id, nickname, grade, join_code, pin_hash, data)
  values (uid, trim(p_nickname), p_grade, make_join_code(), crypt(p_pin, gen_salt('bf')), coalesce(p_data, '{}'::jsonb))
  returning * into k;

  return jsonb_build_object('id', k.id, 'join_code', k.join_code);
end;
$$;

-- Adult changes a kid's PIN and signs the kid out everywhere (new secret).
create or replace function set_kid_pin(p_kid uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must be 4 digits'; end if;
  update kids
     set pin_hash = crypt(p_pin, gen_salt('bf')), secret = gen_random_uuid(),
         failed_attempts = 0, locked_until = null
   where id = p_kid and owner_id = auth.uid();
  if not found then raise exception 'not allowed'; end if;
end;
$$;

-- Kid signs in with join code + PIN. Returns null for a wrong code or PIN.
-- 5 wrong PINs lock that profile for 15 minutes.
create or replace function kid_sign_in(p_code text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  k kids;
begin
  select * into k from kids where join_code = upper(trim(p_code));
  if not found then return null; end if;

  if k.locked_until is not null and k.locked_until > now() then
    raise exception 'locked';
  end if;

  if k.pin_hash = crypt(p_pin, k.pin_hash) then
    update kids set failed_attempts = 0, locked_until = null where id = k.id;
    return jsonb_build_object('kid_id', k.id, 'secret', k.secret, 'nickname', k.nickname, 'data', k.data);
  end if;

  update kids
     set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
         locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end
   where id = k.id;
  return null;
end;
$$;

-- Signed-in kid saves their progress. Needs the kid's id AND secret.
create or replace function kid_save(p_kid uuid, p_secret uuid, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(p_data::text) > 200000 then raise exception 'data too large'; end if;
  update kids set data = p_data, updated_at = now() where id = p_kid and secret = p_secret;
  if not found then raise exception 'not allowed'; end if;
end;
$$;

revoke all on function make_join_code() from public;
revoke all on function create_kid(text, int, text, jsonb) from public;
revoke all on function set_kid_pin(uuid, text) from public;
revoke all on function kid_sign_in(text, text) from public;
revoke all on function kid_save(uuid, uuid, jsonb) from public;

grant execute on function create_kid(text, int, text, jsonb) to authenticated;
grant execute on function set_kid_pin(uuid, text) to authenticated;
grant execute on function kid_sign_in(text, text) to anon, authenticated;
grant execute on function kid_save(uuid, uuid, jsonb) to anon, authenticated;
