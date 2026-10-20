-- Run this whole file in the Supabase SQL editor (safe to re-run).
--
-- Everyone must sign in to use the app. Shared plans are the one public thing:
-- a read-only page for family or a teacher, opened with an unguessable link.
-- The tables are locked: Row Level Security is on with NO open policies, so the
-- public (publishable) key cannot read, list or edit them directly.
-- The app only talks to shared_plans through the functions below, and each function
-- needs the row's unguessable id, so nobody can browse other people's data.

-- The old anonymous "try it without an account" mode is gone.
drop function if exists save_session(text, jsonb);
drop table if exists kid_sessions;

create table if not exists shared_plans (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table shared_plans enable row level security;

-- Remove any open policies from earlier experiments.
drop policy if exists "open" on shared_plans;

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

revoke all on function create_shared_plan(text, jsonb) from public;
revoke all on function get_shared_plan(text) from public;
grant execute on function create_shared_plan(text, jsonb) to anon, authenticated;
grant execute on function get_shared_plan(text) to anon, authenticated;

-- =====================================================================
-- Accounts: one simple sign-up / sign-in (Supabase Auth, email + password).
-- Each person's quiz answers, job ideas and plan are saved in their own row.
-- Row Level Security lets a signed-in person read and write ONLY their own row.
-- =====================================================================

create table if not exists progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table progress enable row level security;

drop policy if exists "people manage their own progress" on progress;
create policy "people manage their own progress" on progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Stop anyone dumping huge JSON into their row.
alter table progress drop constraint if exists progress_data_size;
alter table progress add constraint progress_data_size check (length(data::text) < 200000);

-- Clean up the earlier student / parent / teacher design (safe to re-run).
drop function if exists kid_check(uuid, uuid);
drop function if exists kid_save(uuid, uuid, jsonb);
drop function if exists kid_sign_in(text, text);
drop function if exists set_kid_pin(uuid, text);
drop function if exists create_kid(text, int, text, jsonb);
drop function if exists make_join_code();
drop table if exists kids;
