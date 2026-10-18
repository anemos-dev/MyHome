-- myhome-devで手動適用済みの権限変更処理。データ削除は行わない。
begin;
create schema if not exists myhome_private;
revoke all on schema myhome_private from public;
grant usage on schema myhome_private to authenticated;
create function myhome_private.change_member_role(p_circle_id uuid, p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_old_role text;
begin
  if v_actor is null then
    raise exception 'ログインが必要です';
  end if;
  if p_role is null or p_role not in ('admin', 'member') then
    raise exception '権限の指定が不正です';
  end if;
  perform 1 from public.circles where id = p_circle_id for update;
  if not found then
    raise exception '操作できません';
  end if;
  if not exists (
    select 1 from public.circle_memberships
    where circle_id = p_circle_id and user_id = v_actor and role = 'admin'
  ) then
    raise exception '管理者だけが変更できます';
  end if;
  select role into v_old_role from public.circle_memberships
  where circle_id = p_circle_id and user_id = p_user_id for update;
  if not found then
    raise exception '対象メンバーが見つかりません';
  end if;
  if v_old_role = 'admin' and p_role = 'member' then
    if (select count(*) from public.circle_memberships
        where circle_id = p_circle_id and role = 'admin') <= 1 then
      raise exception '最後の管理者は外せません';
    end if;
  end if;
  update public.circle_memberships set role = p_role
  where circle_id = p_circle_id and user_id = p_user_id;
end;
$$;
create function public.change_member_role(p_circle_id uuid, p_user_id uuid, p_role text)
returns void
language sql
security invoker
set search_path = ''
as $$
  select myhome_private.change_member_role(p_circle_id, p_user_id, p_role);
$$;
revoke all on function myhome_private.change_member_role(uuid, uuid, text) from public, anon;
grant execute on function myhome_private.change_member_role(uuid, uuid, text) to authenticated;
revoke all on function public.change_member_role(uuid, uuid, text) from public, anon;
grant execute on function public.change_member_role(uuid, uuid, text) to authenticated;
revoke insert, update, delete on public.circle_memberships from anon, authenticated;
commit;