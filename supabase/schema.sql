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
