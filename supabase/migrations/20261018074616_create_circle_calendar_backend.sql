create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.circle_memberships (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);
create index circle_memberships_user_id_idx on public.circle_memberships (user_id);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  event_date date not null,
  event_time time not null,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  category text not null check (category in ('work', 'personal', 'shared')),
  created_by uuid not null references auth.users(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index calendar_events_circle_date_time_idx on public.calendar_events (circle_id, event_date, event_time);

alter table public.circles enable row level security;
alter table public.circle_memberships enable row level security;
alter table public.calendar_events enable row level security;

revoke all on table public.circles, public.circle_memberships, public.calendar_events from anon, authenticated;
grant select on table public.circles, public.circle_memberships to authenticated;
grant select, insert, update on table public.calendar_events to authenticated;

create policy "members can view their circles"
  on public.circles for select to authenticated
  using (exists (
    select 1 from public.circle_memberships membership
    where membership.circle_id = circles.id
      and membership.user_id = (select auth.uid())
  ));

create policy "users can view their own memberships"
  on public.circle_memberships for select to authenticated
  using (user_id = (select auth.uid()));

create policy "members can view circle events"
  on public.calendar_events for select to authenticated
  using (exists (
    select 1 from public.circle_memberships membership
    where membership.circle_id = calendar_events.circle_id
      and membership.user_id = (select auth.uid())
  ));

create policy "members can create circle events"
  on public.calendar_events for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.circle_memberships membership
      where membership.circle_id = calendar_events.circle_id
        and membership.user_id = (select auth.uid())
    )
  );

create policy "members can edit circle events"
  on public.calendar_events for update to authenticated
  using (exists (
    select 1 from public.circle_memberships membership
    where membership.circle_id = calendar_events.circle_id
      and membership.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.circle_memberships membership
    where membership.circle_id = calendar_events.circle_id
      and membership.user_id = (select auth.uid())
  ));

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function private.set_updated_at();
