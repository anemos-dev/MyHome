import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import './member-permissions.css';

type Circle = { id: string; name: string; role: 'admin' | 'member' };
type Member = { user_id: string; role: 'admin' | 'member'; display_name: string | null };
export function MemberPermissionsPage({ userId, onHome }: { userId?: string; onHome: () => void }) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [circleId, setCircleId] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const requestId = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    let active = true;
    if (!supabase || !userId) { setLoading(false); return; }
    const client = supabase;
    async function loadCircles() {
      try {
        const { data, error } = await client.rpc('list_my_circles');
        if (error) throw error;
        if (!active) return;
        setCircles(data ?? []);
        setCircleId(data?.[0]?.id ?? '');
        if (!data?.length) setLoading(false);
      } catch (cause) {
        if (active) { setError(cause instanceof Error ? cause.message : String((cause as { message?: string }).message ?? 'サークルを取得できませんでした。')); setLoading(false); }
      }
    }
    void loadCircles();
    return () => { active = false; };
  }, [userId]);
  useEffect(() => {
    let active = true;
    const id = ++requestId.current;
    if (!supabase || !userId || !circleId) return;
    const client = supabase;
    setLoading(true); setRole(null); setMembers([]); setError('');
    async function loadMembers() {
      try {
        const own = await client.rpc('list_my_circles');
        if (own.error) throw own.error;
        if (!active) return;
        setCircles(own.data ?? []);
        const ownCircle = (own.data as Circle[] | null)?.find(circle => circle.id === circleId);
        setRole(ownCircle?.role ?? null);
        if (ownCircle?.role === 'admin') {
          const result = await client.rpc('list_circle_members', { p_circle_id: circleId });
          if (result.error) throw result.error;
          if (active) setMembers(result.data ?? []);
        }
      } catch (cause) {
        if (active) setError(String((cause as { message?: string }).message ?? 'メンバーを取得できませんでした。'));
      } finally { if (active && id === requestId.current) setLoading(false); }
    }
    void loadMembers();
    return () => { active = false; };
  }, [circleId, userId, refresh]);
  async function changeRole(member: Member) {
    if (!supabase || role !== 'admin' || saving) return;
    const next = member.role === 'admin' ? 'member' : 'admin';
    if (!window.confirm(`${member.display_name || member.user_id}を${next === 'admin' ? '管理者' : 'メンバー'}に変更しますか？`)) return;
    setSaving(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.rpc('change_member_role', { p_circle_id: circleId, p_user_id: member.user_id, p_role: next });
      if (error) throw error;
      setNotice('権限を変更しました。');
    } catch (cause) {
      setError(String((cause as { message?: string }).message ?? '権限を変更できませんでした。'));
    } finally {
      setSaving(false);
      setRefresh(value => value + 1);
    }
  }
  const adminCount = members.filter(member => member.role === 'admin').length;
  return <section className="permissions-page" aria-labelledby="permissions-title">
    <button className="today-button" onClick={onHome}>‹ ホームに戻る</button>
    <h1 id="permissions-title" tabIndex={-1} ref={heading}>メンバー権限</h1>
    <p>管理者は、同じサークルのメンバーを管理者・メンバーに変更できます。予定はどちらの権限でも操作できます。</p>
    {!userId ? <p>ログインすると権限を確認できます。サンプル画面では変更できません。</p> : <>
      <label className="permissions-circle">サークル<select value={circleId} disabled={saving || !circles.length} onChange={event => { setNotice(''); setRole(null); setMembers([]); setLoading(true); setCircleId(event.target.value); }}>{circles.map(circle => <option key={circle.id} value={circle.id}>{circle.name}</option>)}</select></label>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <button className="today-button" disabled={loading || saving} onClick={() => setRefresh(value => value + 1)}>最新の権限を確認</button>
      {loading ? <p role="status">権限を確認中です…</p> : !circles.length ? <p>所属サークルがありません。取得エラーがある場合は設定を確認してください。</p> : role !== 'admin' ? <p>メンバーの権限変更は管理者だけが利用できます。</p> : <>
        <p>あなたの権限：管理者。最後の管理者は外せません。</p>
        <ul className="permissions-members">{members.map(member => {
          const lastAdmin = member.role === 'admin' && adminCount <= 1;
          return <li key={member.user_id}><div><strong>{member.display_name || '名前未設定'}{member.user_id === userId ? '（自分）' : ''}</strong><small>{member.user_id}</small><span>{member.role === 'admin' ? '管理者' : 'メンバー'}</span></div><button className="today-button" disabled={loading || saving || lastAdmin} onClick={() => { void changeRole(member); }}>{lastAdmin ? '最後の管理者' : member.role === 'admin' ? 'メンバーに変更' : '管理者に変更'}</button></li>;
        })}</ul>
      </>}
    </>}
  </section>;
}