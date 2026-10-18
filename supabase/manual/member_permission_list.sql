-- 前提: circle_memberships.role と change_member_role は適用済み。
-- データ・権限の値は変更しない。管理者用の一覧取得処理を追加する。
begin;
create or replace function myhome_private.list_circle_members(p_circle_id uuid)
returns table(user_id uuid, role text, display_name text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.circle_memberships m
    where m.circle_id = p_circle_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  ) then
    raise exception '管理者だけがメンバー一覧を取得できます' using errcode = '42501';
  end if;
  return query
    select m.user_id, m.role, p.display_name
    from public.circle_memberships m
    left join public.profiles p on p.user_id = m.user_id
    where m.circle_id = p_circle_id
    order by m.created_at, m.user_id;
end;
$$;
create or replace function public.list_circle_members(p_circle_id uuid)
returns table(user_id uuid, role text, display_name text)
language sql
security invoker
set search_path = ''
as $$
  select * from myhome_private.list_circle_members(p_circle_id);
$$;
revoke all on function myhome_private.list_circle_members(uuid) from public, anon;
revoke all on function public.list_circle_members(uuid) from public, anon;
grant usage on schema myhome_private to authenticated;
grant execute on function myhome_private.list_circle_members(uuid) to authenticated;
grant execute on function public.list_circle_members(uuid) to authenticated;
create or replace function myhome_private.list_my_circles()
returns table(id uuid, name text, role text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'ログインが必要です' using errcode = '42501';
  end if;
  return query
    select c.id, c.name, m.role
    from public.circle_memberships m
    join public.circles c on c.id = m.circle_id
    where m.user_id = auth.uid()
    order by c.name, c.id;
end;
$$;
create or replace function public.list_my_circles()
returns table(id uuid, name text, role text)
language sql
security invoker
set search_path = ''
as $$
  select * from myhome_private.list_my_circles();
$$;
revoke all on function myhome_private.list_my_circles() from public, anon;
revoke all on function public.list_my_circles() from public, anon;
grant execute on function myhome_private.list_my_circles() to authenticated;
grant execute on function public.list_my_circles() to authenticated;
commit;