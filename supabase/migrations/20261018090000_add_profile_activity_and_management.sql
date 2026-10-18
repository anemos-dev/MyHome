create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 50),
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table public.activity_records (
  event_id uuid primary key references public.calendar_events(id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 10000),
  reflection text not null default '' check (char_length(reflection) <= 10000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activity_records enable row level security;
revoke all on table public.profiles, public.activity_records from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.activity_records to authenticated;
grant delete on table public.calendar_events to authenticated;

create policy "users manage their profile"
  on public.profiles for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "members view activity records"
  on public.activity_records for select to authenticated
  using (exists (
    select 1 from public.calendar_events event
    join public.circle_memberships membership on membership.circle_id = event.circle_id
    where event.id = activity_records.event_id
      and membership.user_id = (select auth.uid())
  ));

create policy "members create activity records"
  on public.activity_records for insert to authenticated
  with check (created_by = (select auth.uid()) and updated_by = (select auth.uid()) and exists (
    select 1 from public.calendar_events event
    join public.circle_memberships membership on membership.circle_id = event.circle_id
    where event.id = activity_records.event_id
      and membership.user_id = (select auth.uid())
  ));

create policy "members update activity records"
  on public.activity_records for update to authenticated
  using (exists (
    select 1 from public.calendar_events event
    join public.circle_memberships membership on membership.circle_id = event.circle_id
    where event.id = activity_records.event_id
      and membership.user_id = (select auth.uid())
  ))
  with check (updated_by = (select auth.uid()) and exists (
    select 1 from public.calendar_events event
    join public.circle_memberships membership on membership.circle_id = event.circle_id
    where event.id = activity_records.event_id
      and membership.user_id = (select auth.uid())
  ));

create policy "members can delete circle events"
  on public.calendar_events for delete to authenticated
  using (exists (
    select 1 from public.circle_memberships membership
    where membership.circle_id = calendar_events.circle_id
      and membership.user_id = (select auth.uid())
  ));

create policy "circle creators manage memberships"
  on public.circle_memberships for all to authenticated
  using (exists (
    select 1 from public.circles circle_row
    where circle_row.id = circle_memberships.circle_id
      and circle_row.created_by = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.circles circle_row
    where circle_row.id = circle_memberships.circle_id
      and circle_row.created_by = (select auth.uid())
  ));
