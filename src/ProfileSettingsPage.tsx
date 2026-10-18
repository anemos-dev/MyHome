import { useEffect, useRef, useState } from 'react';
import type { Role } from './RoleDocumentsPage';

export function ProfileSettingsPage({ displayName, email, roles, selectedRoleIds, onApply, onHome }: {
  displayName: string; email: string; roles: Role[]; selectedRoleIds: string[]; onApply: (name: string, roleIds: string[]) => void; onHome: () => void;
}) {
  const [name, setName] = useState(displayName);
  const [roleIds, setRoleIds] = useState(selectedRoleIds);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('表示名を入力してください。'); nameInput.current?.focus(); return; }
    onApply(trimmed, roleIds);
    setName(trimmed); setError(''); setMessage('表示名と役職を反映しました。再読み込みすると元に戻ります。');
  }

  return <section className="profile-page" aria-labelledby="profile-title">
    <nav className="activity-breadcrumb" aria-label="パンくず"><button onClick={onHome}>ホーム</button><span>/</span><span>プロフィール設定</span></nav>
    <h1 id="profile-title" tabIndex={-1} ref={heading}>プロフィール設定</h1>
    <p className="activity-subtitle">表示名と担当する役職を変更できます</p>
    <form className="profile-card" onSubmit={apply}>
      <div className="profile-card-heading"><h2>基本情報</h2><span className="profile-sample-badge">サンプル</span></div>

      <div className="profile-field"><div className="profile-field-label"><label htmlFor="profile-name">表示名</label><p>メニューやホームに表示する名前</p></div><div>
      <input ref={nameInput} id="profile-name" autoComplete="nickname" value={name} maxLength={50} required aria-invalid={!!error} aria-describedby={error ? 'profile-name-error' : 'profile-name-help'} onChange={event => { setName(event.target.value); setError(''); setMessage(''); }}/>
      <p id="profile-name-help" className="profile-note">1〜50文字で入力してください。</p>
      {error && <p id="profile-name-error" className="profile-error" role="alert">{error}</p>}
      </div></div><div className="profile-field"><div className="profile-field-label"><label htmlFor="profile-email">メールアドレス</label><p>アカウントのメールアドレス</p></div><div>
      <input id="profile-email" type="email" value={email} readOnly aria-describedby="profile-email-help"/>
      <p id="profile-email-help" className="profile-note">メールアドレスは表示のみです。</p>
            </div></div>
      <fieldset className="profile-role-field"><legend>担当する役職</legend>
        <p className="profile-note">複数選択できます。役職の選択によって管理者権限は変わりません。</p>
        <div className="profile-role-options">{roles.map(role => <label key={role.id}>
          <input type="checkbox" checked={roleIds.includes(role.id)} onChange={event => { setRoleIds(previous => event.target.checked ? [...previous, role.id] : previous.filter(id => id !== role.id)); setMessage(''); }}/>{role.name}
        </label>)}</div>
        {roleIds.length === 0 && <p className="profile-note">役職は未設定です。</p>}
      </fieldset>
      <p className="profile-sample-info">変更はこの画面内だけに反映されます。再読み込み・ログアウトで元に戻ります。</p><div className="profile-actions"><button className="today-button" type="button" onClick={onHome}>ホームに戻る</button><button className="activity-primary-button" type="submit">変更を反映</button></div>
      <p className="profile-result" role="status">{message}</p>
    </form>
  </section>;
}