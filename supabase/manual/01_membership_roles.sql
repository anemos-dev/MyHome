-- myhome-devで手動適用済みの初期設定。新しいDBで一度だけ実行する。
-- 既存DBへ再実行すると、作成者を再びadminにするため再実行しない。
begin;
alter table public.circle_memberships
  add column role text not null default 'member'
  constraint circle_memberships_role_check check (role in ('admin', 'member'));
update public.circle_memberships as membership
set role = 'admin'
from public.circles as circle
where membership.circle_id = circle.id
  and membership.user_id = circle.created_by;
commit;